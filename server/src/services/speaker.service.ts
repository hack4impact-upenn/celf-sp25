import { ISpeaker, Speaker } from "../models/speaker.model";
import { User } from "../models/user.model";

/**
 * Creates a new speaker profile in the database.
 * @param userId - string representing the user ID
 * @param organization - string representing the organization
 * @param bio - string representing the speaker's bio
 * @param city - string representing the city
 * @param state - string representing the state
 * @param country - string representing the country (optional)
 * @param inperson - boolean indicating if available for in-person events
 * @param virtual - boolean indicating if available for virtual events
 * @param imageUrl - string representing the image URL
 * @param industry - string array representing the industry focus
 * @param grades - string array representing the grades
 * @param coordinates - object representing the coordinates
 * @param languages - string array representing the languages
 * @param visible - boolean indicating if the speaker is visible to others (default: false)
 * @returns The created Speaker profile
 */
const createSpeaker = async (
  userId: string,
  organization: string,
  bio: string,
  city: string,
  state: string,
  country: string | undefined,
  inperson: boolean,
  virtual: boolean,
  imageUrl: string | undefined,
  industry: string[],
  grades: string[],
  coordinates: { lat: number; lng: number } | undefined,
  languages: string[],
  visible: boolean = false
) => {
  const newSpeaker = new Speaker({
    userId,
    organization,
    bio,
    city,
    state,
    country,
    inperson,
    virtual,
    imageUrl,
    industry,
    grades,
    coordinates,
    languages,
    visible
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
 * Gets a speaker from the database by their email
 * @param email The email of the speaker to get
 * @returns The Speaker or null if not found
 */
const getSpeakerByEmail = async (email: string) => {
  const speaker = await Speaker.findOne({})
    .populate({
      path: 'userId',
      match: { email: email },
      select: 'firstName lastName email'
    })
    .exec();
  
  // Filter out speakers where the populated userId is null (no match)
  return speaker && speaker.userId ? speaker : null;
};

/**
 * Gets all speakers from the database (including invisible ones) for admin use
 * @returns Array of all speakers
 */
const getAllSpeakersForAdmin = async () => {
  const speakers = await Speaker.find({}) // No visibility filter for admins
    .populate('userId', 'firstName lastName email')
    .exec();
  return speakers;
};

/**
 * Gets all speakers from the database
 * @returns Array of all speakers
 */
const getAllSpeakers = async () => {
  const speakers = await Speaker.find({ visible: true })
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
  
  // Check if profile is complete and auto-set visibility
  if (speaker && isProfileComplete(speaker)) {
    if (!speaker.visible) {
      speaker.visible = true;
      await speaker.save();
    }
  }
  
  return speaker;
};

/**
 * Checks if a speaker profile is complete and ready to be visible
 * @param speaker - The speaker to check
 * @returns boolean indicating if profile is complete
 */
const isProfileComplete = (speaker: ISpeaker): boolean => {
  return !!(
    speaker.organization && speaker.organization.trim() !== '' &&
    speaker.bio && speaker.bio.trim() !== '' &&
    speaker.city && speaker.city.trim() !== '' &&
    speaker.country && speaker.country.trim() !== '' &&
    speaker.industry && speaker.industry.length > 0 &&
    speaker.grades && speaker.grades.length > 0 &&
    (speaker.inperson || speaker.virtual) // Must support at least one format
  );
};

/**
 * Deletes a speaker profile and associated user account
 * @param userId - The userId of the speaker to delete
 * @returns The deleted speaker
 */
const deleteSpeaker = async (userId: string) => {
  const speaker = await Speaker.findOneAndDelete({ userId }).exec();
  const user = await User.findOneAndDelete({ _id: userId }).exec();
  console.log("Just deleted", user);
  return speaker;
};

/**
 * Gets filtered list of speakers based on provided criteria
 */
const getfilterSpeakeredList = async (filteredParams: Record<string, any>) => {
  // Ensure only visible speakers are returned
  const filterWithVisibility = { ...filteredParams, visible: true };
  const speakers = await Speaker.find(filterWithVisibility)
    .populate('userId', 'firstName lastName email')
    .exec();
  return speakers;
};

export {
  createSpeaker,
  getSpeakerByUserId,
  getSpeakerByEmail,
  getAllSpeakers,
  getAllSpeakersForAdmin,
  updateSpeaker,
  deleteSpeaker,
  getfilterSpeakeredList,
  isProfileComplete,
};
