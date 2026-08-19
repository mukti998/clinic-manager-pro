import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  Pill,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/dashboard/Shared";

export default function PharmacyQueueView() {
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
            {!queue ? <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin inline mr-2" />Loading...</td></tr>
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
                  <button onClick={async () => { await reject({ prescriptionId: rx._id, reason: "Rejected by pharmacist" }); toast.success("Prescription rejected."); }}
                    className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/25">
                    <X className="size-3.5 mr-1 inline" />Reject
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
