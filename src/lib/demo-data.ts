/**
 * DEMO MODE — Temporary fallback for preview when Convex backend is unavailable.
 * This file provides mock data so the UI can be previewed without a live backend.
 * 
 * DEMO MODE is activated automatically when:
 * - VITE_CONVEX_URL is missing
 * - Convex backend fails to connect
 * - useAuth returns null user but user is "authenticated" in demo
 * 
 * This should be removed or disabled when connecting to a real backend.
 */

// ─── Demo Mode Flag ──────────────────────────────────────
const DEMO_MODE_KEY = "__rayan_demo_mode";

export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_MODE_KEY) === "true";
}

export function enableDemoMode() {
  localStorage.setItem(DEMO_MODE_KEY, "true");
}

export function disableDemoMode() {
  localStorage.removeItem(DEMO_MODE_KEY);
}

// ─── Check if Convex URL is configured ───────────────────
export function isConvexConfigured(): boolean {
  const url = import.meta.env.VITE_CONVEX_URL;
  return !!url && url.length > 10 && !url.includes("undefined");
}

// ─── Demo User ───────────────────────────────────────────
export const DEMO_USER = {
  _id: "demo_user_admin" as any,
  name: "Dr. Sarah Chen",
  email: "sarah.chen@rayan-hospital.org",
  role: "admin" as const,
  department: "admin" as const,
  specialization: "Hospital Administration",
  phone: "+1-555-0100",
  staffId: "RAYAN-STF-00001",
  isAnonymous: false,
  createdAt: Date.now() - 86400000 * 365,
  updatedAt: Date.now(),
  emailVerificationTime: Date.now(),
  image: undefined,
};

// ─── Demo Patients ───────────────────────────────────────
export const DEMO_PATIENTS = [
  {
    _id: "demo_p1" as any, medicalId: "RAYAN-MED-00001", cardNumber: "RAYAN-CRD-00001",
    firstName: "James", lastName: "Mwangi", dateOfBirth: "1985-03-15", gender: "male" as const,
    bloodType: "A+" as const, phone: "+1-555-0101", email: "james.m@email.com",
    address: "123 Oak Street, Nairobi", isActive: true, createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now(), allergies: ["Penicillin"], medicalHistory: "History of hypertension",
  },
  {
    _id: "demo_p2" as any, medicalId: "RAYAN-MED-00002", cardNumber: "RAYAN-CRD-00002",
    firstName: "Amara", lastName: "Okonkwo", dateOfBirth: "1992-07-22", gender: "female" as const,
    bloodType: "O+" as const, phone: "+1-555-0102", isActive: true, createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now(),
  },
  {
    _id: "demo_p3" as any, medicalId: "RAYAN-MED-00003", cardNumber: "RAYAN-CRD-00003",
    firstName: "David", lastName: "Kimani", dateOfBirth: "1978-11-08", gender: "male" as const,
    bloodType: "B-" as const, phone: "+1-555-0103", isActive: true, createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now(), allergies: ["Aspirin", "Ibuprofen"],
  },
  {
    _id: "demo_p4" as any, medicalId: "RAYAN-MED-00004", cardNumber: "RAYAN-CRD-00004",
    firstName: "Fatima", lastName: "Hassan", dateOfBirth: "2001-05-30", gender: "female" as const,
    bloodType: "AB+" as const, phone: "+1-555-0104", email: "fatima.h@email.com",
    address: "789 Pine Avenue", isActive: true, createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
  },
  {
    _id: "demo_p5" as any, medicalId: "RAYAN-MED-00005", cardNumber: "RAYAN-CRD-00005",
    firstName: "Peter", lastName: "Ochieng", dateOfBirth: "1965-09-12", gender: "male" as const,
    bloodType: "O-" as const, phone: "+1-555-0105", isActive: true, createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now(), medicalHistory: "Type 2 Diabetes, managed with Metformin",
  },
];

// ─── Demo Visits ─────────────────────────────────────────
export const DEMO_VISITS = [
  {
    _id: "demo_v1" as any, visitNumber: "RAYAN-VIS-00001", patientId: "demo_p1" as any,
    doctorId: "demo_user_admin" as any, tokenNumber: 1, status: "waiting" as const,
    consultationFee: 50, isPaid: true, reason: "Annual checkup", createdAt: Date.now() - 3600000,
  },
  {
    _id: "demo_v2" as any, visitNumber: "RAYAN-VIS-00002", patientId: "demo_p2" as any,
    doctorId: "demo_user_admin" as any, tokenNumber: 2, status: "waiting" as const,
    consultationFee: 75, isPaid: false, reason: "Persistent headache", createdAt: Date.now() - 1800000,
  },
  {
    _id: "demo_v3" as any, visitNumber: "RAYAN-VIS-00003", patientId: "demo_p3" as any,
    doctorId: "demo_user_admin" as any, tokenNumber: 3, status: "with_doctor" as const,
    consultationFee: 60, isPaid: true, reason: "Chest pain evaluation", createdAt: Date.now() - 7200000,
  },
  {
    _id: "demo_v4" as any, visitNumber: "RAYAN-VIS-00004", patientId: "demo_p4" as any,
    doctorId: "demo_user_admin" as any, tokenNumber: 4, status: "completed" as const,
    consultationFee: 50, isPaid: true, reason: "Follow-up visit", createdAt: Date.now() - 86400000,
    completedAt: Date.now() - 82800000,
  },
  {
    _id: "demo_v5" as any, visitNumber: "RAYAN-VIS-00005", patientId: "demo_p5" as any,
    doctorId: "demo_user_admin" as any, tokenNumber: 5, status: "lab_pending" as const,
    consultationFee: 55, isPaid: true, reason: "Diabetes monitoring", createdAt: Date.now() - 5400000,
  },
];

