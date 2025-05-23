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
  console.log(userId);
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
  const {firstName, lastName, bio, email, title, 
    organization, personalSite, industryFocus, areaOfExpertise, 
    ageGroup, location, speakingFormat, languages, available} = req.body;

  if (!firstName || !lastName || !email || !title || 
    !organization) {      // TODO: change fields depending on what you need
    next(
      ApiError.missingFields([
        "firstName",
        "lastName",
        "bio",
        "email",
        "title",
        "organization",
        "personalSite",
        "industryFocus",
        "areaOfExpertise",
        "ageGroup",
        "location",
        "speakingFormat"
      ])
    );
    return;
  }

  try {
    // const existingSpeaker = await getSpeakerByUserId(userId);
    // if (existingSpeaker) {
    //   next(ApiError.badRequest("Speaker profile already exists"));
    //   return;
    // }

    const speaker = await createSpeaker(
      firstName,
      lastName,
      bio,
      email,
      title,
      organization,
      personalSite,
      industryFocus,
      areaOfExpertise,
      ageGroup,
      location,
      speakingFormat,
      languages,
      available
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
  const { userId } = req.params;
  const updateData = req.body;

  if (!userId) {
    next(ApiError.missingFields(["userId"]));
    return;
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

const filterSpeaker = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { location, organization, inperson } = req.query;

  const filterParams: Record<string, any> = {}; 

  if (location) filterParams.location = location;
  if (organization) filterParams.organization = organization;
  if (inperson !== undefined) filterParams.inperson = inperson === "true";

  try {
    const speakerList = await getfilterSpeakeredList(filterParams);
    if (!speakerList || speakerList.length === 0) {
      next(ApiError.notFound("No speakers found matching the criteria"));
      return;
    }
    res.status(StatusCode.OK).json(speakerList);
  } catch (error) {
    console.log(error);
    next(ApiError.internal("Unable to fetch speakers"));
  }
};

export {
  getAllSpeakersHandler as getAllSpeakers,
  getSpeaker,
  createSpeakerProfile,
  updateSpeakerProfile,
  deleteSpeakerProfile,
  filterSpeaker,
};

