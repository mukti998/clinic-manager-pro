import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { ROLES, roleValidator } from "./schema";

// Admin: create a new user account with role
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: roleValidator,
    department: v.optional(v.string()),
    specialization: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", args.email)).first();
    if (existing) throw new Error("A user with this email already exists.");

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: args.role,
      department: args.department as never,
      specialization: args.specialization,
      phone: args.phone,
    });

    // Also create staff record
    const lastStaff = await ctx.db.query("staff").order("desc").first();
    const staffNum = lastStaff ? parseInt(lastStaff.staffId.replace("RAYAN-STF-", "")) + 1 : 1;

    await ctx.db.insert("staff", {
      userId,
      staffId: `RAYAN-STF-${String(staffNum).padStart(5, "0")}`,
      firstName: args.name.split(" ")[0] || args.name,
      lastName: args.name.split(" ").slice(1).join(" ") || "",
      email: args.email,
      phone: args.phone,
      department: args.department || "admin",
      specialization: args.specialization,
      role: args.role,
      isActive: true,
      createdAt: Date.now(),
    });

    return userId;
  },
});

// Get current user profile
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", identity.email)).first();
    return user;
  },
});

// Admin: list all users
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Admin: update user role
export const updateRole = mutation({
  args: { userId: v.id("users"), role: roleValidator },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

// Admin: deactivate user
export const deactivateUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: undefined });
  },
});

// Admin: get user stats
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const doctors = users.filter((u) => u.role === "doctor").length;
    const nurses = users.filter((u) => u.role === "nurse").length;
    const pharmacists = users.filter((u) => u.role === "pharmacist").length;
    const labTechs = users.filter((u) => u.role === "lab_technician").length;
    const receptionists = users.filter((u) => u.role === "receptionist").length;
    const admins = users.filter((u) => u.role === "admin").length;
    const total = users.length;
    return { total, doctors, nurses, pharmacists, labTechs, receptionists, admins };
  },
});
