/**
 * All the controller functions containing the logic for routes relating to
 * admin users such as getting all users, deleting users and upgrading users.
 */
import express from "express";
import crypto from "crypto";
import ApiError from "../util/apiError.ts";
import StatusCode from "../util/statusCode.ts";
import { IUser } from "../models/user.model.ts";
import {
  upgradeUserToAdmin,
  getUserByEmail,
  getAllUsersFromDB,
  deleteUserById,
  createUser,
} from "../services/user.service.ts";
import {
  createInvite,
  getInviteByEmail,
  getInviteByToken,
  updateInvite,
} from "../services/invite.service.ts";
import { IInvite } from "../models/invite.model.ts";
import { emailInviteLink, emailResetPasswordLink } from "../services/mail.service.ts";
import { deleteTeacher } from "../services/teacher.service.ts";
import { deleteSpeaker, getSpeakerByUserId, createSpeaker } from "../services/speaker.service.ts";
import { deleteRequestsBySpeakerId, deleteRequestsByTeacherId } from "../services/request.service.ts";

/**
 * Get all users from the database. Upon success, send the a list of all users in the res body with 200 OK status code.
 */
const getAllUsers = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const userList = await getAllUsersFromDB();
    
    // Enrich user data with speaker visibility information
    const enrichedUserList = await Promise.all(
      userList.map(async (user) => {
        const userObj = user.toObject();
        
        // If user is a speaker, add visibility status
        if (user.role === 'speaker') {
          const speakerProfile = await getSpeakerByUserId(user._id);
          if (speakerProfile) {
            userObj.speakerVisible = speakerProfile.visible;
            userObj.profileComplete = speakerProfile.organization.trim() !== '' &&
                                     speakerProfile.bio.trim() !== '' &&
                                     speakerProfile.city.trim() !== '' &&
                                     speakerProfile.country && speakerProfile.country.trim() !== '';
          } else {
            userObj.speakerVisible = false;
            userObj.profileComplete = false;
          }
        }
        
        return userObj;
      })
    );
    
    res.status(StatusCode.OK).send(enrichedUserList);
  } catch (e) {
    next(ApiError.internal("Unable to retrieve all users"));
  }
};

/**
 * Delete a user from the database. The email of the user is expected to be in the request parameter (url). Send a 200 OK status code on success.
 */
const deleteUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { email } = req.params;
  if (!email) {
    next(ApiError.missingFields(["email"]));
    return;
  }

  // Check if user to delete is an admin
  const user: IUser | null = await getUserByEmail(email);
  if (!user) {
    next(ApiError.notFound(`User with email ${email} does not exist`));
    return;
  }

  const reqUser: IUser | undefined = req.user as IUser;
  if (reqUser.email === user.email) {
    next(ApiError.badRequest("Cannot delete self."));
    return;
  }
  if (user.admin) {
    next(ApiError.forbidden("Cannot delete an admin."));
    return;
  }

  try {
    // Delete associated requests and profile based on user role
    if (user.role === 'teacher') {
      // Delete all requests made by this teacher
      await deleteRequestsByTeacherId(user._id);
      // Delete the teacher profile
      await deleteTeacher(user._id);
    } else if (user.role === 'speaker') {
      // First get the speaker profile to get the speaker ID
      const speaker = await deleteSpeaker(user._id);
      if (speaker) {
        // Delete all requests that reference this speaker
        await deleteRequestsBySpeakerId(speaker._id);
      }
    }
    
    // Delete the user
    await deleteUserById(user._id);
    res.sendStatus(StatusCode.OK);
  } catch (error) {
    console.error("Error deleting user:", error);
    next(ApiError.internal("Failed to delete user."));
  }
};

const verifyToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { token } = req.params;
  getInviteByToken(token)
    .then((invite) => {
      if (invite) {
        res.status(StatusCode.OK).send(invite);
      } else {
        next(ApiError.notFound("Unable to retrieve invite"));
      }
    })
    .catch(() => {
      next(ApiError.internal("Error retrieving invite"));
    });
};

const inviteUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { emails } = req.body;
  if (!emails) {
    next(ApiError.missingFields(["email"]));
    return;
  }
  const emailList = emails.replaceAll(" ", "").split(",");
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/g;

  function validateEmail(email: string) {
    if (!email.match(emailRegex)) {
      next(ApiError.badRequest(`Invalid email: ${email}`));
    }
  }

  function combineEmailToken(email: string, invite: IInvite | null) {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    return [email, invite, verificationToken];
  }

  async function makeInvite(combinedList: any[]) {
    try {
      const email = combinedList[0];
      const existingInvite = combinedList[1];
      const verificationToken = combinedList[2];
      if (existingInvite) {
        await updateInvite(existingInvite, verificationToken);
      } else {
        await createInvite(email, verificationToken);
      }
    } catch (err: any) {
      next(ApiError.internal(`Error creating invite: ${err.message}`));
    }
  }

  async function sendInvite(combinedList: any[]) {
    try {
      const email = combinedList[0];
      const verificationToken = combinedList[2];

      await emailInviteLink(email, verificationToken);
    } catch (err: any) {
      next(ApiError.internal(`Error sending invite: ${err.message}`));
    }
  }

  try {
    if (emailList.length === 0) {
      next(ApiError.missingFields(["email"]));
      return;
    }
    emailList.forEach(validateEmail);
    const lowercaseEmailList: string[] = emailList.map((email: string) =>
      email.toLowerCase()
    );

    const userPromises = lowercaseEmailList.map(getUserByEmail);
    const existingUserList = await Promise.all(userPromises);

    const invitePromises = lowercaseEmailList.map(getInviteByEmail);
    const existingInviteList = await Promise.all(invitePromises);

    const existingUserEmails = existingUserList.map((user) =>
      user ? user.email : ""
    );
    const existingInviteEmails = existingInviteList.map((invite) =>
      invite ? invite.email : ""
    );

    const emailInviteList = lowercaseEmailList.filter((email) => {
      if (existingUserEmails.includes(email)) {
        throw ApiError.badRequest(`User with email ${email} already exists`);
      }
      return !existingUserEmails.includes(email);
    });

    const combinedList = emailInviteList.map((email) => {
      const existingInvite =
        existingInviteList[existingInviteEmails.indexOf(email)];
      return combineEmailToken(email, existingInvite);
    });

    const makeInvitePromises = combinedList.map(makeInvite);
    await Promise.all(makeInvitePromises);

    const sendInvitePromises = combinedList.map(sendInvite);
    await Promise.all(sendInvitePromises);

    res.sendStatus(StatusCode.CREATED);
  } catch (err: any) {
    next(ApiError.internal(`Unable to invite user: ${err.message}`));
  }
};

const inviteAdmin = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { email, firstName, lastName } = req.body;
  if (!email || !firstName || !lastName) {
    next(ApiError.missingFields(["email", "firstName", "lastName"]));
    return;
  }
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/g;
  if (!email.match(emailRegex)) {
    next(ApiError.badRequest(`Invalid email: ${email}`));
    return;
  }
  const lowercaseEmail = email.toLowerCase();
  const existingUser = await getUserByEmail(lowercaseEmail);
  if (existingUser) {
    next(ApiError.badRequest(`User with email ${lowercaseEmail} already exists`));
    return;
  }
  const existingInvite = await getInviteByEmail(lowercaseEmail);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  try {
    if (existingInvite) {
      await updateInvite(existingInvite, verificationToken, "admin", firstName, lastName);
    } else {
      await createInvite(lowercaseEmail, verificationToken, "admin", firstName, lastName);
    }
    // Send invite email (reuse emailInviteLink)
    await emailInviteLink(lowercaseEmail, verificationToken);
    res.sendStatus(StatusCode.CREATED);
  } catch (err: any) {
    next(ApiError.internal(`Unable to invite admin: ${err.message}`));
  }
};

/**
 * Create a speaker directly with admin privileges
 * Creates user account, speaker profile, and sends password reset email
 */
const createSpeakerDirectly = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { email, firstName, lastName, organization, bio, city, state, country, industry, grades, languages } = req.body;
  
  if (!email || !firstName || !lastName || !organization || !bio || !city) {
    next(ApiError.missingFields(["email", "firstName", "lastName", "organization", "bio", "city"]));
    return;
  }
  
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/g;
  if (!email.match(emailRegex)) {
    next(ApiError.badRequest(`Invalid email: ${email}`));
    return;
  }
  
  const lowercaseEmail = email.toLowerCase();
  const existingUser = await getUserByEmail(lowercaseEmail);
  if (existingUser) {
    next(ApiError.badRequest(`User with email ${lowercaseEmail} already exists`));
    return;
  }
  
  try {
    // Generate a random password for the user
    const tempPassword = crypto.randomBytes(16).toString("hex");
    
    // Create user account
    const user = await createUser(
      firstName,
      lastName,
      lowercaseEmail,
      tempPassword,
      "speaker"
    );
    
    if (!user) {
      next(ApiError.internal("Failed to create user account"));
      return;
    }
    
    // Create speaker profile with visibility = true
    const speaker = await createSpeaker(
      user._id,
      organization,
      bio,
      city,
      state || '',
      country || undefined,
      false, // inperson - will be updated by speaker
      false, // virtual - will be updated by speaker
      undefined, // imageUrl
      industry || [],
      grades || [],
      undefined, // coordinates
      languages || ['English'],
      true // visible = true for admin-created speakers
    );
    
    // Send password reset email
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();
    
    // Send password reset email
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== '') {
      try {
        await emailResetPasswordLink(lowercaseEmail, resetToken);
      } catch (emailError) {
        console.error('Password reset email sending failed:', emailError);
        // Continue even if email fails
      }
    } else {
      console.log('SendGrid not configured - skipping password reset email');
    }
    
    res.status(StatusCode.CREATED).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        verified: user.verified
      },
      speaker: {
        _id: speaker._id,
        organization: speaker.organization,
        bio: speaker.bio,
        city: speaker.city,
        state: speaker.state,
        country: speaker.country,
        visible: speaker.visible
      }
    });
  } catch (err: any) {
    next(ApiError.internal(`Unable to create speaker: ${err.message}`));
  }
};

export { getAllUsers, deleteUser, verifyToken, inviteUser, inviteAdmin, createSpeakerDirectly };
