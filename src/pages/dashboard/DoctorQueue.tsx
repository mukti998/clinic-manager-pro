import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Loader2, Stethoscope } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { StatusBadge } from "@/components/dashboard/Shared";
import { useNavigate } from "react-router";

export default function DoctorQueue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queue = useQuery(api.visits.getDoctorQueue, { doctorId: user?._id as Id<"users"> || ("" as Id<"users">) });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">My Queue</h1>
      <p className="mt-1 text-sm text-muted-foreground">Patients waiting for consultation</p>

      <div className="glass glass-strong mt-6 overflow-hidden rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Token</th>
              <th className="px-6 py-4">Fee</th>
              <th className="px-6 py-4">Paid</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {!queue ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin inline mr-2" />Loading...</td></tr>
            ) : queue.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">No patients in queue today.</td></tr>
            ) : (
              queue.map((v, i) => (
                <tr key={v._id} className={`border-b border-white/5 last:border-0 ${v.status === "with_doctor" ? "bg-primary/5" : ""}`}>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{i + 1}</td>
                  <td className="px-6 py-3 font-mono text-lg font-bold text-primary">#{v.tokenNumber}</td>
                  <td className="px-6 py-3 text-sm text-foreground">${v.consultationFee}</td>
                  <td className="px-6 py-3"><span className={`text-xs font-medium ${v.isPaid ? "text-emerald-400" : "text-amber-400"}`}>{v.isPaid ? "\u2713" : "\u2014"}</span></td>
                  <td className="px-6 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-6 py-3">
                    {(v.status === "with_doctor" || v.status === "waiting") && (
                      <button onClick={() => navigate(`/dashboard/doctor-queue/${v._id}`)} className="glass glass-hover flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary transition-all">
                        <Stethoscope className="size-3.5" /> Consult
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
