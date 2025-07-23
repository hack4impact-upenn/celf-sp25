import express from "express";
import { isAdmin } from "../controllers/admin.middleware.ts";
import { isAuthenticated } from "../controllers/auth.middleware.ts";
import {
  getAllSpeakers,
  getSpeaker,
  getSpeakerByEmailHandler,
  createSpeakerProfile,
  submitSpeakerProfile,
  updateSpeakerProfile,
  updateSpeakerProfileByEmail,
  deleteSpeakerProfile,
  filterSpeaker,
  getCurrentUserSpeakerProfile,
  updateCurrentUserSpeakerProfile,
} from "../controllers/speaker.controller.ts";

const router = express.Router();

// Public routes
router.get("/all", getAllSpeakers);
router.get("/filter", filterSpeaker);

// Protected routes  
router.post("/create", isAuthenticated, createSpeakerProfile);
router.post("/profile", isAuthenticated, submitSpeakerProfile);
router.get("/profile", isAuthenticated, getCurrentUserSpeakerProfile);
router.put("/profile", isAuthenticated, updateCurrentUserSpeakerProfile);

// Admin routes
router.post("/filter", isAuthenticated, filterSpeaker);

// Parameterized routes (must come last)
router.get("/email/:email", getSpeakerByEmailHandler);
router.put("/email/:email", isAuthenticated, updateSpeakerProfileByEmail);
router.get("/:userId", getSpeaker);
router.put("/:userId", isAuthenticated, updateSpeakerProfile);
router.delete("/:userId", isAuthenticated, isAdmin, deleteSpeakerProfile);

export default router;
