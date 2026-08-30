import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { roleValidator } from "./schema";

export const add = mutation({
  args: {
    complaintId: v.string(),
    complaintTitle: v.string(),
    updatedBy: v.string(),
    updatedByName: v.string(),
    updatedByRole: roleValidator,
    previousStatus: v.optional(v.string()),
    newStatus: v.string(),
    comment: v.optional(v.string()),
    attachmentUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("resolution_logs", {
      complaintId: args.complaintId,
      complaintTitle: args.complaintTitle,
      updatedBy: args.updatedBy,
      updatedByName: args.updatedByName,
      updatedByRole: args.updatedByRole,
      previousStatus: args.previousStatus,
      newStatus: args.newStatus,
      comment: args.comment,
      attachmentUrls: args.attachmentUrls,
      createdAt: Date.now(),
    });
  },
});

export const listByComplaint = query({
  args: { complaintId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("resolution_logs")
      .withIndex("by_complaint", (q) => q.eq("complaintId", args.complaintId))
      .order("desc")
      .collect();
  },
});

/**
 * Get monthly stats for admin reports
 */
export const monthlyStats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const logs = await ctx.db.query("resolution_logs").order("desc").collect();
    const recentLogs = logs.filter((l) => l.createdAt >= thirtyDaysAgo);
    return {
      totalUpdates: recentLogs.length,
      resolved: recentLogs.filter((l) => l.newStatus === "resolved").length,
      escalated: recentLogs.filter((l) => l.newStatus === "escalated").length,
      byRole: {
        faculty: recentLogs.filter((l) => l.updatedByRole === "faculty").length,
        admin: recentLogs.filter((l) => l.updatedByRole === "admin").length,
      },
    };
  },
});
