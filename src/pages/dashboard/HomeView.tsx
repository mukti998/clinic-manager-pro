import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import {
  Activity,
  CreditCard,
  FlaskConical,
  Heart,
  Pill,
  Radio,
  Send,
  Stethoscope,
  Syringe,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/Shared";

const ROUTE_ACTIONS = [
  { id: "laboratory", label: "Laboratory", sub: "Blood work, cultures, panels", icon: FlaskConical, color: "text-emerald-400", bg: "bg-emerald-400/10", type: "lab_order" as const },
  { id: "pharmacy", label: "Pharmacy", sub: "Medications, prescriptions", icon: Pill, color: "text-violet-400", bg: "bg-violet-400/10", type: "pharmacy_order" as const },
  { id: "radiology", label: "Radiology", sub: "X-ray, CT, MRI", icon: Radio, color: "text-amber-400", bg: "bg-amber-400/10", type: "radiology_order" as const },
  { id: "nursing", label: "Nursing", sub: "Care plans, observations", icon: Syringe, color: "text-rose-400", bg: "bg-rose-400/10", type: "nursing_order" as const },
];

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

export default function HomeView() {
  const { user } = useAuth();
  const role = (user?.role as string) || undefined;
  const userName = user?.name || "User";

  const todayCount = useQuery(api.visits.getTodayCount);
  const todayRevenue = useQuery(api.visits.getTodayRevenue);
  const pendingLabs = useQuery(api.lab.getPendingCount);
  const waitingQueue = useQuery(api.visits.getWaitingQueue);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* ─── Page Header ──────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Good day, {userName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{getGreeting(role)}</p>
      </div>

      {/* ─── Stats Grid ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard
          label="Today's Visits"
          value={todayCount}
          icon={Users}
          color="text-blue-400"
          bgColor="bg-blue-400/10"
        />
        <StatCard
          label="Revenue Today"
          value={todayRevenue !== undefined ? `$${todayRevenue.toLocaleString()}` : undefined}
          icon={CreditCard}
          color="text-emerald-400"
          bgColor="bg-emerald-400/10"
        />
        <StatCard
          label="Waiting Queue"
          value={waitingQueue?.length}
          icon={Activity}
          color="text-amber-400"
          bgColor="bg-amber-400/10"
        />
        <StatCard
          label="Pending Labs"
          value={pendingLabs}
          icon={FlaskConical}
          color="text-violet-400"
          bgColor="bg-violet-400/10"
        />
      </div>

      {/* ─── Quick Actions (Doctor only) ─────────────── */}
      {role === "doctor" && (
        <div className="mt-8">
          <h2 className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Send to Department
          </h2>
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {ROUTE_ACTIONS.map((a) => (
              <button
                key={a.id}
                className="glass-card stat-card group flex flex-col items-center gap-3 p-5 text-center transition-all hover:ring-1 hover:ring-primary/20"
              >
                <div className={`flex size-12 items-center justify-center rounded-xl ${a.bg} transition-transform group-hover:scale-105`}>
                  <a.icon className={`size-6 ${a.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{a.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.sub}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-primary font-medium">
                  Create order <Send className="size-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Waiting Queue Table ─────────────────────── */}
      {waitingQueue && waitingQueue.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Waiting in Queue
          </h2>
          <div className="glass-card overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Visit #</th>
                    <th>Fee</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {waitingQueue.slice(0, 8).map((v) => (
                    <tr key={v._id}>
                      <td className="font-mono text-base font-bold text-primary">#{v.tokenNumber}</td>
                      <td className="font-mono text-muted-foreground">{v.visitNumber}</td>
                      <td className="text-foreground">${v.consultationFee}</td>
                      <td>
                        <span className={`badge ${v.isPaid ? "badge-success" : "badge-warning"}`}>
                          {v.isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-white/[0.04]">
              {waitingQueue.slice(0, 5).map((v) => (
                <div key={v._id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
                      #{v.tokenNumber}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{v.visitNumber}</p>
                      <p className="text-xs text-muted-foreground">${v.consultationFee}</p>
                    </div>
                  </div>
                  <span className={`badge ${v.isPaid ? "badge-success" : "badge-warning"}`}>
                    {v.isPaid ? "Paid" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
