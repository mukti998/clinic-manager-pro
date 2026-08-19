import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { Field } from "@/components/dashboard/Shared";

export default function VitalsEntry() {
  const addVitals = useMutation(api.vitals.add);
  const patients = useQuery(api.patients.list, { activeOnly: true });
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ patientId: "", temperature: "", heartRate: "", bloodPressureSystolic: "", bloodPressureDiastolic: "", respiratoryRate: "", oxygenSaturation: "", weight: "", notes: "" });

  const handleSave = async () => {
    if (!form.patientId) { toast.error("Please select a patient."); return; }
    setIsSaving(true);
    try {
      await addVitals({
        patientId: form.patientId as Id<"patients">,
        temperature: form.temperature ? Number(form.temperature) : undefined,
        heartRate: form.heartRate ? Number(form.heartRate) : undefined,
        bloodPressureSystolic: form.bloodPressureSystolic ? Number(form.bloodPressureSystolic) : undefined,
        bloodPressureDiastolic: form.bloodPressureDiastolic ? Number(form.bloodPressureDiastolic) : undefined,
        respiratoryRate: form.respiratoryRate ? Number(form.respiratoryRate) : undefined,
        oxygenSaturation: form.oxygenSaturation ? Number(form.oxygenSaturation) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        notes: form.notes || undefined,
      });
      toast.success("Vitals recorded successfully.");
      setForm({ patientId: "", temperature: "", heartRate: "", bloodPressureSystolic: "", bloodPressureDiastolic: "", respiratoryRate: "", oxygenSaturation: "", weight: "", notes: "" });
    } catch {
      toast.error("Failed to record vitals.");
    } finally {
      setIsSaving(false);
    }
  };

  const cls = "w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white/6";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Record Vitals</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enter patient vital signs</p>
      <div className="glass glass-strong mt-6 rounded-xl p-6">
        <Field label="Patient" required>
          <select required className={cls} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
            <option value="">Select patient...</option>
            {patients?.map((p) => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.medicalId})</option>)}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-3 mt-4">
          <Field label="Temperature (F)"><input type="number" step="0.1" className={cls} value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} placeholder="98.6" /></Field>
          <Field label="Heart Rate (bpm)"><input type="number" className={cls} value={form.heartRate} onChange={(e) => setForm({ ...form, heartRate: e.target.value })} placeholder="72" /></Field>
          <Field label="Blood Pressure"><div className="flex items-center gap-2"><input type="number" className={cls} value={form.bloodPressureSystolic} onChange={(e) => setForm({ ...form, bloodPressureSystolic: e.target.value })} placeholder="120" /><span className="text-muted-foreground">/</span><input type="number" className={cls} value={form.bloodPressureDiastolic} onChange={(e) => setForm({ ...form, bloodPressureDiastolic: e.target.value })} placeholder="80" /></div></Field>
          <Field label="Resp. Rate"><input type="number" className={cls} value={form.respiratoryRate} onChange={(e) => setForm({ ...form, respiratoryRate: e.target.value })} placeholder="16" /></Field>
          <Field label="SpO2 (%)"><input type="number" step="0.1" className={cls} value={form.oxygenSaturation} onChange={(e) => setForm({ ...form, oxygenSaturation: e.target.value })} placeholder="98" /></Field>
          <Field label="Weight (kg)"><input type="number" step="0.1" className={cls} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="70" /></Field>
        </div>
        <Field label="Notes"><textarea rows={2} className={`${cls} resize-none mt-4`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Clinical notes..." /></Field>
        <button disabled={isSaving} className="mt-4 glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-60" onClick={handleSave}>
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4" />} {isSaving ? "Saving..." : "Save Vitals"}
        </button>
      </div>
    </motion.div>
  );
}
