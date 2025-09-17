/**
 * All the functions related to sending emails with Resend
 */
import "dotenv/config";
import { Resend } from "resend";

const appName = "CELF Speaker Portal"; 
const senderName = "CELF Team"; 
const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a reset password link to a user
 * @param email The email of the user to send the link to
 * @param token The unique token identifying this reset attempt for the user
 */
const emailResetPasswordLink = async (email: string, token: string) => {
  // TODO DURING DEVELOPMENT: use a template to make this prettier and match client's style
  const resetLink = `${baseUrl}/reset-password/${token}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "missing@mail.com";
  
  await resend.emails.send({
    from: `${senderName} <${fromEmail}>`,
    to: [email],
    subject: "Link to Reset Password",
    html:
      `<p>You are receiving this because you (or someone else) have requested ` +
      `the reset of your account password for ${appName}. Please visit this ` +
      `<a href=${resetLink}>link</a> ` +
      `within an hour of receiving this email to successfully reset your password </p>` +
      `<p><strong>Important:</strong> If you are currently logged into any account, please log out first before clicking the reset link, otherwise the reset will not work properly.</p>` +
      `<p>If you did not request this change, please ignore this email and your ` +
      `account will remain secured.</p>`,
  });
};

/**
 * Sends an email to verify an email account
 * @param email The email of the user to send the link to
 * @param token The unique token identifying this verification attempt
 */
const emailVerificationLink = async (email: string, token: string) => {
  const resetLink = `${baseUrl}/verify-account/${token}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "missing@mail.com";
  
  await resend.emails.send({
    from: `${senderName} <${fromEmail}>`,
    to: [email],
    subject: "Verify account",
    html:
      `<p> Please visit the following ` +
      `<a href=${resetLink}>link</a> ` +
      `to verify your account for ${appName} and complete registration</p>` +
      `<p><strong>Important:</strong> If you are currently logged into any account, please log out first before clicking the verification link, otherwise the verification will not work properly.</p>` +
      `<p>If you did not attempt to register an account with this email address, ` +
      `please ignore this message.</p>`,
  });
};

/**
 * Sends an email with an invite link to create an account
 * @param email The email of the user to send the link to
 * @param token The unique token identifying this verification attempt
 */
const emailInviteLink = async (email: string, token: string) => {
  const resetLink = `${baseUrl}/invite/${token}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "missing@mail.com";
  
  await resend.emails.send({
    from: `${senderName} <${fromEmail}>`,
    to: [email],
    subject: "Verify account",
    html:
      `<p> Please visit the following ` +
      `<a href=${resetLink}>link</a> ` +
      `to create your account for ${appName} and complete registration</p>` +
      `<p><strong>Important:</strong> If you are currently logged into any account, please log out first before clicking the invite link, otherwise the registration will not work properly.</p>` +
      `<p>If you did not attempt to register an account with this email address, ` +
      `please ignore this message.</p>`,
  });
};

export { emailVerificationLink, emailResetPasswordLink, emailInviteLink };
