/**
 * All the functions related to sending emails with AWS SES
 */
import "dotenv/config";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const appName = "CELF Speaker Portal"; 
const senderName = "CELF Team"; 
const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// Initialize AWS SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined, // Will use IAM role if running on AWS
});

const fromEmail = process.env.SES_FROM_EMAIL;

// Use display name format if SES_SANDBOX_MODE is not set to 'true'
// In sandbox mode, use just the email to avoid verification issues
const useDisplayName = process.env.SES_SANDBOX_MODE !== 'true';
const sourceEmail = useDisplayName ? `${senderName} <${fromEmail}>` : fromEmail;


/**
 * Sends a reset password link to a user
 * @param email The email of the user to send the link to
 * @param token The unique token identifying this reset attempt for the user
 */
const emailResetPasswordLink = async (email: string, token: string) => {
  const resetLink = `${baseUrl}/reset-password/${token}`;
  const htmlContent =
    `<p>Hello,</p> `+
    `<p>We received a request to reset your password for the ${appName}.</p> `+
    `<p><a href="${resetLink}">Click here to set a new password</a>.</p> `+
    `<p>If you didn't request this change, you can safely ignore this email—your account will remain secure.</p> `+
    `<p>— The ${senderName}</p>`;

  const command = new SendEmailCommand({
    Source: sourceEmail,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: "Link to Reset Password",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: htmlContent,
          Charset: "UTF-8",
        },
      },
    },
  });

  // Send the email and propogate the error up if one exists
  await sesClient.send(command);
};

/**
 * Sends an email to verify an email account
 * @param email The email of the user to send the link to
 * @param token The unique token identifying this verification attempt
 */
const emailVerificationLink = async (email: string, token: string) => {
  const resetLink = `${baseUrl}/verify-account/${token}`;
  const htmlContent =
    `<p> Please visit the following ` +
    `<a href=${resetLink}>link</a> ` +
    `to verify your account for ${appName} and complete registration</p>` +
    `<p>If you did not attempt to register an account with this email address, ` +
    `please ignore this message.</p>`;

  const command = new SendEmailCommand({
    Source: sourceEmail,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: "Verify account",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: htmlContent,
          Charset: "UTF-8",
        },
      },
    },
  });

  // Send the email and propogate the error up if one exists
  await sesClient.send(command);
};

/**
 * Sends an email with an invite link to create an account
 * @param email The email of the user to send the link to
 * @param token The unique token identifying this verification attempt
 */
const emailInviteLink = async (email: string, token: string) => {
  const resetLink = `${baseUrl}/invite/${token}`;
  const htmlContent =
    `<p> Please visit the following ` +
    `<a href=${resetLink}>link</a> ` +
    `to create your account for ${appName} and complete registration</p>` +
    `<p>If you did not attempt to register an account with this email address, ` +
    `please ignore this message.</p>`;

  const command = new SendEmailCommand({
    Source: sourceEmail,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: "Verify account",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: htmlContent,
          Charset: "UTF-8",
        },
      },
    },
  });

  // Send the email and propogate the error up if one exists
  await sesClient.send(command);
};

export { emailVerificationLink, emailResetPasswordLink, emailInviteLink };
