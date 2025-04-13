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
} from "../controllers/speaker.controller.ts";

const router = express.Router();

router.get("/all", isAuthenticated, getAllSpeakers);

router.get("/:userId", isAuthenticated, getSpeaker);

router.post("/create", isAuthenticated, createSpeakerProfile);

router.put("/update/:userId", isAuthenticated, updateSpeakerProfile);

router.delete("/:userId", isAdmin, deleteSpeakerProfile);

router.get("/", isAuthenticated, filterSpeaker);

export default router;
