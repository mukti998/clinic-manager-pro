import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate, useParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  FlaskConical,
  Loader2,
  Pill,
  Plus,
  Send,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { Field, StatusBadge, PageHeader } from "@/components/dashboard/Shared";

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

  const [showLabForm, setShowLabForm] = useState(false);
  const [labTests, setLabTests] = useState("");
  const [labNotes, setLabNotes] = useState("");

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

  if (!visitData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
      <button
        onClick={() => navigate("/dashboard/doctor-queue")}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mb-4"
      >
        <ArrowLeft className="size-4" /> Back to Queue
      </button>

      {/* ─── Patient Info Bar ─────────────────────────── */}
      <div className="glass-card p-4 flex items-center gap-4 mb-6">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary shrink-0">
          {visitData.patient?.firstName?.[0]}{visitData.patient?.lastName?.[0]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {visitData.patient?.firstName} {visitData.patient?.lastName}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Token #{visitData.tokenNumber} · {visitData.patient?.medicalId}
          </p>
        </div>
        <div className="ml-auto shrink-0">
          <StatusBadge status={visitData.status} />
        </div>
      </div>

      {/* ─── Quick Actions ────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => { setShowLabForm(!showLabForm); setShowRxForm(false); }}
          className={`glass-card flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
            showLabForm ? "ring-1 ring-emerald-400/30 text-emerald-400" : "text-emerald-400 hover:ring-1 hover:ring-emerald-400/20"
          }`}
        >
          <FlaskConical className="size-4" /> <span className="hidden sm:inline">Order Lab</span>
        </button>
        <button
          onClick={() => { setShowRxForm(!showRxForm); setShowLabForm(false); }}
          className={`glass-card flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
            showRxForm ? "ring-1 ring-violet-400/30 text-violet-400" : "text-violet-400 hover:ring-1 hover:ring-violet-400/20"
          }`}
        >
          <Pill className="size-4" /> <span className="hidden sm:inline">Prescribe</span>
        </button>
        <button
          onClick={handleComplete}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          <CheckCircle2 className="size-4" /> <span className="hidden sm:inline">Complete</span>
        </button>
      </div>

      {/* ─── Lab Order Form ───────────────────────────── */}
      <AnimatePresence>
        {showLabForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <FlaskConical className="size-4 text-emerald-400" /> Order Laboratory Tests
              </h3>
              <input
                className="input-field mb-3"
                value={labTests}
                onChange={(e) => setLabTests(e.target.value)}
                placeholder="Tests: CBC, Metabolic Panel, Lipid Panel..."
              />
              <textarea
                rows={2}
                className="input-field resize-none mb-3"
                value={labNotes}
                onChange={(e) => setLabNotes(e.target.value)}
                placeholder="Clinical notes for laboratory..."
              />
              <button
                onClick={async () => {
                  const tests = labTests.split(",").map((t) => t.trim()).filter(Boolean).map((t) => ({ testName: t }));
                  if (tests.length === 0) { toast.error("Enter at least one test."); return; }
                  await createLabOrder({ patientId: visitData.patientId, visitId: visitId as Id<"visits">, tests, clinicalNotes: labNotes || undefined });
                  toast.success(`Lab order sent (${tests.length} tests).`);
                  setShowLabForm(false); setLabTests(""); setLabNotes("");
                }}
                className="rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20"
              >
                <Send className="size-3.5 mr-1 inline" /> Send to Laboratory
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Prescription Form ────────────────────────── */}
      <AnimatePresence>
        {showRxForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Pill className="size-4 text-violet-400" /> Write Prescription
              </h3>
              {rxMeds.map((med, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  <input className="input-field" value={med.name} onChange={(e) => { const m = [...rxMeds]; m[i].name = e.target.value; setRxMeds(m); }} placeholder="Medication" />
                  <input className="input-field" value={med.dosage} onChange={(e) => { const m = [...rxMeds]; m[i].dosage = e.target.value; setRxMeds(m); }} placeholder="500mg" />
                  <select className="input-field" value={med.frequency} onChange={(e) => { const m = [...rxMeds]; m[i].frequency = e.target.value; setRxMeds(m); }}>
                    <option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>As needed</option><option>At bedtime</option>
                  </select>
                  <input className="input-field" value={med.duration} onChange={(e) => { const m = [...rxMeds]; m[i].duration = e.target.value; setRxMeds(m); }} placeholder="Duration" />
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setRxMeds([...rxMeds, { name: "", dosage: "", frequency: "Once daily", duration: "" }])}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <Plus className="size-3" /> Add Medication
                </button>
              </div>
              <button
                onClick={async () => {
                  const validMeds = rxMeds.filter((m) => m.name && m.dosage);
                  if (validMeds.length === 0) { toast.error("Add at least one medication."); return; }
                  await createPrescription({ patientId: visitData.patientId, visitId: visitId as Id<"visits">, medications: validMeds });
                  toast.success(`Prescription sent to pharmacy (${validMeds.length} medications).`);
                  setShowRxForm(false); setRxMeds([{ name: "", dosage: "", frequency: "Once daily", duration: "" }]);
                }}
                className="mt-3 rounded-xl bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-400 transition-all hover:bg-violet-500/20"
              >
                <Send className="size-3.5 mr-1 inline" /> Send to Pharmacy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Consultation Notes ───────────────────────── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-primary" /> Consultation Notes
        </h3>
        <div className="space-y-4">
          <Field label="Diagnosis" required>
            <textarea
              rows={2}
              className="input-field resize-none"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Primary diagnosis..."
            />
          </Field>
          <Field label="Clinical Notes">
            <textarea
              rows={3}
              className="input-field resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Symptoms, examination findings, treatment plan..."
            />
          </Field>
          <Field label="Follow-up Date">
            <input
              type="date"
              className="input-field"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
