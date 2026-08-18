import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Generate order number ──────────────────────────────
function generateOrderNumber(count: number): string {
  return `RAYAN-ORD-${String(count + 1).padStart(5, "0")}`;
}

// ─── Department helper ─────────────────────────────────
const deptValidator = v.union(
  v.literal("card_office"), v.literal("doctor"),
  v.literal("laboratory"), v.literal("pharmacy"),
  v.literal("nursing"), v.literal("radiology"),
  v.literal("admin"),
);

type Dept = "card_office" | "doctor" | "laboratory" | "pharmacy" | "nursing" | "radiology" | "admin";

// ─── List orders for a department ───────────────────────
export const listByDepartment = query({
  args: {
    department: deptValidator,
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let orders = await ctx.db
      .query("orders")
      .withIndex("by_toDepartment", (q) => q.eq("toDepartment", args.department as Dept))
      .order("desc")
      .collect();

    if (args.status) {
      orders = orders.filter((o) => o.status === args.status);
    }

    return orders;
  },
});

// ─── List orders sent by a department ───────────────────
export const listBySender = query({
  args: {
    department: deptValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .order("desc")
      .collect()
      .then((orders) =>
        orders.filter((o) => o.fromDepartment === args.department),
      );
  },
});

// ─── Get orders for a patient ───────────────────────────
export const listByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_patientId", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

// ─── Get single order ──────────────────────────────────
export const getById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

// ─── Get order history ──────────────────────────────────
export const getHistory = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orderHistory")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .order("desc")
      .collect();
  },
});

// ─── Get order stats for a department ──────────────────
export const getStats = query({
  args: { department: deptValidator },
  handler: async (ctx, args) => {
    const incoming = await ctx.db
      .query("orders")
      .withIndex("by_toDepartment", (q) => q.eq("toDepartment", args.department as Dept))
      .collect();

    const pending = incoming.filter((o) => o.status === "pending").length;
    const inProgress = incoming.filter((o) => o.status === "in_progress").length;
    const completed = incoming.filter((o) => o.status === "completed").length;
    const total = incoming.length;

    return { total, pending, inProgress, completed };
  },
});

// ─── Create order ──────────────────────────────────────
export const create = mutation({
  args: {
    patientId: v.id("patients"),
    type: v.union(
      v.literal("lab_order"), v.literal("pharmacy_order"),
      v.literal("nursing_order"), v.literal("radiology_order"),
      v.literal("general"),
    ),
    fromDepartment: v.union(
      v.literal("card_office"), v.literal("doctor"),
      v.literal("laboratory"), v.literal("pharmacy"),
      v.literal("nursing"), v.literal("radiology"),
      v.literal("admin"),
    ),
    toDepartment: v.union(
      v.literal("card_office"), v.literal("doctor"),
      v.literal("laboratory"), v.literal("pharmacy"),
      v.literal("nursing"), v.literal("radiology"),
      v.literal("admin"),
    ),
    priority: v.union(v.literal("normal"), v.literal("urgent"), v.literal("stat")),
    items: v.array(v.object({
      description: v.string(),
      quantity: v.optional(v.number()),
      notes: v.optional(v.string()),
    })),
    clinicalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Not authenticated");

    // Generate order number
    const allOrders = await ctx.db.query("orders").collect();
    const orderNumber = generateOrderNumber(allOrders.length);
    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      ...args,
      status: "pending",
      createdBy: userId as any,
      createdAt: now,
      updatedAt: now,
    });

    // Create history entry
    await ctx.db.insert("orderHistory", {
      orderId,
      action: "created",
      fromDepartment: args.fromDepartment,
      toDepartment: args.toDepartment,
      status: "pending",
      performedBy: userId as any,
      timestamp: now,
    });

    return orderId;
  },
});

// ─── Route order to another department ──────────────────
export const route = mutation({
  args: {
    orderId: v.id("orders"),
    toDepartment: v.union(
      v.literal("card_office"), v.literal("doctor"),
      v.literal("laboratory"), v.literal("pharmacy"),
      v.literal("nursing"), v.literal("radiology"),
      v.literal("admin"),
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const now = Date.now();
    const fromDept = order.toDepartment;

    await ctx.db.patch(args.orderId, {
      fromDepartment: fromDept,
      toDepartment: args.toDepartment,
      status: "pending",
      updatedAt: now,
    });

    await ctx.db.insert("orderHistory", {
      orderId: args.orderId,
      action: "routed",
      fromDepartment: fromDept,
      toDepartment: args.toDepartment,
      status: "pending",
      note: args.note,
      performedBy: userId as any,
      timestamp: now,
    });
  },
});

// ─── Update order status ────────────────────────────────
export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"), v.literal("in_progress"),
      v.literal("completed"), v.literal("cancelled"),
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const patch: Record<string, unknown> = {
      status: args.status,
      updatedAt: now,
    };
    if (args.status === "completed") {
      patch.completedAt = now;
    }

    await ctx.db.patch(args.orderId, patch);

    await ctx.db.insert("orderHistory", {
      orderId: args.orderId,
      action: "status_change",
      status: args.status,
      note: args.note,
      performedBy: userId as any,
      timestamp: now,
    });
  },
});

// ─── Assign order ──────────────────────────────────────
export const assign = mutation({
  args: {
    orderId: v.id("orders"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      assignedTo: args.userId,
      status: "in_progress",
      updatedAt: Date.now(),
    });
  },
});
