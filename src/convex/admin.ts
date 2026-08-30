import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { roleValidator } from "./schema";

export const allUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const systemOverview = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const complaints = await ctx.db.query("complaints").collect();
    const appointments = await ctx.db.query("appointments").collect();
    const announcements = await ctx.db.query("announcements").collect();
    const comments = await ctx.db.query("comments").collect();

    const students = users.filter((u) => u.role === "student").length;
    const staff = users.filter((u) => u.role === "staff").length;
    const faculty = users.filter((u) => u.role === "faculty").length;
    const admins = users.filter((u) => u.role === "admin").length;

    return {
      totalUsers: users.length,
      students,
      staff,
      faculty,
      admins,
      totalComplaints: complaints.length,
      pendingComplaints: complaints.filter((c) => c.status === "pending").length,
      resolvedComplaints: complaints.filter((c) => c.status === "resolved").length,
      totalAppointments: appointments.length,
      totalComments: comments.length,
      totalAnnouncements: announcements.length,
    };
  },
});

/**
 * Promote a user to admin role (only callable by existing admins)
 */
export const promoteToAdmin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: "admin" });
  },
});

/**
 * Change a user's role
 */
export const changeUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRole: roleValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.newRole });
  },
});

/**
 * Get faculty members (for assignment dropdowns)
 */
export const facultyMembers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.filter((u) => u.role === "faculty" || u.role === "admin");
  },
});
