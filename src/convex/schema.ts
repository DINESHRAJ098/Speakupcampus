import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// User roles for the college complaint system
export const ROLES = {
  STUDENT: "student",
  STAFF: "staff",
  ADMIN: "admin",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.STUDENT),
  v.literal(ROLES.STAFF),
  v.literal(ROLES.ADMIN),
);
export type Role = Infer<typeof roleValidator>;

// Complaint categories
export const CATEGORIES = {
  ACADEMIC: "academic",
  FACILITY: "facility",
  ADMINISTRATION: "administration",
  DISCIPLINE: "discipline",
  OTHER: "other",
} as const;

export const categoryValidator = v.union(
  v.literal(CATEGORIES.ACADEMIC),
  v.literal(CATEGORIES.FACILITY),
  v.literal(CATEGORIES.ADMINISTRATION),
  v.literal(CATEGORIES.DISCIPLINE),
  v.literal(CATEGORIES.OTHER),
);
export type Category = Infer<typeof categoryValidator>;

// Complaint priority levels
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

// Complaint status
export const STATUSES = {
  PENDING: "pending",
  IN_REVIEW: "in_review",
  RESOLVED: "resolved",
  REJECTED: "rejected",
} as const;

export const statusValidator = v.union(
  v.literal(STATUSES.PENDING),
  v.literal(STATUSES.IN_REVIEW),
  v.literal(STATUSES.RESOLVED),
  v.literal(STATUSES.REJECTED),
);
export type ComplaintStatus = Infer<typeof statusValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user: student or staff
      department: v.optional(v.string()), // department of the user (student roll number or staff dept)
      studentId: v.optional(v.string()), // student roll number or staff ID
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Complaints table
    complaints: defineTable({
      title: v.string(), // complaint title
      description: v.string(), // detailed complaint description
      category: categoryValidator, // complaint category
      priority: priorityValidator, // urgency level
      status: statusValidator, // current status
      userId: v.string(), // ID of the user who submitted
      userName: v.string(), // display name of submitter
      userRole: roleValidator, // role of submitter (student/staff)
      department: v.optional(v.string()), // department related to complaint
      createdAt: v.number(), // timestamp
      updatedAt: v.number(), // last update timestamp
      resolution: v.optional(v.string()), // resolution notes if resolved
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"])
      .index("by_category", ["category"])
      .index("by_created", ["createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
