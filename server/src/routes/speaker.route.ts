import express from "express";
import { isAdmin } from "../controllers/admin.middleware";
import { isAuthenticated } from "../controllers/auth.middleware";
import {
  getAllSpeakers,
  getSpeaker,
  getSpeakerByEmailHandler,
  createSpeakerProfile,
  submitSpeakerProfile,
  updateSpeakerProfile,
  updateSpeakerProfileByEmail,
  deleteSpeakerProfile,
  deleteCurrentUserSpeakerProfile,
  filterSpeaker,
  getCurrentUserSpeakerProfile,
  updateCurrentUserSpeakerProfile,
} from "../controllers/speaker.controller";

const router = express.Router();

// Public routes
router.get("/all", getAllSpeakers);
router.get("/filter", filterSpeaker);

// Protected routes  
router.post("/create", isAuthenticated, createSpeakerProfile);
router.post("/profile", isAuthenticated, submitSpeakerProfile);
router.get("/profile", isAuthenticated, getCurrentUserSpeakerProfile);
router.put("/profile", isAuthenticated, updateCurrentUserSpeakerProfile);
router.delete("/profile", isAuthenticated, deleteCurrentUserSpeakerProfile);

// Admin routes
router.post("/filter", isAuthenticated, filterSpeaker);

// Parameterized routes (must come last)
router.get("/email/:email", getSpeakerByEmailHandler);
router.put("/email/:email", isAuthenticated, updateSpeakerProfileByEmail);
router.get("/:userId", getSpeaker);
router.put("/:userId", isAuthenticated, updateSpeakerProfile);
router.delete("/:userId", isAuthenticated, isAdmin, deleteSpeakerProfile);

export default router;
