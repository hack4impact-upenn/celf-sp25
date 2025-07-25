import express from "express";
import ApiError from "../util/apiError.ts";
import StatusCode from "../util/statusCode.ts";
import { ISpeaker } from "../models/speaker.model.ts";
import { User } from "../models/user.model.ts";
import {
  createSpeaker,
  getSpeakerByUserId,
  getSpeakerByEmail,
  getAllSpeakers,
  updateSpeaker,
  deleteSpeaker,
  getfilterSpeakeredList,
} from "../services/speaker.service.ts";
import { updateUser } from "../services/user.service.ts";
import { updateRequestStatusHandler } from "./request.controller.ts";

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
 * Get a specific speaker by email
 */
const getSpeakerByEmailHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { email } = req.params;
  if (!email) {
    next(ApiError.missingFields(["email"]));
    return;
  }

  try {
    const speaker = await getSpeakerByEmail(email);
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
 * Submit speaker profile information (for self-registration)
 */
const submitSpeakerProfile = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const {
    title,
    personalSite,
    organisation,
    bio,
    location,
    speakingFormat,
    ageGroup,
    industryFocus,
    languages,
    areaOfExpertise,
    picture
  } = req.body;

  // Get userId from the authenticated user session
  const userId = (req.user as any)?._id;
  
  if (!userId) {
    next(ApiError.unauthorized("User not authenticated"));
    return;
  }

  // Validate required fields
  if (!organisation || !bio || !location) {
    next(ApiError.missingFields(["organisation", "bio", "location"]));
    return;
  }

  // Convert speaking format to inperson/virtual booleans
  let inperson = false;
  let virtual = false;
  if (speakingFormat === 'in-person') {
    inperson = true;
  } else if (speakingFormat === 'virtual') {
    virtual = true;
  } else if (speakingFormat === 'both') {
    inperson = true;
    virtual = true;
  }

  // Convert age group to grades array
  let grades: string[] = [];
  if (ageGroup === 'elementary') {
    grades = ['Elementary'];
  } else if (ageGroup === 'middle') {
    grades = ['Middle School'];
  } else if (ageGroup === 'high school') {
    grades = ['High School'];
  } else if (ageGroup === 'all grades') {
    grades = ['Elementary', 'Middle School', 'High School'];
  }

  // Extract city and state from location (assuming format: "City, State")
  const locationParts = location.split(',').map((part: string) => part.trim());
  const city = locationParts[0] || '';
  const state = locationParts[1] || '';

  if (!city || !state) {
    next(ApiError.badRequest("Location must be in format: 'City, State'"));
    return;
  }

  console.log("right before create speaker");

  try {
    const speaker = await createSpeaker(
      userId,
      organisation,
      bio,
      location,
      inperson,
      virtual,
      picture,
      industryFocus || [],
      grades,
      city,
      state,
      undefined, // coordinates
      languages || ['English']
    );
    res.status(StatusCode.CREATED).json(speaker);
  } catch (error) {
    console.log(error);
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
  console.log('=== UPDATE SPEAKER PROFILE CONTROLLER CALLED ===');
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
    // Extract user data (firstName, lastName) from updateData
    const { firstName, lastName, ...speakerUpdateData } = updateData;

    // If location is present, parse city and state from it
    if (speakerUpdateData.location) {
      const locationParts = speakerUpdateData.location.split(',').map((part: string) => part.trim());
      speakerUpdateData.city = locationParts[0] || '';
      speakerUpdateData.state = locationParts[1] || '';
    }
    // Pass jobTitle if present (already included in ...speakerUpdateData)

    // Update speaker profile
    const speaker = await updateSpeaker(userId, speakerUpdateData);
    if (!speaker) {
      next(ApiError.notFound("Speaker not found"));
      return;
    }

    // Update user information if firstName or lastName is provided
    if (firstName || lastName) {
      const userUpdateData: any = {};
      if (firstName !== undefined) userUpdateData.firstName = firstName;
      if (lastName !== undefined) userUpdateData.lastName = lastName;
      await User.findByIdAndUpdate(userId, userUpdateData, { new: true });
    }

    // Return the updated speaker with populated user data
    const updatedSpeaker = await getSpeakerByUserId(userId);
    res.status(StatusCode.OK).json(updatedSpeaker);
  } catch (error) {
    next(ApiError.internal("Unable to update speaker profile"));
  }
};

