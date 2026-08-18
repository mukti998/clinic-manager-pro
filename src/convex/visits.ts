import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create a new visit (receptionist action)
export const create = mutation({
  args: {
    patientId: v.id("patients"),
    doctorId: v.id("users"),
    consultationFee: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate visit number
    const lastVisit = await ctx.db.query("visits").order("desc").first();
    const visitNum = lastVisit
      ? parseInt(lastVisit.visitNumber.replace("RAYAN-VIS-", "")) + 1
      : 1;
    const visitNumber = `RAYAN-VIS-${String(visitNum).padStart(5, "0")}`;

    // Generate daily token per doctor
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();

    const lastForDoctor = await ctx.db
      .query("visits")
      .withIndex("by_doctorId", (q) => q.eq("doctorId", args.doctorId))
      .order("desc")
      .first();

    const tokenNumber =
      !lastForDoctor || lastForDoctor.createdAt < todayMs
        ? 1
        : lastForDoctor.tokenNumber + 1;

    const visitId = await ctx.db.insert("visits", {
      visitNumber,
      patientId: args.patientId,
      doctorId: args.doctorId,
      tokenNumber,
      status: "waiting",
      consultationFee: args.consultationFee,
      isPaid: false,
      reason: args.reason,
      createdAt: Date.now(),
    });

    return { visitId, visitNumber, tokenNumber };
  },
});

// Mark visit as paid
export const markPaid = mutation({
  args: { visitId: v.id("visits") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.visitId, { isPaid: true });
  },
});

// Update visit status
export const updateStatus = mutation({
  args: {
    visitId: v.id("visits"),
    status: v.union(
      v.literal("waiting"),
      v.literal("with_doctor"),
      v.literal("lab_pending"),
      v.literal("pharmacy_pending"),
      v.literal("completed"),
      v.literal("discharged"),
    ),
  },
  handler: async (ctx, args) => {
    const patch: { status: typeof args.status; completedAt?: number } = { status: args.status };
    if (args.status === "completed" || args.status === "discharged") {
      patch.completedAt = Date.now();
    }
    await ctx.db.patch(args.visitId, patch);
  },
});

// Save doctor consultation notes
export const saveConsultation = mutation({
  args: {
    visitId: v.id("visits"),
    diagnosis: v.string(),
    clinicalNotes: v.optional(v.string()),
    followUpDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.visitId, {
      diagnosis: args.diagnosis,
      clinicalNotes: args.clinicalNotes,
      followUpDate: args.followUpDate,
    });
  },
});

// Get today's queue for a doctor
export const getDoctorQueue = query({
  args: { doctorId: v.id("users") },
  handler: async (ctx, args) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const visits = await ctx.db
      .query("visits")
      .withIndex("by_doctorId", (q) => q.eq("doctorId", args.doctorId))
      .order("asc")
      .collect();
    return visits.filter((v) => v.createdAt >= todayStart.getTime());
  },
});

// Get waiting queue
export const getWaitingQueue = query({
  args: {},
  handler: async (ctx) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const visits = await ctx.db
      .query("visits")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .order("asc")
      .collect();
    return visits.filter((v) => v.createdAt >= todayStart.getTime());
  },
});

// Get visit by ID with patient and doctor info
export const getVisit = query({
  args: { visitId: v.id("visits") },
  handler: async (ctx, args) => {
    const visit = await ctx.db.get(args.visitId);
    if (!visit) return null;
    const patient = await ctx.db.get(visit.patientId);
    const doctor = await ctx.db.get(visit.doctorId);
    return { ...visit, patient, doctor };
  },
});

// Get all active visits
export const getActiveVisits = query({
  args: {},
  handler: async (ctx) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const allVisits = await ctx.db.query("visits").order("desc").collect();
    return allVisits.filter(
      (v) => v.createdAt >= todayStart.getTime() && v.status !== "discharged",
    );
  },
});

// Get today's visit count
export const getTodayCount = query({
  args: {},
  handler: async (ctx) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const allVisits = await ctx.db.query("visits").order("desc").collect();
    return allVisits.filter((v) => v.createdAt >= todayStart.getTime()).length;
  },
});

// Get today's revenue
export const getTodayRevenue = query({
  args: {},
  handler: async (ctx) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const payments = await ctx.db.query("payments").order("desc").collect();
    return payments
      .filter((p) => p.createdAt >= todayStart.getTime())
      .reduce((sum, p) => sum + p.amount, 0);
  },
});
