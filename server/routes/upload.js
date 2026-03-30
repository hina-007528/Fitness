import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyToken } from '../middleware/verifyToken.js';
import { BadRequestError } from '../error.js';

const router = express.Router();

const uploadsDir = process.env.VERCEL === "1"
  ? path.join('/tmp', 'uploads')
  : path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    
    // Different folders for different file types
    if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(uploadsDir, 'images');
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = path.join(uploadsDir, 'videos');
    } else if (file.mimetype.startsWith('audio/')) {
      uploadPath = path.join(uploadsDir, 'audio');
    } else {
      uploadPath = path.join(uploadsDir, 'others');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow images, videos, and audio files
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
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5 // Maximum 5 files
  }
});

// Upload single file
router.post('/single', verifyToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    console.log('Upload file info:', {
      destination: req.file.destination,
      filename: req.file.filename,
      originalname: req.file.originalname
    }); // Debug log

    // Generate correct URL based on file type
    let fileUrl;
    if (req.file.mimetype.startsWith('image/')) {
      fileUrl = `${process.env.API_URL || 'http://localhost:8080'}/uploads/images/${req.file.filename}`;
    } else if (req.file.mimetype.startsWith('video/')) {
      fileUrl = `${process.env.API_URL || 'http://localhost:8080'}/uploads/videos/${req.file.filename}`;
    } else if (req.file.mimetype.startsWith('audio/')) {
      fileUrl = `${process.env.API_URL || 'http://localhost:8080'}/uploads/audio/${req.file.filename}`;
    } else {
      fileUrl = `${process.env.API_URL || 'http://localhost:8080'}/uploads/others/${req.file.filename}`;
    }
    console.log('Generated fileUrl:', fileUrl); // Debug log
    
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to upload file'
    });
  }
});

// Upload multiple files
router.post('/multiple', verifyToken, upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new BadRequestError('No files uploaded');
    }

    const uploadedFiles = req.files.map(file => {
      const fileUrl = `/uploads/${file.destination.split('uploads/')[1]}/${file.filename}`;
      return {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl
      };
    });

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadedFiles
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to upload files'
    });
  }
});

// Delete file
router.delete('/file/:filename', verifyToken, (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Find the file in uploads directory
    const findFile = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          const found = findFile(filePath);
          if (found) return found;
        } else if (file === filename) {
          return filePath;
        }
      }
      return null;
    };

    const filePath = findFile(uploadsDir);
    
    if (!filePath) {
      throw new BadRequestError('File not found');
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete file'
    });
  }
});

export default router;