/**
 * Update a speaker's profile by email
 */
const updateSpeakerProfileByEmail = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { email } = req.params;
  const updateData = req.body;

  if (!email) {
    next(ApiError.missingFields(["email"]));
    return;
  }

  try {
    // First get the speaker by email to get their userId
    const speaker = await getSpeakerByEmail(email);
    if (!speaker) {
      next(ApiError.notFound("Speaker not found"));
      return;
    }

    // Extract user data (firstName, lastName) from updateData
    const { firstName, lastName, ...speakerUpdateData } = updateData;
    
    // Update speaker profile using userId
    const updatedSpeaker = await updateSpeaker(speaker.userId.toString(), speakerUpdateData);
    if (!updatedSpeaker) {
      next(ApiError.notFound("Speaker not found"));
      return;
    }

    // Update user information if firstName or lastName is provided
    if (firstName || lastName) {
      const userUpdateData: any = {};
      if (firstName !== undefined) userUpdateData.firstName = firstName;
      if (lastName !== undefined) userUpdateData.lastName = lastName;
      
      await User.findByIdAndUpdate(speaker.userId, userUpdateData, { new: true });
    }

    // Return the updated speaker with populated user data
    const finalSpeaker = await getSpeakerByUserId(speaker.userId.toString());
    res.status(StatusCode.OK).json(finalSpeaker);
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

/**
 * Get the current user's speaker profile
 */
const getCurrentUserSpeakerProfile = async (
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

    const speaker = await getSpeakerByUserId(userId);
    if (!speaker) {
      next(ApiError.notFound("Speaker profile not found"));
      return;
    }
    res.status(StatusCode.OK).json(speaker);
  } catch (error) {
    next(ApiError.internal("Unable to retrieve speaker profile"));
  }
};

/**
 * Update the current user's speaker profile
 */
const updateCurrentUserSpeakerProfile = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const updateData = req.body;

  try {
    const userId = (req.user as any)?._id;
    if (!userId) {
      next(ApiError.unauthorized("User not authenticated"));
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

    // Extract user data (firstName, lastName) from updateData
    const { firstName, lastName, ...speakerUpdateData } = updateData;
    
    // Update speaker profile
    const speaker = await updateSpeaker(userId, speakerUpdateData);
    if (!speaker) {
      next(ApiError.notFound("Speaker not found"));
      return;
    }

    // Update user information if firstName or lastName is provided
    if (firstName || lastName) {
      const userUpdateData: any = {};
      if (firstName !== undefined) userUpdateData.firstName = firstName;
      if (lastName !== undefined) userUpdateData.lastName = lastName;
      
      await User.findByIdAndUpdate(userId, userUpdateData, { new: true });
    }

    // Return the updated speaker with populated user data
    const updatedSpeaker = await getSpeakerByUserId(userId);
    res.status(StatusCode.OK).json(updatedSpeaker);
  } catch (error) {
    next(ApiError.internal("Unable to update speaker profile"));
  }
};

export {
  getAllSpeakersHandler as getAllSpeakers,
  getSpeaker,
  getSpeakerByEmailHandler,
  createSpeakerProfile,
  submitSpeakerProfile,
  updateSpeakerProfile,
  updateSpeakerProfileByEmail,
  deleteSpeakerProfile,
  filterSpeaker,
  getCurrentUserSpeakerProfile,
  updateCurrentUserSpeakerProfile
};

