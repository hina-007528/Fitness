import Blog from "../models/Blog.js";
import { createError } from "../utils/error.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createBlog = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "You are not authenticated!"));
    }

    console.log('Request body:', req.body); // Debug log

    const user = await User.findById(userId).select("name");
    const authorName = user?.name || req.body?.author || "Anonymous";

    const blog = new Blog({
      ...req.body,
      authorId: userId,
      author: authorName,
      isPublished: true,
      publishedAt: new Date(),
    });

    console.log('Blog object before save:', blog); // Debug log
    console.log('Blog featuredImage before save:', blog.featuredImage); // Debug log
    
    // Generate slug from title
    blog.slug = blog.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    await blog.save();
    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllBlogs = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    let query = { isPublished: true };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const blogs = await Blog.find(query)
      .populate('likedBy', 'name')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Blogs retrieved successfully",
      data: blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, isPublished: true }).populate('likedBy', 'name');

    if (!blog) {
      return next(createError(404, "Blog not found"));
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog retrieved successfully",
      data: blog,
    });
  } catch (err) {
    next(err);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "You are not authenticated!"));
    }

    console.log('Update request body:', req.body); // Debug log

    const existingBlog = await Blog.findOne({ slug });
    if (!existingBlog) {
      return next(createError(404, "Blog not found"));
    }

    if (existingBlog.authorId && existingBlog.authorId?.toString() !== userId.toString()) {
      return next(createError(403, "You can only update your own blog"));
    }

    // Prevent changing ownership/author via body
    const { authorId, author, likedBy, likes, comments, commentCount, ...safeBody } = req.body;

    console.log('Safe body for update:', safeBody); // Debug log

    const blog = await Blog.findOneAndUpdate(
      { slug },
      safeBody,
      { new: true, runValidators: true }
    ).populate('likedBy', 'name');

    if (!blog) {
      return next(createError(404, "Blog not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;
    console.log('Delete request - slug:', slug, 'userId:', userId); // Debug log
    
    if (!userId) {
      return next(createError(401, "You are not authenticated!"));
    }

    const blog = await Blog.findOne({ slug });
    console.log('Found blog:', blog); // Debug log

    if (!blog) {
      return next(createError(404, "Blog not found"));
    }

    if (blog.authorId && blog.authorId?.toString() !== userId.toString()) {
      console.log('Ownership check failed - blog.authorId:', blog.authorId, 'userId:', userId); // Debug log
      return next(createError(403, "You can only delete your own blog"));
    }

    console.log('Deleting blog with _id:', blog._id); // Debug log
    await Blog.deleteOne({ _id: blog._id });

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
      data: { slug: blog.slug },
    });
  } catch (err) {
    console.error('Delete blog error:', err); // Debug log
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "You are not authenticated!"));
    }

    const user = await User.findById(userId).select('name');
    const userName = user?.name || req.body?.userName || 'Anonymous';

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return next(createError(404, "Blog not found"));
    }

    // Initialize comments array if it doesn't exist
    if (!blog.comments) {
      blog.comments = [];
    }

    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      userId: userId,
      userName: userName,
      content: content,
      createdAt: new Date(),
    };

    blog.comments.push(newComment);
    blog.commentCount = blog.comments.length; // Update comment count
    await blog.save();

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (err) {
    next(err);
  }
};

export const likeBlog = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(createError(401, "You are not authenticated!"));
    }

    console.log('Like request:', { slug, userId, user: req.user }); // Debug log

    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return next(createError(404, "Blog not found"));
    }

    console.log('Blog found:', { slug, likes: blog.likes, likedBy: blog.likedBy }); // Debug log

    // Initialize likedBy array if it doesn't exist
    if (!blog.likedBy) {
      blog.likedBy = [];
    }

    const isLiked = blog.likedBy.some(id => id.toString() === userId.toString());
    
    console.log('Like status:', { userId, isLiked, currentLikedBy: blog.likedBy }); // Debug log
    
    if (isLiked) {
      // Unlike the blog
      blog.likedBy = blog.likedBy.filter(id => id.toString() !== userId.toString());
      blog.likes = Math.max(0, blog.likes - 1);
      console.log('Blog unliked:', { newLikes: blog.likes, newLikedBy: blog.likedBy }); // Debug log
    } else {
      // Like the blog
      blog.likedBy.push(userId);
      blog.likes += 1;
      console.log('Blog liked:', { newLikes: blog.likes, newLikedBy: blog.likedBy }); // Debug log
    }

    await blog.save();

    const updatedBlog = await Blog.findById(blog._id).populate('likedBy', 'name');

    return res.status(200).json({
      success: true,
      message: isLiked ? "Blog unliked successfully" : "Blog liked successfully",
      data: { 
        liked: !isLiked,
        likes: updatedBlog.likes,
        likedBy: updatedBlog.likedBy
      },
    });
  } catch (err) {
    console.error('Error in likeBlog:', err); // Debug log
    next(err);
  }
};

export const getPopularBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .populate('likedBy', 'name')
      .sort({ views: -1, likes: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      message: "Popular blogs retrieved successfully",
      data: blogs,
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

    // Find the blog that contains this comment
    const blog = await Blog.findOne({ "comments._id": commentId });
    if (!blog) {
      return next(createError(404, "Comment not found"));
    }

    // Find and update the specific comment
    const comment = blog.comments.id(commentId);
    if (!comment) {
      return next(createError(404, "Comment not found"));
    }

    // Check if user owns the comment
    if (comment.userId && comment.userId.toString() !== userId.toString()) {
      return next(createError(403, "You can only edit your own comments"));
    }

    comment.content = content.trim();
    await blog.save();

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

    // Find the blog that contains this comment
    const blog = await Blog.findOne({ "comments._id": commentId });
    if (!blog) {
      return next(createError(404, "Comment not found"));
    }

    // Find and remove the specific comment
    const comment = blog.comments.id(commentId);
    if (!comment) {
      return next(createError(404, "Comment not found"));
    }

    // Check if user owns the comment
    if (comment.userId && comment.userId.toString() !== userId.toString()) {
      return next(createError(403, "You can only delete your own comments"));
    }

    // Remove the comment from the comments array
    blog.comments.pull({ _id: commentId });
    await blog.save();

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

  // Find the blog that contains this comment
  const blog = await Blog.findOne({ "comments._id": commentId });
  if (!blog) {
    return next(createError(404, "Comment not found"));
  }

  // Find the parent comment
  const parentComment = blog.comments.id(commentId);
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
  await blog.save();

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

  // Find the blog that contains this comment
  const blog = await Blog.findOne({ "comments._id": commentId });
  if (!blog) {
    return next(createError(404, "Comment not found"));
  }

  // Find the parent comment
  const parentComment = blog.comments.id(commentId);
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
  await blog.save();

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

  // Find the blog that contains this comment
  const blog = await Blog.findOne({ "comments._id": commentId });
  if (!blog) {
    return next(createError(404, "Comment not found"));
  }

  // Find the parent comment
  const parentComment = blog.comments.id(commentId);
  if (!parentComment) {
    return next(createError(404, "Parent comment not found"));
  }

  // Remove the specific reply from the replies array
  parentComment.replies.pull({ _id: replyId });
  await blog.save();

  return res.status(200).json({
    success: true,
    message: "Reply deleted successfully",
  });
} catch (err) {
  next(err);
}
};
