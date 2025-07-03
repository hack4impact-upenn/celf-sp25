import express from "express";
import {
  getAllIndustryFocuses,
  getAllIndustryFocusesAdmin,
  createIndustryFocus,
  updateIndustryFocus,
  deleteIndustryFocus,
  toggleIndustryFocusStatus,
  getAffectedSpeakersCount,
} from "../controllers/industryFocus.controller";
import { isAuthenticated } from "../controllers/auth.middleware";
import { isAdmin } from "../controllers/admin.middleware";

const router = express.Router();

// Public route - get all active industry focuses
router.get("/", getAllIndustryFocuses);

// Admin routes - require authentication and admin privileges
router.get("/admin", isAuthenticated, isAdmin, getAllIndustryFocusesAdmin);
router.get("/:id/affected-count", isAuthenticated, isAdmin, getAffectedSpeakersCount);
router.post("/", isAuthenticated, isAdmin, createIndustryFocus);
router.put("/:id", isAuthenticated, isAdmin, updateIndustryFocus);
router.delete("/:id", isAuthenticated, isAdmin, deleteIndustryFocus);
router.patch("/:id/toggle", isAuthenticated, isAdmin, toggleIndustryFocusStatus);

export default router; 