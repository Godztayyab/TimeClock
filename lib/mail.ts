import { Resend } from "resend";
import nodemailer from "nodemailer";
import { en } from "@/en";

const domain = process.env.NEXT_PUBLIC_APP_URL;
const emailService = process.env.EMAIL_SERVICE || "resend"; // Default to Resend
const resend =
  emailService === "resend" ? new Resend(process.env.RESEND_API_KEY) : null;

// Configure Nodemailer for Google SMTP
const transporter =
  emailService === "google"
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GOOGLE_SMTP_USER,
          pass: process.env.GOOGLE_SMTP_PASS,
        },
      })
    : null;

// Generic email sending function
const sendEmail = async (to: string, subject: string, html: string) => {
  switch (emailService) {
    case "resend":
      if (resend) {
        await resend.emails.send({
          from: en.emailConfig.defaultEmail,
          to,
          subject,
          html,
        });
      }
      break;
    case "google":
      if (transporter) {
        await transporter.sendMail({
          from: en.emailConfig.defaultEmail,
          to,
          subject,
          html,
        });
      }
      break;
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;
  const subject = "Reset password";
  const html = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;
  await sendEmail(email, subject, html);
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  const subject = "Confirm Your Email Address";
  const html = `
    <p>Thank you for registering!</p>
    <p>Please confirm your email address by clicking the link below:</p>
    <p><a href="${confirmLink}">Confirm Email Address</a></p>
    <p>If you did not create an account, no further action is required.</p>
  `;
  await sendEmail(email, subject, html);
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const subject = "2FA Code";
  const html = `<p>Your 2FA code: <strong>${token}</strong></p>`;
  await sendEmail(email, subject, html);
};
