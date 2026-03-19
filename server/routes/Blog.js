import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  addComment,
  updateComment,
  deleteComment,
  addReply,
  updateReply,
  deleteReply,
  likeBlog,
  getPopularBlogs,
} from "../controllers/Blog.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/popular", getPopularBlogs);
router.get("/:slug", getBlogBySlug);

// Protected routes
router.post("/", verifyToken, createBlog);
router.put("/:slug", verifyToken, updateBlog);
router.delete("/:slug", verifyToken, deleteBlog);
router.post("/:slug/comment", verifyToken, addComment);
router.put("/comment/:commentId", verifyToken, updateComment);
router.delete("/comment/:commentId", verifyToken, deleteComment);
router.post("/:slug/comment/:commentId/reply", verifyToken, addReply);
router.post("/comment/:commentId/reply", verifyToken, addReply);
router.put("/comment/:commentId/reply/:replyId", verifyToken, updateReply);
router.delete("/comment/:commentId/reply/:replyId", verifyToken, deleteReply);
router.post("/:slug/like", verifyToken, likeBlog);

export default router;
