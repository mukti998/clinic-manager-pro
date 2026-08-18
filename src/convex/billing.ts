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
