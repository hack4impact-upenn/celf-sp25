import express from "express";
import { isAdmin } from "../controllers/admin.middleware.ts";
import { isAuthenticated } from "../controllers/auth.middleware.ts";
import {
  getAllTeachers,
  getTeacher,
  createTeacherProfile,
  updateTeacherProfile,
  deleteTeacherProfile,
  deleteCurrentUserTeacherProfile,
} from "../controllers/teacher.controller.ts";

const router = express.Router();

router.get("/all", getAllTeachers);

router.get("/:userId", getTeacher);

router.post("/create", createTeacherProfile);

router.put("/update/:userId", updateTeacherProfile);

// Self-deletion route (no admin required)
router.delete("/profile", isAuthenticated, deleteCurrentUserTeacherProfile);

// Admin deletion route
router.delete("/:userId", isAdmin, deleteTeacherProfile);

export default router;
