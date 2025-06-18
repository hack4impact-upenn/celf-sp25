import express from "express";
import { isAdmin } from "../controllers/admin.middleware.ts";
import { isAuthenticated } from "../controllers/auth.middleware.ts";
import {
  getAllRequestsHandler,
  getRequestsByTeacherIdHandler,
  getCurrentUserRequestsHandler,
  getRequestByIdHandler,
  createRequestHandler,
  updateRequestStatusHandler,
  deleteRequestHandler,
} from "../controllers/request.controller.ts";

const router = express.Router();

// Public routes
router.get("/all", isAuthenticated, getAllRequestsHandler);
router.get("/current", isAuthenticated, getCurrentUserRequestsHandler);
router.get("/teacher/:teacherId", isAuthenticated, getRequestsByTeacherIdHandler);
router.get("/:requestId", isAuthenticated, getRequestByIdHandler);
router.post("/", isAuthenticated, createRequestHandler);

// Admin-only routes
router.put("/:requestId/status", isAuthenticated, isAdmin, updateRequestStatusHandler);
router.delete("/:requestId", isAuthenticated, isAdmin, deleteRequestHandler);

export default router; 