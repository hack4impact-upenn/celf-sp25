/**
 * A file for defining functions used to interact with the backend server
 * for authentication purposes.
 */
import { postData, deleteData } from '../util/api.tsx';

/**
 * Sends a request to the server to log in a user
 * @param email The email of the user to log in
 * @param password The password for the user's account
 * @throws An {@link Error} with a `messsage` field describing the issue in verifying
 */
async function loginUser(email: string, password: string) {
  const lowercaseEmail = email.toLowerCase();
  const res = await postData('auth/login', {
    email: lowercaseEmail,
    password,
  });
  if (res.error) {
    throw Error(res.error.message);
  }
  return res.data;
}

/**
 * Sends a request to the server to verify an account
 * @param verificationToken The token used to identify the verification attempt
 * @throws An {@link Error} with a `messsage` field describing the issue in verifying
 */
async function verifyAccount(verificationToken: string) {
  const res = await postData('auth/verify-account', {
    token: verificationToken,
  });
  if (res.error) {
    throw Error(res.error.message);
  }
}

/**
 * Sends a request to the server to register a user for an account
 * @param firstName
 * @param lastName
 * @param email
 * @param password
 * @param role
 * @param school (optional) School for teacher registration
 * @param gradeLevel (optional) Grade level for teacher registration
 * @param city (optional) City for teacher registration
 * @param state (optional) State for teacher registration
 * @param country (optional) Country for teacher registration
 * @param subjects (optional) Subjects taught for teacher registration
 * @param bio (optional) Bio for teacher registration
 * @throws An {@link Error} with a `messsage` field describing the issue in verifying
 */
async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role?: string,
  school?: string,
  gradeLevel?: string,
  city?: string,
  state?: string,
  country?: string,
  subjects?: string[],
  bio?: string,
  organization?: string,
) {
  const lowercaseEmail = email.toLowerCase();
  const payload: any = {
    firstName,
    lastName,
    email: lowercaseEmail,
    password,
  };
  if (role) payload.role = role;
  if (school) payload.school = school;
  if (gradeLevel) payload.gradeLevel = gradeLevel;
  if (city) payload.city = city;
  if (state) payload.state = state;
  if (country) payload.country = country;
  if (subjects) payload.subjects = subjects;
  if (bio) payload.bio = bio;
  if (organization) payload.organization = organization;
  const res = await postData('auth/register', payload);
  if (res.error) {
    throw Error(res.error.message);
  }
}

/**
 * Sends a request to the server to email a reset password link to a user
 * @param email The email of the user
 * @throws An {@link Error} with a `messsage` field describing the issue in
 * sending the email
 */
async function sendResetPasswordEmail(email: string) {
  const lowercaseEmail = email.toLowerCase();
  const res = await postData('auth/send-reset-password-email', {
    email: lowercaseEmail,
  });
  if (res.error) {
    throw Error(res.error.message);
  }
}

/**
 * Sends a request to the server to reset a password for a user
 * @param password The new password for the user
 * @param token The token identifying the reset password attempt
 * @throws An {@link Error} with a `messsage` field describing the issue in
 * resetting the password
 */
async function resetPassword(password: string, token: string) {
  const res = await postData('auth/reset-password', { password, token });
  if (res.error) {
    throw Error(res.error.message);
  }
}

/**
 * Sends a request to the server to register a new user via an invite
 * @param firstName
 * @param lastName
 * @param email
 * @param password
 * @param inviteToken
 * @throws An {@link Error} with a `messsage` field describing the issue in
 * resetting the password
 */
async function registerInvite(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  inviteToken: string,
) {
  const lowercaseEmail = email.toLowerCase();
  const res = await postData('auth/register-invite', {
    firstName,
    lastName,
    email: lowercaseEmail,
    password,
    inviteToken,
  });
  if (res.error) {
    throw Error(res.error.message);
  }
}

/**
 * Sends a request to the server to delete the current user's account
 * @throws An {@link Error} with a `message` field describing the issue in deleting the account
 */
async function deleteAccount() {
  const res = await deleteData('user/me');
  if (res.error) {
    throw Error(res.error.message);
  }
  return res.data;
}

/**
 * Sends a request to the server to change the password for a logged-in user
 * @param currentPassword The user's current password
 * @param newPassword The new password to set
 * @throws An {@link Error} with a `message` field describing the issue in changing the password
 */
async function changePassword(currentPassword: string, newPassword: string) {
  const res = await postData('auth/change-password', { currentPassword, newPassword });
  if (res.error) {
    throw Error(res.error.message);
  }
  return res.data;
}

/**
 * Sends a request to the server to resend verification email to a user
 * @param email The email of the user to resend verification to
 * @throws An {@link Error} with a `message` field describing the issue
 */
async function resendVerificationEmail(email: string) {
  const res = await postData('auth/resend-verification-email', { email });
  if (res.error) {
    throw Error(res.error.message);
  }
  return res.data;
}

export {
  register,
  loginUser,
  verifyAccount,
  sendResetPasswordEmail,
  resetPassword,
  registerInvite,
  deleteAccount,
  changePassword,
  resendVerificationEmail,
};
