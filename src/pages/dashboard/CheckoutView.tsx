import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { CreditCard, CheckCircle2 } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { StatusBadge, PageHeader, EmptyState, LoadingState } from "@/components/dashboard/Shared";

export default function CheckoutView() {
  const activeVisits = useQuery(api.visits.getActiveVisits);
  const processPayment = useMutation(api.billing.processPayment);
  const updateStatus = useMutation(api.visits.updateStatus);

  const completedVisits = activeVisits?.filter((v) => v.status === "completed") || [];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Checkout"
        description="Process final payment and discharge patients"
      />

      <div className="glass-card mt-6 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Visit #</th>
                <th>Fee</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {completedVisits.length === 0 ? (
                <tr><td colSpan={5}>
                  <EmptyState
                    icon={CheckCircle2}
                    title="No patients ready for checkout"
                    description="Completed consultations will appear here for final payment."
                  />
                </td></tr>
              ) : completedVisits.map((v) => (
                <tr key={v._id}>
                  <td className="font-mono text-base font-bold text-primary">#{v.tokenNumber}</td>
                  <td className="font-mono text-sm text-muted-foreground">{v.visitNumber}</td>
                  <td className="font-medium text-foreground">${v.consultationFee}</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td className="text-right">
                    <button
                      onClick={async () => {
                        await processPayment({
                          patientId: v.patientId, visitId: v._id,
                          amount: v.consultationFee, method: "cash",
                          description: `Consultation fee — Token #${v.tokenNumber}`,
                        });
                        await updateStatus({ visitId: v._id, status: "discharged" });
                        toast.success(`Token #${v.tokenNumber} discharged. Payment processed.`);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                    >
                      <CreditCard className="size-3.5" /> Pay & Discharge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {completedVisits.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No patients ready for checkout"
              description="Completed consultations will appear here."
            />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {completedVisits.map((v) => (
                <div key={v._id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
                        #{v.tokenNumber}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{v.visitNumber}</p>
                        <p className="text-xs text-muted-foreground">${v.consultationFee}</p>
                      </div>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                  <button
                    onClick={async () => {
                      await processPayment({
                        patientId: v.patientId, visitId: v._id,
                        amount: v.consultationFee, method: "cash",
                        description: `Consultation fee — Token #${v.tokenNumber}`,
                      });
                      await updateStatus({ visitId: v._id, status: "discharged" });
                      toast.success(`Token #${v.tokenNumber} discharged.`);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20"
                  >
                    <CreditCard className="size-3.5" /> Pay & Discharge
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
