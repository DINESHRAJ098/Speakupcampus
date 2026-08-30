import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { categoryValidator, priorityValidator, statusValidator } from "./schema";

const URGENCY_KEYWORDS = [
  "electrical fault", "water leak", "fire hazard", "gas leak",
  "collapsed", "injury", "accident", "emergency", "flood",
  "short circuit", "exposed wire", "broken glass", "chemical",
  "harassment", "assault", "threat", "violence", "ragging",
];

function detectPriority(text: string): "low" | "medium" | "high" | "urgent" {
  const lower = text.toLowerCase();
  if (URGENCY_KEYWORDS.some((kw) => lower.includes(kw))) return "urgent";
  if (lower.includes("important") || lower.includes("serious") || lower.includes("damage")) return "high";
  return "medium";
}

export const submit = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    priority: priorityValidator,
    departmentId: v.optional(v.string()),
    departmentName: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    attachmentUrls: v.optional(v.array(v.string())),
    userId: v.string(),
    userName: v.string(),
    userRole: v.union(v.literal("student"), v.literal("staff"), v.literal("faculty"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // Auto-detect priority from title + description if not explicitly set to low
    const effectivePriority = args.priority === "low"
      ? detectPriority(args.title + " " + args.description)
      : args.priority === "medium"
        ? detectPriority(args.title + " " + args.description)
        : args.priority;

    return await ctx.db.insert("complaints", {
      title: args.title,
      description: args.description,
      category: args.category,
      priority: effectivePriority,
      status: "pending",
      userId: args.userId,
      userName: args.isAnonymous ? "Anonymous" : args.userName,
      userRole: args.userRole,
      isAnonymous: args.isAnonymous,
      departmentId: args.departmentId,
      departmentName: args.departmentName,
      attachmentUrls: args.attachmentUrls,
      escalationLevel: 0,
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

export const listByAssigned = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("complaints")
      .withIndex("by_assigned", (q) => q.eq("assignedTo", args.userId))
      .order("desc")
      .collect();
  },
});

export const listByDepartment = query({
  args: { departmentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("complaints")
      .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId))
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
    const now = Date.now();
    const fortyEightHours = 48 * 60 * 60 * 1000;
    const unresolvedStale = all.filter(
      (c) => c.status !== "resolved" && c.status !== "rejected" && now - c.createdAt > fortyEightHours
    ).length;

    return {
      total: all.length,
      pending: all.filter((c) => c.status === "pending").length,
      inProgress: all.filter((c) => c.status === "in_progress").length,
      assigned: all.filter((c) => c.status === "assigned").length,
      resolved: all.filter((c) => c.status === "resolved").length,
      rejected: all.filter((c) => c.status === "rejected").length,
      escalated: all.filter((c) => c.status === "escalated").length,
      unresolvedStale,
      byCategory: {
        academic: all.filter((c) => c.category === "academic").length,
        hostel: all.filter((c) => c.category === "hostel").length,
        mess: all.filter((c) => c.category === "mess").length,
        it: all.filter((c) => c.category === "it").length,
        infrastructure: all.filter((c) => c.category === "infrastructure").length,
        library: all.filter((c) => c.category === "library").length,
        anti_ragging: all.filter((c) => c.category === "anti_ragging").length,
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
    resolutionAttachmentUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db.get(args.complaintId);
    const updates: Record<string, any> = {
      status: args.status,
      updatedAt: now,
    };
    if (args.resolution !== undefined) updates.resolution = args.resolution;
    if (args.status === "resolved") updates.resolvedAt = now;
    if (args.resolutionAttachmentUrls) updates.attachmentUrls = args.resolutionAttachmentUrls;
    await ctx.db.patch(args.complaintId, updates);

    // Log the status change
    if (existing) {
      await ctx.db.insert("resolution_logs", {
        complaintId: args.complaintId,
        complaintTitle: existing.title,
        updatedBy: "",
        updatedByName: "System",
        updatedByRole: "admin",
        previousStatus: existing.status,
        newStatus: args.status,
        comment: args.resolution,
        attachmentUrls: args.resolutionAttachmentUrls,
        createdAt: now,
      });
    }
  },
});

export const assign = mutation({
  args: {
    complaintId: v.id("complaints"),
    assignedTo: v.string(),
    assignedToName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.complaintId, {
      assignedTo: args.assignedTo,
      assignedToName: args.assignedToName,
      status: "assigned",
      updatedAt: now,
    });
  },
});

export const resolve = mutation({
  args: {
    complaintId: v.id("complaints"),
    resolution: v.string(),
    resolutionAttachmentUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.complaintId, {
      status: "resolved",
      resolution: args.resolution,
      resolvedAt: now,
      updatedAt: now,
      attachmentUrls: args.resolutionAttachmentUrls,
    });
  },
});

/**
 * Auto-escalate complaints older than 48 hours that are still unresolved.
 * Designed to be called from a scheduled job or admin action.
 */
export const autoEscalate = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const fortyEightHours = 48 * 60 * 60 * 1000;
    const all = await ctx.db.query("complaints").collect();

    let escalatedCount = 0;
    for (const complaint of all) {
      if (
        complaint.status !== "resolved" &&
        complaint.status !== "rejected" &&
        complaint.status !== "escalated" &&
        now - complaint.createdAt > fortyEightHours
      ) {
        const currentLevel = complaint.escalationLevel || 0;
        const newPriority = currentLevel === 0 ? "high" : "urgent";
        await ctx.db.patch(complaint._id, {
          status: "escalated",
          priority: newPriority as any,
          escalationLevel: currentLevel + 1,
          updatedAt: now,
        });

        // Log escalation
        await ctx.db.insert("resolution_logs", {
          complaintId: complaint._id,
          complaintTitle: complaint.title,
          updatedBy: "",
          updatedByName: "Auto-Escalation System",
          updatedByRole: "admin",
          previousStatus: complaint.status,
          newStatus: "escalated",
          comment: `Complaint auto-escalated after 48 hours without resolution. Priority raised to ${newPriority}.`,
          createdAt: now,
        });
        escalatedCount++;
      }
    }
    return { escalatedCount };
  },
});
