import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Activity,
  ArrowLeftRight,
  Beaker,
  BookOpen,
  Brain,
  Calendar,
  ChevronRight,
  ClipboardList,
  FileText,
  FlaskConical,
  Heart,
  Home,
  Layers,
  Loader2,
  LogOut,
  Mail,
  Microscope,
  PawPrint,
  Pill,
  Plus,
  Radio,
  Search,
  Send,
  Shield,
  Stethoscope,
  Syringe,
  Table2,
  TrendingUp,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import type { Role } from "@/convex/schema";

// ─── Types ────────────────────────────────────────────────
type View =
  | "home"
  | "patients"
  | "add-patient"
  | "patient-detail"
  | "orders"
  | "new-order";

// ─── Role → Department mapping ────────────────────────────
const ROLE_DEPARTMENT: Record<string, string> = {
  doctor: "doctor",
  pharmacist: "pharmacy",
  lab_technician: "laboratory",
  nurse: "nursing",
  admin: "admin",
  receptionist: "card_office",
};

// ─── Quick-action routes for doctors ──────────────────────
const ROUTE_ACTIONS = [
  {
    id: "laboratory",
    label: "Laboratory",
    sublabel: "Blood work, cultures, panels",
    icon: FlaskConical,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    ring: "hover:ring-emerald-400/30",
    type: "lab_order" as const,
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    sublabel: "Medications, prescriptions",
    icon: Pill,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    ring: "hover:ring-violet-400/30",
    type: "pharmacy_order" as const,
  },
  {
    id: "radiology",
    label: "Radiology",
    sublabel: "X-ray, CT, MRI, Ultrasound",
    icon: Radio,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    ring: "hover:ring-amber-400/30",
    type: "radiology_order" as const,
  },
  {
    id: "nursing",
    label: "Nursing",
    sublabel: "Care plans, observations",
    icon: Syringe,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    ring: "hover:ring-rose-400/30",
    type: "nursing_order" as const,
  },
];

// ─── Role-specific sidebar nav ────────────────────────────
function getNavForRole(role: string | undefined) {
  const base = [
    { id: "home", icon: Home, label: "Overview" },
    { id: "patients", icon: Users, label: "Patients" },
    { id: "orders", icon: ClipboardList, label: "Orders" },
  ];

  if (role === "doctor") {
    return [
      ...base,
      { id: "vitals", icon: Heart, label: "Vitals" },
      { id: "calendar", icon: Calendar, label: "Schedule" },
    ];
  }
  if (role === "pharmacist") {
    return [
      ...base,
      { id: "inventory", icon: Pill, label: "Inventory" },
      { id: "dispensing", icon: Layers, label: "Dispensing" },
    ];
  }
  if (role === "lab_technician") {
    return [
      ...base,
      { id: "tests", icon: FlaskConical, label: "Test Queue" },
      { id: "results", icon: Table2, label: "Results" },
    ];
  }
  if (role === "nurse") {
    return [
      ...base,
      { id: "vitals", icon: Heart, label: "Vitals" },
      { id: "care", icon: BookOpen, label: "Care Plans" },
    ];
  }
  // admin / receptionist
  return [...base, { id: "staff", icon: Shield, label: "Staff" }];
}

// ─── Role greeting ────────────────────────────────────────
function getGreeting(role: string | undefined) {
  switch (role) {
    case "doctor":
      return "Your clinical workspace";
    case "pharmacist":
      return "Pharmacy operations at a glance";
    case "lab_technician":
      return "Lab queue and test management";
    case "nurse":
      return "Nursing station overview";
    case "receptionist":
      return "Patient registration and transfers";
    case "admin":
      return "System administration dashboard";
    default:
      return "Operations dashboard";
  }
}

