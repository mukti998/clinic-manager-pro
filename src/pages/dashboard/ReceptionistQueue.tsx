import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, Eye, Users } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { StatusBadge, PageHeader, EmptyState, LoadingState } from "@/components/dashboard/Shared";
import { useNavigate } from "react-router";

export default function ReceptionistQueue() {
  const activeVisits = useQuery(api.visits.getActiveVisits);
  const markPaid = useMutation(api.visits.markPaid);
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Today's Queue"
        description="Manage patient flow — confirm payment and send to doctor"
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
                <th>Payment</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeVisits === undefined ? (
                <tr><td colSpan={6}><LoadingState /></td></tr>
              ) : activeVisits.length === 0 ? (
                <tr><td colSpan={6}>
                  <EmptyState
                    icon={Users}
                    title="No visits today"
                    description="Patients will appear here once registered."
                  />
                </td></tr>
              ) : activeVisits.map((v) => (
                <tr key={v._id}>
                  <td className="font-mono text-base font-bold text-primary">#{v.tokenNumber}</td>
                  <td className="font-mono text-muted-foreground">{v.visitNumber}</td>
                  <td className="font-medium text-foreground">${v.consultationFee}</td>
                  <td>
                    {!v.isPaid ? (
                      <button
                        onClick={async () => {
                          await markPaid({ visitId: v._id });
                          toast.success(`Payment confirmed for token #${v.tokenNumber}`);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20"
                      >
                        <CreditCard className="size-3.5" /> Mark Paid
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 badge badge-success">
                        <CheckCircle2 className="size-3" /> Paid
                      </span>
                    )}
                  </td>
                  <td><StatusBadge status={v.status} /></td>
                  <td className="text-right">
                    <button
                      onClick={() => navigate(`/dashboard/queue/${v._id}`)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      <Eye className="size-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {activeVisits === undefined ? (
            <LoadingState />
          ) : activeVisits.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No visits today"
              description="Patients will appear here once registered."
            />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {activeVisits.map((v) => (
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
                  <div className="flex items-center gap-2">
                    {!v.isPaid ? (
                      <button
                        onClick={async () => {
                          await markPaid({ visitId: v._id });
                          toast.success(`Payment confirmed for token #${v.tokenNumber}`);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400"
                      >
                        <CreditCard className="size-3.5" /> Mark Paid
                      </button>
                    ) : (
                      <span className="flex-1 flex items-center justify-center gap-1 badge badge-success py-2">
                        <CheckCircle2 className="size-3" /> Paid
                      </span>
                    )}
                    <button
                      onClick={() => navigate(`/dashboard/queue/${v._id}`)}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-primary"
                    >
                      <Eye className="size-3.5" /> View
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


