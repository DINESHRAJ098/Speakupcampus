import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

/**
 * Send an OTP email via Resend.
 * Requires RESEND_API_KEY and RESEND_EMAIL_FROM environment variables in Convex.
 */
export const sendOTPEmail = action({
  args: {
    to: v.string(),
    otp: v.string(),
    purpose: v.union(v.literal("verification"), v.literal("password_reset")),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_EMAIL_FROM;

    if (!apiKey) {
      console.log(`[SpeakUp Campus] OTP for ${args.to}: ${args.otp} (email not configured)`);
      return { success: false, message: "Email service not configured. OTP logged to console." };
    }

    const subject = args.purpose === "verification"
      ? "Verify Your Email — SpeakUp Campus"
      : "Reset Your Password — SpeakUp Campus";

    const purposeText = args.purpose === "verification"
      ? "Use this code to verify your email address and complete your registration."
      : "Use this code to reset your password. If you didn't request this, ignore this email.";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#1a1a2e;border-radius:16px;border:1px solid #2a2a3e;overflow:hidden;">
    <div style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #2a2a3e;">
      <div style="display:inline-flex;width:48px;height:48px;border-radius:12px;background:#6366f1;color:#fff;font-size:20px;font-weight:bold;align-items:center;justify-content:center;">S</div>
      <h1 style="color:#e2e8f0;font-size:22px;margin:16px 0 8px;">SpeakUp Campus</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0;">Campus Grievance Management</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#cbd5e1;font-size:15px;margin:0 0 8px;">${purposeText}</p>
      <div style="background:#0f0f1a;border:1px solid #2a2a3e;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
        <p style="color:#64748b;font-size:12px;margin:0 0 8px;letter-spacing:2px;">YOUR VERIFICATION CODE</p>
        <p style="color:#e2e8f0;font-size:36px;font-weight:bold;letter-spacing:8px;margin:0;">${args.otp}</p>
      </div>
      <p style="color:#64748b;font-size:12px;margin:0;">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #2a2a3e;text-align:center;">
      <p style="color:#475569;font-size:11px;margin:0;">© ${new Date().getFullYear()} SpeakUp Campus. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    try {
      const resend = new Resend(apiKey);

      await resend.emails.send({
        from: fromEmail || "SpeakUp Campus <onboarding@resend.dev>",
        to: args.to,
        subject,
        html,
      });

      return { success: true, message: `OTP sent to ${args.to}` };
    } catch (error: any) {
      console.error("[SpeakUp Campus] Email send failed:", error.message || error);
      return { success: false, message: `Email failed: ${error.message || "unknown error"}` };
    }
  },
});
