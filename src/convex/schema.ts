import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// ─── Roles ──────────────────────────────────────────────
export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  NURSE: "nurse",
  RECEPTIONIST: "receptionist",
  PHARMACIST: "pharmacist",
  LAB_TECHNICIAN: "lab_technician",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.DOCTOR),
  v.literal(ROLES.NURSE),
  v.literal(ROLES.RECEPTIONIST),
  v.literal(ROLES.PHARMACIST),
  v.literal(ROLES.LAB_TECHNICIAN),
);
export type Role = Infer<typeof roleValidator>;

// ─── Blood Type ─────────────────────────────────────────
export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export const bloodTypeValidator = v.union(
  ...BLOOD_TYPES.map((bt) => v.literal(bt)) as [any, ...any[]],
);
export type BloodType = Infer<typeof bloodTypeValidator>;

// ─── Gender ─────────────────────────────────────────────
export const GENDERS = ["male", "female", "other"] as const;
export const genderValidator = v.union(
  ...GENDERS.map((g) => v.literal(g)) as [any, ...any[]],
);
export type Gender = Infer<typeof genderValidator>;

const schema = defineSchema(
  {
    // default auth tables — do not remove or modify
    ...authTables,

    // ─── Users (extended from auth) ─────────────────────
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      // Staff-specific fields
      staffId: v.optional(v.string()), // e.g. RAYAN-DOC-001
      department: v.optional(v.string()),
      phone: v.optional(v.string()),
      specialization: v.optional(v.string()),
    }).index("email", ["email"]),

    // ─── Patients ───────────────────────────────────────
    patients: defineTable({
      medicalId: v.string(), // e.g. RAYAN-PAT-00001
      firstName: v.string(),
      lastName: v.string(),
      dateOfBirth: v.string(), // ISO date string YYYY-MM-DD
      gender: genderValidator,
      bloodType: bloodTypeValidator,
      phone: v.string(),
      email: v.optional(v.string()),
      address: v.optional(v.string()),
      emergencyContactName: v.optional(v.string()),
      emergencyContactPhone: v.optional(v.string()),
      allergies: v.optional(v.array(v.string())),
      medicalHistory: v.optional(v.string()),
      insuranceProvider: v.optional(v.string()),
      insurancePolicyNumber: v.optional(v.string()),
      isActive: v.boolean(),
      createdBy: v.optional(v.id("users")),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_medicalId", ["medicalId"])
      .index("by_lastName", ["lastName"])
      .index("by_isActive", ["isActive"])
      .index("by_createdBy", ["createdBy"]),

    // ─── Vitals ─────────────────────────────────────────
    vitals: defineTable({
      patientId: v.id("patients"),
      recordedBy: v.optional(v.id("users")),
      recordedAt: v.number(),
      temperature: v.optional(v.number()), // Fahrenheit
      heartRate: v.optional(v.number()), // bpm
      bloodPressureSystolic: v.optional(v.number()),
      bloodPressureDiastolic: v.optional(v.number()),
      respiratoryRate: v.optional(v.number()), // breaths per minute
      oxygenSaturation: v.optional(v.number()), // percentage
      weight: v.optional(v.number()), // kg
      height: v.optional(v.number()), // cm
      notes: v.optional(v.string()),
    }).index("by_patientId", ["patientId"])
      .index("by_recordedAt", ["recordedAt"]),

    // ─── Staff (legacy / reference) ─────────────────────
    staff: defineTable({
      userId: v.optional(v.id("users")),
      staffId: v.string(), // e.g. RAYAN-DOC-00001
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      department: v.string(),
      specialization: v.optional(v.string()),
      role: roleValidator,
      isActive: v.boolean(),
      createdAt: v.number(),
    })
      .index("by_staffId", ["staffId"])
      .index("by_email", ["email"])
      .index("by_department", ["department"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
