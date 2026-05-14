const { Resend } = require("resend");

const env = require("../config/env");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getOtpExpiryMinutes() {
  const minutes = Math.ceil(Number(env.otpExpiresInMs || 5 * 60 * 1000) / 60000);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 5;
}

function buildOtpEmailTemplate(otp) {
  const businessName = env.businessName || "Wadhwani Associates";
  const expiryMinutes = getOtpExpiryMinutes();
  const safeOtp = escapeHtml(otp);

  return {
    subject: "Your Login OTP",
    text: [
      `${businessName}`,
      "",
      `Your login OTP is ${otp}.`,
      `Expiry: ${expiryMinutes} minutes.`,
      "Do not share this code with anyone.",
    ].join("\n"),
    html: `
      <div style="margin:0;padding:32px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:32px;">
          <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:#0f766e;">
            Secure Login
          </p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">
            Your Login OTP
          </h1>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#475569;">
            Use this one-time password to continue to your client workspace.
          </p>
          <div style="margin:0 0 20px;padding:20px;border-radius:20px;background:#ecfeff;border:1px solid #99f6e4;text-align:center;">
            <div style="font-size:36px;font-weight:700;letter-spacing:0.28em;color:#115e59;">${safeOtp}</div>
          </div>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#334155;">
            Expiry: <strong>${expiryMinutes} minutes</strong>
          </p>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">
            Do not share this code with anyone.
          </p>
        </div>
      </div>
    `,
  };
}

function getResendClient() {
  if (!env.resendApiKey) {
    throw new AppError("RESEND_API_KEY is required for OTP email delivery.", 503, "EMAIL_PROVIDER_NOT_CONFIGURED");
  }

  if (!env.emailFrom) {
    throw new AppError("EMAIL_FROM is required for OTP email delivery.", 503, "EMAIL_SENDER_NOT_CONFIGURED");
  }

  return new Resend(env.resendApiKey);
}

async function sendEmailOtp(to, otp) {
  const normalizedTo = String(to || "").trim().toLowerCase();
  const normalizedOtp = String(otp || "").trim();

  if (!normalizedTo) {
    throw new AppError("A valid email address is required.", 400, "VALIDATION_ERROR");
  }

  if (!normalizedOtp) {
    throw new AppError("A valid OTP is required.", 400, "VALIDATION_ERROR");
  }

  const resend = getResendClient();
  const template = buildOtpEmailTemplate(normalizedOtp);

  try {
    const response = await resend.emails.send({
      from: env.emailFrom,
      to: [normalizedTo],
      replyTo: env.emailReplyTo || undefined,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (response.error) {
      throw new Error(response.error.message || "Resend email request failed.");
    }

    return {
      provider: "resend",
      id: response.data ? response.data.id : null,
    };
  } catch (error) {
    logger.error("auth_email_otp_send_failed", {
      email: normalizedTo,
      message: error.message,
      stack: error.stack,
    });

    throw new AppError("Unable to send login OTP email right now.", 502, "EMAIL_DELIVERY_FAILED");
  }
}

module.exports = {
  sendEmailOtp,
};