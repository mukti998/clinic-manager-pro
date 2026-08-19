import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Beaker,
  CheckCircle2,
  Loader2,
  Table2,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { StatusBadge } from "@/components/dashboard/Shared";

export default function LabQueueView() {
  const queue = useQuery(api.lab.getLabQueue);
  const accept = useMutation(api.lab.accept);
  const collectSample = useMutation(api.lab.collectSample);
  const enterResults = useMutation(api.lab.enterResults);
  const [selectedLab, setSelectedLab] = useState<Id<"labResults"> | null>(null);
  const [resultForm, setResultForm] = useState<{ testName: string; result: string; unit: string }[]>([]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Lab Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage incoming test orders — accept, collect samples, enter results</p>

      <div className="glass glass-strong mt-6 overflow-hidden rounded-xl">
        <table className="w-full">
          <thead><tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-4">Order #</th><th className="px-6 py-4">Tests</th><th className="px-6 py-4">Priority</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th>
          </tr></thead>
          <tbody>
            {!queue ? <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin inline mr-2" />Loading...</td></tr>
            : queue.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">No pending lab orders.</td></tr>
            : queue.map((lab) => (
              <tr key={lab._id} className="border-b border-white/5 last:border-0 hover:bg-white/20">
                <td className="px-6 py-3 font-mono text-sm text-primary">{lab.labOrderNumber}</td>
                <td className="px-6 py-3 text-sm text-muted-foreground">{lab.tests.map((t) => t.testName).join(", ")}</td>
                <td className="px-6 py-3"><span className="text-xs text-muted-foreground capitalize">{lab.status.replace(/_/g, " ")}</span></td>
                <td className="px-6 py-3"><StatusBadge status={lab.status} /></td>
                <td className="px-6 py-3 flex gap-2">
                  {lab.status === "ordered" && (
                    <button onClick={async () => { await accept({ labId: lab._id }); toast.success("Order accepted."); }}
                      className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25">
                      <CheckCircle2 className="size-3.5 mr-1 inline" />Accept
                    </button>
                  )}
                  {lab.status === "sample_collected" && (
                    <button onClick={async () => { await collectSample({ labId: lab._id }); toast.success("Processing..."); }}
                      className="rounded-lg bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-400 transition-all hover:bg-blue-500/25">
                      <Beaker className="size-3.5 mr-1 inline" />Process
                    </button>
                  )}
                  {lab.status === "in_progress" && (
                    <button onClick={() => { setSelectedLab(lab._id); setResultForm(lab.tests.map((t) => ({ testName: t.testName, result: "", unit: "" }))); }}
                      className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/25">
                      <Table2 className="size-3.5 mr-1 inline" />Enter Results
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Result entry modal */}
      <AnimatePresence>
        {selectedLab && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong max-w-lg w-full rounded-xl p-6 mx-4">
              <h3 className="text-lg font-bold text-foreground mb-4">Enter Results</h3>
              {resultForm.map((r, i) => (
                <div key={i} className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">{r.testName}</p>
                  <div className="flex gap-2">
                    <input className="w-full rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-foreground outline-none" value={r.result} onChange={(e) => { const f = [...resultForm]; f[i].result = e.target.value; setResultForm(f); }} placeholder="Result" />
                    <input className="w-24 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-foreground outline-none" value={r.unit} onChange={(e) => { const f = [...resultForm]; f[i].unit = e.target.value; setResultForm(f); }} placeholder="Unit" />
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <button onClick={async () => { await enterResults({ labId: selectedLab, tests: resultForm.map((r) => ({ ...r, testName: r.testName })) }); toast.success("Results entered and released to doctor."); setSelectedLab(null); }}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20">Release Results</button>
                <button onClick={() => setSelectedLab(null)} className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
