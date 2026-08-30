import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  STUDENT: "student",
  STAFF: "staff",
  FACULTY: "faculty",
  ADMIN: "admin",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.STUDENT),
  v.literal(ROLES.STAFF),
  v.literal(ROLES.FACULTY),
  v.literal(ROLES.ADMIN),
);
export type Role = Infer<typeof roleValidator>;

export const CATEGORIES = {
  ACADEMIC: "academic",
  FACILITY: "facility",
  ADMINISTRATION: "administration",
  DISCIPLINE: "discipline",
  SAFETY: "safety",
  OTHER: "other",
} as const;

export const categoryValidator = v.union(
  v.literal(CATEGORIES.ACADEMIC),
  v.literal(CATEGORIES.FACILITY),
  v.literal(CATEGORIES.ADMINISTRATION),
  v.literal(CATEGORIES.DISCIPLINE),
  v.literal(CATEGORIES.SAFETY),
  v.literal(CATEGORIES.OTHER),
);
export type Category = Infer<typeof categoryValidator>;

export const PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export const priorityValidator = v.union(
  v.literal(PRIORITIES.LOW),
  v.literal(PRIORITIES.MEDIUM),
  v.literal(PRIORITIES.HIGH),
  v.literal(PRIORITIES.URGENT),
);
export type Priority = Infer<typeof priorityValidator>;

export const STATUSES = {
  PENDING: "pending",
  IN_REVIEW: "in_review",
  ASSIGNED: "assigned",
  RESOLVED: "resolved",
  REJECTED: "rejected",
} as const;

export const statusValidator = v.union(
  v.literal(STATUSES.PENDING),
  v.literal(STATUSES.IN_REVIEW),
  v.literal(STATUSES.ASSIGNED),
  v.literal(STATUSES.RESOLVED),
  v.literal(STATUSES.REJECTED),
);
export type ComplaintStatus = Infer<typeof statusValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      department: v.optional(v.string()),
      studentId: v.optional(v.string()),
    }).index("email", ["email"]),

    complaints: defineTable({
      title: v.string(),
      description: v.string(),
      category: categoryValidator,
      priority: priorityValidator,
      status: statusValidator,
      userId: v.string(),
      userName: v.string(),
      userRole: roleValidator,
      department: v.optional(v.string()),
      assignedTo: v.optional(v.string()),
      assignedToName: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      resolution: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"])
      .index("by_category", ["category"])
      .index("by_created", ["createdAt"])
      .index("by_assigned", ["assignedTo"]),

    comments: defineTable({
      complaintId: v.string(),
      userId: v.string(),
      userName: v.string(),
      userRole: roleValidator,
      content: v.string(),
      createdAt: v.number(),
    })
      .index("by_complaint", ["complaintId"])
      .index("by_user", ["userId"]),

    appointments: defineTable({
      complaintId: v.string(),
      complaintTitle: v.string(),
      scheduledBy: v.string(),
      scheduledByName: v.string(),
      scheduledFor: v.string(),
      scheduledTime: v.string(),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_complaint", ["complaintId"])
      .index("by_user", ["scheduledBy"])
      .index("by_date", ["scheduledFor"]),

    announcements: defineTable({
      title: v.string(),
      content: v.string(),
      authorId: v.string(),
      authorName: v.string(),
      priority: v.union(v.literal("normal"), v.literal("important"), v.literal("urgent")),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_created", ["createdAt"])
      .index("by_author", ["authorId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
