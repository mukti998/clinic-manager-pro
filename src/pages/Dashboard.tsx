import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Heart,
  Users,
  Activity,
  Calendar,
  LogOut,
  Search,
  Plus,
  ChevronRight,
  UserPlus,
  TrendingUp,
  Stethoscope,
  FileText,
  X,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

// ─── Types ──────────────────────────────────────────────
type View = "patients" | "add-patient" | "patient-detail";

// ─── Sidebar Navigation ─────────────────────────────────
const navItems = [
  { id: "patients", icon: Users, label: "Patients" },
  { id: "calendar", icon: Calendar, label: "Appointments" },
  { id: "staff", icon: Stethoscope, label: "Staff" },
  { id: "billing", icon: FileText, label: "Billing" },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>("patients");
  const [selectedPatientId, setSelectedPatientId] = useState<Id<"patients"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-mesh bg-dots">
      {/* ─── Sidebar ─────────────────────────────────── */}
      <aside className="glass-strong flex w-64 flex-col border-r border-white/30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Heart className="size-5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Rayan<span className="text-primary">Health</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as View);
                setSelectedPatientId(null);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                currentView === item.id || (item.id === "patients" && (currentView === "patients" || currentView === "add-patient" || currentView === "patient-detail"))
                  ? "glass bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/40 hover:text-foreground"
              }`}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User / Sign Out */}
        <div className="border-t border-white/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || "Staff"}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/50 hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentView === "patients" && !selectedPatientId && (
            <PatientList
              key="list"
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectPatient={(id) => {
                setSelectedPatientId(id);
                setCurrentView("patient-detail");
              }}
              onAddPatient={() => setCurrentView("add-patient")}
            />
          )}
          {currentView === "add-patient" && (
            <AddPatient
              key="add"
              onBack={() => setCurrentView("patients")}
            />
          )}
          {currentView === "patient-detail" && selectedPatientId && (
            <PatientDetail
              key={`detail-${selectedPatientId}`}
              patientId={selectedPatientId}
              onBack={() => {
                setSelectedPatientId(null);
                setCurrentView("patients");
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── Stats Row ──────────────────────────────────────────
function StatsRow() {
  const stats = useQuery(api.patients.getStats);

  const cards = [
    {
      label: "Total Patients",
      value: stats?.total ?? "—",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active",
      value: stats?.active ?? "—",
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Recent (30d)",
      value: stats?.recentPatients ?? "—",
      icon: TrendingUp,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Male / Female",
      value: stats ? `${stats.male} / ${stats.female}` : "—",
      icon: Users,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="glass glass-strong glass-hover rounded-2xl p-5 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <div className={`flex size-9 items-center justify-center rounded-xl ${c.bg}`}>
              <c.icon className={`size-4.5 ${c.color}`} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Patient List View ──────────────────────────────────
function PatientList({
  searchQuery,
  setSearchQuery,
  onSelectPatient,
  onAddPatient,
}: {
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  onSelectPatient: (id: Id<"patients">) => void;
  onAddPatient: () => void;
}) {
  const patients = useQuery(api.patients.list, {
    search: searchQuery || undefined,
    activeOnly: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-6xl px-6 py-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Records</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and view all patient information
          </p>
        </div>
        <button
          onClick={onAddPatient}
          className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:shadow-lg hover:shadow-primary/25"
        >
          <Plus className="size-4" />
          New Patient
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6">
        <StatsRow />
      </div>

      {/* Search */}
      <div className="glass mt-6 flex items-center gap-3 rounded-xl px-4 py-3">
        <Search className="size-4.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, medical ID, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass glass-strong mt-4 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/30 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Medical ID</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Blood Type</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {patients === undefined ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    Loading patients...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    {searchQuery ? "No patients match your search." : "No patients registered yet."}
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr
                    key={patient._id}
                    onClick={() => onSelectPatient(patient._id)}
                    className="cursor-pointer border-b border-white/20 transition-colors hover:bg-white/40 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {patient.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="glass rounded-full px-3 py-1 text-xs font-medium text-primary">
                        {patient.medicalId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize text-muted-foreground">
                      {patient.gender}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
                        {patient.bloodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="inline size-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Add Patient Form ───────────────────────────────────
function AddPatient({ onBack }: { onBack: () => void }) {
  const createPatient = useMutation(api.patients.create);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "male" as "male" | "female" | "other",
    bloodType: "O+" as
      | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-",
    phone: "",
    email: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    allergies: "",
    medicalHistory: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const allergies = form.allergies
        ? form.allergies.split(",").map((a) => a.trim()).filter(Boolean)
        : undefined;
      await createPatient({
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        bloodType: form.bloodType,
        phone: form.phone,
        email: form.email || undefined,
        address: form.address || undefined,
        emergencyContactName: form.emergencyContactName || undefined,
        emergencyContactPhone: form.emergencyContactPhone || undefined,
        allergies,
        medicalHistory: form.medicalHistory || undefined,
        insuranceProvider: form.insuranceProvider || undefined,
        insurancePolicyNumber: form.insurancePolicyNumber || undefined,
      });
      toast.success("Patient registered successfully!");
      onBack();
    } catch (err) {
      toast.error("Failed to register patient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/40 bg-white/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10 focus:bg-white/70";
  const labelCls = "text-sm font-medium text-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="mx-auto max-w-3xl px-6 py-8"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="glass glass-hover rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Register New Patient</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in the patient details below
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass glass-strong mt-8 rounded-2xl p-8">
        {/* Personal Info */}
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
          Personal Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>First Name *</label>
            <input
              required
              className={`${inputCls} mt-1.5`}
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="John"
            />
          </div>
          <div>
            <label className={labelCls}>Last Name *</label>
            <input
              required
              className={`${inputCls} mt-1.5`}
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder="Doe"
            />
          </div>
          <div>
            <label className={labelCls}>Date of Birth *</label>
            <input
              required
              type="date"
              className={`${inputCls} mt-1.5`}
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Gender *</label>
            <select
              required
              className={`${inputCls} mt-1.5`}
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value as "male" | "female" | "other" })
              }
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Blood Type *</label>
            <select
              required
              className={`${inputCls} mt-1.5`}
              value={form.bloodType}
              onChange={(e) => setForm({ ...form, bloodType: e.target.value as any })}
            >
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact */}
        <h2 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wider text-primary">
          Contact Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Phone *</label>
            <input
              required
              className={`${inputCls} mt-1.5`}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              className={`${inputCls} mt-1.5`}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Address</label>
            <input
              className={`${inputCls} mt-1.5`}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Main St, City, State"
            />
          </div>
        </div>

        {/* Emergency */}
        <h2 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wider text-primary">
          Emergency Contact
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Contact Name</label>
            <input
              className={`${inputCls} mt-1.5`}
              value={form.emergencyContactName}
              onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className={labelCls}>Contact Phone</label>
            <input
              className={`${inputCls} mt-1.5`}
              value={form.emergencyContactPhone}
              onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
              placeholder="+1 (555) 987-6543"
            />
          </div>
        </div>

        {/* Medical */}
        <h2 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wider text-primary">
          Medical Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Allergies (comma separated)</label>
            <input
              className={`${inputCls} mt-1.5`}
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              placeholder="Penicillin, Peanuts, Latex"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Medical History</label>
            <textarea
              rows={3}
              className={`${inputCls} mt-1.5 resize-none`}
              value={form.medicalHistory}
              onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })}
              placeholder="Previous surgeries, chronic conditions, etc."
            />
          </div>
        </div>

        {/* Insurance */}
        <h2 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wider text-primary">
          Insurance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Provider</label>
            <input
              className={`${inputCls} mt-1.5`}
              value={form.insuranceProvider}
              onChange={(e) => setForm({ ...form, insuranceProvider: e.target.value })}
              placeholder="Blue Cross Blue Shield"
            />
          </div>
          <div>
            <label className={labelCls}>Policy Number</label>
            <input
              className={`${inputCls} mt-1.5`}
              value={form.insurancePolicyNumber}
              onChange={(e) => setForm({ ...form, insurancePolicyNumber: e.target.value })}
              placeholder="BCB-123456789"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60"
          >
            <UserPlus className="size-4" />
            {isSubmitting ? "Registering..." : "Register Patient"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="glass glass-hover rounded-xl px-6 py-2.5 text-sm font-medium text-muted-foreground transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Patient Detail View ────────────────────────────────
function PatientDetail({
  patientId,
  onBack,
}: {
  patientId: Id<"patients">;
  onBack: () => void;
}) {
  const patient = useQuery(api.patients.getById, { patientId });
  const vitals = useQuery(api.patients.getVitals, { patientId });
  const deactivate = useMutation(api.patients.deactivate);
  const reactivate = useMutation(api.patients.reactivate);
  const addVitals = useMutation(api.vitals.add);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({
    temperature: "",
    heartRate: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    notes: "",
  });

  const inputCls =
    "w-full rounded-xl border border-white/40 bg-white/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10 focus:bg-white/70";
  const labelCls = "text-sm font-medium text-foreground";

  const handleAddVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addVitals({
        patientId,
        temperature: vitalsForm.temperature ? Number(vitalsForm.temperature) : undefined,
        heartRate: vitalsForm.heartRate ? Number(vitalsForm.heartRate) : undefined,
        bloodPressureSystolic: vitalsForm.bloodPressureSystolic
          ? Number(vitalsForm.bloodPressureSystolic)
          : undefined,
        bloodPressureDiastolic: vitalsForm.bloodPressureDiastolic
          ? Number(vitalsForm.bloodPressureDiastolic)
          : undefined,
        respiratoryRate: vitalsForm.respiratoryRate
          ? Number(vitalsForm.respiratoryRate)
          : undefined,
        oxygenSaturation: vitalsForm.oxygenSaturation
          ? Number(vitalsForm.oxygenSaturation)
          : undefined,
        weight: vitalsForm.weight ? Number(vitalsForm.weight) : undefined,
        height: vitalsForm.height ? Number(vitalsForm.height) : undefined,
        notes: vitalsForm.notes || undefined,
      });
      toast.success("Vitals recorded successfully!");
      setShowVitalsForm(false);
      setVitalsForm({
        temperature: "", heartRate: "", bloodPressureSystolic: "",
        bloodPressureDiastolic: "", respiratoryRate: "", oxygenSaturation: "",
        weight: "", height: "", notes: "",
      });
    } catch {
      toast.error("Failed to record vitals.");
    }
  };

  if (!patient) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading patient data...</p>
      </div>
    );
  }

  const age = patient.dateOfBirth
    ? Math.floor(
        (Date.now() - new Date(patient.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="mx-auto max-w-4xl px-6 py-8"
    >
      {/* Back + Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="glass glass-hover rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {patient.firstName} {patient.lastName}
              </h1>
              <div className="flex items-center gap-3">
                <span className="glass rounded-full px-3 py-0.5 text-xs font-medium text-primary">
                  {patient.medicalId}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    patient.isActive
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {patient.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {patient.isActive ? (
            <button
              onClick={async () => {
                await deactivate({ patientId });
                toast.success("Patient deactivated.");
                onBack();
              }}
              className="glass glass-hover rounded-xl px-4 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-500/10"
            >
              Deactivate
            </button>
          ) : (
            <button
              onClick={async () => {
                await reactivate({ patientId });
                toast.success("Patient reactivated.");
              }}
              className="glass glass-hover rounded-xl px-4 py-2 text-sm font-medium text-emerald-500 transition-all hover:bg-emerald-500/10"
            >
              Reactivate
            </button>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Date of Birth", value: patient.dateOfBirth || "—" },
          { label: "Age", value: `${age} years` },
          { label: "Gender", value: patient.gender },
          { label: "Blood Type", value: patient.bloodType },
          { label: "Phone", value: patient.phone },
          { label: "Email", value: patient.email || "—" },
          { label: "Address", value: patient.address || "—" },
          { label: "Insurance", value: patient.insuranceProvider || "—" },
          { label: "Policy #", value: patient.insurancePolicyNumber || "—" },
        ].map((item) => (
          <div key={item.label} className="glass glass-strong rounded-xl p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Emergency Contact */}
      {(patient.emergencyContactName || patient.emergencyContactPhone) && (
        <div className="mt-5">
          <div className="glass glass-strong rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
              Emergency Contact
            </p>
            <div className="mt-2 flex gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium text-foreground">
                  {patient.emergencyContactName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium text-foreground">
                  {patient.emergencyContactPhone || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Allergies */}
      {patient.allergies && patient.allergies.length > 0 && (
        <div className="mt-5">
          <div className="glass glass-strong rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              Allergies
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {patient.allergies.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Medical History */}
      {patient.medicalHistory && (
        <div className="mt-5">
          <div className="glass glass-strong rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
              Medical History
            </p>
            <p className="mt-2 text-sm text-foreground leading-relaxed">
              {patient.medicalHistory}
            </p>
          </div>
        </div>
      )}

      {/* ─── Vitals Section ───────────────────────────── */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Vitals History</h2>
        <button
          onClick={() => setShowVitalsForm(!showVitalsForm)}
          className="glass glass-hover flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-primary transition-all"
        >
          <Activity className="size-4" />
          {showVitalsForm ? "Cancel" : "Record Vitals"}
        </button>
      </div>

      {/* Vitals Form */}
      <AnimatePresence>
        {showVitalsForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleAddVitals}
              className="glass glass-strong mt-4 rounded-2xl p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={labelCls}>Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    className={`${inputCls} mt-1.5`}
                    value={vitalsForm.temperature}
                    onChange={(e) =>
                      setVitalsForm({ ...vitalsForm, temperature: e.target.value })
                    }
                    placeholder="98.6"
                  />
                </div>
                <div>
                  <label className={labelCls}>Heart Rate (bpm)</label>
                  <input
                    type="number"
                    className={`${inputCls} mt-1.5`}
                    value={vitalsForm.heartRate}
                    onChange={(e) =>
                      setVitalsForm({ ...vitalsForm, heartRate: e.target.value })
                    }
                    placeholder="72"
                  />
                </div>
                <div>
                  <label className={labelCls}>BP Systolic</label>
                  <input
                    type="number"
                    className={`${inputCls} mt-1.5`}
                    value={vitalsForm.bloodPressureSystolic}
                    onChange={(e) =>
                      setVitalsForm({ ...vitalsForm, bloodPressureSystolic: e.target.value })
                    }
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className={labelCls}>BP Diastolic</label>
                  <input
                    type="number"
                    className={`${inputCls} mt-1.5`}
                    value={vitalsForm.bloodPressureDiastolic}
                    onChange={(e) =>
                      setVitalsForm({ ...vitalsForm, bloodPressureDiastolic: e.target.value })
                    }
                    placeholder="80"
                  />
                </div>
                <div>
                  <label className={labelCls}>Resp Rate</label>
                  <input
                    type="number"
                    className={`${inputCls} mt-1.5`}
                    value={vitalsForm.respiratoryRate}
                    onChange={(e) =>
                      setVitalsForm({ ...vitalsForm, respiratoryRate: e.target.value })
                    }
                    placeholder="16"
                  />
                </div>
                <div>
                  <label className={labelCls}>SpO₂ (%)</label>
                  <input
                    type="number"
                    className={`${inputCls} mt-1.5`}
                    value={vitalsForm.oxygenSaturation}
                    onChange={(e) =>
                      setVitalsForm({ ...vitalsForm, oxygenSaturation: e.target.value })
                    }
                    placeholder="98"
                  />
                </div>
                <div>
                  <label className={labelCls}>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className={`${inputCls} mt-1.5`}
                    value={vitalsForm.weight}
                    onChange={(e) =>
                      setVitalsForm({ ...vitalsForm, weight: e.target.value })
                    }
                    placeholder="70"
                  />
                </div>
                <div>
                  <label className={labelCls}>Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className={`${inputCls} mt-1.5`}
                    value={vitalsForm.height}
                    onChange={(e) =>
                      setVitalsForm({ ...vitalsForm, height: e.target.value })
                    }
                    placeholder="175"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelCls}>Notes</label>
                <textarea
                  rows={2}
                  className={`${inputCls} mt-1.5 resize-none`}
                  value={vitalsForm.notes}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, notes: e.target.value })
                  }
                  placeholder="Optional observations..."
                />
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:shadow-lg hover:shadow-primary/25"
                >
                  <Activity className="size-4" />
                  Save Vitals
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vitals Table */}
      <div className="glass glass-strong mt-4 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/30 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Temp</th>
                <th className="px-5 py-3">HR</th>
                <th className="px-5 py-3">BP</th>
                <th className="px-5 py-3">SpO₂</th>
                <th className="px-5 py-3">Weight</th>
                <th className="px-5 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {vitals === undefined ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Loading vitals...
                  </td>
                </tr>
              ) : vitals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No vitals recorded yet.
                  </td>
                </tr>
              ) : (
                vitals.map((v) => (
                  <tr
                    key={v._id}
                    className="border-b border-white/20 last:border-0"
                  >
                    <td className="px-5 py-3 text-sm text-foreground">
                      {new Date(v.recordedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {v.temperature ? `${v.temperature}°F` : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {v.heartRate ? `${v.heartRate} bpm` : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {v.bloodPressureSystolic && v.bloodPressureDiastolic
                        ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {v.oxygenSaturation ? `${v.oxygenSaturation}%` : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {v.weight ? `${v.weight} kg` : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground max-w-[150px] truncate">
                      {v.notes || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
