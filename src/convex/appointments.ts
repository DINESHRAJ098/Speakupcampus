import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const schedule = mutation({
  args: {
    complaintId: v.string(),
    complaintTitle: v.string(),
    scheduledBy: v.string(),
    scheduledByName: v.string(),
    scheduledFor: v.string(),
    scheduledTime: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("appointments", {
      complaintId: args.complaintId,
      complaintTitle: args.complaintTitle,
      scheduledBy: args.scheduledBy,
      scheduledByName: args.scheduledByName,
      scheduledFor: args.scheduledFor,
      scheduledTime: args.scheduledTime,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const listByComplaint = query({
  args: { complaintId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_complaint", (q) => q.eq("complaintId", args.complaintId))
      .order("asc")
      .collect();
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("scheduledBy", args.userId))
      .order("asc")
      .collect();
  },
});

export const upcoming = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString().slice(0, 10);
    const all = await ctx.db.query("appointments").order("asc").collect();
    return all.filter((a) => a.scheduledFor >= now).slice(0, 10);
  },
});
