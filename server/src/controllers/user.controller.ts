import express from "express";
import ApiError from "../util/apiError";
import StatusCode from "../util/statusCode";
import { IUser } from "../models/user.model";
import { getUserById, getAllUsersFromDB, updateUser, deleteUserById } from "../services/user.service";
import { deleteSpeaker } from "../services/speaker.service";
import { deleteTeacher } from "../services/teacher.service";
import { deleteRequestsBySpeakerId, deleteRequestsByTeacherId } from "../services/request.service";

const getUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { userId } = req.params;
  if (!userId) {
    next(ApiError.missingFields(["userId"]));
    return;
  }

  try {
    const user = await getUserById(userId);
    console.log(user);
    if (!user) {
      next(ApiError.notFound("User not found"));
      return;
    }
    res.status(StatusCode.OK).json(user);
  } catch (error) {
    next(ApiError.internal("Unable to retrieve user"));
  }
};

const getAllUsersHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const users = await getAllUsersFromDB();
    res.status(StatusCode.OK).json(users);
  } catch (error) {
    next(ApiError.internal("Unable to retrieve users"));
  }
};

const updateUserProfile = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { userId } = req.params;
  const updateData = req.body;

  if (!userId) {
    next(ApiError.missingFields(["userId"]));
    return;
  }

  // Remove email from update data to prevent email changes
  const { email, ...safeUpdateData } = updateData;

  try {
    const user = await updateUser(userId, safeUpdateData);
    if (!user) {
      next(ApiError.notFound("User not found"));
      return;
    }
    res.status(StatusCode.OK).json(user);
  } catch (error) {
    next(ApiError.internal("Unable to update user profile"));
  }
};

/**
 * Delete a user profile
 */
const deleteUserProfile = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { userId } = req.params;

  if (!userId) {
    next(ApiError.missingFields(["userId"]));
    return;
  }

  try {
    const user = await deleteUserById(userId);
    if (!user) {
      next(ApiError.notFound("User not found"));
      return;
    }
    res.status(StatusCode.OK).json(user);
  } catch (error) {
    next(ApiError.internal("Unable to delete user profile"));
  }
};

/**
 * Delete the current user's account
 */
const deleteCurrentUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const currentUser = req.user as any;
    if (!currentUser || !currentUser._id) {
      next(ApiError.unauthorized("User not authenticated"));
      return;
    }

    // Check if user is an admin (prevent admin self-deletion)
    // if (currentUser.admin) {
    //   next(ApiError.forbidden("Admin accounts cannot be deleted"));
    //   return;
    // }

    console.log(`Deleting user account for user ID: ${currentUser._id}, role: ${currentUser.role}`);

    // Delete user and all associated data based on role
    await deleteUserByRole(currentUser._id, currentUser.role);

    console.log(`Successfully deleted user account and all associated data for user ID: ${currentUser._id}`);

    // Logout the user after deletion
    req.logout((err) => {
      if (err) {
        console.error("Error during logout after account deletion:", err);
      }
      // Destroy the session
      if (req.session) {
        req.session.destroy((e) => {
          if (e) {
            console.error("Error destroying session after account deletion:", e);
          }
          // Send response only after session is destroyed
          res.status(StatusCode.OK).json({ message: "Account deleted successfully" });
        });
      } else {
        // Send response if no session to destroy
        res.status(StatusCode.OK).json({ message: "Account deleted successfully" });
      }
    });
  } catch (error) {
    console.error("Error in deleteCurrentUser:", error);
    next(ApiError.internal("Unable to delete account"));
  }
};

/**
 * Helper function to delete a user and all associated data based on their role
 * @param userId - The ID of the user to delete
 * @param userRole - The role of the user (teacher, speaker, admin, etc.)
 */
const deleteUserByRole = async (userId: string, userRole: string) => {
  console.log(`Starting role-based deletion for user ID: ${userId}, role: ${userRole}`);
  
  try {
    switch (userRole) {
      case 'teacher':
        console.log(`Deleting teacher account for user ID: ${userId}`);
        // Delete all requests made by this teacher
        const deletedRequests = await deleteRequestsByTeacherId(userId);
        console.log(`Deleted ${deletedRequests} requests for teacher ID: ${userId}`);
        
        // Delete the teacher profile (this also deletes the user)
        const deletedTeacher = await deleteTeacher(userId);
        console.log(`Deleted teacher profile for user ID: ${userId}`, deletedTeacher ? 'success' : 'not found');
        break;
        
      case 'speaker':
        console.log(`Deleting speaker account for user ID: ${userId}`);
        // First get the speaker profile to get the speaker ID
        const speaker = await deleteSpeaker(userId);
        if (speaker) {
          console.log(`Found speaker profile, deleting requests for speaker ID: ${speaker._id}`);
          // Delete all requests that reference this speaker
          const deletedSpeakerRequests = await deleteRequestsBySpeakerId(speaker._id);
          console.log(`Deleted ${deletedSpeakerRequests} requests for speaker ID: ${speaker._id}`);
        } else {
          console.log(`No speaker profile found for user ID: ${userId}`);
        }
        // Note: deleteSpeaker already deletes the user
        break;
        
      case 'admin':
        const deletedAdmin = await deleteUserById(userId);
        console.log(`Deleted admin for user ID: ${userId}`, deletedAdmin ? 'success' : 'not found');
        break;
        
      default:
        console.log(`Deleting user with unknown role: ${userRole} for user ID: ${userId}`);
        // For users without specific roles, just delete the user
        const deletedUser = await deleteUserById(userId);
        console.log(`Deleted user for user ID: ${userId}`, deletedUser ? 'success' : 'not found');
        break;
    }
    
    console.log(`Successfully completed role-based deletion for user ID: ${userId}, role: ${userRole}`);
  } catch (error) {
    console.error(`Error in deleteUserByRole for user ID: ${userId}, role: ${userRole}:`, error);
    throw error; // Re-throw to be handled by the calling function
  }
};

/**
 * Delete a user profile with role-based cascading deletes
 */
const deleteUserProfileWithRole = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { userId } = req.params;

  if (!userId) {
    next(ApiError.missingFields(["userId"]));
    return;
  }

  try {
    // First get the user to determine their role
    const user = await getUserById(userId);
    if (!user) {
      next(ApiError.notFound("User not found"));
      return;
    }

    // Delete user and all associated data based on role
    await deleteUserByRole(userId, user.role);
    
    res.status(StatusCode.OK).json({ message: "User and all associated data deleted successfully" });
  } catch (error) {
    next(ApiError.internal("Unable to delete user profile"));
  }
};

export { 
  getUser, 
  getAllUsersHandler, 
  updateUserProfile, 
  deleteUserProfile, 
  deleteCurrentUser,
  deleteUserByRole,
  deleteUserProfileWithRole
};
