import express from "express";
import ApiError from "../util/apiError.ts";
import StatusCode from "../util/statusCode.ts";
import {
  deleteUserById,
  getAllUsersFromDB,
  getUserById,
  updateUser,
} from "../services/user.service.ts";

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
    if (currentUser.admin) {
      next(ApiError.forbidden("Admin accounts cannot be deleted"));
      return;
    }

    const user = await deleteUserById(currentUser._id);
    if (!user) {
      next(ApiError.notFound("User not found"));
      return;
    }

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
        });
      }
    });

    res.status(StatusCode.OK).json({ message: "Account deleted successfully" });
  } catch (error) {
    next(ApiError.internal("Unable to delete account"));
  }
};

export { getUser, getAllUsersHandler, updateUserProfile, deleteUserProfile, deleteCurrentUser };
