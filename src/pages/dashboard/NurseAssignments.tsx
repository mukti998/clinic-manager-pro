import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/Shared";

export default function NurseAssignments() {
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
            {!activeVisits ? <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin inline mr-2" />Loading...</td></tr>
            : patients.length === 0 ? <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-muted-foreground">No patients requiring nursing care.</td></tr>
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
