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

// ─── Visit Status ───────────────────────────────────────
export const VISIT_STATUSES = ["waiting", "with_doctor", "lab_pending", "pharmacy_pending", "completed", "discharged"] as const;
type VisitStatusLiteral = (typeof VISIT_STATUSES)[number];
export const visitStatusValidator = v.union(
  ...(VISIT_STATUSES.map((s) => v.literal(s)) as [Validator<VisitStatusLiteral>, ...Validator<VisitStatusLiteral>[]]),
);

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

// ─── Payment Methods ────────────────────────────────────
export const PAYMENT_METHODS = ["cash", "card", "insurance", "digital"] as const;
type PaymentMethodLiteral = (typeof PAYMENT_METHODS)[number];
export const paymentMethodValidator = v.union(
  ...(PAYMENT_METHODS.map((m) => v.literal(m)) as [Validator<PaymentMethodLiteral>, ...Validator<PaymentMethodLiteral>[]]),
);

// ─── Prescription Status ────────────────────────────────
export const RX_STATUSES = ["pending", "approved", "dispensed", "rejected"] as const;
type RxStatusLiteral = (typeof RX_STATUSES)[number];
export const rxStatusValidator = v.union(
  ...(RX_STATUSES.map((s) => v.literal(s)) as [Validator<RxStatusLiteral>, ...Validator<RxStatusLiteral>[]]),
);

// ─── Lab Test Status ────────────────────────────────────
export const LAB_STATUSES = ["ordered", "sample_collected", "in_progress", "completed", "rejected"] as const;
type LabStatusLiteral = (typeof LAB_STATUSES)[number];
export const labStatusValidator = v.union(
  ...(LAB_STATUSES.map((s) => v.literal(s)) as [Validator<LabStatusLiteral>, ...Validator<LabStatusLiteral>[]]),
);

const schema = defineSchema(
  {
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
      medicalId: v.string(),
      cardNumber: v.string(),
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
      .index("by_isActive", ["isActive"]),

    // ─── Visits (token + queue + consultation tracking) ─
    visits: defineTable({
      visitNumber: v.string(),           // e.g. RAYAN-VIS-00001
      patientId: v.id("patients"),
      doctorId: v.id("users"),
      tokenNumber: v.number(),           // sequential per doctor per day
      status: visitStatusValidator,
      consultationFee: v.number(),
      isPaid: v.boolean(),
      reason: v.optional(v.string()),
      diagnosis: v.optional(v.string()),
      clinicalNotes: v.optional(v.string()),
      vitalsId: v.optional(v.id("vitals")),
      followUpDate: v.optional(v.string()),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
    })
      .index("by_doctorId", ["doctorId"])
      .index("by_patientId", ["patientId"])
      .index("by_status", ["status"])
      .index("by_tokenNumber", ["tokenNumber"]),

    // ─── Vitals ─────────────────────────────────────────
    vitals: defineTable({
      patientId: v.id("patients"),
      visitId: v.optional(v.id("visits")),
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

    // ─── Orders (inter-department routing) ──────────────
    orders: defineTable({
      orderNumber: v.string(),
      patientId: v.id("patients"),
      visitId: v.optional(v.id("visits")),
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
      .index("by_orderNumber", ["orderNumber"]),

    // ─── Prescriptions (doctor → pharmacy) ──────────────
    prescriptions: defineTable({
      prescriptionNumber: v.string(),    // e.g. RAYAN-RX-00001
      patientId: v.id("patients"),
      visitId: v.id("visits"),
      doctorId: v.id("users"),
      status: rxStatusValidator,
      medications: v.array(v.object({
        name: v.string(),
        dosage: v.string(),
        frequency: v.string(),
        duration: v.optional(v.string()),
        notes: v.optional(v.string()),
      })),
      pharmacistNotes: v.optional(v.string()),
      createdAt: v.number(),
      dispensedAt: v.optional(v.number()),
    })
      .index("by_patientId", ["patientId"])
      .index("by_status", ["status"])
      .index("by_visitId", ["visitId"]),

    // ─── Lab Results (doctor → lab) ─────────────────────
    labResults: defineTable({
      labOrderNumber: v.string(),
      patientId: v.id("patients"),
      visitId: v.id("visits"),
      doctorId: v.id("users"),
      status: labStatusValidator,
      tests: v.array(v.object({
        testName: v.string(),
        result: v.optional(v.string()),
        unit: v.optional(v.string()),
        referenceRange: v.optional(v.string()),
        notes: v.optional(v.string()),
      })),
      clinicalNotes: v.optional(v.string()),
      labTechNotes: v.optional(v.string()),
      createdAt: v.number(),
      sampleCollectedAt: v.optional(v.number()),
      completedAt: v.optional(v.number()),
    })
      .index("by_patientId", ["patientId"])
      .index("by_status", ["status"])
      .index("by_visitId", ["visitId"]),

    // ─── Payments ───────────────────────────────────────
    payments: defineTable({
      paymentNumber: v.string(),
      patientId: v.id("patients"),
      visitId: v.optional(v.id("visits")),
      amount: v.number(),
      method: paymentMethodValidator,
      description: v.string(),
      processedBy: v.id("users"),
      createdAt: v.number(),
    })
      .index("by_patientId", ["patientId"])
      .index("by_visitId", ["visitId"]),

    // ─── Invoices (aggregated bills for checkout) ───────
    invoices: defineTable({
      invoiceNumber: v.string(),
      patientId: v.id("patients"),
      visitId: v.id("visits"),
      items: v.array(v.object({
        description: v.string(),
        amount: v.number(),
        category: v.string(),
      })),
      subtotal: v.number(),
      discount: v.optional(v.number()),
      total: v.number(),
      isPaid: v.boolean(),
      createdAt: v.number(),
    })
      .index("by_patientId", ["patientId"])
      .index("by_visitId", ["visitId"]),

    // ─── Order History (audit trail) ────────────────────
    orderHistory: defineTable({
      orderId: v.id("orders"),
      action: v.string(),
      fromDepartment: v.optional(departmentValidator),
      toDepartment: v.optional(departmentValidator),
      status: v.optional(orderStatusValidator),
      note: v.optional(v.string()),
      performedBy: v.id("users"),
      timestamp: v.number(),
    }).index("by_orderId", ["orderId"]),

    // ─── Staff ──────────────────────────────────────────
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
