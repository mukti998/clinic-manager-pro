import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2,
  FlaskConical,
  Loader2,
  Pill,
  Plus,
  Send,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { Field, StatusBadge } from "@/components/dashboard/Shared";

export default function DoctorConsult() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const visitData = useQuery(api.visits.getVisit, { visitId: visitId as Id<"visits"> });
  const saveConsultation = useMutation(api.visits.saveConsultation);
  const updateStatus = useMutation(api.visits.updateStatus);
  const createLabOrder = useMutation(api.lab.create);
  const createPrescription = useMutation(api.prescriptions.create);

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");

  // Lab order form
  const [showLabForm, setShowLabForm] = useState(false);
  const [labTests, setLabTests] = useState("");
  const [labNotes, setLabNotes] = useState("");

  // Prescription form
  const [showRxForm, setShowRxForm] = useState(false);
  const [rxMeds, setRxMeds] = useState([{ name: "", dosage: "", frequency: "Once daily", duration: "" }]);

  const handleComplete = async () => {
    if (!diagnosis) { toast.error("Diagnosis is required."); return; }
    try {
      await saveConsultation({ visitId: visitId as Id<"visits">, diagnosis, clinicalNotes: notes, followUpDate: followUp || undefined });
      await updateStatus({ visitId: visitId as Id<"visits">, status: "completed" });
      toast.success("Consultation completed.");
      navigate("/dashboard/doctor-queue");
    } catch { toast.error("Failed to complete consultation."); }
  };

  if (!visitData) return <div className="flex h-full items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  const cls = "w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white/6";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <button onClick={() => navigate("/dashboard/doctor-queue")} className="glass glass-hover rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground mb-6">&larr; Back to Queue</button>

      {/* Patient info bar */}
      <div className="glass rounded-xl p-4 flex items-center gap-4 mb-6">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">{visitData.patient?.firstName?.[0]}{visitData.patient?.lastName?.[0]}</div>
        <div><p className="text-sm font-medium text-foreground">{visitData.patient?.firstName} {visitData.patient?.lastName}</p><p className="text-xs text-muted-foreground font-mono">Token #{visitData.tokenNumber} &middot; {visitData.patient?.medicalId}</p></div>
        <div className="ml-auto"><StatusBadge status={visitData.status} /></div>
      </div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button onClick={() => setShowLabForm(!showLabForm)} className="glass glass-hover flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-emerald-400 transition-all hover:ring-1 hover:ring-emerald-400/30">
          <FlaskConical className="size-4" /> Order Lab
        </button>
        <button onClick={() => setShowRxForm(!showRxForm)} className="glass glass-hover flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-violet-400 transition-all hover:ring-1 hover:ring-violet-400/30">
          <Pill className="size-4" /> Prescribe
        </button>
        <button onClick={handleComplete} className="glass glass-strong flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold bg-primary text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20">
          <CheckCircle2 className="size-4" /> Complete Visit
        </button>
      </div>

      {/* Lab order form */}
      <AnimatePresence>
        {showLabForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass glass-strong rounded-xl p-6 mb-6 overflow-hidden">
            <h3 className="text-sm font-semibold text-foreground mb-3">Order Lab Tests</h3>
            <input className={`${cls} mb-3`} value={labTests} onChange={(e) => setLabTests(e.target.value)} placeholder="Tests: CBC, Metabolic Panel, Lipid Panel..." />
            <textarea rows={2} className={`${cls} resize-none mb-3`} value={labNotes} onChange={(e) => setLabNotes(e.target.value)} placeholder="Clinical notes for lab..." />
            <button onClick={async () => {
              const tests = labTests.split(",").map((t) => t.trim()).filter(Boolean).map((t) => ({ testName: t }));
              if (tests.length === 0) { toast.error("Enter at least one test."); return; }
              await createLabOrder({ patientId: visitData.patientId, visitId: visitId as Id<"visits">, tests, clinicalNotes: labNotes || undefined });
              toast.success(`Lab order sent (${tests.length} tests).`);
              setShowLabForm(false); setLabTests(""); setLabNotes("");
            }} className="rounded-xl bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25">
              <Send className="size-3.5 mr-1 inline" /> Send to Lab
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prescription form */}
      <AnimatePresence>
        {showRxForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass glass-strong rounded-xl p-6 mb-6 overflow-hidden">
            <h3 className="text-sm font-semibold text-foreground mb-3">Write Prescription</h3>
            {rxMeds.map((med, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <input className={cls} value={med.name} onChange={(e) => { const m = [...rxMeds]; m[i].name = e.target.value; setRxMeds(m); }} placeholder="Medication" />
                <input className={cls} value={med.dosage} onChange={(e) => { const m = [...rxMeds]; m[i].dosage = e.target.value; setRxMeds(m); }} placeholder="500mg" />
                <select className={cls} value={med.frequency} onChange={(e) => { const m = [...rxMeds]; m[i].frequency = e.target.value; setRxMeds(m); }}>
                  <option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>As needed</option><option>At bedtime</option>
                </select>
                <input className={cls} value={med.duration} onChange={(e) => { const m = [...rxMeds]; m[i].duration = e.target.value; setRxMeds(m); }} placeholder="7 days" />
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <button onClick={() => setRxMeds([...rxMeds, { name: "", dosage: "", frequency: "Once daily", duration: "" }])} className="glass text-xs px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground"><Plus className="size-3 inline mr-1" />Add</button>
            </div>
            <button onClick={async () => {
              const validMeds = rxMeds.filter((m) => m.name && m.dosage);
              if (validMeds.length === 0) { toast.error("Add at least one medication."); return; }
              await createPrescription({ patientId: visitData.patientId, visitId: visitId as Id<"visits">, medications: validMeds });
              toast.success(`Prescription sent to pharmacy (${validMeds.length} medications).`);
              setShowRxForm(false); setRxMeds([{ name: "", dosage: "", frequency: "Once daily", duration: "" }]);
            }} className="rounded-xl bg-violet-500/15 px-4 py-2 text-xs font-semibold text-violet-400 transition-all hover:bg-violet-500/25 mt-3">
              <Send className="size-3.5 mr-1 inline" /> Send to Pharmacy
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consultation notes */}
      <div className="glass glass-strong rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Consultation Notes</h3>
        <div className="space-y-4">
          <Field label="Diagnosis" required><textarea rows={2} className={`${cls} resize-none`} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Primary diagnosis..." /></Field>
          <Field label="Clinical Notes"><textarea rows={3} className={`${cls} resize-none`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Symptoms, examination findings..." /></Field>
          <Field label="Follow-up Date"><input type="date" className={cls} value={followUp} onChange={(e) => setFollowUp(e.target.value)} /></Field>
        </div>
      </div>
    </motion.div>
  );
}
