import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { verifyToken } from '../middleware/verifyToken.js';
import { BadRequestError } from '../error.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage - files go to buffer, then straight to Cloudinary
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/') ||
      file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Invalid file type. Only images, videos, and audio files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5,
  },
});

// Helper: upload a buffer to Cloudinary
const uploadToCloudinary = (buffer, mimetype, originalname) => {
  return new Promise((resolve, reject) => {
    let resourceType = 'auto';
    let folder = 'fitnesstrack/others';

    if (mimetype.startsWith('image/')) {
      resourceType = 'image';
      folder = 'fitnesstrack/images';
    } else if (mimetype.startsWith('video/')) {
      resourceType = 'video';
      folder = 'fitnesstrack/videos';
    } else if (mimetype.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary uses 'video' resource_type for audio
      folder = 'fitnesstrack/audio';
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

// Upload single file
router.post('/single', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: result.public_id,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: result.secure_url,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to upload file',
    });
  }
});

// Upload multiple files
router.post('/multiple', verifyToken, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new BadRequestError('No files uploaded');
    }

    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        const result = await uploadToCloudinary(file.buffer, file.mimetype, file.originalname);
        return {
          filename: result.public_id,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: result.secure_url,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to upload files',
    });
  }
});

// Delete file
router.delete('/file/:publicId', verifyToken, async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    await cloudinary.uploader.destroy(publicId);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete file',
    });
  }
});

export default router;
