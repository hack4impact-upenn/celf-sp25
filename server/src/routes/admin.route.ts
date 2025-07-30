/**
 * Specifies the middleware and controller functions to call for each route
 * relating to admin users.
 */
import express from "express";
import { isAdmin } from "../controllers/admin.middleware.ts";
import {
  getAllUsers,
  deleteUser,
  inviteUser,
  verifyToken,
  inviteAdmin,
  createSpeakerDirectly,
} from "../controllers/admin.controller.ts";
import { isAuthenticated } from "../controllers/auth.middleware.ts";
import { approve } from "../controllers/auth.controller.ts";
import { getAllSpeakersAdmin } from "../controllers/speaker.controller.ts";
import "dotenv/config";

const router = express.Router();

/**
 * A GET route to get all users. Checks first if the requestor is a
 * authenticated and is an admin.
 */
router.get("/all", isAuthenticated, isAdmin, getAllUsers);

/**
 * A GET route for admins to get all speakers including invisible ones
 */
router.get("/speakers", isAuthenticated, isAdmin, getAllSpeakersAdmin);

/**
 * A GET route to check if the requestor is an admin. Checks first if the
 * requestor is a authenticated. Throws an error if the requestor is not an admin.
 */
router.get("/adminstatus", isAuthenticated, isAdmin, approve);

/**
 * A PUT route to delete a user. Checks first if the requestor
 * is a authenticated and is an admin.
 * Expects the following fields in the URL:
 * email (string) - The email of the user to be deleted
 */
router.delete("/:email", isAuthenticated, isAdmin, deleteUser);

/**
 * A POST route to invite a new user
 * Expects a JSON body with the following fields:
 * - email (string) - The email to invite the user from
 */
router.post("/invite", isAuthenticated, isAdmin, inviteUser);

/**
 * A GET route to verify the user invite is valid
 */
router.get("/invite/:token", verifyToken);

/**
 * A POST route to invite a new admin
 * Expects a JSON body with the following fields:
 * - email (string)
 * - firstName (string)
 * - lastName (string)
 */
router.post("/invite-admin", isAuthenticated, isAdmin, inviteAdmin);

/**
 * A POST route to create a speaker directly with admin privileges
 * Expects a JSON body with the following fields:
 * - email (string)
 * - firstName (string)
 * - lastName (string)
 * - organization (string)
 * - bio (string)
 * - city (string)
 * - state (string, optional)
 * - country (string, optional)
 * - industry (string[], optional)
 * - grades (string[], optional)
 * - languages (string[], optional)
 */
router.post("/create-speaker", isAuthenticated, isAdmin, createSpeakerDirectly);

export default router;
