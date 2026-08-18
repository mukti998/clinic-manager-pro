import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Database,
  FileText,
  Layers,
  Lock,
  Monitor,
  Route,
  Server,
  Shield,
  Terminal,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const capabilities = [
  {
    icon: Users,
    title: "Patient Profile Routing",
    desc: "Transfer and receive patient records across departments with full audit trails and role-based access control.",
  },
  {
    icon: Layers,
    title: "Room Activity Tracking",
    desc: "Monitor room status, occupancy, and activity in real time. Route orders and tasks to the right hands.",
  },
  {
    icon: Database,
    title: "Structured Data Layer",
    desc: "All patient data, vitals, and clinical notes stored in a typed, queryable backend. No spreadsheets.",
  },
  {
    icon: Route,
    title: "Order Management",
    desc: "Create, assign, and track orders across pharmacy, lab, and nursing. Every action is logged.",
  },
  {
    icon: Activity,
    title: "Vitals & Observations",
    desc: "Record and query patient vitals over time. Timestamped, attributed, immutable.",
  },
  {
    icon: FileText,
    title: "Invoice & Billing Pipeline",
    desc: "Generate invoices from clinical events. Line-item breakdowns, tax calculation, payment status tracking.",
  },
];

const specs = [
  { icon: Lock, label: "Session-based auth" },
  { icon: Shield, label: "Role enforcement" },
  { icon: Server, label: "Convex backend" },
  { icon: Terminal, label: "Typed throughout" },
];

const steps = [
  {
    step: "01",
    title: "Authenticate",
    desc: "Sign in with your team credentials. Sessions are managed server-side with Convex Auth.",
  },
  {
    step: "02",
    title: "Select a workspace",
    desc: "Choose the department or service line you are operating in. Permissions follow your role.",
  },
  {
    step: "03",
    title: "Execute",
    desc: "Transfer patients, record vitals, manage orders. Every mutation is validated and logged.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-mesh bg-dots overflow-hidden">
      {/* ─── Nav ─────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-strong sticky top-0 z-50"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15">
              <Monitor className="size-4.5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground font-mono">
              rayan
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#capabilities" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Capabilities
            </a>
            <a href="#architecture" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Architecture
            </a>
            <a href="#workflow" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Workflow
            </a>
          </div>
          <button
            onClick={() => navigate("/auth")}
            className="glass glass-hover flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-primary transition-all"
          >
            Sign In
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </motion.nav>

      {/* ─── Hero ───────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 md:pt-28">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2">
          <div className="size-[500px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-primary font-mono">
            <Activity className="size-3.5" />
            internal operations platform
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Hospital operations,{" "}
            <span className="text-primary">
              controlled.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Rayan is the internal platform for managing patient transfers, room
            activity, orders, and clinical data. Built for the team that keeps
            the hospital running — not for the waiting room.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate("/auth")}
              className="glass glass-strong flex items-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Enter Rayan
              <ArrowRight className="size-3.5" />
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="glass glass-hover flex items-center gap-2 rounded-lg px-7 py-3 text-sm font-medium text-muted-foreground transition-all"
            >
              View as guest
            </button>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="mx-auto mt-20 grid max-w-4xl grid-cols-3 gap-4"
        >
          {[
            { label: "Patient records", value: "active", icon: Users },
            { label: "Room tracking", value: "real-time", icon: Activity },
            { label: "Data layer", value: "typed", icon: Database },
          ].map((item) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              className="glass glass-strong glass-hover rounded-xl p-5 text-center transition-all"
            >
              <item.icon className="mx-auto size-6 text-primary" />
              <p className="mt-2 font-mono text-sm font-bold text-primary">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Capabilities ───────────────────────────── */}
      <section id="capabilities" className="relative mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="glass mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-primary font-mono">
            <Layers className="size-3.5" />
            system capabilities
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            What Rayan Does
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Every module is purpose-built for hospital operations. No generic
            dashboards — just the workflows your team actually needs.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {capabilities.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="glass glass-strong glass-hover group rounded-xl p-6 transition-all"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Architecture ───────────────────────────── */}
      <section id="architecture" className="relative mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="glass mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-primary font-mono">
            <Server className="size-3.5" />
            technical stack
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Built for Engineers
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4"
        >
          {specs.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="glass glass-strong rounded-xl p-5 text-center"
            >
              <s.icon className="mx-auto size-5 text-primary" />
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                {s.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Workflow ───────────────────────────────── */}
      <section id="workflow" className="relative mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Three steps from login to a live operation.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {steps.map((s) => (
            <motion.div
              key={s.step}
              variants={fadeUp}
              className="glass glass-strong glass-hover relative rounded-xl p-7 transition-all"
            >
              <span className="font-mono text-4xl font-extrabold text-primary/15">
                {s.step}
              </span>
              <h3 className="mt-3 text-base font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── CTA ───────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass glass-strong relative overflow-hidden rounded-2xl p-12 text-center md:p-16"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-primary/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 size-60 rounded-full bg-[oklch(0.65_0.12_180)]/6 blur-3xl" />
          <h2 className="relative text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Ready to Deploy
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
            Sign in with your team credentials to start managing patient
            transfers, room activity, and orders.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate("/auth")}
              className="glass glass-strong flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Sign In to Rayan
              <ArrowRight className="size-3.5" />
            </button>
          </div>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
            {["Role-Based Access", "Audit Logging", "Convex Backend", "Type-Safe"].map(
              (item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  {item}
                </span>
              ),
            )}
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ────────────────────────────────── */}
      <footer className="glass border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Monitor className="size-4 text-primary" />
            <span className="text-sm font-bold text-foreground font-mono">
              rayan
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Internal tool. Not for public distribution.
          </p>
        </div>
      </footer>
    </div>
  );
}
