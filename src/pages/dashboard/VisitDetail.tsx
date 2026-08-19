import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate, useParams } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { StatusBadge } from "@/components/dashboard/Shared";

export default function VisitDetail() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const visitData = useQuery(api.visits.getVisit, { visitId: visitId as Id<"visits"> });
  const updateStatus = useMutation(api.visits.updateStatus);

  if (!visitData) return <div className="flex h-full items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <button onClick={() => navigate("/dashboard/queue")} className="glass glass-hover rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground mb-6">&larr; Back to Queue</button>
      <div className="glass glass-strong rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Token #{visitData.tokenNumber}</h1>
            <p className="mt-1 text-sm text-muted-foreground font-mono">{visitData.visitNumber}</p>
          </div>
          <StatusBadge status={visitData.status} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div><p className="text-xs text-muted-foreground">Patient</p><p className="text-sm font-medium text-foreground">{visitData.patient?.firstName} {visitData.patient?.lastName}</p></div>
          <div><p className="text-xs text-muted-foreground">Doctor</p><p className="text-sm font-medium text-foreground">Dr. {visitData.doctor?.name || "\u2014"}</p></div>
          <div><p className="text-xs text-muted-foreground">Consultation Fee</p><p className="text-sm font-medium text-foreground">${visitData.consultationFee}</p></div>
          <div><p className="text-xs text-muted-foreground">Payment</p><p className={`text-sm font-medium ${visitData.isPaid ? "text-emerald-400" : "text-amber-400"}`}>{visitData.isPaid ? "Paid" : "Pending"}</p></div>
          {visitData.reason && <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">Reason</p><p className="text-sm text-foreground">{visitData.reason}</p></div>}
        </div>
        {visitData.isPaid && visitData.status === "waiting" && (
          <div className="mt-6 border-t border-white/5 pt-6">
            <button onClick={async () => { await updateStatus({ visitId: visitId as Id<"visits">, status: "with_doctor" }); toast.success(`Token #${visitData.tokenNumber} sent to doctor`); navigate("/dashboard/queue"); }}
              className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:shadow-lg hover:shadow-primary/25">
              <Send className="size-4" /> Send to Doctor
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
