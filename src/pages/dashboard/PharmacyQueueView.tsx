import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Pill, X } from "lucide-react";
import { StatusBadge, PageHeader, EmptyState, LoadingState } from "@/components/dashboard/Shared";

export default function PharmacyQueueView() {
  const queue = useQuery(api.prescriptions.getPharmacyQueue);
  const approve = useMutation(api.prescriptions.approve);
  const dispense = useMutation(api.prescriptions.dispense);
  const reject = useMutation(api.prescriptions.reject);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Prescription Queue"
        description="Review, approve, and dispense prescriptions"
      />

      <div className="glass-card mt-6 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rx #</th>
                <th>Medications</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!queue ? (
                <tr><td colSpan={4}><LoadingState /></td></tr>
              ) : queue.length === 0 ? (
                <tr><td colSpan={4}>
                  <EmptyState
                    icon={Pill}
                    title="No pending prescriptions"
                    description="Prescriptions from doctors will appear here."
                  />
                </td></tr>
              ) : queue.map((rx) => (
                <tr key={rx._id}>
                  <td className="font-mono text-sm font-medium text-primary">{rx.prescriptionNumber}</td>
                  <td className="text-sm text-muted-foreground max-w-xs truncate">
                    {rx.medications.map((m) => `${m.name} ${m.dosage}`).join(", ")}
                  </td>
                  <td><StatusBadge status={rx.status} /></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={async () => { await approve({ prescriptionId: rx._id }); toast.success("Prescription approved."); }}
                        className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20">
                        <CheckCircle2 className="size-3.5 mr-1 inline" /> Approve
                      </button>
                      <button onClick={async () => { await dispense({ prescriptionId: rx._id }); toast.success("Medications dispensed."); }}
                        className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
                        <Pill className="size-3.5 mr-1 inline" /> Dispense
                      </button>
                      <button onClick={async () => { await reject({ prescriptionId: rx._id, reason: "Rejected by pharmacist" }); toast.success("Prescription rejected."); }}
                        className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20">
                        <X className="size-3.5 mr-1 inline" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {!queue ? (
            <LoadingState />
          ) : queue.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="No pending prescriptions"
              description="Prescriptions from doctors will appear here."
            />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {queue.map((rx) => (
                <div key={rx._id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-medium text-primary">{rx.prescriptionNumber}</span>
                    <StatusBadge status={rx.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {rx.medications.map((m) => `${m.name} ${m.dosage}`).join(", ")}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={async () => { await approve({ prescriptionId: rx._id }); toast.success("Approved."); }}
                      className="flex-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 text-center">
                      Approve
                    </button>
                    <button onClick={async () => { await dispense({ prescriptionId: rx._id }); toast.success("Dispensed."); }}
                      className="flex-1 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary text-center">
                      Dispense
                    </button>
                    <button onClick={async () => { await reject({ prescriptionId: rx._id, reason: "Rejected" }); toast.success("Rejected."); }}
                      className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive text-center">
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
