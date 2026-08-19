import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import {
  Activity, ArrowRight, BarChart3, CreditCard, Edit3, Eye, FlaskConical,
  Heart, HeartPulse, Pill, Plus, Radio, Send, Settings, Shield, Stethoscope,
  Syringe, TestTube, UserPlus, Users, ClipboardList,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/Shared";

// ─── Role-specific quick actions ───────────────────────────
interface QuickAction {
  label: string; desc: string; icon: React.FC<{ className?: string }>;
  color: string; bg: string; to: string;
}

const ROLE_ACTIONS: Record<string, QuickAction[]> = {
  doctor: [
    { label: "My Queue", desc: "Patients waiting for consultation", icon: ClipboardList, color: "text-blue-400", bg: "bg-blue-400/10", to: "/dashboard/doctor-queue" },
    { label: "Patient Records", desc: "Search and view patients", icon: Users, color: "text-cyan-400", bg: "bg-cyan-400/10", to: "/dashboard/patients" },
    { label: "Order Lab Test", desc: "Blood work, cultures, panels", icon: FlaskConical, color: "text-emerald-400", bg: "bg-emerald-400/10", to: "/dashboard/doctor-queue" },
    { label: "Prescribe", desc: "Medications and dosages", icon: Pill, color: "text-violet-400", bg: "bg-violet-400/10", to: "/dashboard/doctor-queue" },
  ],
  nurse: [
    { label: "My Patients", desc: "Assigned patient list", icon: Heart, color: "text-emerald-400", bg: "bg-emerald-400/10", to: "/dashboard/nurse-assignments" },
    { label: "Record Vitals", desc: "Temperature, BP, heart rate", icon: HeartPulse, color: "text-teal-400", bg: "bg-teal-400/10", to: "/dashboard/vitals" },
    { label: "Patient Records", desc: "View patient details", icon: Users, color: "text-green-400", bg: "bg-green-400/10", to: "/dashboard/patients" },
    { label: "Care Notes", desc: "Observations and updates", icon: Edit3, color: "text-cyan-400", bg: "bg-cyan-400/10", to: "/dashboard/nurse-assignments" },
  ],
  pharmacist: [
    { label: "Prescription Queue", desc: "Pending prescriptions to review", icon: Pill, color: "text-violet-400", bg: "bg-violet-400/10", to: "/dashboard/pharmacy-queue" },
    { label: "Dispense", desc: "Mark medications as dispensed", icon: Send, color: "text-purple-400", bg: "bg-purple-400/10", to: "/dashboard/pharmacy-queue" },
    { label: "Patient Records", desc: "View prescription history", icon: Users, color: "text-fuchsia-400", bg: "bg-fuchsia-400/10", to: "/dashboard/patients" },
    { label: "Inventory", desc: "Stock levels and alerts", icon: Eye, color: "text-indigo-400", bg: "bg-indigo-400/10", to: "/dashboard/pharmacy-queue" },
  ],
  lab_technician: [
    { label: "Lab Orders", desc: "Pending test requests", icon: FlaskConical, color: "text-amber-400", bg: "bg-amber-400/10", to: "/dashboard/lab-queue" },
    { label: "Enter Results", desc: "Record test outcomes", icon: TestTube, color: "text-orange-400", bg: "bg-orange-400/10", to: "/dashboard/lab-queue" },
    { label: "Verify", desc: "Review and approve results", icon: Shield, color: "text-yellow-400", bg: "bg-yellow-400/10", to: "/dashboard/lab-queue" },
    { label: "Patient Records", desc: "View patient lab history", icon: Users, color: "text-red-400", bg: "bg-red-400/10", to: "/dashboard/patients" },
  ],
  receptionist: [
    { label: "Register Patient", desc: "New patient registration", icon: UserPlus, color: "text-rose-400", bg: "bg-rose-400/10", to: "/dashboard/register" },
    { label: "Queue", desc: "Manage today's patient flow", icon: Users, color: "text-pink-400", bg: "bg-pink-400/10", to: "/dashboard/queue" },
    { label: "Checkout", desc: "Process payment & discharge", icon: CreditCard, color: "text-red-400", bg: "bg-red-400/10", to: "/dashboard/checkout" },
    { label: "Patient Records", desc: "Search registered patients", icon: Eye, color: "text-amber-400", bg: "bg-amber-400/10", to: "/dashboard/patients" },
  ],
  admin: [
    { label: "Staff Management", desc: "Add and manage staff accounts", icon: Shield, color: "text-red-400", bg: "bg-red-400/10", to: "/dashboard/admin-staff" },
    { label: "Financial Reports", desc: "Revenue and transaction data", icon: BarChart3, color: "text-orange-400", bg: "bg-orange-400/10", to: "/dashboard/admin-reports" },
    { label: "Patient Records", desc: "All registered patients", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", to: "/dashboard/patients" },
    { label: "Settings", desc: "System configuration", icon: Settings, color: "text-gray-400", bg: "bg-gray-400/10", to: "/dashboard/settings" },
  ],
};

// ─── Role-specific stats ─────────────────────────────────
function RoleStats({ role }: { role: string }) {
  const todayCount = useQuery(api.visits.getTodayCount);
  const todayRevenue = useQuery(api.visits.getTodayRevenue);
  const pendingLabs = useQuery(api.lab.getPendingCount);
  const waitingQueue = useQuery(api.visits.getWaitingQueue);

  switch (role) {
    case "doctor":
      return (
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard label="My Queue" value={waitingQueue?.length} icon={ClipboardList} color="text-blue-400" bgColor="bg-blue-400/10" />
          <StatCard label="Today's Visits" value={todayCount} icon={Users} color="text-cyan-400" bgColor="bg-cyan-400/10" />
          <StatCard label="Pending Labs" value={pendingLabs} icon={FlaskConical} color="text-emerald-400" bgColor="bg-emerald-400/10" />
          <StatCard label="Revenue Today" value={todayRevenue !== undefined ? `$${todayRevenue.toLocaleString()}` : undefined} icon={CreditCard} color="text-violet-400" bgColor="bg-violet-400/10" />
        </div>
      );
    case "nurse":
      return (
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
          <StatCard label="Waiting Queue" value={waitingQueue?.length} icon={Heart} color="text-emerald-400" bgColor="bg-emerald-400/10" />
          <StatCard label="Today's Visits" value={todayCount} icon={Users} color="text-teal-400" bgColor="bg-teal-400/10" />
          <StatCard label="Vitals Pending" value={waitingQueue?.length} icon={HeartPulse} color="text-green-400" bgColor="bg-green-400/10" />
        </div>
      );
    case "pharmacist":
      return (
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
          <StatCard label="Pending Prescriptions" value={3} icon={Pill} color="text-violet-400" bgColor="bg-violet-400/10" />
          <StatCard label="Dispensed Today" value={5} icon={Send} color="text-purple-400" bgColor="bg-purple-400/10" />
          <StatCard label="Rejected" value={0} icon={Eye} color="text-fuchsia-400" bgColor="bg-fuchsia-400/10" />
        </div>
      );
    case "lab_technician":
      return (
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
          <StatCard label="Pending Orders" value={pendingLabs} icon={FlaskConical} color="text-amber-400" bgColor="bg-amber-400/10" />
          <StatCard label="In Progress" value={2} icon={TestTube} color="text-orange-400" bgColor="bg-orange-400/10" />
          <StatCard label="Completed Today" value={4} icon={Shield} color="text-yellow-400" bgColor="bg-yellow-400/10" />
        </div>
      );
    case "receptionist":
      return (
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard label="Waiting" value={waitingQueue?.length} icon={Users} color="text-rose-400" bgColor="bg-rose-400/10" />
          <StatCard label="Today's Visits" value={todayCount} icon={UserPlus} color="text-pink-400" bgColor="bg-pink-400/10" />
          <StatCard label="Revenue" value={todayRevenue !== undefined ? `$${todayRevenue.toLocaleString()}` : undefined} icon={CreditCard} color="text-red-400" bgColor="bg-red-400/10" />
          <StatCard label="Checkout Ready" value={1} icon={CreditCard} color="text-amber-400" bgColor="bg-amber-400/10" />
        </div>
      );
    case "admin":
      return (
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard label="Today's Visits" value={todayCount} icon={Users} color="text-blue-400" bgColor="bg-blue-400/10" />
          <StatCard label="Revenue Today" value={todayRevenue !== undefined ? `$${todayRevenue.toLocaleString()}` : undefined} icon={CreditCard} color="text-emerald-400" bgColor="bg-emerald-400/10" />
          <StatCard label="Waiting Queue" value={waitingQueue?.length} icon={Activity} color="text-amber-400" bgColor="bg-amber-400/10" />
          <StatCard label="Pending Labs" value={pendingLabs} icon={FlaskConical} color="text-violet-400" bgColor="bg-violet-400/10" />
        </div>
      );
    default:
      return (
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard label="Today's Visits" value={todayCount} icon={Users} color="text-blue-400" bgColor="bg-blue-400/10" />
          <StatCard label="Revenue Today" value={todayRevenue !== undefined ? `$${todayRevenue.toLocaleString()}` : undefined} icon={CreditCard} color="text-emerald-400" bgColor="bg-emerald-400/10" />
          <StatCard label="Waiting Queue" value={waitingQueue?.length} icon={Activity} color="text-amber-400" bgColor="bg-amber-400/10" />
          <StatCard label="Pending Labs" value={pendingLabs} icon={FlaskConical} color="text-violet-400" bgColor="bg-violet-400/10" />
        </div>
      );
  }
}

// ─── Waiting queue ─────────────────────────────────────
function WaitingQueue() {
  const waitingQueue = useQuery(api.visits.getWaitingQueue);
  if (!waitingQueue || waitingQueue.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Waiting in Queue</h2>
      <div className="glass-card overflow-hidden">
        <div className="hidden md:block">
          <table className="data-table">
            <thead><tr><th>Token</th><th>Visit #</th><th>Fee</th><th>Payment</th></tr></thead>
            <tbody>
              {waitingQueue.slice(0, 8).map((v) => (
                <tr key={v._id}>
                  <td className="font-mono text-base font-bold text-primary">#{v.tokenNumber}</td>
                  <td className="font-mono text-muted-foreground">{v.visitNumber}</td>
                  <td className="text-foreground">${v.consultationFee}</td>
                  <td><span className={`badge ${v.isPaid ? "badge-success" : "badge-warning"}`}>{v.isPaid ? "Paid" : "Pending"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-white/[0.04]">
          {waitingQueue.slice(0, 5).map((v) => (
            <div key={v._id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">#{v.tokenNumber}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{v.visitNumber}</p>
                  <p className="text-xs text-muted-foreground">${v.consultationFee}</p>
                </div>
              </div>
              <span className={`badge ${v.isPaid ? "badge-success" : "badge-warning"}`}>{v.isPaid ? "Paid" : "Pending"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main HomeView ──────────────────────────────────────
export default function HomeView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = (user?.role as string) || undefined;
  const userName = user?.name || "User";
  const firstName = userName.split(" ")[0];
  const actions = ROLE_ACTIONS[role || ""] || ROLE_ACTIONS.admin;

  const greetings: Record<string, string> = {
    doctor: "Your clinical workspace",
    nurse: "Patient care and vitals tracking",
    pharmacist: "Prescription queue and dispensing",
    lab_technician: "Lab orders and diagnostic results",
    receptionist: "Registration, payments, and queue management",
    admin: "System administration and oversight",
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* ─── Greeting ───────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Good day, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{greetings[role || ""] || "Operations dashboard"}</p>
      </div>

      {/* ─── Role Stats ─────────────────────────────── */}
      <RoleStats role={role || "admin"} />

      {/* ─── Quick Actions ──────────────────────────── */}
      <div className="mt-8">
        <h2 className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {actions.map((a) => (
            <button key={a.label} onClick={() => navigate(a.to)}
              className="glass-card stat-card group flex flex-col items-center gap-3 p-5 text-center transition-all hover:ring-1 hover:ring-primary/20">
              <div className={`flex size-12 items-center justify-center rounded-xl ${a.bg} transition-transform group-hover:scale-105`}>
                <a.icon className={`size-6 ${a.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{a.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.desc}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-primary font-medium">
                Open <ArrowRight className="size-3" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Waiting Queue ──────────────────────────── */}
      <WaitingQueue />
    </div>
  );
}
