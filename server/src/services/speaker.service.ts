import { ISpeaker, Speaker } from "../models/speaker.model.ts";
import { User } from "../models/user.model.ts";

/**
 * Creates a new speaker profile in the database.
 * @param userId - string representing the user ID
 * @param organization - string representing the organization
 * @param bio - string representing the speaker's bio
 * @param location - string representing the location
 * @param inperson - boolean indicating if available for in-person events
 * @param virtual - boolean indicating if available for virtual events
 * @param imageUrl - string representing the image URL
 * @param industry - string array representing the industry focus
 * @param grades - string array representing the grades
 * @param city - string representing the city
 * @param state - string representing the state
 * @param coordinates - object representing the coordinates
 * @param languages - string array representing the languages
 * @returns The created Speaker profile
 */
const createSpeaker = async (
  userId: string,
  organization: string,
  bio: string,
  location: string,
  inperson: boolean,
  virtual: boolean,
  imageUrl: string | undefined,
  industry: string[],
  grades: string[],
  city: string,
  state: string,
  coordinates: { lat: number; lng: number } | undefined,
  languages: string[]
) => {
  const newSpeaker = new Speaker({
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
  });
  const speaker = await newSpeaker.save();
  return speaker;
};

/**
 * Gets a speaker from the database by their userId
 * @param userId The userId of the speaker to get
 * @returns The Speaker or null if not found
 */
const getSpeakerByUserId = async (userId: string) => {
  const speaker = await Speaker.findOne({ userId })
    .populate('userId', 'firstName lastName email')
    .exec();
  return speaker;
};

/**
 * Gets all speakers from the database
 * @returns Array of all speakers
 */
const getAllSpeakers = async () => {
  const speakers = await Speaker.find({})
    .populate('userId', 'firstName lastName email')
    .exec();
  return speakers;
};

/**
 * Updates a speaker's information
 * @param userId - The userId of the speaker to update
 * @param updateData - Object containing the fields to update
 * @returns The updated speaker
 */
const updateSpeaker = async (userId: string, updateData: Partial<ISpeaker>) => {
  const speaker = await Speaker.findOneAndUpdate(
    { userId },
    updateData,
    { new: true }
  )
    .populate('userId', 'firstName lastName email')
    .exec();
  return speaker;
};

/**
 * Deletes a speaker profile
 * @param userId - The userId of the speaker to delete
 * @returns The deleted speaker
 */
const deleteSpeaker = async (userId: string) => {
  const speaker = await Speaker.findOneAndDelete({ userId }).exec();
  return speaker;
};

/**
 * Gets filtered list of speakers based on provided criteria
 */
const getfilterSpeakeredList = async (filteredParams: Record<string, any>) => {
  const speakers = await Speaker.find(filteredParams)
    .populate('userId', 'firstName lastName email')
    .exec();
  return speakers;
};

export {
  createSpeaker,
  getSpeakerByUserId,
  getAllSpeakers,
  updateSpeaker,
  deleteSpeaker,
  getfilterSpeakeredList,
};
