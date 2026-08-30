import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Simple SHA-256 hash for passwords (Convex runs on Cloudflare Workers)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) return { valid: false, message: "Password must be at least 8 characters" };
  if (!/[A-Z]/.test(password)) return { valid: false, message: "Password must contain an uppercase letter" };
  if (!/[a-z]/.test(password)) return { valid: false, message: "Password must contain a lowercase letter" };
  if (!/[0-9]/.test(password)) return { valid: false, message: "Password must contain a number" };
  return { valid: true, message: "" };
}

/**
 * Register: validate input, hash password, generate OTP, store pending user
 */
export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    confirmPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Validation
    if (!args.name.trim()) throw new Error("Name is required");
    if (!args.email.trim()) throw new Error("Email is required");
    if (!isValidEmail(args.email)) throw new Error("Invalid email address");
    if (!args.password) throw new Error("Password is required");
    if (args.password !== args.confirmPassword) throw new Error("Passwords do not match");

    const strength = isStrongPassword(args.password);
    if (!strength.valid) throw new Error(strength.message);

    // Check if email already exists in users
    const existingUser = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", args.email.toLowerCase())).first();
    if (existingUser) {
      if (existingUser.password) {
        throw new Error("An account with this email already exists. Please sign in.");
      }
      // Existing account from old auth system (no password) — allow setting password via OTP
    }

    // Check if email is already pending
    const existingPending = await ctx.db.query("pendingUsers").withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase())).first();
    if (existingPending) {
      // Delete old pending registration
      await ctx.db.delete(existingPending._id);
    }

    // Hash password and generate OTP
    const hashedPassword = await hashPassword(args.password);
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store pending user
    await ctx.db.insert("pendingUsers", {
      name: args.name.trim(),
      email: args.email.toLowerCase().trim(),
      password: hashedPassword,
      otp,
      otpExpiry,
      createdAt: Date.now(),
    });

    // In production, send OTP via email service (Resend, SendGrid, etc.)
    // For now, log it to console
    ctx.scheduler.runAfter(0, api.sendEmail.sendOTPEmail, { to: args.email, otp, purpose: "verification" });

    return { success: true, message: `OTP sent to ${args.email}` };
  },
});

/**
 * Verify OTP: check code, create user account, delete pending registration
 */
export const verifyOTP = mutation({
  args: {
    email: v.string(),
    otp: v.string(),
  },
  handler: async (ctx, args) => {
    const pending = await ctx.db.query("pendingUsers").withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase())).first();

    if (!pending) throw new Error("No pending registration found for this email");

    if (Date.now() > pending.otpExpiry) {
      await ctx.db.delete(pending._id);
      throw new Error("OTP has expired. Please register again.");
    }

    if (pending.otp !== args.otp) {
      throw new Error("Invalid OTP. Please try again.");
    }

    // Check if user already exists (from old auth system without password)
    const existingUser = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", pending.email)).first();

    let userId;
    if (existingUser) {
      // Update existing user with password and verification
      await ctx.db.patch(existingUser._id, {
        password: pending.password,
        isVerified: true,
        emailVerificationTime: Date.now(),
      });
      userId = existingUser._id;
    } else {
      // Create new user account
      userId = await ctx.db.insert("users", {
        name: pending.name,
        email: pending.email,
        password: pending.password,
        isVerified: true,
        emailVerificationTime: Date.now(),
        role: "student",
      });
    }

    // Delete the pending registration
    await ctx.db.delete(pending._id);

    return { success: true, userId };
  },
});

/**
 * Resend OTP: generate new OTP for pending registration
 */
export const resendOTP = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const pending = await ctx.db.query("pendingUsers").withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase())).first();

    if (!pending) throw new Error("No pending registration found. Please register again.");

    const newOTP = generateOTP();
    const newExpiry = Date.now() + 10 * 60 * 1000;

    await ctx.db.patch(pending._id, { otp: newOTP, otpExpiry: newExpiry });

    ctx.scheduler.runAfter(0, api.sendEmail.sendOTPEmail, { to: args.email, otp: newOTP, purpose: "verification" });

    return { success: true, message: `New OTP sent to ${args.email}` };
  },
});

/**
 * Sign in with email and password
 */
export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.email || !args.password) throw new Error("Email and password are required");

    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", args.email.toLowerCase())).first();

    if (!user) throw new Error("No account found with this email");

    if (!user.password) throw new Error("This account has no password set. Please register again with the same email to set a password.");

    if (!user.isVerified) throw new Error("Please verify your email before signing in");

    const hashedInput = await hashPassword(args.password);
    if (hashedInput !== user.password) throw new Error("Invalid email or password");

    return {
      success: true,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
});

/**
 * Get pending registration info (for OTP page)
 */
export const getPendingRegistration = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const pending = await ctx.db.query("pendingUsers").withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase())).first();
    if (!pending) return null;
    return {
      name: pending.name,
      email: pending.email,
      otpExpiry: pending.otpExpiry,
    };
  },
});

/**
 * Forgot Password: generate OTP for password reset
 */
export const forgotPassword = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    if (!args.email) throw new Error("Email is required");

    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", args.email.toLowerCase())).first();
    if (!user) throw new Error("No account found with this email");
    if (!user.isVerified) throw new Error("This account is not verified yet");

    // Check for existing pending reset
    const existing = await ctx.db.query("pendingUsers").withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase())).first();
    if (existing) await ctx.db.delete(existing._id);

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    await ctx.db.insert("pendingUsers", {
      name: "password_reset",
      email: args.email.toLowerCase().trim(),
      password: "reset",
      otp,
      otpExpiry,
      createdAt: Date.now(),
    });

    ctx.scheduler.runAfter(0, api.sendEmail.sendOTPEmail, { to: args.email, otp, purpose: "password_reset" });

    return { success: true, message: `OTP sent to ${args.email}` };
  },
});

/**
 * Reset Password: verify OTP and set new password
 */
export const resetPassword = mutation({
  args: {
    email: v.string(),
    otp: v.string(),
    newPassword: v.string(),
    confirmPassword: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.email || !args.otp || !args.newPassword || !args.confirmPassword) {
      throw new Error("All fields are required");
    }
    if (args.newPassword !== args.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const strength = isStrongPassword(args.newPassword);
    if (!strength.valid) throw new Error(strength.message);

    const pending = await ctx.db.query("pendingUsers").withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase())).first();
    if (!pending) throw new Error("No reset request found. Please request a new OTP.");

    if (Date.now() > pending.otpExpiry) {
      await ctx.db.delete(pending._id);
      throw new Error("OTP has expired. Please request a new one.");
    }

    if (pending.otp !== args.otp) {
      throw new Error("Invalid OTP. Please try again.");
    }

    // Find user and update password
    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", args.email.toLowerCase())).first();
    if (!user) throw new Error("User not found");

    const hashedPassword = await hashPassword(args.newPassword);
    await ctx.db.patch(user._id, { password: hashedPassword });

    // Delete the pending reset
    await ctx.db.delete(pending._id);

    return { success: true, message: "Password reset successful" };
  },
});
