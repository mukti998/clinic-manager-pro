import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Activity,
  BarChart3,
  Beaker,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FlaskConical,
  Heart,
  Home,
  Layers,
  Loader2,
  LogOut,
  Pill,
  Plus,
  Radio,
  Search,
  Send,
  Shield,
  Stethoscope,
  Syringe,
  Table2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import type { Role } from "@/convex/schema";

// ─── Types ────────────────────────────────────────────────
type View = string;

// ─── Role config ──────────────────────────────────────────
const ROLE_DEPARTMENT: Record<string, string> = {
  doctor: "doctor",
  pharmacist: "pharmacy",
  lab_technician: "laboratory",
  nurse: "nursing",
  admin: "admin",
  receptionist: "card_office",
};

const ROUTE_ACTIONS = [
  { id: "laboratory", label: "Laboratory", sub: "Blood work, cultures, panels", icon: FlaskConical, color: "text-emerald-400", bg: "bg-emerald-400/10", ring: "hover:ring-emerald-400/30", type: "lab_order" as const },
  { id: "pharmacy", label: "Pharmacy", sub: "Medications, prescriptions", icon: Pill, color: "text-violet-400", bg: "bg-violet-400/10", ring: "hover:ring-violet-400/30", type: "pharmacy_order" as const },
  { id: "radiology", label: "Radiology", sub: "X-ray, CT, MRI", icon: Radio, color: "text-amber-400", bg: "bg-amber-400/10", ring: "hover:ring-amber-400/30", type: "radiology_order" as const },
  { id: "nursing", label: "Nursing", sub: "Care plans, observations", icon: Syringe, color: "text-rose-400", bg: "bg-rose-400/10", ring: "hover:ring-rose-400/30", type: "nursing_order" as const },
];

const DEPT_LABELS: Record<string, string> = { card_office: "Card Office", doctor: "Doctor", laboratory: "Laboratory", pharmacy: "Pharmacy", nursing: "Nursing", radiology: "Radiology", admin: "Admin" };

function getNavForRole(role: string | undefined) {
  const base = [{ id: "home", icon: Home, label: "Overview" }];
  switch (role) {
    case "receptionist":
      return [...base, { id: "register", icon: UserPlus, label: "Register" },        { id: "queue", icon: Users, label: "Queue" }, { id: "checkout", icon: CreditCard, label: "Checkout" }]; // eslint-disable-line react-hooks/pure
    case "doctor":
      return [...base, { id: "doctor-queue", icon: ClipboardList, label: "My Queue" }, { id: "patients", icon: Users, label: "Patients" }];
    case "pharmacist":
      return [...base, { id: "pharmacy-queue", icon: Pill, label: "Prescriptions" }];
    case "lab_technician":
      return [...base, { id: "lab-queue", icon: FlaskConical, label: "Lab Orders" }];
    case "nurse":
      return [...base, { id: "nurse-assignments", icon: Heart, label: "Assigned" }, { id: "vitals", icon: Activity, label: "Vitals" }];
    case "admin":
      return [...base, { id: "admin-reports", icon: BarChart3, label: "Financial" }, { id: "admin-staff", icon: Shield, label: "Staff" }, { id: "patients", icon: Users, label: "Patients" }];
    default:
      return [...base, { id: "patients", icon: Users, label: "Patients" }];
  }
}

function getGreeting(role: string | undefined) {
  switch (role) {
    case "receptionist": return "Patient registration, payments, and checkout";
    case "doctor": return "Your clinical workspace";
    case "pharmacist": return "Prescription queue and dispensing";
    case "lab_technician": return "Lab orders, samples, and results";
    case "nurse": return "Assigned patients and vitals tracking";
    case "admin": return "System administration dashboard";
    default: return "Operations dashboard";
  }
}

