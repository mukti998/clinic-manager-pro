import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

type Patient = Doc<"patients">;

// ─── List all patients (with optional search) ───────────
export const list = query({
  args: {
    search: v.optional(v.string()),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let patients;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      patients = await ctx.db.query("patients").collect();
      patients = patients.filter(
        (p: Patient) =>
          p.firstName.toLowerCase().includes(searchLower) ||
          p.lastName.toLowerCase().includes(searchLower) ||
          p.medicalId.toLowerCase().includes(searchLower) ||
          p.phone.includes(searchLower),
      );
    } else {
      patients = await ctx.db.query("patients").collect();
    }

    if (args.activeOnly) {
      patients = patients.filter((p: Patient) => p.isActive);
    }

    return patients.sort((a: Patient, b: Patient) => b.createdAt - a.createdAt);
  },
});

// ─── Get single patient ─────────────────────────────────
export const getById = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.patientId);
  },
});

// ─── Get vitals for a patient ───────────────────────────
export const getVitals = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vitals")
      .withIndex("by_patientId", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .take(20);
  },
});

// ─── Get patient stats ──────────────────────────────────
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allPatients = await ctx.db.query("patients").collect();
    const total = allPatients.length;
    const active = allPatients.filter((p: Patient) => p.isActive).length;
    const inactive = total - active;

    const male = allPatients.filter((p: Patient) => p.gender === "male").length;
    const female = allPatients.filter((p: Patient) => p.gender === "female").length;

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentPatients = allPatients.filter(
      (p: Patient) => p.createdAt > thirtyDaysAgo,
    ).length;

    return {
      total,
      active,
      inactive,
      male,
      female,
      recentPatients,
    };
  },
});

// ─── Create patient ─────────────────────────────────────
export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    bloodType: v.union(
      v.literal("A+"), v.literal("A-"),
      v.literal("B+"), v.literal("B-"),
      v.literal("AB+"), v.literal("AB-"),
      v.literal("O+"), v.literal("O-"),
    ),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    medicalHistory: v.optional(v.string()),
    insuranceProvider: v.optional(v.string()),
    insurancePolicyNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const allPatients = await ctx.db.query("patients").collect();
    const medicalId = `RAYAN-PAT-${String(allPatients.length + 1).padStart(5, "0")}`;
    const now = Date.now();
    const userId = (await ctx.auth.getUserIdentity())?.subject;

    const patientId = await ctx.db.insert("patients", {
      medicalId,
      ...args,
      isActive: true,
      createdBy: userId as Doc<"users">["_id"] | undefined,
      createdAt: now,
      updatedAt: now,
    });

    return patientId;
  },
});

// ─── Update patient ─────────────────────────────────────
export const update = mutation({
  args: {
    patientId: v.id("patients"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    bloodType: v.optional(v.union(
      v.literal("A+"), v.literal("A-"),
      v.literal("B+"), v.literal("B-"),
      v.literal("AB+"), v.literal("AB-"),
      v.literal("O+"), v.literal("O-"),
    )),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    medicalHistory: v.optional(v.string()),
    insuranceProvider: v.optional(v.string()),
    insurancePolicyNumber: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { patientId, ...updates } = args;
    const filtered: Record<string, string | number | boolean | string[]> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filtered[key] = value;
      }
    }
    filtered.updatedAt = Date.now();
    await ctx.db.patch(patientId, filtered);
  },
});

// ─── Add vitals ─────────────────────────────────────────
export const addVitals = mutation({
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
    const vitalsId = await ctx.db.insert("vitals", {
      ...args,
      recordedBy: userId as Doc<"users">["_id"] | undefined,
      recordedAt: Date.now(),
    });
    return vitalsId;
  },
});

// ─── Delete patient (soft delete) ───────────────────────
export const deactivate = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.patientId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

// ─── Reactivate patient ─────────────────────────────────
export const reactivate = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.patientId, {
      isActive: true,
      updatedAt: Date.now(),
    });
  },
});
