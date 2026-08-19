import { isDemoMode } from "./demo-data";
import {
  DEMO_USER,
  DEMO_PATIENTS,
  DEMO_VISITS,
  DEMO_ORDERS,
  DEMO_LAB_RESULTS,
  DEMO_PRESCRIPTIONS,
  DEMO_PAYMENTS,
  DEMO_STAFF,
  DEMO_VITALS,
  DEMO_INVOICES,
} from "./demo-data";

/**
 * Maps Convex API query paths to demo data responses.
 * Called by the DemoConvexClient when a watch is created.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDemoQueryResult(queryPath: string, args: any): any {
  // Users
  if (queryPath.includes("users.currentUser")) {
    return DEMO_USER;
  }
  if (queryPath.includes("users.listAll") || queryPath.includes("users.getStats")) {
    if (queryPath.includes("getStats")) {
      const counts = { total: DEMO_STAFF.length, doctors: 0, nurses: 0, pharmacists: 0, labTechs: 0, receptionists: 0, admins: 0 };
      for (const s of DEMO_STAFF) {
        if (s.role === "admin") counts.admins++;
        else if (s.role === "doctor") counts.doctors++;
        else if (s.role === "nurse") counts.nurses++;
        else if (s.role === "pharmacist") counts.pharmacists++;
        else if (s.role === "lab_technician") counts.labTechs++;
        else if (s.role === "receptionist") counts.receptionists++;
      }
      return counts;
    }
    return DEMO_STAFF.map((s) => ({ ...s, _id: s._id, _creationTime: s.createdAt }));
  }

  // Patients
  if (queryPath.includes("patients.list") || queryPath.includes("patients.search")) {
    return DEMO_PATIENTS;
  }
  if (queryPath.includes("patients.getStats")) {
    return { total: DEMO_PATIENTS.length, active: DEMO_PATIENTS.filter(p => p.isActive).length };
  }

  // Visits
  if (queryPath.includes("visits.getTodayCount")) return DEMO_VISITS.length;
  if (queryPath.includes("visits.getTodayRevenue")) {
    return DEMO_PAYMENTS.reduce((sum, p) => sum + p.amount, 0);
  }
  if (queryPath.includes("visits.getWaitingQueue")) {
    return DEMO_VISITS.filter((v) => v.status === "waiting");
  }
  if (queryPath.includes("visits.getByDoctor")) {
    return DEMO_VISITS.filter((v) => v.status === "with_doctor" || v.status === "waiting");
  }
  if (queryPath.includes("visits.get")) {
    return DEMO_VISITS.find((v) => v._id === args?.visitId) || null;
  }
  if (queryPath.includes("visits.list")) {
    return DEMO_VISITS;
  }

  // Lab
  if (queryPath.includes("lab.getPendingCount")) return 2;
  if (queryPath.includes("lab.getByStatus") || queryPath.includes("lab.list")) {
    return DEMO_LAB_RESULTS;
  }

  // Orders
  if (queryPath.includes("orders.list") || queryPath.includes("orders.getByStatus")) {
    return DEMO_ORDERS;
  }
  if (queryPath.includes("orders.getOrderHistory")) return [];

  // Prescriptions
  if (queryPath.includes("prescriptions.getByStatus") || queryPath.includes("prescriptions.list")) {
    return DEMO_PRESCRIPTIONS;
  }

  // Billing
  if (queryPath.includes("billing.getDailyRevenue") || queryPath.includes("billing.getRevenueReport")) {
    return { total: 110, byMethod: { cash: 50, card: 60, insurance: 0, digital: 0 } };
  }
  if (queryPath.includes("billing.getRecentPayments")) return DEMO_PAYMENTS;
  if (queryPath.includes("billing.getAllInvoices")) return DEMO_INVOICES;
  if (queryPath.includes("billing.getOutstanding")) return 75;

  // Staff
  if (queryPath.includes("staff.list") || queryPath.includes("staff.getAll")) {
    return DEMO_STAFF;
  }

  // Vitals
  if (queryPath.includes("vitals.getLatest")) {
    return DEMO_VITALS.find((v) => v.patientId === args?.patientId) || null;
  }
  if (queryPath.includes("vitals.getHistory")) {
    return DEMO_VITALS.filter((v) => v.patientId === args?.patientId);
  }

  // Default: return empty array for any unhandled queries
  return [];
}
