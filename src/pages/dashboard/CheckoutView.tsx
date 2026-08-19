import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { StatusBadge } from "@/components/dashboard/Shared";

export default function CheckoutView() {
  const activeVisits = useQuery(api.visits.getActiveVisits);
  const processPayment = useMutation(api.billing.processPayment);
  const updateStatus = useMutation(api.visits.updateStatus);

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
