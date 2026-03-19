import Tutorial from "../models/Tutorial.js";
import User from "../models/User.js";
import { createError } from "../utils/error.js";
import mongoose from "mongoose";

export const createTutorial = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userName = req.user?.name || 'Anonymous';
    
    // Get author from request body or use authenticated user's name
    const authorName = req.body.author || userName;
    
    const tutorialData = {
      ...req.body,
      author: authorName,
      authorId: userId
    };
    
    const tutorial = new Tutorial(tutorialData);
    await tutorial.save();
    return res.status(201).json({
      success: true,
      message: "Tutorial created successfully",
      data: tutorial,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllTutorials = async (req, res, next) => {
  try {
    const { difficulty, category, search } = req.query;
    let query = { isPublished: true };

    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const tutorials = await Tutorial.find(query)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Tutorials retrieved successfully",
      data: tutorials,
      count: tutorials.length,
    });
  } catch (err) {
    next(err);
  }
};

export const getTutorialById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tutorial = await Tutorial.findById(id)
      .populate('authorId', 'name email bio');

    if (!tutorial) {
      return next(createError(404, "Tutorial not found"));
    }

    // Increment views
    tutorial.views += 1;
    await tutorial.save();

    return res.status(200).json({
      success: true,
      message: "Tutorial retrieved successfully",
      data: tutorial,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTutorial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tutorial = await Tutorial.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tutorial) {
      return next(createError(404, "Tutorial not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Tutorial updated successfully",
      data: tutorial,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTutorial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tutorial = await Tutorial.findByIdAndDelete(id);

    if (!tutorial) {
      return next(createError(404, "Tutorial not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Tutorial deleted successfully",
      data: { id: tutorial._id },
    });
  } catch (err) {
    next(err);
  }
};

export const getTutorialStats = async (req, res, next) => {
  try {
    const stats = await Tutorial.aggregate([
      {
        $group: {
          _id: null,
          totalTutorials: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likes" },
          totalComments: { $sum: { $size: "$comments" } },
          averageLikes: { $avg: "$likes" },
          averageViews: { $avg: "$views" }
        }
      }
    ]);

    return res.status(200).json({ 
      success: true, 
      message: "Tutorial stats retrieved successfully", 
      data: stats[0] || {
        totalTutorials: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        averageLikes: 0,
        averageViews: 0
      }
    });
  } catch (err) {
    next(err);
  }
};

export const likeTutorial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return next(createError(404, "Tutorial not found"));
    }

    // Check if user already liked the tutorial
    const isLiked = tutorial.likedBy.includes(userId);
    
    if (isLiked) {
      // Unlike the tutorial
      tutorial.likedBy = tutorial.likedBy.filter(id => id.toString() !== userId);
      tutorial.likes -= 1;
    } else {
      // Like the tutorial
      tutorial.likedBy.push(userId);
      tutorial.likes += 1;
    }

    await tutorial.save();

    return res.status(200).json({ 
      success: true, 
      message: isLiked ? "Tutorial unliked" : "Tutorial liked",
      data: {
        liked: !isLiked,
        likes: tutorial.likes
      }
    });
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(createError(401, "You are not authenticated!"));
    }

    if (!content || content.trim() === '') {
      return next(createError(400, "Comment content is required"));
    }

    const user = await User.findById(userId).select('name');
    const userName = user?.name || 'Anonymous';

    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return next(createError(404, "Tutorial not found"));
    }

    // Initialize comments array if it doesn't exist
    if (!tutorial.comments) {
      tutorial.comments = [];
    }

    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      userId: userId,
      userName: userName,
      content: content.trim(),
      createdAt: new Date(),
    };

    tutorial.comments.push(newComment);
    tutorial.commentCount = tutorial.comments.length; // Update comment count
    await tutorial.save();

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (err) {
    next(err);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tutorial = await Tutorial.findById(id).select('comments').populate('comments.userId', 'name email');
    if (!tutorial) {
      return next(createError(404, "Tutorial not found"));
    }

    return res.status(200).json({ 
      success: true, 
      message: "Comments retrieved successfully", 
      data: tutorial.comments.sort((a, b) => b.createdAt - a.createdAt)
    });
  } catch (err) {
    next(err);
  }
};

