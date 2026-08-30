import { v } from "convex/values";
import { query } from "./_generated/server";

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
    const admins = users.filter((u) => u.role === "admin").length;

    return {
      totalUsers: users.length,
      students,
      staff,
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
