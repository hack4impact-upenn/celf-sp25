import express from "express";
import { isAdmin } from "../controllers/admin.middleware.ts";
import { isAuthenticated } from "../controllers/auth.middleware.ts";
import {
  getAllSpeakers,
  getSpeaker,
  createSpeakerProfile,
  updateSpeakerProfile,
  deleteSpeakerProfile,
  filterSpeaker,
  submitSpeakerProfile,
} from "../controllers/speaker.controller.ts";

const router = express.Router();

// Public routes
router.get("/all", getAllSpeakers);
router.get("/filter", filterSpeaker);
router.get("/:userId", getSpeaker);

// Protected routes
router.post("/create", isAuthenticated, createSpeakerProfile);
router.post("/profile", isAuthenticated, submitSpeakerProfile);
router.put("/:userId", isAuthenticated, updateSpeakerProfile);
router.delete("/:userId", isAuthenticated, isAdmin, deleteSpeakerProfile);

// Admin routes
router.post("/filter", isAuthenticated, filterSpeaker);

export default router;