// ═════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedPatientId, setSelectedPatientId] =
    useState<Id<"patients"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientForOrder, setSelectedPatientForOrder] =
    useState<Id<"patients"> | null>(null);

  const userRole = (user?.role as Role) || undefined;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = getNavForRole(userRole);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-mesh bg-dots">
      {/* ─── Sidebar ─────────────────────────────────── */}
      <aside className="glass-strong flex w-64 flex-col border-r border-white/5">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
            <Heart className="size-4.5 text-primary" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-foreground font-mono">
              rayan
            </span>
          </div>
        </div>

        {/* Role badge */}
        {userRole && (
          <div className="mx-4 mb-2">
            <div className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
              <Stethoscope className="size-3.5 text-primary" />
              <span className="font-medium text-primary capitalize">
                {userRole.replace("_", " ")}
              </span>
              <span className="ml-auto text-muted-foreground">
                {ROLE_DEPARTMENT[userRole] || "general"}
              </span>
            </div>
          </div>
        )}

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
                currentView === item.id ||
                (item.id === "patients" &&
                  (currentView === "patients" ||
                    currentView === "add-patient" ||
                    currentView === "patient-detail"))
                  ? "glass bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/40 hover:text-foreground"
              }`}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Quick route shortcuts (doctor only) */}
        {userRole === "doctor" && (
          <div className="px-3 pb-4">
            <p className="mb-2 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Quick Route
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROUTE_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    setSelectedPatientForOrder(null);
                    setCurrentView("orders");
                  }}
                  className={`glass glass-hover flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-all hover:ring-1 ${action.ring}`}
                >
                  <div
                    className={`flex size-8 items-center justify-center rounded-lg ${action.bg}`}
                  >
                    <action.icon className={`size-4 ${action.color}`} />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User / Sign Out */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate font-mono">
                {user?.email || "staff"}
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
          {currentView === "home" && (
            <HomeView
              key="home"
              role={userRole}
              userName={user?.name || "User"}
            />
          )}
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
              onNewOrder={(pid) => {
                setSelectedPatientForOrder(pid);
                setCurrentView("new-order");
              }}
            />
          )}
          {currentView === "orders" && !selectedPatientForOrder && (
            <OrdersList
              key="orders"
              onSelectPatient={(id) => {
                setSelectedPatientForOrder(id);
                setCurrentView("new-order");
              }}
            />
          )}
          {currentView === "new-order" && selectedPatientForOrder && (
            <NewOrder
              key="new-order"
              patientId={selectedPatientForOrder}
              onBack={() => {
                setSelectedPatientForOrder(null);
                setCurrentView("orders");
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// HOME VIEW — Role-based overview with quick actions
// ═════════════════════════════════════════════════════════
function HomeView({
  role,
  userName,
}: {
  role: string | undefined;
  userName: string;
}) {
  const stats = useQuery(api.patients.getStats);
  const orders = useQuery(api.orders.listByDepartment, {
    department: (ROLE_DEPARTMENT[role || ""] || "doctor") as "doctor" | "laboratory" | "pharmacy" | "nursing" | "card_office" | "admin",
    status: "pending",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-6xl px-6 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Good day, {userName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {getGreeting(role)}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total Patients",
            value: stats?.total ?? "—",
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
          },
          {
            label: "Active",
            value: stats?.active ?? "—",
            icon: Activity,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
          },
          {
            label: "Recent (30d)",
            value: stats?.recentPatients ?? "—",
            icon: TrendingUp,
            color: "text-violet-400",
            bg: "bg-violet-400/10",
          },
          {
            label: "Pending Orders",
            value: orders?.length ?? "—",
            icon: ClipboardList,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="glass glass-strong glass-hover rounded-xl p-5 transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <div
                className={`flex size-9 items-center justify-center rounded-xl ${c.bg}`}
              >
                <c.icon className={`size-4.5 ${c.color}`} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Route Actions (for doctors) */}
      {role === "doctor" && (
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Send to Department
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {ROUTE_ACTIONS.map((action) => (
              <button
                key={action.id}
                className={`glass glass-strong glass-hover group flex flex-col items-center gap-4 rounded-xl p-6 text-center transition-all hover:ring-1 ${action.ring}`}
              >
                <div
                  className={`flex size-14 items-center justify-center rounded-2xl ${action.bg} transition-transform group-hover:scale-110`}
                >
                  <action.icon className={`size-7 ${action.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {action.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {action.sublabel}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs text-primary font-medium">
                  Create order
                  <Send className="size-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pending orders for non-doctor roles */}
      {role !== "doctor" && orders && orders.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Incoming Orders
          </h2>
          <div className="glass glass-strong overflow-hidden rounded-xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-6 py-3 font-mono text-sm text-primary">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-3 text-sm capitalize text-muted-foreground">
                      {order.type.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.priority === "stat"
                            ? "bg-red-500/15 text-red-400"
                            : order.priority === "urgent"
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-blue-500/15 text-blue-400"
                        }`}
                      >
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state for pending orders */}
      {role !== "doctor" && orders && orders.length === 0 && (
        <div className="mt-8">
          <div className="glass rounded-xl p-8 text-center">
            <ClipboardList className="mx-auto size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              No pending orders. New orders will appear here.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// PATIENT LIST
// ═════════════════════════════════════════════════════════
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
          <h1 className="text-2xl font-bold text-foreground">
            Patient Records
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View, transfer, and manage patient profiles
          </p>
        </div>
        <button
          onClick={onAddPatient}
          className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:shadow-lg hover:shadow-primary/25"
        >
          <Plus className="size-4" />
          New Profile
        </button>
      </div>

      {/* Search */}
      <div className="glass mt-6 flex items-center gap-3 rounded-xl px-4 py-3">
        <Search className="size-4.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, medical ID, or phone…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass glass-strong mt-4 overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/30 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Card #</th>
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
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    Loading patients…
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    {searchQuery
                      ? "No patients match your search."
                      : "No patients registered yet."}
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
                          {patient.firstName[0]}
                          {patient.lastName[0]}
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
                      <span className="glass rounded-full px-2 py-0.5 text-xs font-mono text-muted-foreground">
                        {patient.cardNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="glass rounded-full px-2 py-0.5 text-xs font-mono text-primary">
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

// ═════════════════════════════════════════════════════════
// ADD PATIENT
// ═════════════════════════════════════════════════════════
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
        ? form.allergies
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
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
      toast.success("Patient profile created.");
      onBack();
    } catch {
      toast.error("Failed to create patient profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white/6";
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
          className="glass glass-hover rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            New Patient Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new patient record in the system
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass glass-strong mt-8 rounded-xl p-8">
        <SectionTitle icon={Users} label="Personal Information" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First Name" required>
            <input
              required
              className={inputCls}
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="John"
            />
          </Field>
          <Field label="Last Name" required>
            <input
              required
              className={inputCls}
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder="Doe"
            />
          </Field>
          <Field label="Date of Birth" required>
            <input
              required
              type="date"
              className={inputCls}
              value={form.dateOfBirth}
              onChange={(e) =>
                setForm({ ...form, dateOfBirth: e.target.value })
              }
            />
          </Field>
          <Field label="Gender" required>
            <select
              required
              className={inputCls}
              value={form.gender}
              onChange={(e) =>
                setForm({
                  ...form,
                  gender: e.target.value as "male" | "female" | "other",
                })
              }
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Blood Type" required>
            <select
              required
              className={inputCls}
              value={form.bloodType}
              onChange={(e) =>
                setForm({
                  ...form,
                  bloodType: e.target.value as
                    | "A+"
                    | "A-"
                    | "B+"
                    | "B-"
                    | "AB+"
                    | "AB-"
                    | "O+"
                    | "O-",
                })
              }
            >
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                (bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ),
              )}
            </select>
          </Field>
        </div>

        <SectionTitle icon={Mail} label="Contact Information" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" required>
            <input
              required
              className={inputCls}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputCls}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@example.com"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address">
              <input
                className={inputCls}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="123 Main St, City, State"
              />
            </Field>
          </div>
        </div>

        <SectionTitle icon={Shield} label="Emergency Contact" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact Name">
            <input
              className={inputCls}
              value={form.emergencyContactName}
              onChange={(e) =>
                setForm({ ...form, emergencyContactName: e.target.value })
              }
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Contact Phone">
            <input
              className={inputCls}
              value={form.emergencyContactPhone}
              onChange={(e) =>
                setForm({ ...form, emergencyContactPhone: e.target.value })
              }
              placeholder="+1 (555) 987-6543"
            />
          </Field>
        </div>

        <SectionTitle icon={Stethoscope} label="Medical Information" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Allergies (comma separated)">
              <input
                className={inputCls}
                value={form.allergies}
                onChange={(e) =>
                  setForm({ ...form, allergies: e.target.value })
                }
                placeholder="Penicillin, Peanuts, Latex"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Medical History">
              <textarea
                rows={3}
                className={`${inputCls} resize-none`}
                value={form.medicalHistory}
                onChange={(e) =>
                  setForm({ ...form, medicalHistory: e.target.value })
                }
                placeholder="Previous surgeries, chronic conditions, etc."
              />
            </Field>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            {isSubmitting ? "Creating…" : "Create Profile"}
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

// ═════════════════════════════════════════════════════════
// PATIENT DETAIL — with route-to-department quick actions
// ═════════════════════════════════════════════════════════
function PatientDetail({
  patientId,
  onBack,
  onNewOrder,
}: {
  patientId: Id<"patients">;
  onBack: () => void;
  onNewOrder: (patientId: Id<"patients">) => void;
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
    "w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white/6";
  const labelCls = "text-sm font-medium text-foreground";

  const handleAddVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addVitals({
        patientId,
        temperature: vitalsForm.temperature
          ? Number(vitalsForm.temperature)
          : undefined,
        heartRate: vitalsForm.heartRate
          ? Number(vitalsForm.heartRate)
          : undefined,
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
      toast.success("Vitals entry saved.");
      setShowVitalsForm(false);
      setVitalsForm({
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
    } catch {
      toast.error("Failed to save vitals.");
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivate({ patientId });
      toast.success("Patient profile deactivated.");
      onBack();
    } catch {
      toast.error("Failed to deactivate patient.");
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivate({ patientId });
      toast.success("Patient profile reactivated.");
    } catch {
      toast.error("Failed to reactivate patient.");
    }
  };

  if (!patient) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const age = patient.dateOfBirth
    ? Math.floor(
        (Date.now() - new Date(patient.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : null;

  const infoGrid = [
    { label: "Date of Birth", value: patient.dateOfBirth || "—" },
    { label: "Age", value: age !== null ? `${age} years` : "—" },
    { label: "Card #", value: patient.cardNumber, mono: true },
    { label: "Medical ID", value: patient.medicalId, mono: true },
    { label: "Blood Type", value: patient.bloodType },
    { label: "Phone", value: patient.phone },
    { label: "Email", value: patient.email || "—" },
    { label: "Address", value: patient.address || "—" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="mx-auto max-w-4xl px-6 py-8"
    >
      {/* Header with back + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="glass glass-hover rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
              {patient.firstName[0]}
              {patient.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                {patient.medicalId} · {patient.cardNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {patient.isActive ? (
            <button
              onClick={handleDeactivate}
              className="glass glass-hover rounded-lg px-4 py-2 text-xs font-medium text-destructive transition-all"
            >
              Deactivate
            </button>
          ) : (
            <button
              onClick={handleReactivate}
              className="glass glass-hover rounded-lg px-4 py-2 text-xs font-medium text-emerald-400 transition-all"
            >
              Reactivate
            </button>
          )}
        </div>
      </div>

      {/* Quick route actions — only visible to doctors */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Route to Department
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ROUTE_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => onNewOrder(patientId)}
              className={`glass glass-hover group flex items-center gap-3 rounded-xl p-4 transition-all hover:ring-1 ${action.ring}`}
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${action.bg} transition-transform group-hover:scale-110`}
              >
                <action.icon className={`size-5 ${action.color}`} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Create order <ArrowLeftRight className="size-3" />
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info grid */}
      <div className="glass glass-strong mt-6 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {infoGrid.map((item) => (
            <div key={item.label}>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p
                className={`mt-0.5 text-sm font-medium text-foreground ${item.mono ? "font-mono" : ""}`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Allergies */}
        {patient.allergies && patient.allergies.length > 0 && (
          <div className="mt-4 border-t border-white/5 pt-4">
            <p className="text-xs text-muted-foreground mb-2">Allergies</p>
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Medical history */}
        {patient.medicalHistory && (
          <div className="mt-4 border-t border-white/5 pt-4">
            <p className="text-xs text-muted-foreground mb-1">
              Medical History
            </p>
            <p className="text-sm text-foreground">{patient.medicalHistory}</p>
          </div>
        )}
      </div>

      {/* Vitals */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Vitals History
          </h2>
          <button
            onClick={() => setShowVitalsForm(!showVitalsForm)}
            className="glass glass-hover flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-all"
          >
            <Plus className="size-3.5" />
            Record Vitals
          </button>
        </div>

        {/* Vitals form */}
        <AnimatePresence>
          {showVitalsForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddVitals}
              className="glass glass-strong mt-3 overflow-hidden rounded-xl p-6"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Temperature (°F)">
                  <input
                    type="number"
                    step="0.1"
                    className={inputCls}
                    value={vitalsForm.temperature}
                    onChange={(e) =>
                      setVitalsForm({
                        ...vitalsForm,
                        temperature: e.target.value,
                      })
                    }
                    placeholder="98.6"
                  />
                </Field>
                <Field label="Heart Rate (bpm)">
                  <input
                    type="number"
                    className={inputCls}
                    value={vitalsForm.heartRate}
                    onChange={(e) =>
                      setVitalsForm({
                        ...vitalsForm,
                        heartRate: e.target.value,
                      })
                    }
                    placeholder="72"
                  />
                </Field>
                <Field label="Blood Pressure">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className={inputCls}
                      value={vitalsForm.bloodPressureSystolic}
                      onChange={(e) =>
                        setVitalsForm({
                          ...vitalsForm,
                          bloodPressureSystolic: e.target.value,
                        })
                      }
                      placeholder="120"
                    />
                    <span className="text-muted-foreground">/</span>
                    <input
                      type="number"
                      className={inputCls}
                      value={vitalsForm.bloodPressureDiastolic}
                      onChange={(e) =>
                        setVitalsForm({
                          ...vitalsForm,
                          bloodPressureDiastolic: e.target.value,
                        })
                      }
                      placeholder="80"
                    />
                  </div>
                </Field>
                <Field label="Resp. Rate">
                  <input
                    type="number"
                    className={inputCls}
                    value={vitalsForm.respiratoryRate}
                    onChange={(e) =>
                      setVitalsForm({
                        ...vitalsForm,
                        respiratoryRate: e.target.value,
                      })
                    }
                    placeholder="16"
                  />
                </Field>
                <Field label="O₂ Saturation (%)">
                  <input
                    type="number"
                    step="0.1"
                    className={inputCls}
                    value={vitalsForm.oxygenSaturation}
                    onChange={(e) =>
                      setVitalsForm({
                        ...vitalsForm,
                        oxygenSaturation: e.target.value,
                      })
                    }
                    placeholder="98"
                  />
                </Field>
                <Field label="Weight (kg)">
                  <input
                    type="number"
                    step="0.1"
                    className={inputCls}
                    value={vitalsForm.weight}
                    onChange={(e) =>
                      setVitalsForm({ ...vitalsForm, weight: e.target.value })
                    }
                    placeholder="70"
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Notes">
                  <textarea
                    rows={2}
                    className={`${inputCls} resize-none`}
                    value={vitalsForm.notes}
                    onChange={(e) =>
                      setVitalsForm({ ...vitalsForm, notes: e.target.value })
                    }
                    placeholder="Any clinical notes…"
                  />
                </Field>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
                >
                  <Heart className="size-4" />
                  Save Vitals
                </button>
                <button
                  type="button"
                  onClick={() => setShowVitalsForm(false)}
                  className="glass glass-hover rounded-xl px-5 py-2 text-sm font-medium text-muted-foreground transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Vitals table */}
        <div className="glass glass-strong mt-3 overflow-hidden rounded-xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-sm text-muted-foreground"
                  >
                    Loading vitals…
                  </td>
                </tr>
              ) : vitals.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-sm text-muted-foreground"
                  >
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

// ═════════════════════════════════════════════════════════
// ORDERS LIST
// ═════════════════════════════════════════════════════════
function OrdersList({
  onSelectPatient,
}: {
  onSelectPatient: (id: Id<"patients">) => void;
}) {
  const allOrders = useQuery(api.orders.listByDepartment, {
    department: "doctor",
  });

  const departments: Record<string, string> = {
    card_office: "Card Office",
    doctor: "Doctor",
    laboratory: "Laboratory",
    pharmacy: "Pharmacy",
    nursing: "Nursing",
    radiology: "Radiology",
    admin: "Admin",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-400",
    in_progress: "bg-blue-500/15 text-blue-400",
    completed: "bg-emerald-500/15 text-emerald-400",
    cancelled: "bg-red-500/15 text-red-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-6xl px-6 py-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inter-department order routing and tracking
          </p>
        </div>
      </div>

      <div className="glass glass-strong mt-6 overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">From</th>
                <th className="px-6 py-4">To</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {allOrders === undefined ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    Loading orders…
                  </td>
                </tr>
              ) : allOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    No orders yet. Create one from a patient profile.
                  </td>
                </tr>
              ) : (
                allOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-primary">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm capitalize text-muted-foreground">
                      {order.type.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {departments[order.fromDepartment] ||
                        order.fromDepartment}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {departments[order.toDepartment] || order.toDepartment}
                    </td>
                    <td className="px-6 py-4 text-sm capitalize text-muted-foreground">
                      {order.priority}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] || ""}`}
                      >
                        {order.status}
                      </span>
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

// ═════════════════════════════════════════════════════════
// NEW ORDER FORM
// ═════════════════════════════════════════════════════════
function NewOrder({
  patientId,
  onBack,
}: {
  patientId: Id<"patients">;
  onBack: () => void;
}) {
  const patient = useQuery(api.patients.getById, { patientId });
  const createOrder = useMutation(api.orders.create);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: "lab_order" as const,
    toDepartment: "laboratory" as const,
    priority: "normal" as const,
    itemDescription: "",
    itemQuantity: "",
    itemNotes: "",
    clinicalNotes: "",
  });

  const typeToDept: Record<string, string> = {
    lab_order: "laboratory",
    pharmacy_order: "pharmacy",
    nursing_order: "nursing",
    radiology_order: "radiology",
    general: "doctor",
  };

  const handleTypeChange = (type: string) => {
    setForm({
      ...form,
      type: type as typeof form.type,
      toDepartment: typeToDept[type] as typeof form.toDepartment,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createOrder({
        patientId,
        type: form.type,
        fromDepartment: "doctor",
        toDepartment: form.toDepartment,
        priority: form.priority,
        items: [
          {
            description: form.itemDescription,
            quantity: form.itemQuantity ? Number(form.itemQuantity) : undefined,
            notes: form.itemNotes || undefined,
          },
        ],
        clinicalNotes: form.clinicalNotes || undefined,
      });
      toast.success("Order created and routed.");
      onBack();
    } catch {
      toast.error("Failed to create order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white/6";
  const labelCls = "text-sm font-medium text-foreground";

  if (!patient) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

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
          className="glass glass-hover rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Order</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Route an order for {patient.firstName} {patient.lastName}
          </p>
        </div>
      </div>

      {/* Patient context card */}
      <div className="glass rounded-xl p-4 mt-6 flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
          {patient.firstName[0]}
          {patient.lastName[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {patient.firstName} {patient.lastName}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {patient.cardNumber} · {patient.medicalId}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass glass-strong mt-6 rounded-xl p-8"
      >
        <SectionTitle icon={Send} label="Order Details" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Order Type" required>
            <select
              required
              className={inputCls}
              value={form.type}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="lab_order">Laboratory</option>
              <option value="pharmacy_order">Pharmacy</option>
              <option value="nursing_order">Nursing</option>
              <option value="radiology_order">Radiology</option>
              <option value="general">General</option>
            </select>
          </Field>
          <Field label="Priority" required>
            <select
              required
              className={inputCls}
              value={form.priority}
              onChange={(e) =>
                setForm({
                  ...form,
                  priority: e.target.value as typeof form.priority,
                })
              }
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT</option>
            </select>
          </Field>
        </div>

        <SectionTitle icon={FileText} label="Items" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Field label="Description" required>
              <input
                required
                className={inputCls}
                value={form.itemDescription}
                onChange={(e) =>
                  setForm({ ...form, itemDescription: e.target.value })
                }
                placeholder="CBC, Metabolic Panel, Amoxicillin 500mg…"
              />
            </Field>
          </div>
          <Field label="Quantity">
            <input
              type="number"
              className={inputCls}
              value={form.itemQuantity}
              onChange={(e) =>
                setForm({ ...form, itemQuantity: e.target.value })
              }
              placeholder="1"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Item Notes">
            <input
              className={inputCls}
              value={form.itemNotes}
              onChange={(e) =>
                setForm({ ...form, itemNotes: e.target.value })
              }
              placeholder="Optional instructions for this item"
            />
          </Field>
        </div>

        <div className="mt-6">
          <Field label="Clinical Notes">
            <textarea
              rows={3}
              className={`${inputCls} resize-none`}
              value={form.clinicalNotes}
              onChange={(e) =>
                setForm({ ...form, clinicalNotes: e.target.value })
              }
              placeholder="Reason for order, relevant history, special instructions…"
            />
          </Field>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {isSubmitting ? "Creating…" : "Create & Route Order"}
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

// ═════════════════════════════════════════════════════════
// SHARED UI HELPERS
// ═════════════════════════════════════════════════════════
function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
      <Icon className="size-4" />
      {label}
    </h2>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
