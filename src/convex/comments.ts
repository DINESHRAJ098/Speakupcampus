import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { roleValidator } from "./schema";

export const add = mutation({
  args: {
    complaintId: v.string(),
    userId: v.string(),
    userName: v.string(),
    userRole: roleValidator,
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("comments", {
      complaintId: args.complaintId,
      userId: args.userId,
      userName: args.userName,
      userRole: args.userRole,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const listByComplaint = query({
  args: { complaintId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_complaint", (q) => q.eq("complaintId", args.complaintId))
      .order("asc")
      .collect();
  },
});
