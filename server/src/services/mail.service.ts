/**
 * All the functions related to sending emails with SendGrid
 */
import "dotenv/config";
import SGmail, { MailDataRequired } from "@sendgrid/mail";


const appName = "CELF Speaker Portal"; 
const senderName = "CELF Team"; 
const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// eslint-disable-next-line no-useless-concat
SGmail.setApiKey(`${process.env.SENDGRID_API_KEY}`);


/**
 * Sends a reset password link to a user
 * @param email The email of the user to send the link to
 * @param token The unique token identifying this reset attempt for the user
 */
const emailResetPasswordLink = async (email: string, token: string) => {
  const resetLink = `${baseUrl}/reset-password/${token}`;
  const mailSettings: MailDataRequired = {
    from: {
      email: process.env.SENDGRID_EMAIL_ADDRESS || "missing@mail.com",
      name: senderName,
    },
    to: email,
    subject: "Link to Reset Password",
    html:
      <p>Hello,</p>
      <p>We received a request to reset your password for the ${APP_NAME}.</p>
      <p><a href="${resetLink}">Click here to set a new password</a>.</p>
      <p>If you didn’t request this change, you can safely ignore this email—your account will remain secure.</p>
      <p>— The ${SENDER_NAME}</p>`,
    };
    // Send the email and propogate the error up if one exists
    await SGmail.send(mailSettings);
};

/**
 * Sends an email to verify an email account
 * @param email The email of the user to send the link to
 * @param token The unique token identifying this verification attempt
 */
const emailVerificationLink = async (email: string, token: string) => {
  const resetLink = `${baseUrl}/verify-account/${token}`;
  const mailSettings: MailDataRequired = {
    from: {
      email: process.env.SENDGRID_EMAIL_ADDRESS || "missing@mail.com",
      name: senderName,
    },
    to: email,
    subject: "Verify account",
    html:
      `<p> Please visit the following ` +
      `<a href=${resetLink}>link</a> ` +
      `to verify your account for ${appName} and complete registration</p>` +
      `<p><strong>Important:</strong> If you are currently logged into any account, please log out first before clicking the verification link, otherwise the verification will not work properly.</p>` +
      `<p>If you did not attempt to register an account with this email address, ` +
      `please ignore this message.</p>`,
  };
  // Send the email and propogate the error up if one exists
  await SGmail.send(mailSettings);
};

/**
 * Sends an email with an invite link to create an account
 * @param email The email of the user to send the link to
 * @param token The unique token identifying this verification attempt
 */
const emailInviteLink = async (email: string, token: string) => {
  const resetLink = `${baseUrl}/invite/${token}`;
  const mailSettings: MailDataRequired = {
    from: {
      email: process.env.SENDGRID_EMAIL_ADDRESS || "missing@mail.com",
      name: senderName,
    },
    to: email,
    subject: "Verify account",
    html:
      `<p> Please visit the following ` +
      `<a href=${resetLink}>link</a> ` +
      `to create your account for ${appName} and complete registration</p>` +
      `<p><strong>Important:</strong> If you are currently logged into any account, please log out first before clicking the invite link, otherwise the registration will not work properly.</p>` +
      `<p>If you did not attempt to register an account with this email address, ` +
      `please ignore this message.</p>`,
  };
  // Send the email and propogate the error up if one exists
  await SGmail.send(mailSettings);
};

export { emailVerificationLink, emailResetPasswordLink, emailInviteLink };
