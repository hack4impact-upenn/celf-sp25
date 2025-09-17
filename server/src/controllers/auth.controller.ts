/**
 * All the controller functions containing the logic for routes relating to a
 * user's authentication such as login, logout, and registration.
 */
import express from "express";
import passport from "passport";
import crypto from "crypto";
import { hash, compare } from "bcrypt";
import { IUser } from "../models/user.model";
import StatusCode from "../util/statusCode";
import {
  passwordHashSaltRounds,
  createUser,
  getUserByEmail,
  getUserByResetPasswordToken,
  getUserByVerificationToken,
  getUserByEmailWithPassword,
} from "../services/user.service";
import {
  emailResetPasswordLink,
  emailVerificationLink,
} from "../services/mail.service";
import ApiError from "../util/apiError";
import {
  getInviteByToken,
  removeInviteByToken,
} from "../services/invite.service";
import { IInvite } from "../models/invite.model";
import { createTeacher } from "../services/teacher.service";
import { createSpeaker } from "../services/speaker.service";

/**
 * A controller function to login a user and create a session with Passport.
 * On success, the user's information is returned.
 * Else, send an appropriate error message.
 */

const login = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.isAuthenticated()) {
    next(ApiError.badRequest("Already logged in"));
    return;
  }
  // TODO: look more into when each of these errors are thrown
  passport.authenticate(
    ["local"],
    {
      failureMessage: true,
    },
    // Callback function defined by passport strategy in configPassport
    (err: Error | null, user: any, _info: any) => {
      if (err) {
        next(ApiError.internal("Failed to authenticate user."));
        return;
      }
      if (!user) {
        next(ApiError.unauthorized("Incorrect credentials"));
        return;
      }
      if (!user!.verified) {
        next(ApiError.unauthorized("Need to verify account by email"));
        return;
      }
      req.logIn(user, (error) => {
        if (error) {
          next(ApiError.internal("Failed to log in user"));
          return;
        }
        // Send success response after successful login
        res.status(StatusCode.OK).json({
          message: "Login successful",
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            verified: user.verified,
            admin: user.admin,
            role: user.role
          }
        });
      });
    }
  )(req, res, next);
};

/**
 * A controller function to logout a user with Passport and clear the session.
 */
const logout = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // Logout with Passport which modifies the request object
  req.logout((err) => {
    if (err) {
      next(ApiError.internal("Failed to log out user"));
      return;
    }
    // Destroy the session
    if (req.session) {
      req.session.destroy((e) => {
        if (e) {
          next(ApiError.internal("Unable to logout properly"));
        } else {
          res.sendStatus(StatusCode.OK);
        }
      });
    } else {
      // No session to destroy, send success response
      res.sendStatus(StatusCode.OK);
    }
  });
};

/**
 * A controller function to register a user in the database.
 */
const register = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { firstName, lastName, email, password, role, school, gradeLevel, city, state, country, subjects, bio, organization } = req.body;
  if (!firstName || !lastName || !email || !password) {
    next(
      ApiError.missingFields(["firstName", "lastName", "email", "password"])
    );
    return;
  }

  // If role is teacher, validate additional required fields
  if (role === 'teacher') {
    if (!school || !gradeLevel || !city || !country || !subjects || !bio) {
      next(
        ApiError.missingFields(["school", "gradeLevel", "city", "country", "subjects", "bio"])
      );
      return;
    }
  }

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/g;

  const passwordRegex = /^[a-zA-Z0-9!?$%^*)(+=._@#&-]{6,61}$/;

  const nameRegex = /^[a-zA-Z\s,.'-]+$/;

  // Check each validation separately to provide specific error messages
  if (!email.match(emailRegex)) {
    next(ApiError.badRequest("Invalid email format. Please enter a valid email address."));
    return;
  }

  if (!password.match(passwordRegex)) {
    next(ApiError.badRequest("Invalid password format. Password must be 6-61 characters and contain only letters, numbers, and special characters."));
    return;
  }

  if (!firstName.match(nameRegex)) {
    next(ApiError.badRequest("Invalid first name format. Name can only contain letters, spaces, commas, periods, apostrophes, and hyphens."));
    return;
  }

  if (!lastName.match(nameRegex)) {
    next(ApiError.badRequest("Invalid last name format. Name can only contain letters, spaces, commas, periods, apostrophes, and hyphens."));
    return;
  }

  // Only check if user is logged in if the request is not from an admin
  const reqUser = req.user as IUser;
  if (!reqUser?.admin && req.isAuthenticated()) {
    next(ApiError.badRequest("Already logged in."));
    return;
  }

  const lowercaseEmail = email.toLowerCase();
  const existingUser: IUser | null = await getUserByEmail(lowercaseEmail);
  if (existingUser) {
    next(
      ApiError.badRequest(
        `An account with email ${lowercaseEmail} already exists.`
      )
    );
    return;
  }

  // Create user and send verification email
  try {
    const user = await createUser(
      firstName,
      lastName,
      lowercaseEmail,
      password,
      role === 'teacher' ? 'teacher' : 'speaker'
    );

    // Create teacher profile if role is teacher
    if (role === 'teacher' && user) {
      await createTeacher(user._id, school, gradeLevel, city, state, subjects, bio, country);
    }

    // Create minimal speaker profile if role is speaker
    if (role === 'speaker' && user) {
      await createSpeaker(
        user._id,
        organization || '', // organization from form
        '', // bio - will be updated later when completing profile
        city || '', // city from form
        state || '', // state from form
        country || undefined, // country from form
        false, // inperson - will be updated later
        false, // virtual - will be updated later
        undefined, // imageUrl
        [], // industry - empty array, will be updated later
        [], // grades - empty array, will be updated later
        undefined, // coordinates
        ['English'] // languages - default value
      );
    }

    // Note: Speaker profiles are created with default values and visibility set to false
    // Speakers must complete their profile through the speaker submission flow to become visible

    // If created by admin, automatically verify the user
    if (reqUser?.admin) {
      user!.verified = true;
      await user?.save();
    } else if (process.env.NODE_ENV === "test") {
      user!.verified = true;
      await user?.save();
    } else {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      user!.verificationToken = verificationToken;
      await user!.save();
      
      // Only send email if Resend is configured
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== '') {
        try {
          await emailVerificationLink(lowercaseEmail, verificationToken);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Continue registration even if email fails
        }
      } else {
        console.log('Resend not configured - skipping verification email');
        // Auto-verify in development if no Resend
        if (process.env.NODE_ENV === 'development') {
          user!.verified = true;
          user!.verificationToken = undefined;
          await user!.save();
        }
      }
    }
    res.status(StatusCode.CREATED).send(user);
  } catch (err) {
    console.error("Registration error:", err);
    next(ApiError.internal("Unable to register user."));
  }
};

