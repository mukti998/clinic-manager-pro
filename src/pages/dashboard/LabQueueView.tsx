import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Beaker, CheckCircle2, FlaskConical, Loader2, Table2, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { StatusBadge, PageHeader, EmptyState, LoadingState } from "@/components/dashboard/Shared";

export default function LabQueueView() {
  const queue = useQuery(api.lab.getLabQueue);
  const accept = useMutation(api.lab.accept);
  const collectSample = useMutation(api.lab.collectSample);
  const enterResults = useMutation(api.lab.enterResults);
  const [selectedLab, setSelectedLab] = useState<Id<"labResults"> | null>(null);
  const [resultForm, setResultForm] = useState<{ testName: string; result: string; unit: string }[]>([]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Lab Orders"
        description="Accept orders, collect samples, enter and verify results"
      />

      <div className="glass-card mt-6 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Tests</th>
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
                    icon={FlaskConical}
                    title="No pending lab orders"
                    description="Orders from doctors will appear here."
                  />
                </td></tr>
              ) : queue.map((lab) => (
                <tr key={lab._id}>
                  <td className="font-mono text-sm font-medium text-primary">{lab.labOrderNumber}</td>
                  <td className="text-sm text-muted-foreground max-w-xs truncate">{lab.tests.map((t) => t.testName).join(", ")}</td>
                  <td><StatusBadge status={lab.status} /></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {lab.status === "ordered" && (
                        <button onClick={async () => { await accept({ labId: lab._id }); toast.success("Order accepted."); }}
                          className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20">
                          <CheckCircle2 className="size-3.5 mr-1 inline" /> Accept
                        </button>
                      )}
                      {lab.status === "sample_collected" && (
                        <button onClick={async () => { await collectSample({ labId: lab._id }); toast.success("Processing..."); }}
                          className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/20">
                          <Beaker className="size-3.5 mr-1 inline" /> Process
                        </button>
                      )}
                      {lab.status === "in_progress" && (
                        <button onClick={() => { setSelectedLab(lab._id); setResultForm(lab.tests.map((t) => ({ testName: t.testName, result: "", unit: "" }))); }}
                          className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
                          <Table2 className="size-3.5 mr-1 inline" /> Enter Results
                        </button>
                      )}
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
              icon={FlaskConical}
              title="No pending lab orders"
              description="Orders from doctors will appear here."
            />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {queue.map((lab) => (
                <div key={lab._id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-medium text-primary">{lab.labOrderNumber}</span>
                    <StatusBadge status={lab.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{lab.tests.map((t) => t.testName).join(", ")}</p>
                  <div className="flex gap-2">
                    {lab.status === "ordered" && (
                      <button onClick={async () => { await accept({ labId: lab._id }); toast.success("Order accepted."); }}
                        className="flex-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 text-center">
                        Accept
                      </button>
                    )}
                    {lab.status === "sample_collected" && (
                      <button onClick={async () => { await collectSample({ labId: lab._id }); toast.success("Processing..."); }}
                        className="flex-1 rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400 text-center">
                        Process
                      </button>
                    )}
                    {lab.status === "in_progress" && (
                      <button onClick={() => { setSelectedLab(lab._id); setResultForm(lab.tests.map((t) => ({ testName: t.testName, result: "", unit: "" }))); }}
                        className="flex-1 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary text-center">
                        Enter Results
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Result Entry Modal ─────────────────────── */}
      <AnimatePresence>
        {selectedLab && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-strong w-full max-w-lg rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">Enter Lab Results</h3>
                <button onClick={() => setSelectedLab(null)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5">
                  <X className="size-4" />
                </button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {resultForm.map((r, i) => (
                  <div key={i} className="glass rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">{r.testName}</p>
                    <div className="flex gap-2">
                      <input
                        className="input-field flex-1"
                        value={r.result}
                        onChange={(e) => { const f = [...resultForm]; f[i].result = e.target.value; setResultForm(f); }}
                        placeholder="Result value"
                      />
                      <input
                        className="input-field w-24"
                        value={r.unit}
                        onChange={(e) => { const f = [...resultForm]; f[i].unit = e.target.value; setResultForm(f); }}
                        placeholder="Unit"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={async () => {
                    await enterResults({ labId: selectedLab, tests: resultForm.map((r) => ({ ...r, testName: r.testName })) });
                    toast.success("Results released to doctor.");
                    setSelectedLab(null);
                  }}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                >
                  Release Results
                </button>
                <button onClick={() => setSelectedLab(null)} className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


