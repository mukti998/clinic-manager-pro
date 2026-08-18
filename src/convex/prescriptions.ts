import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Doctor creates prescription
export const create = mutation({
  args: {
    patientId: v.id("patients"),
    visitId: v.id("visits"),
    medications: v.array(v.object({
      name: v.string(),
      dosage: v.string(),
      frequency: v.string(),
      duration: v.optional(v.string()),
      notes: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const last = await ctx.db.query("prescriptions").order("desc").first();
    const num = last ? parseInt(last.prescriptionNumber.replace("RAYAN-RX-", "")) + 1 : 1;

    return await ctx.db.insert("prescriptions", {
      prescriptionNumber: `RAYAN-RX-${String(num).padStart(5, "0")}`,
      patientId: args.patientId,
      visitId: args.visitId,
      doctorId: identity.subject as never,
      status: "pending",
      medications: args.medications,
      createdAt: Date.now(),
    });
  },
});

// Pharmacist approves
export const approve = mutation({
  args: { prescriptionId: v.id("prescriptions"), pharmacistNotes: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.prescriptionId, { status: "approved", pharmacistNotes: args.pharmacistNotes });
  },
});

// Pharmacist dispenses
export const dispense = mutation({
  args: { prescriptionId: v.id("prescriptions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.prescriptionId, { status: "dispensed", dispensedAt: Date.now() });
  },
});

// Pharmacist rejects
export const reject = mutation({
  args: { prescriptionId: v.id("prescriptions"), reason: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.prescriptionId, { status: "rejected", pharmacistNotes: args.reason });
  },
});

// List by status
export const listByStatus = query({
  args: { status: v.union(v.literal("pending"), v.literal("approved"), v.literal("dispensed"), v.literal("rejected")) },
  handler: async (ctx, args) => {
    return await ctx.db.query("prescriptions").withIndex("by_status", (q) => q.eq("status", args.status)).order("desc").collect();
  },
});

// Get prescriptions for a visit
export const listByVisit = query({
  args: { visitId: v.id("visits") },
  handler: async (ctx, args) => {
    return await ctx.db.query("prescriptions").withIndex("by_visitId", (q) => q.eq("visitId", args.visitId)).order("desc").collect();
  },
});

// Get pharmacy queue
export const getPharmacyQueue = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("prescriptions").withIndex("by_status", (q) => q.eq("status", "pending")).order("desc").collect();
  },
});
