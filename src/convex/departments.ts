import { mutation, query } from "./_generated/server";

const DEFAULT_DEPARTMENTS = [
  { name: "Hostel", slug: "hostel", description: "Hostel accommodation and facilities" },
  { name: "Mess", slug: "mess", description: "Canteen and mess facility issues" },
  { name: "IT", slug: "it", description: "Internet, computer lab, and IT infrastructure" },
  { name: "Academics", slug: "academics", description: "Academic affairs and curriculum issues" },
  { name: "Infrastructure", slug: "infrastructure", description: "Building, classroom, and campus maintenance" },
  { name: "Library", slug: "library", description: "Library resources and facilities" },
  { name: "Anti-Ragging", slug: "anti_ragging", description: "Ragging and harassment complaints" },
  { name: "Discipline", slug: "discipline", description: "Student discipline and conduct" },
  { name: "Safety", slug: "safety", description: "Campus safety and emergency concerns" },
];

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("departments").collect();
  },
});

/**
 * Seed default departments if none exist. Safe to call multiple times.
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("departments").collect();
    if (existing.length > 0) return { seeded: false, count: existing.length };

    let count = 0;
    for (const dept of DEFAULT_DEPARTMENTS) {
      await ctx.db.insert("departments", dept);
      count++;
    }
    return { seeded: true, count };
  },
});
