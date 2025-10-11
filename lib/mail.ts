import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: "onboarding@tahirabbas.com",
    to: email,
    subject: "Reset password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: "onboarding@tahirabbas.com",
    to: email,
    subject: "Confirm Your Email Address",
    html: `
      <p>Thank you for registering!</p>
      <p>Please confirm your email address by clicking the link below:</p>
      <p><a href="${confirmLink}">Confirm Email Address</a></p>
      <p>If you did not create an account, no further action is required.</p>
    `,
  });
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: "onboarding@tahirabbas.com",
    to: email,
    subject: "2FA Code",
    html: `<p>Tour 2FA code: <strong>${token}</strong></p>`,
  });
};