export const shareTutorial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { platform } = req.body;

    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return next(createError(404, "Tutorial not found"));
    }

    tutorial.shares += 1;
    await tutorial.save();

    return res.status(200).json({ 
      success: true, 
      message: "Tutorial shared successfully",
      data: {
        platform,
        shares: tutorial.shares,
        shareUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/tutorials/${id}`
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update a comment
export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(createError(401, "You are not authenticated!"));
    }

    if (!content || !content.trim()) {
      return next(createError(400, "Comment content is required"));
    }

    // Find the tutorial that contains this comment
    const tutorial = await Tutorial.findOne({ "comments._id": commentId });
    if (!tutorial) {
      return next(createError(404, "Comment not found"));
    }

    // Find and update the specific comment
    const comment = tutorial.comments.id(commentId);
    if (!comment) {
      return next(createError(404, "Comment not found"));
    }

    // Check if user owns the comment
    if (comment.userId && comment.userId.toString() !== userId.toString()) {
      return next(createError(403, "You can only edit your own comments"));
    }

    comment.content = content.trim();
    await tutorial.save();

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (err) {
    next(err);
  }
};

// Delete a comment
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(createError(401, "You are not authenticated!"));
    }

    // Find the tutorial that contains this comment
    const tutorial = await Tutorial.findOne({ "comments._id": commentId });
    if (!tutorial) {
      return next(createError(404, "Comment not found"));
    }

    // Find and remove the specific comment
    const comment = tutorial.comments.id(commentId);
    if (!comment) {
      return next(createError(404, "Comment not found"));
    }

    // Check if user owns the comment
    if (comment.userId && comment.userId.toString() !== userId.toString()) {
      return next(createError(403, "You can only delete your own comments"));
    }

    // Remove the comment from the comments array
    tutorial.comments.pull({ _id: commentId });
    tutorial.commentCount = tutorial.comments.length; // Update comment count
    await tutorial.save();

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Add a reply to a comment
export const addReply = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(createError(401, "You are not authenticated!"));
    }

    if (!content || !content.trim()) {
      return next(createError(400, "Reply content is required"));
    }

    // Find the tutorial that contains this comment
    const tutorial = await Tutorial.findOne({ "comments._id": commentId });
    if (!tutorial) {
      return next(createError(404, "Comment not found"));
    }

    // Find the parent comment
    const parentComment = tutorial.comments.id(commentId);
    if (!parentComment) {
      return next(createError(404, "Parent comment not found"));
    }

    // Create the reply object
    const reply = {
      _id: new mongoose.Types.ObjectId(),
      content: content.trim(),
      userId: userId,
      userName: req.user?.name || 'Anonymous',
      createdAt: new Date(),
    };

    // Add reply to the parent comment's replies array
    if (!parentComment.replies) {
      parentComment.replies = [];
    }
    parentComment.replies.push(reply);
    await tutorial.save();

    return res.status(201).json({
      success: true,
      message: "Reply added successfully",
      data: reply,
    });
  } catch (err) {
    next(err);
  }
};

// Update a reply
export const updateReply = async (req, res, next) => {
  try {
    const { commentId, replyId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(createError(401, "You are not authenticated!"));
    }

    if (!content || !content.trim()) {
      return next(createError(400, "Reply content is required"));
    }

    // Find the tutorial that contains this comment
    const tutorial = await Tutorial.findOne({ "comments._id": commentId });
    if (!tutorial) {
      return next(createError(404, "Comment not found"));
    }

    // Find the parent comment
    const parentComment = tutorial.comments.id(commentId);
    if (!parentComment) {
      return next(createError(404, "Parent comment not found"));
    }

    // Find the specific reply
    const reply = parentComment.replies.id(replyId);
    if (!reply) {
      return next(createError(404, "Reply not found"));
    }

    // Check if user owns the reply
    if (reply.userId && reply.userId.toString() !== userId.toString()) {
      return next(createError(403, "You can only edit your own replies"));
    }

    reply.content = content.trim();
    await tutorial.save();

    return res.status(200).json({
      success: true,
      message: "Reply updated successfully",
      data: reply,
    });
  } catch (err) {
    next(err);
  }
};

// Delete a reply
export const deleteReply = async (req, res, next) => {
  try {
    const { commentId, replyId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(createError(401, "You are not authenticated!"));
    }

    // Find the tutorial that contains this comment
    const tutorial = await Tutorial.findOne({ "comments._id": commentId });
    if (!tutorial) {
      return next(createError(404, "Comment not found"));
    }

    // Find the parent comment
    const parentComment = tutorial.comments.id(commentId);
    if (!parentComment) {
      return next(createError(404, "Parent comment not found"));
    }

    // Remove the specific reply from the replies array
    parentComment.replies.pull({ _id: replyId });
    await tutorial.save();

    return res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
