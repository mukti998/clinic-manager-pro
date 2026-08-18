import { describe, it, expect } from "vitest";
import { ROLES } from "@/convex/schema";

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
});
