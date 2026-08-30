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
  HOSTEL: "hostel",
  MESS: "mess",
  IT: "it",
  INFRASTRUCTURE: "infrastructure",
  LIBRARY: "library",
  ANTI_RAGGING: "anti_ragging",
  DISCIPLINE: "discipline",
  SAFETY: "safety",
  OTHER: "other",
} as const;

export const categoryValidator = v.union(
  v.literal(CATEGORIES.ACADEMIC),
  v.literal(CATEGORIES.HOSTEL),
  v.literal(CATEGORIES.MESS),
  v.literal(CATEGORIES.IT),
  v.literal(CATEGORIES.INFRASTRUCTURE),
  v.literal(CATEGORIES.LIBRARY),
  v.literal(CATEGORIES.ANTI_RAGGING),
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
  IN_PROGRESS: "in_progress",
  ASSIGNED: "assigned",
  RESOLVED: "resolved",
  REJECTED: "rejected",
  ESCALATED: "escalated",
} as const;

export const statusValidator = v.union(
  v.literal(STATUSES.PENDING),
  v.literal(STATUSES.IN_PROGRESS),
  v.literal(STATUSES.ASSIGNED),
  v.literal(STATUSES.RESOLVED),
  v.literal(STATUSES.REJECTED),
  v.literal(STATUSES.ESCALATED),
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
      password: v.optional(v.string()),
      isVerified: v.optional(v.boolean()),
    }).index("email", ["email"]),

    pendingUsers: defineTable({
      name: v.string(),
      email: v.string(),
      password: v.string(),
      otp: v.string(),
      otpExpiry: v.number(),
      createdAt: v.number(),
    }).index("by_email", ["email"]),


    departments: defineTable({
      name: v.string(),
      slug: v.string(),
      headName: v.optional(v.string()),
      headId: v.optional(v.string()),
      description: v.optional(v.string()),
    }).index("by_slug", ["slug"]),

    complaints: defineTable({
      title: v.string(),
      description: v.string(),
      category: categoryValidator,
      priority: priorityValidator,
      status: statusValidator,
      userId: v.string(),
      userName: v.string(),
      userRole: roleValidator,
      isAnonymous: v.optional(v.boolean()),
      departmentId: v.optional(v.string()),
      departmentName: v.optional(v.string()),
      assignedTo: v.optional(v.string()),
      assignedToName: v.optional(v.string()),
      attachmentUrls: v.optional(v.array(v.string())),
      escalationLevel: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
      resolvedAt: v.optional(v.number()),
      resolution: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"])
      .index("by_category", ["category"])
      .index("by_department", ["departmentId"])
      .index("by_created", ["createdAt"])
      .index("by_assigned", ["assignedTo"]),

    resolution_logs: defineTable({
      complaintId: v.string(),
      complaintTitle: v.string(),
      updatedBy: v.string(),
      updatedByName: v.string(),
      updatedByRole: roleValidator,
      previousStatus: v.optional(v.string()),
      newStatus: v.string(),
      comment: v.optional(v.string()),
      attachmentUrls: v.optional(v.array(v.string())),
      createdAt: v.number(),
    })
      .index("by_complaint", ["complaintId"])
      .index("by_created", ["createdAt"]),

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
