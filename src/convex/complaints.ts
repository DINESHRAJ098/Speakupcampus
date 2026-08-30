import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  categoryValidator,
  priorityValidator,
  statusValidator,
} from "./schema";

/**
 * Submit a new complaint
 */
export const submit = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    priority: priorityValidator,
    department: v.optional(v.string()),
    userId: v.string(),
    userName: v.string(),
    userRole: v.union(v.literal("student"), v.literal("staff"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const complaintId = await ctx.db.insert("complaints", {
      title: args.title,
      description: args.description,
      category: args.category,
      priority: args.priority,
      status: "pending",
      userId: args.userId,
      userName: args.userName,
      userRole: args.userRole,
      department: args.department,
      createdAt: now,
      updatedAt: now,
    });
    return complaintId;
  },
});

/**
 * Get all complaints (for dashboard overview)
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const complaints = await ctx.db
      .query("complaints")
      .order("desc")
      .collect();
    return complaints;
  },
});

/**
 * Get complaints submitted by a specific user
 */
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const complaints = await ctx.db
      .query("complaints")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return complaints;
  },
});

/**
 * Get a single complaint by ID
 */
export const get = query({
  args: { complaintId: v.id("complaints") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.complaintId);
  },
});

/**
 * Get complaint statistics
 */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("complaints").collect();
    const total = all.length;
    const pending = all.filter((c) => c.status === "pending").length;
    const inReview = all.filter((c) => c.status === "in_review").length;
    const resolved = all.filter((c) => c.status === "resolved").length;
    const rejected = all.filter((c) => c.status === "rejected").length;

    const byCategory = {
      academic: all.filter((c) => c.category === "academic").length,
      facility: all.filter((c) => c.category === "facility").length,
      administration: all.filter((c) => c.category === "administration").length,
      discipline: all.filter((c) => c.category === "discipline").length,
      other: all.filter((c) => c.category === "other").length,
    };

    return {
      total,
      pending,
      inReview,
      resolved,
      rejected,
      byCategory,
    };
  },
});
