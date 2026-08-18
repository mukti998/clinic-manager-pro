import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";
import type { Validator } from "convex/values";

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

// ─── Departments ────────────────────────────────────────
export const DEPARTMENTS = [
  "card_office",
  "doctor",
  "laboratory",
  "pharmacy",
  "nursing",
  "radiology",
  "admin",
] as const;

type DeptLiteral = (typeof DEPARTMENTS)[number];
export const departmentValidator = v.union(
  ...(DEPARTMENTS.map((d) => v.literal(d)) as [Validator<DeptLiteral>, ...Validator<DeptLiteral>[]]),
);
export type Department = Infer<typeof departmentValidator>;

// ─── Blood Type ─────────────────────────────────────────
export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

type BloodLiteral = (typeof BLOOD_TYPES)[number];
export const bloodTypeValidator = v.union(
  ...(BLOOD_TYPES.map((bt) => v.literal(bt)) as [Validator<BloodLiteral>, ...Validator<BloodLiteral>[]]),
);
export type BloodType = Infer<typeof bloodTypeValidator>;

// ─── Gender ─────────────────────────────────────────────
export const GENDERS = ["male", "female", "other"] as const;

type GenderLiteral = (typeof GENDERS)[number];
export const genderValidator = v.union(
  ...(GENDERS.map((g) => v.literal(g)) as [Validator<GenderLiteral>, ...Validator<GenderLiteral>[]]),
);
export type Gender = Infer<typeof genderValidator>;

// ─── Order Types & Status ───────────────────────────────
export const ORDER_TYPES = ["lab_order", "pharmacy_order", "nursing_order", "radiology_order", "general"] as const;
type OrderTypeLiteral = (typeof ORDER_TYPES)[number];
export const orderTypeValidator = v.union(
  ...(ORDER_TYPES.map((t) => v.literal(t)) as [Validator<OrderTypeLiteral>, ...Validator<OrderTypeLiteral>[]]),
);

export const ORDER_STATUSES = ["pending", "in_progress", "completed", "cancelled"] as const;
type OrderStatusLiteral = (typeof ORDER_STATUSES)[number];
export const orderStatusValidator = v.union(
  ...(ORDER_STATUSES.map((s) => v.literal(s)) as [Validator<OrderStatusLiteral>, ...Validator<OrderStatusLiteral>[]]),
);

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
      department: v.optional(departmentValidator),
      staffId: v.optional(v.string()),
      phone: v.optional(v.string()),
      specialization: v.optional(v.string()),
    }).index("email", ["email"]),

    // ─── Patients ───────────────────────────────────────
    patients: defineTable({
      medicalId: v.string(),        // e.g. RAYAN-PAT-00001
      cardNumber: v.string(),       // e.g. RAYAN-CARD-00001
      firstName: v.string(),
      lastName: v.string(),
      dateOfBirth: v.string(),
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
      currentDepartment: v.optional(departmentValidator),
      isActive: v.boolean(),
      createdBy: v.optional(v.id("users")),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_medicalId", ["medicalId"])
      .index("by_cardNumber", ["cardNumber"])
      .index("by_lastName", ["lastName"])
      .index("by_isActive", ["isActive"])
      .index("by_currentDepartment", ["currentDepartment"]),

    // ─── Vitals ─────────────────────────────────────────
    vitals: defineTable({
      patientId: v.id("patients"),
      recordedBy: v.optional(v.id("users")),
      recordedAt: v.number(),
      temperature: v.optional(v.number()),
      heartRate: v.optional(v.number()),
      bloodPressureSystolic: v.optional(v.number()),
      bloodPressureDiastolic: v.optional(v.number()),
      respiratoryRate: v.optional(v.number()),
      oxygenSaturation: v.optional(v.number()),
      weight: v.optional(v.number()),
      height: v.optional(v.number()),
      notes: v.optional(v.string()),
    }).index("by_patientId", ["patientId"])
      .index("by_recordedAt", ["recordedAt"]),

    // ─── Orders ─────────────────────────────────────────
    // Orders route between departments: doctor → lab, doctor → pharmacy,
    // lab → pharmacy, pharmacy → nursing, etc.
    orders: defineTable({
      orderNumber: v.string(),           // e.g. RAYAN-ORD-00001
      patientId: v.id("patients"),
      type: orderTypeValidator,
      fromDepartment: departmentValidator,
      toDepartment: departmentValidator,
      status: orderStatusValidator,
      priority: v.union(v.literal("normal"), v.literal("urgent"), v.literal("stat")),
      items: v.array(v.object({
        description: v.string(),
        quantity: v.optional(v.number()),
        notes: v.optional(v.string()),
      })),
      clinicalNotes: v.optional(v.string()),
      createdBy: v.id("users"),
      assignedTo: v.optional(v.id("users")),
      createdAt: v.number(),
      updatedAt: v.number(),
      completedAt: v.optional(v.number()),
    })
      .index("by_patientId", ["patientId"])
      .index("by_toDepartment", ["toDepartment"])
      .index("by_status", ["status"])
      .index("by_orderNumber", ["orderNumber"])
      .index("by_createdBy", ["createdBy"]),

    // ─── Order History (audit trail) ────────────────────
    orderHistory: defineTable({
      orderId: v.id("orders"),
      action: v.string(),       // "created" | "routed" | "status_change" | "note_added"
      fromDepartment: v.optional(departmentValidator),
      toDepartment: v.optional(departmentValidator),
      status: v.optional(orderStatusValidator),
      note: v.optional(v.string()),
      performedBy: v.id("users"),
      timestamp: v.number(),
    }).index("by_orderId", ["orderId"]),

    // ─── Staff (reference) ──────────────────────────────
    staff: defineTable({
      userId: v.optional(v.id("users")),
      staffId: v.string(),
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
