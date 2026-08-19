import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { StatusBadge, PageHeader } from "@/components/dashboard/Shared";

export default function VisitDetail() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const visitData = useQuery(api.visits.getVisit, { visitId: visitId as Id<"visits"> });
  const updateStatus = useMutation(api.visits.updateStatus);

  if (!visitData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl">
      <button
        onClick={() => navigate("/dashboard/queue")}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mb-4"
      >
        <ArrowLeft className="size-4" /> Back to Queue
      </button>

      <PageHeader
        title={`Token #${visitData.tokenNumber}`}
        description={visitData.visitNumber}
        action={<StatusBadge status={visitData.status} />}
      />

      <div className="glass-card mt-6 p-5 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="glass rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Patient</p>
            <p className="text-sm font-semibold text-foreground">
              {visitData.patient?.firstName} {visitData.patient?.lastName}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{visitData.patient?.medicalId}</p>
          </div>
          <div className="glass rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Doctor</p>
            <p className="text-sm font-semibold text-foreground">Dr. {visitData.doctor?.name || "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{visitData.doctor?.specialization || "General"}</p>
          </div>
          <div className="glass rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Consultation Fee</p>
            <p className="text-lg font-bold text-foreground">${visitData.consultationFee}</p>
          </div>
          <div className="glass rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Payment Status</p>
            <p className={`text-lg font-bold ${visitData.isPaid ? "text-emerald-400" : "text-amber-400"}`}>
              {visitData.isPaid ? "Paid" : "Pending"}
            </p>
          </div>
          {visitData.reason && (
            <div className="sm:col-span-2 glass rounded-lg p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Reason for Visit</p>
              <p className="text-sm text-foreground">{visitData.reason}</p>
            </div>
          )}
        </div>

        {visitData.isPaid && visitData.status === "waiting" && (
          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <button
              onClick={async () => {
                await updateStatus({ visitId: visitId as Id<"visits">, status: "with_doctor" });
                toast.success(`Token #${visitData.tokenNumber} sent to doctor`);
                navigate("/dashboard/queue");
              }}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              <Send className="size-4" /> Send to Doctor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