/**
 * A dummy controller function which sends a 200 OK status code. Should be used to close a request after a middleware call.
 */
const approve = async (req: express.Request, res: express.Response) => {
  res.sendStatus(StatusCode.OK);
};

/**
 * A controller function to verify an account with a verification token.
 */
const verifyAccount = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { token } = req.body;
  if (!token) {
    next(ApiError.missingFields(["token"]));
    return;
  }

  const user = await getUserByVerificationToken(token);
  if (!user) {
    next(ApiError.badRequest("Invalid verification token."));
    return;
  }
  user!.verificationToken = undefined;
  user!.verified = true;
  try {
    await user!.save();
    res.sendStatus(StatusCode.OK);
  } catch (err) {
    next(ApiError.internal("Unable to verify the account."));
  }
};

/**
 * A controller function to send a password reset link to a user's email.
 */
const sendResetPasswordEmail = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { email } = req.body;
  if (!email) {
    next(ApiError.missingFields(["email"]));
    return;
  }
  const lowercaseEmail = email.toLowerCase();

  const user: IUser | null = await getUserByEmail(lowercaseEmail);
  if (!user) {
    next(
      ApiError.notFound(`No user with email ${lowercaseEmail} is registered.`)
    );
    return;
  }

  // Generate a token for the user for this reset link
  const token = crypto.randomBytes(32).toString("hex");
  user!.resetPasswordToken = token;
  user!.resetPasswordTokenExpiryDate = new Date(
    new Date().getTime() + 60 * 60 * 1000
  ); // Expires in an hour
  await user!.save();

  // Send the email and return an appropriate response
  emailResetPasswordLink(lowercaseEmail, token)
    .then(() =>
      res.status(StatusCode.CREATED).send({
        message: `Reset link has been sent to ${lowercaseEmail}`,
      })
    )
    .catch(() => {
      next(ApiError.internal("Failed to email reset password link."));
    });
};

/**
 * A controller function to reset a user's password.
 */
const resetPassword = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { password, token } = req.body;
  if (!password || !token) {
    next(ApiError.missingFields(["password", "token"]));
    return;
  }

  const user: IUser | null = await getUserByResetPasswordToken(token);
  if (!user) {
    next(ApiError.badRequest("Invalid reset password token."));
    return;
  }

  if (Date.now() > user.resetPasswordTokenExpiryDate!.getTime()) {
    next(ApiError.forbidden("Reset password token has expired."));
    return;
  }
  // Hash the password before storing
  let hashedPassword: string | undefined;
  try {
    hashedPassword = await hash(password, passwordHashSaltRounds);
  } catch (err) {
    next(ApiError.internal("Unable to reset the password"));
    return;
  }

  // Set new password for user
  user!.password = hashedPassword;
  user!.resetPasswordToken = undefined;
  user!.resetPasswordTokenExpiryDate = undefined;
  try {
    await user.save();
    res.sendStatus(StatusCode.OK);
  } catch (err) {
    next(ApiError.internal("Unable to reset the password"));
  }
};

