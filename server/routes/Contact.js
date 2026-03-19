import express from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  addNote,
  respondToContact,
  getContactStats,
} from "../controllers/Contact.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public routes
router.post("/", createContact);

// Protected routes (admin only)
router.get("/", verifyToken, getAllContacts);
router.get("/stats", verifyToken, getContactStats);
router.get("/:id", verifyToken, getContactById);
router.put("/:id", verifyToken, updateContact);
router.delete("/:id", verifyToken, deleteContact);
router.post("/:id/notes", verifyToken, addNote);
router.post("/:id/respond", verifyToken, respondToContact);

export default router;
