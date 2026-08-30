import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    priority: v.union(v.literal("normal"), v.literal("important"), v.literal("urgent")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("announcements", {
      title: args.title,
      content: args.content,
      authorId: args.authorId,
      authorName: args.authorName,
      priority: args.priority,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("announcements").order("desc").collect();
  },
});

export const remove = mutation({
  args: { announcementId: v.id("announcements") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.announcementId);
  },
});
