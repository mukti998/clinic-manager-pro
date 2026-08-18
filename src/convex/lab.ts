import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Doctor orders lab tests
export const create = mutation({
  args: {
    patientId: v.id("patients"),
    visitId: v.id("visits"),
    tests: v.array(v.object({ testName: v.string(), notes: v.optional(v.string()) })),
    clinicalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const last = await ctx.db.query("labResults").order("desc").first();
    const num = last ? parseInt(last.labOrderNumber.replace("RAYAN-LAB-", "")) + 1 : 1;

    await ctx.db.patch(args.visitId, { status: "lab_pending" });

    return await ctx.db.insert("labResults", {
      labOrderNumber: `RAYAN-LAB-${String(num).padStart(5, "0")}`,
      patientId: args.patientId,
      visitId: args.visitId,
      doctorId: identity.subject as never,
      status: "ordered",
      tests: args.tests.map((t) => ({ testName: t.testName, notes: t.notes })),
      clinicalNotes: args.clinicalNotes,
      createdAt: Date.now(),
    });
  },
});

// Lab tech accepts
export const accept = mutation({
  args: { labId: v.id("labResults") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.labId, { status: "sample_collected", sampleCollectedAt: Date.now() });
  },
});

// Lab tech marks sample collected → in progress
export const collectSample = mutation({
  args: { labId: v.id("labResults") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.labId, { status: "in_progress", sampleCollectedAt: Date.now() });
  },
});

// Lab tech enters results
export const enterResults = mutation({
  args: {
    labId: v.id("labResults"),
    tests: v.array(v.object({
      testName: v.string(),
      result: v.optional(v.string()),
      unit: v.optional(v.string()),
      referenceRange: v.optional(v.string()),
      notes: v.optional(v.string()),
    })),
    labTechNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.labId, { tests: args.tests, labTechNotes: args.labTechNotes, status: "completed", completedAt: Date.now() });
    const lab = await ctx.db.get(args.labId);
    if (lab) await ctx.db.patch(lab.visitId, { status: "with_doctor" });
  },
});

// Lab tech rejects
export const reject = mutation({
  args: { labId: v.id("labResults"), reason: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.labId, { status: "rejected", labTechNotes: args.reason });
  },
});

// Get lab queue
export const getLabQueue = query({
  args: {},
  handler: async (ctx) => {
    const ordered = await ctx.db.query("labResults").withIndex("by_status", (q) => q.eq("status", "ordered")).collect();
    const sampleCollected = await ctx.db.query("labResults").withIndex("by_status", (q) => q.eq("status", "sample_collected")).collect();
    const inProgress = await ctx.db.query("labResults").withIndex("by_status", (q) => q.eq("status", "in_progress")).collect();
    return [...ordered, ...sampleCollected, ...inProgress].sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get lab results for a visit
export const getByVisit = query({
  args: { visitId: v.id("visits") },
  handler: async (ctx, args) => {
    return await ctx.db.query("labResults").withIndex("by_visitId", (q) => q.eq("visitId", args.visitId)).order("desc").collect();
  },
});

// Get pending count
export const getPendingCount = query({
  args: {},
  handler: async (ctx) => {
    const ordered = await ctx.db.query("labResults").withIndex("by_status", (q) => q.eq("status", "ordered")).collect();
    const collected = await ctx.db.query("labResults").withIndex("by_status", (q) => q.eq("status", "sample_collected")).collect();
    return ordered.length + collected.length;
  },
});
