import { motion } from "framer-motion";
import {
  Heart,
  Shield,
  Users,
  Activity,
  Calendar,
  FileText,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Pill,
  FlaskConical,
  ClipboardList,
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

const features = [
  {
    icon: Users,
    title: "Patient Records",
    desc: "Complete digital patient profiles with medical history, vitals tracking, and secure data management.",
  },
  {
    icon: Calendar,
    title: "Appointments",
    desc: "Smart scheduling with conflict detection, automated reminders, and doctor availability tracking.",
  },
  {
    icon: Stethoscope,
    title: "Doctor Portal",
    desc: "Dedicated workspace for physicians with patient dashboards, consultation notes, and care plans.",
  },
  {
    icon: Pill,
    title: "Pharmacy",
    desc: "Inventory management, prescription tracking, and automated stock alerts for medications.",
  },
  {
    icon: FlaskConical,
    title: "Laboratory",
    desc: "Lab order management, result tracking, and integration with diagnostic equipment.",
  },
  {
    icon: FileText,
    title: "Billing & Invoices",
    desc: "Automated invoice generation, payment tracking, and insurance claim processing.",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "256-bit", label: "Encryption" },
  { value: "HIPAA", label: "Compliant" },
  { value: "24/7", label: "Monitoring" },
];

const steps = [
  {
    step: "01",
    title: "Register Patients",
    desc: "Quick onboarding with digital intake forms and insurance verification.",
  },
  {
    step: "02",
    title: "Schedule Care",
    desc: "Book appointments, assign doctors, and coordinate treatment plans.",
  },
  {
    step: "03",
    title: "Deliver Excellence",
    desc: "Track outcomes, manage billing, and continuously improve patient care.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-mesh bg-dots overflow-hidden">
      {/* ─── Navbar ─────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-strong sticky top-0 z-50"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Heart className="size-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Rayan<span className="text-primary">Health</span>
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#security" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Security
            </a>
            <a href="#workflow" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </a>
          </div>
          <button
            onClick={() => navigate("/auth")}
            className="glass glass-hover flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary transition-all"
          >
            Sign In
            <ArrowRight className="size-4" />
          </button>
        </div>
      </motion.nav>

      {/* ─── Hero ───────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 md:pt-28">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2">
          <div className="size-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-primary">
            <Activity className="size-3.5" />
            Hospital Management System
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Modern Healthcare,{" "}
            <span className="bg-gradient-to-r from-primary to-[oklch(0.6_0.12_170)] bg-clip-text text-transparent">
              Simplified
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            RayanHealth connects doctors, patients, pharmacy, and laboratory
            into one seamless platform. Manage records, schedule appointments,
            track vitals, and streamline billing — all from a single dashboard.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate("/auth")}
              className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="glass glass-hover flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-foreground transition-all"
            >
              View Demo
            </button>
          </div>
        </motion.div>

        {/* Hero visual — glass card grid */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="mx-auto mt-20 grid max-w-4xl grid-cols-3 gap-4"
        >
          {[
            { icon: Users, label: "Patients", value: "12,847", color: "text-blue-500" },
            { icon: Calendar, label: "Appointments", value: "3,291", color: "text-violet-500" },
            { icon: Activity, label: "Consultations", value: "8,654", color: "text-teal-500" },
          ].map((item) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              className="glass glass-strong glass-hover rounded-2xl p-6 text-center transition-all"
            >
              <item.icon className={`mx-auto size-8 ${item.color}`} />
              <p className="mt-3 text-2xl font-bold text-foreground">{item.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Features ──────────────────────────────────── */}
      <section id="features" className="relative mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="glass mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-primary">
            <ClipboardList className="size-3.5" />
            Platform Features
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything Your Hospital Needs
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            A unified system designed for modern healthcare facilities — from
            small clinics to multi-department hospitals.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="glass glass-strong glass-hover group rounded-2xl p-7 transition-all"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                <f.icon className="size-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Security ──────────────────────────────────── */}
      <section id="security" className="relative mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="glass mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-primary">
            <Shield className="size-3.5" />
            Enterprise Security
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Built for Trust & Compliance
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-5 md:grid-cols-4"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="glass glass-strong rounded-2xl p-6 text-center"
            >
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── How It Works ──────────────────────────────── */}
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
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Get your hospital management system running in three simple steps.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          {steps.map((s) => (
            <motion.div
              key={s.step}
              variants={fadeUp}
              className="glass glass-strong glass-hover relative rounded-2xl p-8 transition-all"
            >
              <span className="text-5xl font-extrabold text-primary/10">
                {s.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── CTA ───────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass glass-strong relative overflow-hidden rounded-3xl p-12 text-center md:p-16"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-[oklch(0.6_0.12_170)]/8 blur-3xl" />
          <h2 className="relative text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Ready to Transform Your Hospital?
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-muted-foreground">
            Join healthcare providers who trust RayanHealth to manage their
            operations and deliver better patient outcomes.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate("/auth")}
              className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Start Managing Patients
              <ArrowRight className="size-4" />
            </button>
          </div>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {["HIPAA Compliant", "End-to-End Encrypted", "Role-Based Access"].map(
              (item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-primary" />
                  {item}
                </span>
              ),
            )}
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ────────────────────────────────────── */}
      <footer className="glass border-t border-white/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              RayanHealth
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 RayanHealth. Built for modern healthcare.
          </p>
        </div>
      </footer>
    </div>
  );
}
