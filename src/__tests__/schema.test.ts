import { describe, it, expect } from "vitest";
import { ROLES, DEPARTMENTS, ORDER_TYPES, ORDER_STATUSES } from "@/convex/schema";

describe("Convex schema constants", () => {
  it("defines all expected staff roles", () => {
    expect(ROLES.ADMIN).toBe("admin");
    expect(ROLES.DOCTOR).toBe("doctor");
    expect(ROLES.NURSE).toBe("nurse");
    expect(ROLES.RECEPTIONIST).toBe("receptionist");
    expect(ROLES.PHARMACIST).toBe("pharmacist");
    expect(ROLES.LAB_TECHNICIAN).toBe("lab_technician");
  });

  it("has exactly 6 role values", () => {
    const roleValues = Object.values(ROLES);
    expect(roleValues).toHaveLength(6);
  });

  it("all role values are strings", () => {
    for (const role of Object.values(ROLES)) {
      expect(typeof role).toBe("string");
    }
  });

  it("defines all expected departments", () => {
    expect(DEPARTMENTS).toContain("card_office");
    expect(DEPARTMENTS).toContain("doctor");
    expect(DEPARTMENTS).toContain("laboratory");
    expect(DEPARTMENTS).toContain("pharmacy");
    expect(DEPARTMENTS).toContain("nursing");
    expect(DEPARTMENTS).toContain("radiology");
    expect(DEPARTMENTS).toHaveLength(7);
  });

  it("defines order types", () => {
    expect(ORDER_TYPES).toContain("lab_order");
    expect(ORDER_TYPES).toContain("pharmacy_order");
    expect(ORDER_TYPES).toContain("nursing_order");
    expect(ORDER_TYPES).toContain("radiology_order");
    expect(ORDER_TYPES).toContain("general");
  });

  it("defines order statuses", () => {
    expect(ORDER_STATUSES).toContain("pending");
    expect(ORDER_STATUSES).toContain("in_progress");
    expect(ORDER_STATUSES).toContain("completed");
    expect(ORDER_STATUSES).toContain("cancelled");
  });
});
