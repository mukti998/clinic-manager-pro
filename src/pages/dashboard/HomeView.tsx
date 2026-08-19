import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  CreditCard,
  FlaskConical,
  Pill,
  Radio,
  Send,
  Syringe,
  Users,
} from "lucide-react";

const ROUTE_ACTIONS = [
  { id: "laboratory", label: "Laboratory", sub: "Blood work, cultures, panels", icon: FlaskConical, color: "text-emerald-400", bg: "bg-emerald-400/10", ring: "hover:ring-emerald-400/30", type: "lab_order" as const },
  { id: "pharmacy", label: "Pharmacy", sub: "Medications, prescriptions", icon: Pill, color: "text-violet-400", bg: "bg-violet-400/10", ring: "hover:ring-violet-400/30", type: "pharmacy_order" as const },
  { id: "radiology", label: "Radiology", sub: "X-ray, CT, MRI", icon: Radio, color: "text-amber-400", bg: "bg-amber-400/10", ring: "hover:ring-amber-400/30", type: "radiology_order" as const },
  { id: "nursing", label: "Nursing", sub: "Care plans, observations", icon: Syringe, color: "text-rose-400", bg: "bg-rose-400/10", ring: "hover:ring-rose-400/30", type: "nursing_order" as const },
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Good day, {userName.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{getGreeting(role)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Today's Visits", value: todayCount ?? "\u2014", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Revenue Today", value: todayRevenue !== undefined ? `$${todayRevenue.toLocaleString()}` : "\u2014", icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Waiting Queue", value: waitingQueue?.length ?? "\u2014", icon: Users, color: "text-amber-400", bg: "bg-amber-400/10" },
          { label: "Pending Labs", value: pendingLabs ?? "\u2014", icon: FlaskConical, color: "text-violet-400", bg: "bg-violet-400/10" },
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
