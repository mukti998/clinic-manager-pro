import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── Get vitals history for a patient ───────────────────
export const getHistory = query({
  args: {
    patientId: v.id("patients"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("vitals")
      .withIndex("by_patientId", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .take(limit);
  },
});

// ─── Get latest vitals for a patient ────────────────────
export const getLatest = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const vitals = await ctx.db
      .query("vitals")
      .withIndex("by_patientId", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .first();
    return vitals;
  },
});

// ─── Add vitals record ──────────────────────────────────
export const add = mutation({
  args: {
    patientId: v.id("patients"),
    temperature: v.optional(v.number()),
    heartRate: v.optional(v.number()),
    bloodPressureSystolic: v.optional(v.number()),
    bloodPressureDiastolic: v.optional(v.number()),
    respiratoryRate: v.optional(v.number()),
    oxygenSaturation: v.optional(v.number()),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    return await ctx.db.insert("vitals", {
      ...args,
      recordedBy: userId as any,
      recordedAt: Date.now(),
    });
  },
});
