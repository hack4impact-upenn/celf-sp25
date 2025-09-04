import { isAdmin } from "../controllers/admin.middleware";
import { isAuthenticated } from "../controllers/auth.middleware";
import {
  deleteUserProfile,
  getAllUsersHandler,
  getUser,
  updateUserProfile,
  deleteCurrentUser,
} from "../controllers/user.controller";
import express from "express";

const router = express.Router();

router.get("/all", getAllUsersHandler);

// Route for current user to delete their own account (must come before /:userId)
router.delete("/me", isAuthenticated, deleteCurrentUser);

router.get("/:userId", getUser);

router.put("/:userId", updateUserProfile);

router.delete("/:userId", deleteUserProfile);

export default router;
