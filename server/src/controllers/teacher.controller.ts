import express from "express";
import ApiError from "../util/apiError";
import StatusCode from "../util/statusCode";
import { ITeacher } from "../models/teacher.model";
import { User } from "../models/user.model";
import {
  createTeacher,
  getTeacherByUserId,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
} from "../services/teacher.service";
import { deleteUserById } from "../services/user.service";
import { deleteRequestsByTeacherId } from "../services/request.service";

/**
 * Get all teachers from the database
 */
const getAllTeachersHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const teachers = await getAllTeachers();
    res.status(StatusCode.OK).json(teachers);
  } catch (error) {
    next(ApiError.internal("Unable to retrieve teachers"));
  }
};

/**
 * Get a specific teacher by userId
 */
const getTeacher = async (
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
    const teacher = await getTeacherByUserId(userId);
    if (!teacher) {
      next(ApiError.notFound("Teacher not found"));
      return;
    }
    res.status(StatusCode.OK).json(teacher);
  } catch (error) {
    next(ApiError.internal("Unable to retrieve teacher"));
  }
};

/**
 * Create a new teacher profile
 */
const createTeacherProfile = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { userId, school, gradeLevel, city, state, country, subjects, bio } = req.body;

  if (!userId || !school || !gradeLevel || !city || !country || !subjects || !bio) {
    next(ApiError.missingFields(["userId", "school", "gradeLevel", "city", "country", "subjects", "bio"]));
    return;
  }

  try {
    const existingTeacher = await getTeacherByUserId(userId);
    if (existingTeacher) {
      next(ApiError.badRequest("Teacher profile already exists"));
      return;
    }

    const teacher = await createTeacher(userId, school, gradeLevel, city, state, subjects, bio, country);
    res.status(StatusCode.CREATED).json(teacher);
  } catch (error) {
    console.error("Error creating teacher profile:", error);
    next(ApiError.internal("Unable to create teacher profile"));
  }
};

/**
 * Update a teacher's profile
 */
const updateTeacherProfile = async (
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

  // Validate required fields
  if (updateData.city !== undefined && (!updateData.city || updateData.city.trim() === '')) {
    next(ApiError.badRequest("City is required and cannot be empty"));
    return;
  }

  if (updateData.country !== undefined && (!updateData.country || updateData.country.trim() === '')) {
    next(ApiError.badRequest("Country is required and cannot be empty"));
    return;
  }

  if (updateData.bio !== undefined && (!updateData.bio || updateData.bio.trim() === '')) {
    next(ApiError.badRequest("Bio is required and cannot be empty"));
    return;
  }

  if (updateData.subjects !== undefined && (!updateData.subjects || !Array.isArray(updateData.subjects) || updateData.subjects.length === 0)) {
    next(ApiError.badRequest("At least one subject must be selected"));
    return;
  }

  try {
    const teacher = await updateTeacher(userId, updateData);
    if (!teacher) {
      next(ApiError.notFound("Teacher not found"));
      return;
    }

    // Update user document if firstName or lastName are present
    const userFields: any = {};
    if (updateData.firstName !== undefined) userFields.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) userFields.lastName = updateData.lastName;

    if (Object.keys(userFields).length > 0) {
      console.log(userFields)
      await User.findByIdAndUpdate(userId, userFields);
    }

    res.status(StatusCode.OK).json(teacher);
  } catch (error) {
    next(ApiError.internal("Unable to update teacher profile"));
  }
};

/**
 * Delete a teacher profile
 */
const deleteTeacherProfile = async (
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
    const teacher = await deleteTeacher(userId);
    if (!teacher) {
      next(ApiError.notFound("Teacher not found"));
      return;
    }
    
    // Delete all requests made by this teacher
    await deleteRequestsByTeacherId(userId);
    
    res.status(StatusCode.OK).json(teacher);
  } catch (error) {
    next(ApiError.internal("Unable to delete teacher profile"));
  }
};

/**
 * Delete the current user's teacher profile
 */
const deleteCurrentUserTeacherProfile = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const userId = (req.user as any)?._id;
    if (!userId) {
      next(ApiError.unauthorized("User not authenticated"));
      return;
    }

    // Check if user is an admin (prevent admin self-deletion)
    if ((req.user as any)?.admin) {
      next(ApiError.forbidden("Admin accounts cannot be deleted"));
      return;
    }

    const teacher = await deleteTeacher(userId);
    if (!teacher) {
      next(ApiError.notFound("Teacher profile not found"));
      return;
    }
    
    // Delete all requests made by this teacher
    await deleteRequestsByTeacherId(userId);
    
    // Note: deleteTeacher already deletes the user account
    
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

    res.status(StatusCode.OK).json({ message: "Teacher profile and account deleted successfully" });
  } catch (error) {
    next(ApiError.internal("Unable to delete teacher profile"));
  }
};

export {
  getAllTeachersHandler as getAllTeachers,
  getTeacher,
  createTeacherProfile,
  updateTeacherProfile,
  deleteTeacherProfile,
  deleteCurrentUserTeacherProfile,
};