/**
 * A controller function to change a user's password (must be authenticated).
 * Expects currentPassword and newPassword in the body.
 */
const changePassword = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const user = req.user as IUser;
    if (!user || !user.email) {
      next(ApiError.unauthorized("User not authenticated"));
      return;
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      next(ApiError.missingFields(["currentPassword", "newPassword"]));
      return;
    }
    // Get user with password
    const userWithPassword = await getUserByEmailWithPassword(user.email);
    if (!userWithPassword || !userWithPassword.password) {
      next(ApiError.notFound("User not found"));
      return;
    }
    // Verify current password
    const isMatch = await compare(currentPassword, userWithPassword.password);
    if (!isMatch) {
      next(ApiError.unauthorized("Current password is incorrect"));
      return;
    }
    // Hash new password
    const hashedPassword = await hash(newPassword, passwordHashSaltRounds);
    userWithPassword.password = hashedPassword;
    await userWithPassword.save();
    res.status(StatusCode.OK).json({ message: "Password changed successfully" });
  } catch (err) {
    next(ApiError.internal("Unable to change password"));
  }
};

const registerInvite = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { firstName, lastName, email, password, inviteToken } = req.body;
  if (!firstName || !lastName || !email || !password || !inviteToken) {
    next(
      ApiError.missingFields([
        "firstName",
        "lastName",
        "email",
        "password",
        "inviteToken",
      ])
    );
    return;
  }
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/g;

  const passwordRegex = /^[a-zA-Z0-9!?$%^*)(+=._@#&-]{6,61}$/;

  const nameRegex = /^[a-zA-Z\s,.'-]+$/;

  // Check each validation separately to provide specific error messages
  if (!email.match(emailRegex)) {
    next(ApiError.badRequest("Invalid email format. Please enter a valid email address."));
    return;
  }

  if (!password.match(passwordRegex)) {
    next(ApiError.badRequest("Invalid password format. Password must be 6-61 characters and contain only letters, numbers, and special characters."));
    return;
  }

  if (!firstName.match(nameRegex)) {
    next(ApiError.badRequest("Invalid first name format. Name can only contain letters, spaces, commas, periods, apostrophes, and hyphens."));
    return;
  }

  if (!lastName.match(nameRegex)) {
    next(ApiError.badRequest("Invalid last name format. Name can only contain letters, spaces, commas, periods, apostrophes, and hyphens."));
    return;
  }

  if (req.isAuthenticated()) {
    next(ApiError.badRequest("Already logged in."));
    return;
  }

  // Check if invite exists
  const invite: IInvite | null = await getInviteByToken(inviteToken);
  if (!invite || invite.email !== email) {
    next(ApiError.badRequest(`Invalid invite`));
    return;
  }

  const lowercaseEmail = email.toLowerCase();
  // Check if user exists
  const existingUser: IUser | null = await getUserByEmail(lowercaseEmail);
  if (existingUser) {
    next(
      ApiError.badRequest(
        `An account with email ${lowercaseEmail} already exists.`
      )
    );
    return;
  }

  // Create user
  try {
    const user = await createUser(
      firstName,
      lastName,
      lowercaseEmail,
      password
    );
    user!.role = invite.role;
    if (invite.role === "admin") {
      user!.admin = true;
    }
    user!.verified = true;
    await user?.save();
    await removeInviteByToken(inviteToken);
    res.sendStatus(StatusCode.CREATED);
  } catch (err) {
    next(ApiError.internal("Unable to register user."));
  }
};

/**
 * A controller function to resend verification email to a user
 */
const resendVerificationEmail = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { email } = req.body;
  if (!email) {
    next(ApiError.missingFields(["email"]));
    return;
  }
  const lowercaseEmail = email.toLowerCase();

  const user: IUser | null = await getUserByEmail(lowercaseEmail);
  if (!user) {
    next(
      ApiError.notFound(`No user with email ${lowercaseEmail} is registered.`)
    );
    return;
  }

  if (user.verified) {
    next(ApiError.badRequest("User account is already verified."));
    return;
  }

  try {
    // Generate a new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    await user.save();

    // Only send email if Resend is configured
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== '') {
      try {
        await emailVerificationLink(lowercaseEmail, verificationToken);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue even if email fails - just like in registration
      }
    } else {
      console.log('Resend not configured - skipping verification email');
      // Auto-verify in development if no Resend
      if (process.env.NODE_ENV === 'development') {
        user.verified = true;
        user.verificationToken = undefined;
        await user.save();
      }
    }

    // Always return success, just like registration does
    res.status(StatusCode.OK).send({
      message: `Verification email has been sent to ${lowercaseEmail}`,
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    next(ApiError.internal("Failed to resend verification email."));
  }
};

export {
  login,
  logout,
  register,
  approve,
  verifyAccount,
  sendResetPasswordEmail,
  resetPassword,
  registerInvite,
  changePassword,
  resendVerificationEmail,
};
