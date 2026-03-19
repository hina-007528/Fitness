import express from "express";
import {
  createTutorial,
  getAllTutorials,
  getTutorialById,
  updateTutorial,
  deleteTutorial,
  getTutorialStats,
  getComments,
  likeTutorial,
  addComment,
  updateComment,
  deleteComment,
  addReply,
  updateReply,
  deleteReply,
  shareTutorial,
} from "../controllers/Tutorial.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public routes
router.get("/", getAllTutorials);
router.get("/:id", getTutorialById);
router.get("/:id/comments", getComments);

// Protected routes (require authentication)
router.post("/", verifyToken, createTutorial);
router.put("/:id", verifyToken, updateTutorial);
router.delete("/:id", verifyToken, deleteTutorial);
router.post("/:id/like", verifyToken, likeTutorial);
router.post("/:id/comment", verifyToken, addComment);
router.put("/comment/:commentId", verifyToken, updateComment);
router.delete("/comment/:commentId", verifyToken, deleteComment);
router.post("/comment/:commentId/reply", verifyToken, addReply);
router.put("/comment/:commentId/reply/:replyId", verifyToken, updateReply);
router.delete("/comment/:commentId/reply/:replyId", verifyToken, deleteReply);
router.post("/:id/share", verifyToken, shareTutorial);
router.get("/stats/admin", verifyToken, getTutorialStats);

export default router;
