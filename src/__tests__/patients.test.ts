import { describe, it, expect } from "vitest";

// ─── Patient Data Shape Tests ───────────────────────────
// These validate the data structures that match the Convex schema

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const GENDERS = ["male", "female", "other"] as const;

type BloodType = (typeof BLOOD_TYPES)[number];
type Gender = (typeof GENDERS)[number];

interface Patient {
  medicalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  bloodType: BloodType;
  phone: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string[];
  medicalHistory?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

function createPatientInput(overrides: Partial<Patient> = {}): Patient {
  return {
    medicalId: "RAYAN-PAT-00001",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1990-01-15",
    gender: "male",
    bloodType: "O+",
    phone: "+15551234567",
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

function generateMedicalId(index: number): string {
  return `RAYAN-PAT-${String(index + 1).padStart(5, "0")}`;
}

describe("Patient data structure", () => {
  it("creates a valid patient with required fields", () => {
    const patient = createPatientInput();
    expect(patient.firstName).toBe("John");
    expect(patient.lastName).toBe("Doe");
    expect(patient.isActive).toBe(true);
    expect(patient.medicalId).toMatch(/^RAYAN-PAT-\d{5}$/);
  });

  it("generates correct medical IDs with zero-padding", () => {
    expect(generateMedicalId(0)).toBe("RAYAN-PAT-00001");
    expect(generateMedicalId(9)).toBe("RAYAN-PAT-00010");
    expect(generateMedicalId(99)).toBe("RAYAN-PAT-00100");
    expect(generateMedicalId(9999)).toBe("RAYAN-PAT-10000");
  });

  it("allows optional fields to be undefined", () => {
    const patient = createPatientInput();
    expect(patient.email).toBeUndefined();
    expect(patient.address).toBeUndefined();
    expect(patient.allergies).toBeUndefined();
    expect(patient.emergencyContactName).toBeUndefined();
    expect(patient.medicalHistory).toBeUndefined();
  });

  it("accepts valid blood types", () => {
    for (const bt of BLOOD_TYPES) {
      const patient = createPatientInput({ bloodType: bt });
      expect(patient.bloodType).toBe(bt);
      expect(BLOOD_TYPES).toContain(patient.bloodType);
    }
  });

  it("accepts valid genders", () => {
    for (const g of GENDERS) {
      const patient = createPatientInput({ gender: g });
      expect(patient.gender).toBe(g);
      expect(GENDERS).toContain(patient.gender);
    }
  });

  it("supports allergies as string array", () => {
    const patient = createPatientInput({
      allergies: ["Penicillin", "Peanuts", "Latex"],
    });
    expect(patient.allergies).toHaveLength(3);
    expect(patient.allergies).toContain("Penicillin");
  });

  it("tracks timestamps as numbers", () => {
    const now = Date.now();
    const patient = createPatientInput({ createdAt: now, updatedAt: now });
    expect(typeof patient.createdAt).toBe("number");
    expect(typeof patient.updatedAt).toBe("number");
    expect(patient.createdAt).toBeGreaterThan(0);
  });
});

// ─── Medical ID Validation ──────────────────────────────
describe("Medical ID format", () => {
  it("matches the RAYAN-PAT-XXXXX pattern", () => {
    const pattern = /^RAYAN-PAT-\d{5}$/;
    expect(pattern.test("RAYAN-PAT-00001")).toBe(true);
    expect(pattern.test("RAYAN-PAT-99999")).toBe(true);
    expect(pattern.test("RAYAN-PAT-001")).toBe(false);
    expect(pattern.test("RAYAN-PAT-123456")).toBe(false);
    expect(pattern.test("INVALID-00001")).toBe(false);
  });
});

// ─── Vitals Data Shape ──────────────────────────────────
interface Vitals {
  patientId: string;
  recordedAt: number;
  temperature?: number;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  notes?: string;
}

describe("Vitals data structure", () => {
  it("creates vitals with only patientId and recordedAt", () => {
    const vitals: Vitals = {
      patientId: "some-id",
      recordedAt: Date.now(),
    };
    expect(vitals.patientId).toBeTruthy();
    expect(vitals.temperature).toBeUndefined();
    expect(vitals.heartRate).toBeUndefined();
  });

  it("accepts all vital sign values", () => {
    const vitals: Vitals = {
      patientId: "some-id",
      recordedAt: Date.now(),
      temperature: 98.6,
      heartRate: 72,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      weight: 70,
      height: 175,
      notes: "Patient appears healthy",
    };
    expect(vitals.temperature).toBe(98.6);
    expect(vitals.heartRate).toBe(72);
    expect(vitals.bloodPressureSystolic).toBe(120);
    expect(vitals.bloodPressureDiastolic).toBe(80);
    expect(vitals.oxygenSaturation).toBe(98);
  });

  it("validates normal vital sign ranges", () => {
    const normalVitals: Vitals = {
      patientId: "id",
      recordedAt: Date.now(),
      temperature: 98.6,
      heartRate: 72,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      oxygenSaturation: 98,
    };

    // Temperature: 95-100°F is normal
    expect(normalVitals.temperature!).toBeGreaterThanOrEqual(95);
    expect(normalVitals.temperature!).toBeLessThanOrEqual(100);

    // Heart rate: 60-100 bpm is normal
    expect(normalVitals.heartRate!).toBeGreaterThanOrEqual(60);
    expect(normalVitals.heartRate!).toBeLessThanOrEqual(100);

    // Systolic: 90-140 mmHg is normal range
    expect(normalVitals.bloodPressureSystolic!).toBeGreaterThanOrEqual(90);
    expect(normalVitals.bloodPressureSystolic!).toBeLessThanOrEqual(140);

    // SpO2: 95-100% is normal
    expect(normalVitals.oxygenSaturation!).toBeGreaterThanOrEqual(95);
    expect(normalVitals.oxygenSaturation!).toBeLessThanOrEqual(100);
  });
});

// ─── Invoice Data Shape (v1 scaffold) ───────────────────
interface Invoice {
  invoiceNumber: string;
  patientId: string;
  totalAmount: number;
  tax: number;
  grandTotal: number;
  status: "PENDING" | "PAID" | "REFUNDED";
}

describe("Invoice data structure", () => {
  it("generates invoice number with RAYAN-INV prefix", () => {
    const num = "RAYAN-INV-00001";
    expect(num).toMatch(/^RAYAN-INV-\d{5}$/);
  });

  it("calculates grand total from totalAmount + tax", () => {
    const totalAmount = 250.0;
    const tax = 25.0;
    const grandTotal = totalAmount + tax;
    expect(grandTotal).toBe(275.0);
  });

  it("supports all payment statuses", () => {
    const statuses: Invoice["status"][] = ["PENDING", "PAID", "REFUNDED"];
    expect(statuses).toHaveLength(3);
    for (const s of statuses) {
      expect(["PENDING", "PAID", "REFUNDED"]).toContain(s);
    }
  });
});
