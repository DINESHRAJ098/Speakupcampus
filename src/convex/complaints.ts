import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { categoryValidator, priorityValidator, statusValidator } from "./schema";

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
    return await ctx.db.insert("complaints", {
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
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("complaints").order("desc").collect();
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("complaints")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { complaintId: v.id("complaints") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.complaintId);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("complaints").collect();
    return {
      total: all.length,
      pending: all.filter((c) => c.status === "pending").length,
      inReview: all.filter((c) => c.status === "in_review").length,
      assigned: all.filter((c) => c.status === "assigned").length,
      resolved: all.filter((c) => c.status === "resolved").length,
      rejected: all.filter((c) => c.status === "rejected").length,
      byCategory: {
        academic: all.filter((c) => c.category === "academic").length,
        facility: all.filter((c) => c.category === "facility").length,
        administration: all.filter((c) => c.category === "administration").length,
        discipline: all.filter((c) => c.category === "discipline").length,
        safety: all.filter((c) => c.category === "safety").length,
        other: all.filter((c) => c.category === "other").length,
      },
      byPriority: {
        low: all.filter((c) => c.priority === "low").length,
        medium: all.filter((c) => c.priority === "medium").length,
        high: all.filter((c) => c.priority === "high").length,
        urgent: all.filter((c) => c.priority === "urgent").length,
      },
    };
  },
});

export const updateStatus = mutation({
  args: {
    complaintId: v.id("complaints"),
    status: statusValidator,
    resolution: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const updates: Record<string, any> = {
      status: args.status,
      updatedAt: now,
    };
    if (args.resolution !== undefined) {
      updates.resolution = args.resolution;
    }
    await ctx.db.patch(args.complaintId, updates);
  },
});

export const assign = mutation({
  args: {
    complaintId: v.id("complaints"),
    assignedTo: v.string(),
    assignedToName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.complaintId, {
      assignedTo: args.assignedTo,
      assignedToName: args.assignedToName,
      status: "assigned",
      updatedAt: Date.now(),
    });
  },
});

export const resolve = mutation({
  args: {
    complaintId: v.id("complaints"),
    resolution: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.complaintId, {
      status: "resolved",
      resolution: args.resolution,
      updatedAt: Date.now(),
    });
  },
});
