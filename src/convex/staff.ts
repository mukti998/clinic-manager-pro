import { v } from "convex/values";
import { query } from "./_generated/server";

// ─── List staff by department ───────────────────────────
export const listByDepartment = query({
  args: { department: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("staff")
      .withIndex("by_department", (q) => q.eq("department", args.department))
      .collect();
  },
});

// ─── List all active staff ──────────────────────────────
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const staff = await ctx.db.query("staff").collect();
    return staff.filter((s) => s.isActive);
  },
});

// ─── Get staff count ────────────────────────────────────
export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const staff = await ctx.db.query("staff").collect();
    const doctors = staff.filter((s) => s.role === "doctor" && s.isActive).length;
    const nurses = staff.filter((s) => s.role === "nurse" && s.isActive).length;
    const total = staff.filter((s) => s.isActive).length;
    return { total, doctors, nurses };
  },
});
