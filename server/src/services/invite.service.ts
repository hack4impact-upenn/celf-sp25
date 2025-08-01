import { IInvite, Invite } from "../models/invite.model.ts";

const removeSensitiveDataQuery = ["-verificationToken"];

/**
 * Creates a new invite in the database.
 * @param email - string representing the email of the invited user
 * @param verificationToken - string representing verification token
 * @param role - string representing the role of the invited user
 * @param firstName - string representing the first name of the invited user
 * @param lastName - string representing the last name of the invited user
 * @returns The created {@link Invite}
 */
const createInvite = async (
  email: string, 
  verificationToken: string, 
  role: "teacher" | "admin" | "speaker" = "speaker",
  firstName?: string,
  lastName?: string
) => {
  const newInvite = new Invite({
    email,
    verificationToken,
    role,
    firstName,
    lastName,
  });
  const invite = await newInvite.save();
  return invite;
};

/**
 * Updates an existing invite in the database with a new verification token.
 * @param oldInvite {@link Invite} - string representing the email of the invited user
 * @param verificationToken - string representing verification token
 * @param role - string representing the role of the invited user
 * @param firstName - string representing the first name of the invited user
 * @param lastName - string representing the last name of the invited user
 * @returns The created {@link Invite}
 */
const updateInvite = async (
  oldInvite: IInvite, 
  verificationToken: string, 
  role: "teacher" | "admin" | "speaker" = "speaker",
  firstName?: string,
  lastName?: string
) => {
  const { _id, email } = oldInvite;
  const newInvite = new Invite({
    _id,
    email,
    verificationToken,
    role,
    firstName,
    lastName,
  });
  const invite = await Invite.findOneAndUpdate({ email }, newInvite).exec();
  return invite;
};

/**
 * Fetch the invite associtated with the given email
 * @param email - string representing the email of the invited user
 * @returns The invite {@link Invite}
 */
const getInviteByEmail = async (email: string) => {
  const invite = await Invite.findOne({ email })
    .select(removeSensitiveDataQuery)
    .exec();
  return invite;
};

/**
 * Fetch the invite associtated with the given token
 * @param token - string representing the email of the invited user
 * @returns The invite {@link Invite}
 */
const getInviteByToken = async (token: string) => {
  const invite = await Invite.findOne({ verificationToken: token }).exec();
  return invite;
};

/**
 * Delete the invite associtated with the given token
 * @param token - string representing the email of the invited user
 * @returns The deleted invite {@link Invite}
 */
const removeInviteByToken = async (token: string) => {
  const invite = await Invite.findOneAndDelete({
    verificationToken: token,
  }).exec();
  return invite;
};

export {
  createInvite,
  updateInvite,
  getInviteByEmail,
  getInviteByToken,
  removeInviteByToken,
};
