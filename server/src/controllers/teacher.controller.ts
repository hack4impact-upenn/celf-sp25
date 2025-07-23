import express from "express";
import ApiError from "../util/apiError.ts";
import StatusCode from "../util/statusCode.ts";
import { ITeacher } from "../models/teacher.model.ts";
import { User } from "../models/user.model.ts";
import {
  createTeacher,
  getTeacherByUserId,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
} from "../services/teacher.service.ts";

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
  const { userId, school, gradeLevel, location, subjects, bio } = req.body;

  if (!userId || !school || !gradeLevel || !location || !subjects || !bio) {
    next(ApiError.missingFields(["userId", "school", "gradeLevel", "location", "subjects", "bio"]));
    return;
  }

  try {
    const existingTeacher = await getTeacherByUserId(userId);
    if (existingTeacher) {
      next(ApiError.badRequest("Teacher profile already exists"));
      return;
    }

    // Parse city and state from location
    const locationParts = location.split(',').map((part: string) => part.trim());
    const city = locationParts[0] || '';
    const state = locationParts[1] || '';

    const teacher = await createTeacher(userId, school, gradeLevel, city, state, subjects, bio);
    res.status(StatusCode.CREATED).json(teacher);
  } catch (error) {
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
  if (updateData.location !== undefined && (!updateData.location || updateData.location.trim() === '')) {
    next(ApiError.badRequest("Location is required and cannot be empty"));
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

    // Update user document if firstName, lastName, or email are present
    const userFields: any = {};
    if (updateData.firstName !== undefined) userFields.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) userFields.lastName = updateData.lastName;
    if (updateData.email !== undefined) userFields.email = updateData.email;

    if (Object.keys(userFields).length > 0) {
      console.log(userFields);
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
    res.status(StatusCode.OK).json(teacher);
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
};