// ─── Demo Orders ─────────────────────────────────────────
export const DEMO_ORDERS = [
  {
    _id: "demo_o1" as any, orderNumber: "RAYAN-ORD-00001", patientId: "demo_p3" as any,
    visitId: "demo_v3" as any, type: "lab_order" as const, fromDepartment: "doctor" as const,
    toDepartment: "laboratory" as const, status: "pending" as const, priority: "urgent" as const,
    items: [{ description: "ECG", quantity: 1 }],
    createdBy: "demo_user_admin" as any, createdAt: Date.now() - 7000000, updatedAt: Date.now() - 7000000,
  },
  {
    _id: "demo_o2" as any, orderNumber: "RAYAN-ORD-00002", patientId: "demo_p5" as any,
    visitId: "demo_v5" as any, type: "lab_order" as const, fromDepartment: "doctor" as const,
    toDepartment: "laboratory" as const, status: "in_progress" as const, priority: "normal" as const,
    items: [
      { description: "HbA1c Test", quantity: 1 },
      { description: "Fasting Glucose", quantity: 1 },
      { description: "Lipid Panel", quantity: 1 },
    ],
    createdBy: "demo_user_admin" as any, createdAt: Date.now() - 4800000, updatedAt: Date.now() - 3600000,
  },
];

// ─── Demo Lab Results ────────────────────────────────────
export const DEMO_LAB_RESULTS = [
  {
    _id: "demo_lr1" as any, labOrderNumber: "RAYAN-LAB-00001", patientId: "demo_p3" as any,
    visitId: "demo_v3" as any, doctorId: "demo_user_admin" as any,
    status: "ordered" as const,
    tests: [{ testName: "ECG", unit: "", referenceRange: "Normal sinus rhythm" }],
    createdAt: Date.now() - 7000000,
  },
  {
    _id: "demo_lr2" as any, labOrderNumber: "RAYAN-LAB-00002", patientId: "demo_p5" as any,
    visitId: "demo_v5" as any, doctorId: "demo_user_admin" as any,
    status: "sample_collected" as const,
    tests: [
      { testName: "HbA1c", result: "7.2%", unit: "%", referenceRange: "< 5.7%", notes: "Above normal range" },
      { testName: "Fasting Glucose", result: "142", unit: "mg/dL", referenceRange: "70-100 mg/dL" },
      { testName: "Lipid Panel", result: "Pending", unit: "", referenceRange: "" },
    ],
    createdAt: Date.now() - 4800000, sampleCollectedAt: Date.now() - 3600000,
  },
];

// ─── Demo Prescriptions ──────────────────────────────────
export const DEMO_PRESCRIPTIONS = [
  {
    _id: "demo_rx1" as any, prescriptionNumber: "RAYAN-RX-00001",
    patientId: "demo_p1" as any, visitId: "demo_v1" as any,
    doctorId: "demo_user_admin" as any, status: "pending" as const,
    medications: [
      { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days", notes: "Take in the morning" },
    ],
    createdAt: Date.now() - 3000000,
  },
  {
    _id: "demo_rx2" as any, prescriptionNumber: "RAYAN-RX-00002",
    patientId: "demo_p5" as any, visitId: "demo_v5" as any,
    doctorId: "demo_user_admin" as any, status: "approved" as const,
    medications: [
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "90 days" },
      { name: "Glipizide", dosage: "5mg", frequency: "Once daily before breakfast", duration: "90 days" },
    ],
    createdAt: Date.now() - 4500000,
  },
];

// ─── Demo Payments ───────────────────────────────────────
export const DEMO_PAYMENTS = [
  {
    _id: "demo_pay1" as any, paymentNumber: "RAYAN-PAY-00001",
    patientId: "demo_p1" as any, visitId: "demo_v1" as any,
    amount: 50, method: "cash" as const, description: "Consultation fee",
    processedBy: "demo_user_admin" as any, createdAt: Date.now() - 3500000,
  },
  {
    _id: "demo_pay2" as any, paymentNumber: "RAYAN-PAY-00002",
    patientId: "demo_p3" as any, visitId: "demo_v3" as any,
    amount: 60, method: "card" as const, description: "Consultation fee",
    processedBy: "demo_user_admin" as any, createdAt: Date.now() - 7100000,
  },
  {
    _id: "demo_pay3" as any, paymentNumber: "RAYAN-PAY-00003",
    patientId: "demo_p4" as any, visitId: "demo_v4" as any,
    amount: 50, method: "insurance" as const, description: "Consultation fee",
    processedBy: "demo_user_admin" as any, createdAt: Date.now() - 85000000,
  },
];

