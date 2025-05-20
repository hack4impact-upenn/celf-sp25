import express from "express";
import ApiError from "../util/apiError.ts";
import StatusCode from "../util/statusCode.ts";
import { ISpeaker } from "../models/speaker.model.ts";
import {
  createSpeaker,
  getSpeakerByUserId,
  getAllSpeakers,
  updateSpeaker,
  deleteSpeaker,
  getfilterSpeakeredList,
} from "../services/speaker.service.ts";

/**
 * Get all speakers from the database
 */
const getAllSpeakersHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const speakers = await getAllSpeakers();
    res.status(StatusCode.OK).json(speakers);
  } catch (error) {
    next(ApiError.internal("Unable to retrieve speakers"));
  }
};

/**
 * Get a specific speaker by userId
 */
const getSpeaker = async (
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
    const speaker = await getSpeakerByUserId(userId);
    if (!speaker) {
      next(ApiError.notFound("Speaker not found"));
      return;
    }
    res.status(StatusCode.OK).json(speaker);
  } catch (error) {
    next(ApiError.internal("Unable to retrieve speaker"));
  }
};

/**
 * Create a new speaker profile
 */
const createSpeakerProfile = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const {
    userId,
    organization,
    bio,
    location,
    inperson,
    virtual,
    imageUrl,
    industry,
    grades,
    city,
    state,
    coordinates,
    languages
  } = req.body;

  // Validate required fields
  if (!userId || !organization || !bio || !location || !city || !state) {
    next(
      ApiError.missingFields([
        "userId",
        "organization",
        "bio",
        "location",
        "city",
        "state"
      ])
    );
    return;
  }

  // Validate arrays
  if (!Array.isArray(industry) || !Array.isArray(grades)) {
    next(ApiError.badRequest("Industry and grades must be arrays"));
    return;
  }

  // Validate grades enum
  const validGrades = ["Elementary", "Middle School", "High School"];
  if (!grades.every(grade => validGrades.includes(grade))) {
    next(ApiError.badRequest("Invalid grade values"));
    return;
  }

  try {
    const speaker = await createSpeaker(
      userId,
      organization,
      bio,
      location,
      inperson || false,
      virtual || false,
      imageUrl,
      industry,
      grades,
      city,
      state,
      coordinates,
      languages || []
    );
    res.status(StatusCode.CREATED).json(speaker);
  } catch (error) {
    next(ApiError.internal("Unable to create speaker profile"));
  }
};

/**
 * Update a speaker's profile
 */
const updateSpeakerProfile = async (
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

  // Validate grades if provided
  if (updateData.grades) {
    const validGrades = ["Elementary", "Middle School", "High School"];
    if (!Array.isArray(updateData.grades) || 
        !updateData.grades.every((grade: string) => validGrades.includes(grade))) {
      next(ApiError.badRequest("Invalid grade values"));
      return;
    }
  }

  try {
    const speaker = await updateSpeaker(userId, updateData);
    if (!speaker) {
      next(ApiError.notFound("Speaker not found"));
      return;
    }
    res.status(StatusCode.OK).json(speaker);
  } catch (error) {
    next(ApiError.internal("Unable to update speaker profile"));
  }
};

/**
 * Delete a speaker profile
 */
const deleteSpeakerProfile = async (
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
    const speaker = await deleteSpeaker(userId);
    if (!speaker) {
      next(ApiError.notFound("Speaker not found"));
      return;
    }
    res.status(StatusCode.OK).json(speaker);
  } catch (error) {
    next(ApiError.internal("Unable to delete speaker profile"));
  }
};

/**
 * Filter speakers based on criteria
 */
const filterSpeaker = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const filterParams = req.body;
  
  try {
    const speakers = await getfilterSpeakeredList(filterParams);
    res.status(StatusCode.OK).json(speakers);
  } catch (error) {
    next(ApiError.internal("Unable to filter speakers"));
  }
};

export {
  getAllSpeakersHandler as getAllSpeakers,
  getSpeaker,
  createSpeakerProfile,
  updateSpeakerProfile,
  deleteSpeakerProfile,
  filterSpeaker
};

