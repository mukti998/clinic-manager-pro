import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2,
  CreditCard,
  Send,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { StatusBadge } from "@/components/dashboard/Shared";
import { useNavigate } from "react-router";

export default function ReceptionistQueue() {
  const activeVisits = useQuery(api.visits.getActiveVisits);
  const markPaid = useMutation(api.visits.markPaid);
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground">Today's Queue</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage patient flow — mark paid, send to doctor, track status</p>

      <div className="glass glass-strong mt-6 overflow-hidden rounded-xl">
        <table className="w-full">
          <thead><tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-4">Token</th><th className="px-6 py-4">Visit #</th><th className="px-6 py-4">Fee</th><th className="px-6 py-4">Payment</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th>
          </tr></thead>
          <tbody>
            {activeVisits === undefined ? <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">Loading queue...</td></tr>
            : activeVisits.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">No visits today yet.</td></tr>
            : activeVisits.map((v) => (
              <tr key={v._id} className="border-b border-white/5 last:border-0 hover:bg-white/20">
                <td className="px-6 py-3 font-mono text-lg font-bold text-primary">#{v.tokenNumber}</td>
                <td className="px-6 py-3 text-sm text-muted-foreground font-mono">{v.visitNumber}</td>
                <td className="px-6 py-3 text-sm text-foreground">${v.consultationFee}</td>
                <td className="px-6 py-3">
                  {!v.isPaid ? (
                    <button onClick={async () => { await markPaid({ visitId: v._id }); toast.success(`Payment confirmed for token #${v.tokenNumber}`); }}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25">
                      <CreditCard className="size-3.5" /> Mark Paid
                    </button>
                  ) : <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400"><CheckCircle2 className="size-3" /> Paid</span>}
                </td>
                <td className="px-6 py-3">
                  <StatusBadge status={v.status} />
                </td>
                <td className="px-6 py-3">
                  <button onClick={() => navigate(`/dashboard/queue/${v._id}`)} className="text-xs text-primary hover:text-primary/80 font-medium">View &rarr;</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