// ═════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("home");  const [selectedVisitId, setSelectedVisitId] = useState<Id<"visits"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const userRole = (user?.role as Role) || undefined;

  const handleSignOut = async () => { await signOut(); navigate("/"); };
  const navItems = getNavForRole(userRole);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-mesh bg-dots">
      {/* Sidebar */}
      <aside className="glass-strong flex w-64 flex-col border-r border-white/5">
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
            <Heart className="size-4.5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground font-mono">rayan</span>
        </div>
        {userRole && (
          <div className="mx-4 mb-2">
            <div className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
              <Stethoscope className="size-3.5 text-primary" />
              <span className="font-medium text-primary capitalize">{userRole.replace("_", " ")}</span>
              <span className="ml-auto text-muted-foreground">{DEPT_LABELS[ROLE_DEPARTMENT[userRole] || ""] || "general"}</span>
            </div>
          </div>
        )}
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setView(item.id); setSelectedVisitId(null); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${view === item.id ? "glass bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/40 hover:text-foreground"}`}>
              <item.icon className="size-4.5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{user?.name?.[0]?.toUpperCase() || "U"}</div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate font-mono">{user?.email || "staff"}</p>
            </div>
            <button onClick={handleSignOut} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/50 hover:text-foreground" title="Sign out">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {view === "home" && <HomeView key="home" role={userRole} userName={user?.name || "User"} />}
          {view === "register" && <RegisterPatient key="reg" onDone={() => setView("queue")} />}
          {view === "queue" && <ReceptionistQueue key="rq" onSelect={(vid) => { setSelectedVisitId(vid); setView("visit-detail"); }} />}
          {view === "visit-detail" && selectedVisitId && <VisitDetail key={`vd-${selectedVisitId}`} visitId={selectedVisitId} onBack={() => setView("queue")} />}
          {view === "checkout" && <CheckoutView key="co" />}
          {view === "doctor-queue" && <DoctorQueue key="dq" onSelect={(vid) => { setSelectedVisitId(vid); setView("consult"); }} />}
          {view === "consult" && selectedVisitId && <DoctorConsult key={`dc-${selectedVisitId}`} visitId={selectedVisitId} onBack={() => setView("doctor-queue")} />}
          {view === "lab-queue" && <LabQueueView key="lq" />}
          {view === "pharmacy-queue" && <PharmacyQueueView key="pq" />}
          {view === "nurse-assignments" && <NurseAssignments key="na" />}
          {view === "vitals" && <VitalsEntry key="ve" />}
          {view === "patients" && <PatientListView key="pl" searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
          {view === "admin-reports" && <AdminFinancial key="ar" />}
          {view === "admin-staff" && <AdminStaff key="as" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// HOME VIEW
// ═════════════════════════════════════════════════════════
function HomeView({ role, userName }: { role: string | undefined; userName: string }) {
  const todayCount = useQuery(api.visits.getTodayCount);
  const todayRevenue = useQuery(api.visits.getTodayRevenue);
  const pendingLabs = useQuery(api.lab.getPendingCount);
  const pharmacyQueue = useQuery(api.prescriptions.getPharmacyQueue);
  const waitingQueue = useQuery(api.visits.getWaitingQueue);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Good day, {userName.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{getGreeting(role)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Today's Visits", value: todayCount ?? "—", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Revenue Today", value: todayRevenue !== undefined ? `$${todayRevenue.toLocaleString()}` : "—", icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Waiting Queue", value: waitingQueue?.length ?? "—", icon: Users, color: "text-amber-400", bg: "bg-amber-400/10" },
          { label: "Pending Labs", value: pendingLabs ?? "—", icon: FlaskConical, color: "text-violet-400", bg: "bg-violet-400/10" },
        ].map((c) => (
          <div key={c.label} className="glass glass-strong glass-hover rounded-xl p-5 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <div className={`flex size-9 items-center justify-center rounded-xl ${c.bg}`}><c.icon className={`size-4.5 ${c.color}`} /></div>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Doctor quick routes */}
      {role === "doctor" && (
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Send to Department</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {ROUTE_ACTIONS.map((a) => (
              <button key={a.id} className={`glass glass-strong glass-hover group flex flex-col items-center gap-4 rounded-xl p-6 text-center transition-all hover:ring-1 ${a.ring}`}>
                <div className={`flex size-14 items-center justify-center rounded-2xl ${a.bg} transition-transform group-hover:scale-110`}><a.icon className={`size-7 ${a.color}`} /></div>
                <div><p className="text-sm font-semibold text-foreground">{a.label}</p><p className="mt-1 text-xs text-muted-foreground">{a.sub}</p></div>
                <span className="flex items-center gap-1 text-xs text-primary font-medium">Create order <Send className="size-3" /></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Waiting queue overview */}
      {waitingQueue && waitingQueue.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Waiting in Queue</h2>
          <div className="glass glass-strong overflow-hidden rounded-xl">
            <table className="w-full">
              <thead><tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Token</th><th className="px-6 py-4">Patient</th><th className="px-6 py-4">Fee</th><th className="px-6 py-4">Paid</th>
              </tr></thead>
              <tbody>{waitingQueue.slice(0, 5).map((v) => (
                <tr key={v._id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-3 font-mono text-sm text-primary">#{v.tokenNumber}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{v.visitNumber}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">${v.consultationFee}</td>
                  <td className="px-6 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${v.isPaid ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{v.isPaid ? "Paid" : "Pending"}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// RECEPTIONIST — Register Patient
// ═════════════════════════════════════════════════════════
function RegisterPatient({ onDone }: { onDone: () => void }) {
  const createPatient = useMutation(api.patients.create);
  const createVisit = useMutation(api.visits.create);
  const doctors = useQuery(api.staff.getByRole, { role: "doctor" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", dateOfBirth: "", gender: "male" as "male" | "female" | "other",
    bloodType: "O+" as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-",
    phone: "", email: "", address: "", emergencyContactName: "", emergencyContactPhone: "",
    allergies: "", medicalHistory: "", insuranceProvider: "", insurancePolicyNumber: "",
    doctorId: "", consultationFee: "50", reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.doctorId) { toast.error("Please select a doctor."); return; }
    setIsSubmitting(true);
    try {
      const allergies = form.allergies ? form.allergies.split(",").map((a) => a.trim()).filter(Boolean) : undefined;
      const patientId = await createPatient({
        firstName: form.firstName, lastName: form.lastName, dateOfBirth: form.dateOfBirth,
        gender: form.gender, bloodType: form.bloodType, phone: form.phone,
        email: form.email || undefined, address: form.address || undefined,
        emergencyContactName: form.emergencyContactName || undefined,
        emergencyContactPhone: form.emergencyContactPhone || undefined,
        allergies, medicalHistory: form.medicalHistory || undefined,
        insuranceProvider: form.insuranceProvider || undefined,
        insurancePolicyNumber: form.insurancePolicyNumber || undefined,
      });
      const { tokenNumber } = await createVisit({
        patientId, doctorId: form.doctorId as Id<"users">,
        consultationFee: Number(form.consultationFee) || 50,
        reason: form.reason || undefined,
      });
      toast.success(`Patient registered. Token #${tokenNumber} generated.`);
      onDone();
    } catch { toast.error("Failed to register patient."); }
    finally { setIsSubmitting(false); }
  };

  const cls = "w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white/6";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Register New Patient</h1>
      <p className="mt-1 text-sm text-muted-foreground">Register patient and assign to doctor — token generated after payment</p>

      <form onSubmit={handleSubmit} className="glass glass-strong mt-8 rounded-xl p-8">
        <SectionTitle icon={UserPlus} label="Patient Information" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First Name" required><input required className={cls} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" /></Field>
          <Field label="Last Name" required><input required className={cls} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" /></Field>
          <Field label="Date of Birth" required><input required type="date" className={cls} value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></Field>
          <Field label="Gender" required>
            <select required className={cls} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" | "other" })}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </Field>
          <Field label="Phone" required><input required className={cls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 123-4567" /></Field>
          <Field label="Email"><input type="email" className={cls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" /></Field>
        </div>

        <SectionTitle icon={Stethoscope} label="Assignment" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Assign Doctor" required>
            <select required className={cls} value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
              <option value="">Select doctor…</option>
              {doctors?.map((d) => <option key={d._id} value={d.userId || d._id}>Dr. {d.firstName} {d.lastName} ({d.specialization || d.department})</option>)}
            </select>
          </Field>
          <Field label="Consultation Fee ($)" required>
            <input required type="number" className={cls} value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} placeholder="50" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Reason for Visit">
              <textarea rows={2} className={`${cls} resize-none`} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Chief complaint…" />
            </Field>
          </div>
        </div>

        <SectionTitle icon={Shield} label="Emergency Contact" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact Name"><input className={cls} value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} placeholder="Jane Doe" /></Field>
          <Field label="Contact Phone"><input className={cls} value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} placeholder="+1 (555) 987-6543" /></Field>
        </div>

        <SectionTitle icon={Users} label="Medical" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Blood Type" required>
            <select required className={cls} value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value as typeof form.bloodType })}>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bt) => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </Field>
          <Field label="Allergies (comma separated)"><input className={cls} value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Penicillin, Peanuts" /></Field>
          <div className="sm:col-span-2">
            <Field label="Medical History">
              <textarea rows={2} className={`${cls} resize-none`} value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} placeholder="Previous surgeries, chronic conditions…" />
            </Field>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button type="submit" disabled={isSubmitting} className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            {isSubmitting ? "Registering…" : "Register & Generate Token"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// RECEPTIONIST — Queue View
// ═════════════════════════════════════════════════════════
function ReceptionistQueue({ onSelect }: { onSelect: (visitId: Id<"visits">) => void }) {
  const activeVisits = useQuery(api.visits.getActiveVisits);
  const markPaid = useMutation(api.visits.markPaid);
  const updateStatus = useMutation(api.visits.updateStatus);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground">Today's Queue</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage patient flow — mark paid, send to doctor, track status</p>

      <div className="glass glass-strong mt-6 overflow-hidden rounded-xl">
        <table className="w-full">
          <thead><tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-4">Token</th><th className="px-6 py-4">Visit #</th><th className="px-6 py-4">Fee</th><th className="px-6 py-4">Payment</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th>
          </tr></thead>
          <tbody>
            {activeVisits === undefined ? <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">Loading queue…</td></tr>
            : activeVisits.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">No visits today yet.</td></tr>
            : activeVisits.map((v) => (
              <tr key={v._id} className="border-b border-white/5 last:border-0 hover:bg-white/20">
                <td className="px-6 py-3 font-mono text-lg font-bold text-primary">#{v.tokenNumber}</td>
                <td className="px-6 py-3 text-sm text-muted-foreground font-mono">{v.visitNumber}</td>
                <td className="px-6 py-3 text-sm text-foreground">${v.consultationFee}</td>
                <td className="px-6 py-3">
                  {!v.isPaid ? (
                    <button onClick={async () => { await markPaid({ visitId: v._id }); toast.success(`Payment confirmed for token #${v.tokenNumber}`); }}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25">
                      <CreditCard className="size-3.5" /> Mark Paid
                    </button>
                  ) : <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400"><CheckCircle2 className="size-3" /> Paid</span>}
                </td>
                <td className="px-6 py-3">
                  <StatusBadge status={v.status} />
                </td>
                <td className="px-6 py-3">
                  <button onClick={() => onSelect(v._id)} className="text-xs text-primary hover:text-primary/80 font-medium">View →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// RECEPTIONIST — Visit Detail (for sending to doctor)
// ═════════════════════════════════════════════════════════
function VisitDetail({ visitId, onBack }: { visitId: Id<"visits">; onBack: () => void }) {
  const visitData = useQuery(api.visits.getVisit, { visitId });
  const updateStatus = useMutation(api.visits.updateStatus);

  if (!visitData) return <div className="flex h-full items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <button onClick={onBack} className="glass glass-hover rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground mb-6">← Back to Queue</button>
      <div className="glass glass-strong rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Token #{visitData.tokenNumber}</h1>
            <p className="mt-1 text-sm text-muted-foreground font-mono">{visitData.visitNumber}</p>
          </div>
          <StatusBadge status={visitData.status} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div><p className="text-xs text-muted-foreground">Patient</p><p className="text-sm font-medium text-foreground">{visitData.patient?.firstName} {visitData.patient?.lastName}</p></div>
          <div><p className="text-xs text-muted-foreground">Doctor</p><p className="text-sm font-medium text-foreground">Dr. {visitData.doctor?.name || "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Consultation Fee</p><p className="text-sm font-medium text-foreground">${visitData.consultationFee}</p></div>
          <div><p className="text-xs text-muted-foreground">Payment</p><p className={`text-sm font-medium ${visitData.isPaid ? "text-emerald-400" : "text-amber-400"}`}>{visitData.isPaid ? "Paid ✓" : "Pending"}</p></div>
          {visitData.reason && <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">Reason</p><p className="text-sm text-foreground">{visitData.reason}</p></div>}
        </div>
        {visitData.isPaid && visitData.status === "waiting" && (
          <div className="mt-6 border-t border-white/5 pt-6">
            <button onClick={async () => { await updateStatus({ visitId, status: "with_doctor" }); toast.success(`Token #${visitData.tokenNumber} sent to doctor`); onBack(); }}
              className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:shadow-lg hover:shadow-primary/25">
              <Send className="size-4" /> Send to Doctor
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// RECEPTIONIST — Checkout
// ═════════════════════════════════════════════════════════
function CheckoutView() {
  const activeVisits = useQuery(api.visits.getActiveVisits);
  const processPayment = useMutation(api.billing.processPayment);
  const updateStatus = useMutation(api.visits.updateStatus);
  const [selectedVisit, setSelectedVisit] = useState<Id<"visits"> | null>(null);

  const completedVisits = activeVisits?.filter((v) => v.status === "completed") || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">Process final payment and discharge patients</p>

      <div className="glass glass-strong mt-6 overflow-hidden rounded-xl">
        <table className="w-full">
          <thead><tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-4">Token</th><th className="px-6 py-4">Patient</th><th className="px-6 py-4">Fee</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Action</th>
          </tr></thead>
          <tbody>
            {completedVisits.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">No patients ready for checkout.</td></tr>
            : completedVisits.map((v) => (
              <tr key={v._id} className="border-b border-white/5 last:border-0 hover:bg-white/20">
                <td className="px-6 py-3 font-mono text-lg font-bold text-primary">#{v.tokenNumber}</td>
                <td className="px-6 py-3 text-sm text-foreground">{v.visitNumber}</td>
                <td className="px-6 py-3 text-sm text-foreground">${v.consultationFee}</td>
                <td className="px-6 py-3"><StatusBadge status={v.status} /></td>
                <td className="px-6 py-3">
                  <button onClick={async () => {
                    await processPayment({ patientId: v.patientId, visitId: v._id, amount: v.consultationFee, method: "cash", description: `Consultation fee — Token #${v.tokenNumber}` });
                    await updateStatus({ visitId: v._id, status: "discharged" });
                    toast.success(`Token #${v.tokenNumber} discharged. Payment processed.`);
                  }} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20">
                    <CreditCard className="size-3.5" /> Pay & Discharge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// DOCTOR — Queue
// ═════════════════════════════════════════════════════════
function DoctorQueue({ onSelect }: { onSelect: (visitId: Id<"visits">) => void }) {
  const { user } = useAuth();
  const queue = useQuery(api.visits.getDoctorQueue, { doctorId: user?._id as Id<"users"> || "" as Id<"users"> });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">My Queue</h1>
      <p className="mt-1 text-sm text-muted-foreground">Patients waiting for consultation</p>

      <div className="glass glass-strong mt-6 overflow-hidden rounded-xl">
        <table className="w-full">
          <thead><tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-4">#</th><th className="px-6 py-4">Token</th><th className="px-6 py-4">Fee</th><th className="px-6 py-4">Paid</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Action</th>
          </tr></thead>
          <tbody>
            {!queue ? <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">Loading…</td></tr>
            : queue.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">No patients in queue today.</td></tr>
            : queue.map((v, i) => (
              <tr key={v._id} className={`border-b border-white/5 last:border-0 ${v.status === "with_doctor" ? "bg-primary/5" : ""}`}>
                <td className="px-6 py-3 text-sm text-muted-foreground">{i + 1}</td>
                <td className="px-6 py-3 font-mono text-lg font-bold text-primary">#{v.tokenNumber}</td>
                <td className="px-6 py-3 text-sm text-foreground">${v.consultationFee}</td>
                <td className="px-6 py-3"><span className={`text-xs font-medium ${v.isPaid ? "text-emerald-400" : "text-amber-400"}`}>{v.isPaid ? "✓" : "—"}</span></td>
                <td className="px-6 py-3"><StatusBadge status={v.status} /></td>
                <td className="px-6 py-3">
                  {(v.status === "with_doctor" || v.status === "waiting") && (
                    <button onClick={() => onSelect(v._id)} className="glass glass-hover flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary transition-all">
                      <Stethoscope className="size-3.5" /> Consult
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// DOCTOR — Consultation
// ═════════════════════════════════════════════════════════
function DoctorConsult({ visitId, onBack }: { visitId: Id<"visits">; onBack: () => void }) {
  const visitData = useQuery(api.visits.getVisit, { visitId });
  const saveConsultation = useMutation(api.visits.saveConsultation);
  const updateStatus = useMutation(api.visits.updateStatus);
  const createLabOrder = useMutation(api.lab.create);
  const createPrescription = useMutation(api.prescriptions.create);

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");

  // Lab order form
  const [showLabForm, setShowLabForm] = useState(false);
  const [labTests, setLabTests] = useState("");
  const [labNotes, setLabNotes] = useState("");

  // Prescription form
  const [showRxForm, setShowRxForm] = useState(false);
  const [rxMeds, setRxMeds] = useState([{ name: "", dosage: "", frequency: "Once daily", duration: "" }]);

  const handleComplete = async () => {
    if (!diagnosis) { toast.error("Diagnosis is required."); return; }
    try {
      await saveConsultation({ visitId, diagnosis, clinicalNotes: notes, followUpDate: followUp || undefined });
      await updateStatus({ visitId, status: "completed" });
      toast.success("Consultation completed.");
      onBack();
    } catch { toast.error("Failed to complete consultation."); }
  };

  if (!visitData) return <div className="flex h-full items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  const cls = "w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white/6";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <button onClick={onBack} className="glass glass-hover rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground mb-6">← Back to Queue</button>

      {/* Patient info bar */}
      <div className="glass rounded-xl p-4 flex items-center gap-4 mb-6">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">{visitData.patient?.firstName?.[0]}{visitData.patient?.lastName?.[0]}</div>
        <div><p className="text-sm font-medium text-foreground">{visitData.patient?.firstName} {visitData.patient?.lastName}</p><p className="text-xs text-muted-foreground font-mono">Token #{visitData.tokenNumber} · {visitData.patient?.medicalId}</p></div>
        <div className="ml-auto"><StatusBadge status={visitData.status} /></div>
      </div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button onClick={() => setShowLabForm(!showLabForm)} className="glass glass-hover flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-emerald-400 transition-all hover:ring-1 hover:ring-emerald-400/30">
          <FlaskConical className="size-4" /> Order Lab
        </button>
        <button onClick={() => setShowRxForm(!showRxForm)} className="glass glass-hover flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-violet-400 transition-all hover:ring-1 hover:ring-violet-400/30">
          <Pill className="size-4" /> Prescribe
        </button>
        <button onClick={handleComplete} className="glass glass-strong flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold bg-primary text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20">
          <CheckCircle2 className="size-4" /> Complete Visit
        </button>
      </div>

      {/* Lab order form */}
      <AnimatePresence>
        {showLabForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass glass-strong rounded-xl p-6 mb-6 overflow-hidden">
            <h3 className="text-sm font-semibold text-foreground mb-3">Order Lab Tests</h3>
            <input className={`${cls} mb-3`} value={labTests} onChange={(e) => setLabTests(e.target.value)} placeholder="Tests: CBC, Metabolic Panel, Lipid Panel…" />
            <textarea rows={2} className={`${cls} resize-none mb-3`} value={labNotes} onChange={(e) => setLabNotes(e.target.value)} placeholder="Clinical notes for lab…" />
            <button onClick={async () => {
              const tests = labTests.split(",").map((t) => t.trim()).filter(Boolean).map((t) => ({ testName: t }));
              if (tests.length === 0) { toast.error("Enter at least one test."); return; }
              await createLabOrder({ patientId: visitData.patientId, visitId, tests, clinicalNotes: labNotes || undefined });
              toast.success(`Lab order sent (${tests.length} tests).`);
              setShowLabForm(false); setLabTests(""); setLabNotes("");
            }} className="rounded-xl bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25">
              <Send className="size-3.5 mr-1 inline" /> Send to Lab
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prescription form */}
      <AnimatePresence>
        {showRxForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass glass-strong rounded-xl p-6 mb-6 overflow-hidden">
            <h3 className="text-sm font-semibold text-foreground mb-3">Write Prescription</h3>
            {rxMeds.map((med, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <input className={cls} value={med.name} onChange={(e) => { const m = [...rxMeds]; m[i].name = e.target.value; setRxMeds(m); }} placeholder="Medication" />
                <input className={cls} value={med.dosage} onChange={(e) => { const m = [...rxMeds]; m[i].dosage = e.target.value; setRxMeds(m); }} placeholder="500mg" />
                <select className={cls} value={med.frequency} onChange={(e) => { const m = [...rxMeds]; m[i].frequency = e.target.value; setRxMeds(m); }}>
                  <option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>As needed</option><option>At bedtime</option>
                </select>
                <input className={cls} value={med.duration} onChange={(e) => { const m = [...rxMeds]; m[i].duration = e.target.value; setRxMeds(m); }} placeholder="7 days" />
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <button onClick={() => setRxMeds([...rxMeds, { name: "", dosage: "", frequency: "Once daily", duration: "" }])} className="glass text-xs px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground"><Plus className="size-3 inline mr-1" />Add</button>
            </div>
            <button onClick={async () => {
              const validMeds = rxMeds.filter((m) => m.name && m.dosage);
              if (validMeds.length === 0) { toast.error("Add at least one medication."); return; }
              await createPrescription({ patientId: visitData.patientId, visitId, medications: validMeds });
              toast.success(`Prescription sent to pharmacy (${validMeds.length} medications).`);
              setShowRxForm(false); setRxMeds([{ name: "", dosage: "", frequency: "Once daily", duration: "" }]);
            }} className="rounded-xl bg-violet-500/15 px-4 py-2 text-xs font-semibold text-violet-400 transition-all hover:bg-violet-500/25 mt-3">
              <Send className="size-3.5 mr-1 inline" /> Send to Pharmacy
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consultation notes */}
      <div className="glass glass-strong rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Consultation Notes</h3>
        <div className="space-y-4">
          <Field label="Diagnosis" required><textarea rows={2} className={`${cls} resize-none`} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Primary diagnosis…" /></Field>
          <Field label="Clinical Notes"><textarea rows={3} className={`${cls} resize-none`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Symptoms, examination findings…" /></Field>
          <Field label="Follow-up Date"><input type="date" className={cls} value={followUp} onChange={(e) => setFollowUp(e.target.value)} /></Field>
        </div>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// LAB — Queue View
// ═════════════════════════════════════════════════════════
function LabQueueView() {
  const queue = useQuery(api.lab.getLabQueue);
  const accept = useMutation(api.lab.accept);
  const collectSample = useMutation(api.lab.collectSample);
  const enterResults = useMutation(api.lab.enterResults);
  const [selectedLab, setSelectedLab] = useState<Id<"labResults"> | null>(null);
  const [resultForm, setResultForm] = useState<{ testName: string; result: string; unit: string }[]>([]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Lab Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage incoming test orders — accept, collect samples, enter results</p>

      <div className="glass glass-strong mt-6 overflow-hidden rounded-xl">
        <table className="w-full">
          <thead><tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-4">Order #</th><th className="px-6 py-4">Tests</th><th className="px-6 py-4">Priority</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th>
          </tr></thead>
          <tbody>
            {!queue ? <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">Loading…</td></tr>
            : queue.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">No pending lab orders.</td></tr>
            : queue.map((lab) => (
              <tr key={lab._id} className="border-b border-white/5 last:border-0 hover:bg-white/20">
                <td className="px-6 py-3 font-mono text-sm text-primary">{lab.labOrderNumber}</td>
                <td className="px-6 py-3 text-sm text-muted-foreground">{lab.tests.map((t) => t.testName).join(", ")}</td>
                <td className="px-6 py-3"><span className="text-xs text-muted-foreground capitalize">{lab.status.replace(/_/g, " ")}</span></td>
                <td className="px-6 py-3"><StatusBadge status={lab.status} /></td>
                <td className="px-6 py-3 flex gap-2">
                  {lab.status === "ordered" && (
                    <button onClick={async () => { await accept({ labId: lab._id }); toast.success("Order accepted."); }}
                      className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25">
                      <CheckCircle2 className="size-3.5 mr-1 inline" />Accept
                    </button>
                  )}
                  {lab.status === "sample_collected" && (
                    <button onClick={async () => { await collectSample({ labId: lab._id }); toast.success("Processing…"); }}
                      className="rounded-lg bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-400 transition-all hover:bg-blue-500/25">
                      <Beaker className="size-3.5 mr-1 inline" />Process
                    </button>
                  )}
                  {lab.status === "in_progress" && (
                    <button onClick={() => { setSelectedLab(lab._id); setResultForm(lab.tests.map((t) => ({ testName: t.testName, result: "", unit: "" }))); }}
                      className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/25">
                      <Table2 className="size-3.5 mr-1 inline" />Enter Results
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Result entry modal */}
      <AnimatePresence>
        {selectedLab && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong max-w-lg w-full rounded-xl p-6 mx-4">
              <h3 className="text-lg font-bold text-foreground mb-4">Enter Results</h3>
              {resultForm.map((r, i) => (
                <div key={i} className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">{r.testName}</p>
                  <div className="flex gap-2">
                    <input className="w-full rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-foreground outline-none" value={r.result} onChange={(e) => { const f = [...resultForm]; f[i].result = e.target.value; setResultForm(f); }} placeholder="Result" />
                    <input className="w-24 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-foreground outline-none" value={r.unit} onChange={(e) => { const f = [...resultForm]; f[i].unit = e.target.value; setResultForm(f); }} placeholder="Unit" />
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <button onClick={async () => { await enterResults({ labId: selectedLab, tests: resultForm.map((r) => ({ ...r, testName: r.testName })) }); toast.success("Results entered and released to doctor."); setSelectedLab(null); }}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20">Release Results</button>
                <button onClick={() => setSelectedLab(null)} className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// PHARMACY — Queue View
// ═════════════════════════════════════════════════════════
function PharmacyQueueView() {
  const queue = useQuery(api.prescriptions.getPharmacyQueue);
  const approve = useMutation(api.prescriptions.approve);
  const dispense = useMutation(api.prescriptions.dispense);
  const reject = useMutation(api.prescriptions.reject);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Prescription Queue</h1>
      <p className="mt-1 text-sm text-muted-foreground">Verify allergies, approve prescriptions, and dispense</p>

      <div className="glass glass-strong mt-6 overflow-hidden rounded-xl">
        <table className="w-full">
          <thead><tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-4">Rx #</th><th className="px-6 py-4">Medications</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th>
          </tr></thead>
          <tbody>
            {!queue ? <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">Loading…</td></tr>
            : queue.length === 0 ? <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">No pending prescriptions.</td></tr>
            : queue.map((rx) => (
              <tr key={rx._id} className="border-b border-white/5 last:border-0 hover:bg-white/20">
                <td className="px-6 py-3 font-mono text-sm text-primary">{rx.prescriptionNumber}</td>
                <td className="px-6 py-3 text-sm text-muted-foreground">{rx.medications.map((m) => `${m.name} ${m.dosage}`).join(", ")}</td>
                <td className="px-6 py-3"><StatusBadge status={rx.status} /></td>
                <td className="px-6 py-3 flex gap-2">
                  <button onClick={async () => { await approve({ prescriptionId: rx._id }); toast.success("Prescription approved."); }}
                    className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25">
                    <CheckCircle2 className="size-3.5 mr-1 inline" />Approve
                  </button>
                  <button onClick={async () => { await dispense({ prescriptionId: rx._id }); toast.success("Medications dispensed."); }}
                    className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/25">
                    <Pill className="size-3.5 mr-1 inline" />Dispense
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// NURSING — Assigned Patients
// ═════════════════════════════════════════════════════════
function NurseAssignments() {
  const activeVisits = useQuery(api.visits.getActiveVisits);
  const patients = activeVisits?.filter((v) => v.status === "with_doctor" || v.status === "lab_pending" || v.status === "pharmacy_pending") || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Assigned Patients</h1>
      <p className="mt-1 text-sm text-muted-foreground">Patients requiring nursing attention</p>

      <div className="glass glass-strong mt-6 overflow-hidden rounded-xl">
        <table className="w-full">
          <thead><tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-4">Token</th><th className="px-6 py-4">Patient</th><th className="px-6 py-4">Status</th>
          </tr></thead>
          <tbody>
            {patients.length === 0 ? <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-muted-foreground">No patients requiring nursing care.</td></tr>
            : patients.map((v) => (
              <tr key={v._id} className="border-b border-white/5 last:border-0 hover:bg-white/20">
                <td className="px-6 py-3 font-mono text-lg font-bold text-primary">#{v.tokenNumber}</td>
                <td className="px-6 py-3 text-sm text-foreground">{v.visitNumber}</td>
                <td className="px-6 py-3"><StatusBadge status={v.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// NURSING — Vitals Entry
// ═════════════════════════════════════════════════════════
function VitalsEntry() {
  const addVitals = useMutation(api.vitals.add);
  const patients = useQuery(api.patients.list, { activeOnly: true });
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ patientId: "", temperature: "", heartRate: "", bloodPressureSystolic: "", bloodPressureDiastolic: "", respiratoryRate: "", oxygenSaturation: "", weight: "", notes: "" });
  const cls = "w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white/6";

  const handleSave = async () => {
    if (!form.patientId) { toast.error("Please select a patient."); return; }
    setIsSaving(true);
    try {
      await addVitals({
        patientId: form.patientId as Id<"patients">,
        temperature: form.temperature ? Number(form.temperature) : undefined,
        heartRate: form.heartRate ? Number(form.heartRate) : undefined,
        bloodPressureSystolic: form.bloodPressureSystolic ? Number(form.bloodPressureSystolic) : undefined,
        bloodPressureDiastolic: form.bloodPressureDiastolic ? Number(form.bloodPressureDiastolic) : undefined,
        respiratoryRate: form.respiratoryRate ? Number(form.respiratoryRate) : undefined,
        oxygenSaturation: form.oxygenSaturation ? Number(form.oxygenSaturation) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        notes: form.notes || undefined,
      });
      toast.success("Vitals recorded successfully.");
      setForm({ patientId: "", temperature: "", heartRate: "", bloodPressureSystolic: "", bloodPressureDiastolic: "", respiratoryRate: "", oxygenSaturation: "", weight: "", notes: "" });
    } catch {
      toast.error("Failed to record vitals.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Record Vitals</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enter patient vital signs</p>
      <div className="glass glass-strong mt-6 rounded-xl p-6">
        <Field label="Patient" required>
          <select required className={cls} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
            <option value="">Select patient…</option>
            {patients?.map((p) => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.medicalId})</option>)}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-3 mt-4">
          <Field label="Temperature (°F)"><input type="number" step="0.1" className={cls} value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} placeholder="98.6" /></Field>
          <Field label="Heart Rate (bpm)"><input type="number" className={cls} value={form.heartRate} onChange={(e) => setForm({ ...form, heartRate: e.target.value })} placeholder="72" /></Field>
          <Field label="Blood Pressure"><div className="flex items-center gap-2"><input type="number" className={cls} value={form.bloodPressureSystolic} onChange={(e) => setForm({ ...form, bloodPressureSystolic: e.target.value })} placeholder="120" /><span className="text-muted-foreground">/</span><input type="number" className={cls} value={form.bloodPressureDiastolic} onChange={(e) => setForm({ ...form, bloodPressureDiastolic: e.target.value })} placeholder="80" /></div></Field>
          <Field label="Resp. Rate"><input type="number" className={cls} value={form.respiratoryRate} onChange={(e) => setForm({ ...form, respiratoryRate: e.target.value })} placeholder="16" /></Field>
          <Field label="SpO₂ (%)"><input type="number" step="0.1" className={cls} value={form.oxygenSaturation} onChange={(e) => setForm({ ...form, oxygenSaturation: e.target.value })} placeholder="98" /></Field>
          <Field label="Weight (kg)"><input type="number" step="0.1" className={cls} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="70" /></Field>
        </div>
        <Field label="Notes"><textarea rows={2} className={`${cls} resize-none mt-4`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Clinical notes…" /></Field>
        <button disabled={isSaving} className="mt-4 glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-60" onClick={handleSave}>
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4" />} {isSaving ? "Saving…" : "Save Vitals"}
        </button>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// PATIENT LIST (shared)
// ═════════════════════════════════════════════════════════
function PatientListView({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (s: string) => void }) {
  const patients = useQuery(api.patients.list, { search: searchQuery || undefined, activeOnly: true });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground">Patient Records</h1>
      <div className="glass mt-6 flex items-center gap-3 rounded-xl px-4 py-3">
        <Search className="size-4.5 text-muted-foreground" />
        <input type="text" placeholder="Search by name, medical ID, or phone…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
        {searchQuery && <button onClick={() => setSearchQuery("")}><X className="size-4 text-muted-foreground hover:text-foreground" /></button>}
      </div>
      <div className="glass glass-strong mt-4 overflow-hidden rounded-xl">
        <table className="w-full">
          <thead><tr className="border-b border-white/30 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-4">Patient</th><th className="px-6 py-4">Medical ID</th><th className="px-6 py-4">Blood</th><th className="px-6 py-4">Phone</th>
          </tr></thead>
          <tbody>
            {patients === undefined ? <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">Loading…</td></tr>
            : patients.length === 0 ? <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">No patients found.</td></tr>
            : patients.map((p) => (
              <tr key={p._id} className="border-b border-white/20 last:border-0 hover:bg-white/40">
                <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{p.firstName[0]}{p.lastName[0]}</div><div><p className="text-sm font-medium text-foreground">{p.firstName} {p.lastName}</p><p className="text-xs text-muted-foreground">{p.email || "—"}</p></div></div></td>
                <td className="px-6 py-4"><span className="glass rounded-full px-2 py-0.5 text-xs font-mono text-primary">{p.medicalId}</span></td>
                <td className="px-6 py-4"><span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">{p.bloodType}</span></td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{p.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// SHARED UI HELPERS
const inputCls = "w-full rounded-xl border border-white\/8 bg-white\/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary\/40 focus:ring-2 focus:ring-primary\/10 focus:bg-white\/6";

// ═════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════
// ADMIN — Financial Reports
// ═════════════════════════════════════════════════════════
function AdminFinancial() {
  const todayRevenue = useQuery(api.billing.getTodayRevenue);
  const totalRevenue = useQuery(api.billing.getTotalRevenue);
  const dailyChart = useQuery(api.billing.getDailyRevenueChart);
  const recentPayments = useQuery(api.billing.getRecentPayments, { limit: 20 });
  const [range, setRange] = useState<"today" | "week" | "month">("today");
  const now = Date.now();
  const rangeStart = range === "today" ? new Date().setHours(0, 0, 0, 0) : range === "week" ? now - 7 * 86400000 : now - 30 * 86400000;
  const rangeData = useQuery(api.billing.getRevenueByRange, { startDate: rangeStart, endDate: now });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Financial Reports</h1>
      <p className="mt-1 text-sm text-muted-foreground">Revenue, transactions, and department activity — admin only</p>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="glass glass-strong rounded-xl p-5"><p className="text-xs text-muted-foreground font-medium">Today{"'"}s Revenue</p><p className="mt-2 text-2xl font-bold text-foreground">${todayRevenue?.toLocaleString() || "0"}</p></div>
        <div className="glass glass-strong rounded-xl p-5"><p className="text-xs text-muted-foreground font-medium">Total Revenue</p><p className="mt-2 text-2xl font-bold text-foreground">${totalRevenue?.toLocaleString() || "0"}</p></div>
        <div className="glass glass-strong rounded-xl p-5"><p className="text-xs text-muted-foreground font-medium">Range Total</p><p className="mt-2 text-2xl font-bold text-foreground">${rangeData?.totalRevenue?.toLocaleString() || "0"}</p>
          <div className="mt-2 flex gap-1">
            {(["today", "week", "month"] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-all ${range === r ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>{r === "today" ? "Today" : r === "week" ? "7 Days" : "30 Days"}</button>
            ))}
          </div>
        </div>
      </div>
      {rangeData && Object.keys(rangeData.byMethod).length > 0 && (
        <div className="mt-6 glass glass-strong rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue by Payment Method</h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(rangeData.byMethod).map(([method, amount]) => (
              <div key={method} className="text-center"><p className="text-xs text-muted-foreground capitalize">{method}</p><p className="text-lg font-bold text-foreground mt-1">${(amount as number).toLocaleString()}</p></div>
            ))}
          </div>
        </div>
      )}
      {dailyChart && (
        <div className="mt-6 glass glass-strong rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Daily Revenue — Last 7 Days</h3>
          <div className="space-y-2">
            {dailyChart.map((day) => {
              const maxRev = Math.max(...dailyChart.map((d) => d.revenue), 1);
              const pct = (day.revenue / maxRev) * 100;
              return (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="w-24 text-[10px] text-muted-foreground">{day.date}</span>
                  <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden"><div className="h-full rounded-lg bg-primary/30 transition-all" style={{ width: `${Math.max(pct, 2)}%` }} /></div>
                  <span className="w-16 text-right text-xs font-medium text-foreground">${day.revenue.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {recentPayments && recentPayments.length > 0 && (
        <div className="mt-6 glass glass-strong rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5"><h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3></div>
          <table className="w-full">
            <thead><tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-3">Payment #</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Method</th><th className="px-6 py-3">Description</th><th className="px-6 py-3">Time</th>
            </tr></thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-6 py-3 font-mono text-xs text-primary">{p.paymentNumber}</td>
                  <td className="px-6 py-3 text-sm font-medium text-foreground">${p.amount.toLocaleString()}</td>
                  <td className="px-6 py-3"><span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-muted-foreground capitalize">{p.method}</span></td>
                  <td className="px-6 py-3 text-xs text-muted-foreground max-w-xs truncate">{p.description}</td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════
// ADMIN — Staff Management
// ═════════════════════════════════════════════════════════
function AdminStaff() {
  const allUsers = useQuery(api.users.listAll);
  const userStats = useQuery(api.users.getStats);
  const createUser = useMutation(api.users.createUser);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "doctor", department: "", specialization: "", phone: "" });
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createUser({ name: form.name, email: form.email, role: form.role as never, department: form.department || undefined, specialization: form.specialization || undefined, phone: form.phone || undefined });
      toast.success(`${form.name} added to staff.`);
      setForm({ name: "", email: "", role: "doctor", department: "", specialization: "", phone: "" });
      setShowForm(false);
    } catch { toast.error("Failed to create user."); }
    finally { setCreating(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Staff Management</h1><p className="mt-1 text-sm text-muted-foreground">Create accounts, assign roles, manage access</p></div>
        <button onClick={() => setShowForm(!showForm)} className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"><UserPlus className="size-4" /> Add Staff</button>
      </div>
      {userStats && (
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[{ label: "Doctors", value: userStats.doctors }, { label: "Pharmacists", value: userStats.pharmacists }, { label: "Lab Technicians", value: userStats.labTechs }].map((s) => (
            <div key={s.label} className="glass glass-strong rounded-xl p-4 flex items-center justify-between"><p className="text-xs text-muted-foreground font-medium">{s.label}</p><p className="text-xl font-bold text-foreground">{s.value}</p></div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={handleCreate} className="glass glass-strong mt-6 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">New Staff Member</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" required><input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" /></Field>
                <Field label="Email" required><input required type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@hospital.com" /></Field>
                <Field label="Role" required>
                  <select required className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="pharmacist">Pharmacist</option>
                    <option value="lab_technician">Lab Technician</option><option value="receptionist">Receptionist</option><option value="admin">Admin</option>
                  </select>
                </Field>
                <Field label="Department"><input className={inputCls} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Cardiology" /></Field>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" disabled={creating} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-60">{creating ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Create Account</button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="glass glass-strong mt-6 overflow-hidden rounded-xl">
        <table className="w-full">
          <thead><tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Department</th>
          </tr></thead>
          <tbody>
            {!allUsers ? <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">Loading…</td></tr>
            : allUsers.length === 0 ? <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">No staff found.</td></tr>
            : allUsers.map((u) => (
              <tr key={u._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                <td className="px-6 py-3 text-sm font-medium text-foreground">{u.name || "—"}</td>
                <td className="px-6 py-3 text-xs text-muted-foreground font-mono">{u.email || "—"}</td>
                <td className="px-6 py-3"><span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">{u.role?.replace("_", " ") || "—"}</span></td>
                <td className="px-6 py-3 text-xs text-muted-foreground">{u.department || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function SectionTitle({ icon: Icon, label }: { icon: React.FC<{ className?: string }>; label: string }) {
  return <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary"><Icon className="size-4" />{label}</h2>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="text-sm font-medium text-foreground">{label}{required && <span className="text-destructive ml-0.5">*</span>}</label><div className="mt-1.5">{children}</div></div>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    waiting: "bg-amber-500/15 text-amber-400",
    with_doctor: "bg-blue-500/15 text-blue-400",
    lab_pending: "bg-violet-500/15 text-violet-400",
    pharmacy_pending: "bg-violet-500/15 text-violet-400",
    completed: "bg-emerald-500/15 text-emerald-400",
    discharged: "bg-gray-500/15 text-gray-400",
    ordered: "bg-amber-500/15 text-amber-400",
    sample_collected: "bg-blue-500/15 text-blue-400",
    in_progress: "bg-blue-500/15 text-blue-400",
    approved: "bg-emerald-500/15 text-emerald-400",
    dispensed: "bg-emerald-500/15 text-emerald-400",
    rejected: "bg-red-500/15 text-red-400",
    pending: "bg-amber-500/15 text-amber-400",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-500/15 text-gray-400"}`}>{status.replace(/_/g, " ")}</span>;
}
