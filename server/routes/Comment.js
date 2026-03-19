import express from 'express';
import Comment from '../models/Comment.js';
import Blog from '../models/Blog.js';
import Tutorial from '../models/Tutorial.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../error.js';

const router = express.Router();

// Get comments for a blog
router.get('/blog/:blogId', async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }

    const comments = await Comment.findByBlog(blogId, page, limit);
    
    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Comment.countDocuments({ blogId, parentId: null, isDeleted: false })
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get comments for a tutorial
router.get('/tutorial/:tutorialId', async (req, res, next) => {
  try {
    const { tutorialId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if tutorial exists
    const tutorial = await Tutorial.findById(tutorialId);
    if (!tutorial) {
      throw new NotFoundError('Tutorial not found');
    }

    const comments = await Comment.findByTutorial(tutorialId, page, limit);
    
    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Comment.countDocuments({ tutorialId, parentId: null, isDeleted: false })
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get replies for a comment
router.get('/:commentId/replies', async (req, res, next) => {
  try {
    const { commentId } = req.params;

    // Check if parent comment exists
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      throw new NotFoundError('Comment not found');
    }

    const replies = await Comment.findReplies(commentId);
    
    res.status(200).json({
      success: true,
      data: replies
    });
  } catch (error) {
    next(error);
  }
});

// Create a comment on a blog
router.post('/blog/:blogId', verifyToken, async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { content, attachments = [], parentId = null } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      throw new BadRequestError('Comment content is required');
    }

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment || parentComment.blogId.toString() !== blogId) {
        throw new BadRequestError('Invalid parent comment');
      }
    }

    const comment = new Comment({
      content: content.trim(),
      author: req.user.name,
      userId,
      blogId,
      parentId,
      attachments
    });

    await comment.save();

    // Update blog comment count
    await Blog.findByIdAndUpdate(blogId, { $inc: { commentCount: 1 } });

    // If it's a reply, update parent comment
    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, { $push: { replies: comment._id } });
    }

    const populatedComment = await Comment.findById(comment._id).populate('userId', 'name');

    res.status(201).json({
      success: true,
      data: populatedComment,
      message: 'Comment created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Create a comment on a tutorial
router.post('/tutorial/:tutorialId', verifyToken, async (req, res, next) => {
  try {
    const { tutorialId } = req.params;
    const { content, attachments = [], parentId = null } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      throw new BadRequestError('Comment content is required');
    }

    // Check if tutorial exists
    const tutorial = await Tutorial.findById(tutorialId);
    if (!tutorial) {
      throw new NotFoundError('Tutorial not found');
    }

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment || parentComment.tutorialId.toString() !== tutorialId) {
        throw new BadRequestError('Invalid parent comment');
      }
    }

    const comment = new Comment({
      content: content.trim(),
      author: req.user.name,
      userId,
      tutorialId,
      parentId,
      attachments
    });

    await comment.save();

    // Update tutorial comment count
    await Tutorial.findByIdAndUpdate(tutorialId, { $inc: { commentCount: 1 } });

    // If it's a reply, update parent comment
    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, { $push: { replies: comment._id } });
    }

    const populatedComment = await Comment.findById(comment._id).populate('userId', 'name');

    res.status(201).json({
      success: true,
      data: populatedComment,
      message: 'Comment created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Update a comment
router.put('/:commentId', verifyToken, async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      throw new BadRequestError('Comment content is required');
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId) {
      throw new ForbiddenError('You can only edit your own comments');
    }

    const updatedComment = await comment.edit(content.trim());
    await updatedComment.populate('userId', 'name');

    res.status(200).json({
      success: true,
      data: updatedComment,
      message: 'Comment updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Delete a comment
router.delete('/:commentId', verifyToken, async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await comment.softDelete();

    // Update blog/tutorial comment count
    if (comment.blogId) {
      await Blog.findByIdAndUpdate(comment.blogId, { $inc: { commentCount: -1 } });
    } else if (comment.tutorialId) {
      await Tutorial.findByIdAndUpdate(comment.tutorialId, { $inc: { commentCount: -1 } });
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Like/unlike a comment
router.post('/:commentId/like', verifyToken, async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    const isLiked = comment.likes.includes(userId);
    
    if (isLiked) {
      await comment.removeLike(userId);
      res.status(200).json({
        success: true,
        message: 'Like removed',
        likeCount: comment.likeCount
      });
    } else {
      await comment.addLike(userId);
      res.status(200).json({
        success: true,
        message: 'Comment liked',
        likeCount: comment.likeCount
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