// ─── Demo Staff ──────────────────────────────────────────
export const DEMO_STAFF = [
  {
    _id: "demo_s1" as any, userId: "demo_user_admin" as any, staffId: "RAYAN-STF-00001",
    firstName: "Sarah", lastName: "Chen", email: "sarah.chen@rayan-hospital.org",
    department: "admin", role: "admin" as const, isActive: true, createdAt: Date.now() - 86400000 * 365,
  },
  {
    _id: "demo_s2" as any, staffId: "RAYAN-STF-00002",
    firstName: "Michael", lastName: "Obi", email: "michael.obi@rayan-hospital.org",
    department: "doctor", role: "doctor" as const, specialization: "Internal Medicine",
    isActive: true, createdAt: Date.now() - 86400000 * 200,
  },
  {
    _id: "demo_s3" as any, staffId: "RAYAN-STF-00003",
    firstName: "Grace", lastName: "Adeyemi", email: "grace.a@rayan-hospital.org",
    department: "doctor", role: "doctor" as const, specialization: "Pediatrics",
    isActive: true, createdAt: Date.now() - 86400000 * 150,
  },
  {
    _id: "demo_s4" as any, staffId: "RAYAN-STF-00004",
    firstName: "John", lastName: "Kamau", email: "john.k@rayan-hospital.org",
    department: "nursing", role: "nurse" as const,
    isActive: true, createdAt: Date.now() - 86400000 * 100,
  },
  {
    _id: "demo_s5" as any, staffId: "RAYAN-STF-00005",
    firstName: "Fatou", lastName: "Diallo", email: "fatou.d@rayan-hospital.org",
    department: "pharmacy", role: "pharmacist" as const,
    isActive: true, createdAt: Date.now() - 86400000 * 80,
  },
  {
    _id: "demo_s6" as any, staffId: "RAYAN-STF-00006",
    firstName: "Ahmed", lastName: "Rashid", email: "ahmed.r@rayan-hospital.org",
    department: "laboratory", role: "lab_technician" as const,
    isActive: true, createdAt: Date.now() - 86400000 * 60,
  },
  {
    _id: "demo_s7" as any, staffId: "RAYAN-STF-00007",
    firstName: "Lucy", lastName: "Wanjiku", email: "lucy.w@rayan-hospital.org",
    department: "card_office", role: "receptionist" as const,
    isActive: true, createdAt: Date.now() - 86400000 * 40,
  },
];

// ─── Demo Vitals ─────────────────────────────────────────
export const DEMO_VITALS = [
  {
    _id: "demo_vt1" as any, patientId: "demo_p3" as any,
    recordedAt: Date.now() - 6800000,
    temperature: 37.2, heartRate: 88,
    bloodPressureSystolic: 142, bloodPressureDiastolic: 88,
    respiratoryRate: 18, oxygenSaturation: 97,
    weight: 82, height: 175,
  },
  {
    _id: "demo_vt2" as any, patientId: "demo_p5" as any,
    recordedAt: Date.now() - 4200000,
    temperature: 36.8, heartRate: 72,
    bloodPressureSystolic: 128, bloodPressureDiastolic: 80,
    respiratoryRate: 16, oxygenSaturation: 98,
    weight: 78, height: 170,
  },
];

// ─── Demo Invoices ───────────────────────────────────────
export const DEMO_INVOICES = [
  {
    _id: "demo_inv1" as any, invoiceNumber: "RAYAN-INV-00001",
    patientId: "demo_p1" as any, visitId: "demo_v1" as any,
    items: [
      { description: "Consultation — Internal Medicine", amount: 50, category: "consultation" },
    ],
    subtotal: 50, total: 50, isPaid: true, createdAt: Date.now() - 3500000,
  },
  {
    _id: "demo_inv2" as any, invoiceNumber: "RAYAN-INV-00002",
    patientId: "demo_p3" as any, visitId: "demo_v3" as any,
    items: [
      { description: "Consultation — Cardiology", amount: 60, category: "consultation" },
      { description: "ECG Test", amount: 30, category: "laboratory" },
    ],
    subtotal: 90, total: 90, isPaid: true, createdAt: Date.now() - 7100000,
  },
  {
    _id: "demo_inv3" as any, invoiceNumber: "RAYAN-INV-00003",
    patientId: "demo_p2" as any, visitId: "demo_v2" as any,
    items: [
      { description: "Consultation — General", amount: 75, category: "consultation" },
    ],
    subtotal: 75, total: 75, isPaid: false, createdAt: Date.now() - 1700000,
  },
];

// ─── Helper: resolve patient name from ID ────────────────
export function getPatientName(patientId: string): string {
  const p = DEMO_PATIENTS.find((p) => p._id === patientId);
  return p ? `${p.firstName} ${p.lastName}` : "Unknown Patient";
}
