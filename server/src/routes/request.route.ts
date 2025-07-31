import express from "express";
import { isAdmin } from "../controllers/admin.middleware.ts";
import { isAuthenticated } from "../controllers/auth.middleware.ts";
import {
  getAllRequestsHandler,
  getRequestsByTeacherIdHandler,
  getRequestsBySpeakerIdHandler,
  getCurrentUserRequestsHandler,
  getRequestByIdHandler,
  createRequestHandler,
  updateRequestStatusHandler,
  updateOwnRequestStatusHandler,
  deleteRequestHandler,
} from "../controllers/request.controller.ts";

const router = express.Router();

// Public routes
router.get("/all", isAuthenticated, getAllRequestsHandler);
router.get("/current", isAuthenticated, getCurrentUserRequestsHandler);
router.get("/teacher/:teacherId", isAuthenticated, getRequestsByTeacherIdHandler);
router.get("/speaker/:speakerId", isAuthenticated, getRequestsBySpeakerIdHandler);
router.get("/:requestId", isAuthenticated, getRequestByIdHandler);
router.post("/", isAuthenticated, createRequestHandler);

// Teacher routes - allow users to update their own requests
router.put("/:requestId/status/own", isAuthenticated, updateOwnRequestStatusHandler);

// Admin-only routes
router.put("/:requestId/status", isAuthenticated, isAdmin, updateRequestStatusHandler);
router.delete("/:requestId", isAuthenticated, isAdmin, deleteRequestHandler);

export default router; 