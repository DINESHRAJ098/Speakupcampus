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
    const departments = await ctx.db.query("departments").collect();

    const students = users.filter((u) => u.role === "student").length;
    const staff = users.filter((u) => u.role === "staff").length;
    const faculty = users.filter((u) => u.role === "faculty").length;
    const admins = users.filter((u) => u.role === "admin").length;

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const recentComplaints = complaints.filter((c) => c.createdAt >= thirtyDaysAgo);
    const resolvedComplaints = complaints.filter((c) => c.status === "resolved");
    const avgResolutionTime = resolvedComplaints.length > 0
      ? resolvedComplaints.reduce((acc, c) => acc + ((c.resolvedAt || c.updatedAt) - c.createdAt), 0) / resolvedComplaints.length
      : 0;

    // Per-department stats
    const deptStats = departments.map((dept) => {
      const deptComplaints = complaints.filter((c) => c.departmentId === dept._id);
      return {
        departmentId: dept._id,
        departmentName: dept.name,
        total: deptComplaints.length,
        pending: deptComplaints.filter((c) => c.status === "pending" || c.status === "in_progress").length,
        resolved: deptComplaints.filter((c) => c.status === "resolved").length,
      };
    });

    return {
      totalUsers: users.length,
      students,
      staff,
      faculty,
      admins,
      totalComplaints: complaints.length,
      pendingComplaints: complaints.filter((c) => c.status === "pending").length,
      inProgressComplaints: complaints.filter((c) => c.status === "in_progress").length,
      resolvedComplaints: resolvedComplaints.length,
      escalatedComplaints: complaints.filter((c) => c.status === "escalated").length,
      recentComplaints: recentComplaints.length,
      avgResolutionTimeMs: avgResolutionTime,
      totalAppointments: appointments.length,
      totalComments: comments.length,
      totalAnnouncements: announcements.length,
      totalDepartments: departments.length,
      departmentStats: deptStats,
    };
  },
});

export const promoteToAdmin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: "admin" });
  },
});

export const changeUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRole: roleValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.newRole });
  },
});

export const facultyMembers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.filter((u) => u.role === "faculty" || u.role === "admin");
  },
});

/**
 * Monthly grievance report: counts, resolution rates, avg time, by department
 */
export const monthlyReport = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const complaints = await ctx.db.query("complaints").collect();
    const departments = await ctx.db.query("departments").collect();

    const recent = complaints.filter((c) => c.createdAt >= thirtyDaysAgo);
    const recentResolved = recent.filter((c) => c.status === "resolved");

    const avgTime = recentResolved.length > 0
      ? recentResolved.reduce((acc, c) => acc + ((c.resolvedAt || c.updatedAt) - c.createdAt), 0) / recentResolved.length
      : 0;

    const byDepartment = departments.map((dept) => {
      const deptComplaints = recent.filter((c) => c.departmentId === dept._id);
      return {
        name: dept.name,
        total: deptComplaints.length,
        resolved: deptComplaints.filter((c) => c.status === "resolved").length,
        escalated: deptComplaints.filter((c) => c.status === "escalated").length,
      };
    });

    const byCategory: Record<string, number> = {};
    for (const c of recent) {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    }

    return {
      period: "Last 30 days",
      totalFiled: recent.length,
      totalResolved: recentResolved.length,
      totalEscalated: recent.filter((c) => c.status === "escalated").length,
      resolutionRate: recent.length > 0 ? Math.round((recentResolved.length / recent.length) * 100) : 0,
      avgResolutionTimeMs: avgTime,
      byDepartment,
      byCategory,
    };
  },
});

/**
 * Assign a faculty member to a department (admin only)
 */
export const assignFacultyDepartment = mutation({
  args: {
    userId: v.id("users"),
    department: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { department: args.department });
  },
});

/**
 * Get all faculty members with their department assignments
 */
export const getFacultyWithDepartments = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => u.role === "faculty")
      .map((u) => ({
        _id: u._id,
        name: u.name || "Unnamed",
        email: u.email || "",
        department: u.department || "Unassigned",
      }));
  },
});

/**
 * Promote user to faculty and assign department in one call
 */
export const grantFacultyAccess = mutation({
  args: {
    userId: v.id("users"),
    department: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: "faculty",
      department: args.department,
    });
  },
});

/**
 * Revoke faculty access (set back to student)
 */
export const revokeFacultyAccess = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: "student",
      department: undefined,
    });
  },
});

/**
 * Bootstrap: promote the current user to admin if no admin exists yet.
 * Safe to call multiple times — only works when 0 admins exist.
 */
