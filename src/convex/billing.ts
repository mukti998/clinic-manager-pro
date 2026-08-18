import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Process payment
export const processPayment = mutation({
  args: {
    patientId: v.id("patients"),
    visitId: v.optional(v.id("visits")),
    amount: v.number(),
    method: v.union(v.literal("cash"), v.literal("card"), v.literal("insurance"), v.literal("digital")),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const last = await ctx.db.query("payments").order("desc").first();
    const num = last ? parseInt(last.paymentNumber.replace("RAYAN-PAY-", "")) + 1 : 1;

    return await ctx.db.insert("payments", {
      paymentNumber: `RAYAN-PAY-${String(num).padStart(5, "0")}`,
      patientId: args.patientId,
      visitId: args.visitId,
      amount: args.amount,
      method: args.method,
      description: args.description,
      processedBy: identity.subject as never,
      createdAt: Date.now(),
    });
  },
});

// Create invoice
export const createInvoice = mutation({
  args: {
    patientId: v.id("patients"),
    visitId: v.id("visits"),
    items: v.array(v.object({ description: v.string(), amount: v.number(), category: v.string() })),
    discount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const last = await ctx.db.query("invoices").order("desc").first();
    const num = last ? parseInt(last.invoiceNumber.replace("RAYAN-INV-", "")) + 1 : 1;
    const subtotal = args.items.reduce((s, i) => s + i.amount, 0);
    const discount = args.discount || 0;

    return await ctx.db.insert("invoices", {
      invoiceNumber: `RAYAN-INV-${String(num).padStart(5, "0")}`,
      patientId: args.patientId,
      visitId: args.visitId,
      items: args.items,
      subtotal,
      discount,
      total: subtotal - discount,
      isPaid: false,
      createdAt: Date.now(),
    });
  },
});

// Mark invoice paid
export const markInvoicePaid = mutation({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invoiceId, { isPaid: true });
  },
});

// Get invoice for a visit
export const getInvoiceByVisit = query({
  args: { visitId: v.id("visits") },
  handler: async (ctx, args) => {
    return await ctx.db.query("invoices").withIndex("by_visitId", (q) => q.eq("visitId", args.visitId)).first();
  },
});

// Get payments for a visit
export const getPaymentsByVisit = query({
  args: { visitId: v.id("visits") },
  handler: async (ctx, args) => {
    return await ctx.db.query("payments").withIndex("by_visitId", (q) => q.eq("visitId", args.visitId)).order("desc").collect();
  },
});

// Today's revenue
export const getTodayRevenue = query({
  args: {},
  handler: async (ctx) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const payments = await ctx.db.query("payments").order("desc").collect();
    return payments.filter((p) => p.createdAt >= todayStart.getTime()).reduce((s, p) => s + p.amount, 0);
  },
});

// Total revenue
export const getTotalRevenue = query({
  args: {},
  handler: async (ctx) => {
    const payments = await ctx.db.query("payments").order("desc").collect();
    return payments.reduce((s, p) => s + p.amount, 0);
  },
});

// ─── Admin Financial Reports ───────────────────────────────

// Revenue by date range (for daily/weekly/monthly reports)
export const getRevenueByRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const payments = await ctx.db.query("payments").order("desc").collect();
    const filtered = payments.filter(
      (p) => p.createdAt >= args.startDate && p.createdAt <= args.endDate,
    );

    const totalRevenue = filtered.reduce((s, p) => s + p.amount, 0);
    const byMethod: Record<string, number> = {};
    for (const p of filtered) {
      byMethod[p.method] = (byMethod[p.method] || 0) + p.amount;
    }

    return {
      totalRevenue,
      transactionCount: filtered.length,
      byMethod,
      payments: filtered,
    };
  },
});

// Recent payments (last N payments)
export const getRecentPayments = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db.query("payments").order("desc").take(limit);
  },
});

// Daily revenue for last 7 days (chart data)
export const getDailyRevenueChart = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const days: { date: string; revenue: number; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const payments = await ctx.db.query("payments").order("desc").collect();
      const dayPayments = payments.filter(
        (p) => p.createdAt >= dayStart.getTime() && p.createdAt <= dayEnd.getTime(),
      );

      const label = dayStart.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      days.push({
        date: label,
        revenue: dayPayments.reduce((s, p) => s + p.amount, 0),
        count: dayPayments.length,
      });
    }

    return days;
  },
});

// Department activity summary for admin
export const getDepartmentSummary = query({
  args: {},
  handler: async (ctx) => {
    const visits = await ctx.db.query("visits").collect();
    const labOrders = await ctx.db.query("labResults").collect();
    const prescriptions = await ctx.db.query("prescriptions").collect();

    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTs = todayStart.getTime();

    const todayVisits = visits.filter((v) => v.createdAt >= todayTs);
    const todayLab = labOrders.filter((l) => l.createdAt >= todayTs);
    const todayRx = prescriptions.filter((r) => r.createdAt >= todayTs);

    return {
      cardOffice: {
        todayRegistrations: todayVisits.length,
        waitingQueue: visits.filter((v) => v.status === "waiting").length,
        totalToday: todayVisits.length,
      },
      doctors: {
        inConsultation: visits.filter((v) => v.status === "with_doctor").length,
        completedToday: todayVisits.filter((v) => v.status === "completed").length,
        totalToday: todayVisits.length,
      },
      laboratory: {
        pendingOrders: labOrders.filter((l) => l.status === "ordered").length,
        inProgress: labOrders.filter((l) => l.status === "in_progress").length,
        completedToday: todayLab.filter((l) => l.status === "completed").length,
        totalAllTime: labOrders.length,
      },
      pharmacy: {
        pendingPrescriptions: prescriptions.filter((r) => r.status === "pending").length,
        dispensedToday: todayRx.filter((r) => r.status === "dispensed").length,
        totalAllTime: prescriptions.length,
      },
    };
  },
});

// All invoices (admin view)
export const getAllInvoices = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("invoices").order("desc").take(100);
  },
});

// Total expenses (placeholder — would connect to expense tracking in production)
export const getTotalExpenses = query({
  args: {},
  handler: async () => {
    // In production, this would aggregate from an expenses table
    return 0;
  },
});
