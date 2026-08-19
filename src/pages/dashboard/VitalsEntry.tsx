import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { Field, PageHeader } from "@/components/dashboard/Shared";

export default function VitalsEntry() {
  const addVitals = useMutation(api.vitals.add);
  const patients = useQuery(api.patients.list, { activeOnly: true });
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: "", temperature: "", heartRate: "", bloodPressureSystolic: "",
    bloodPressureDiastolic: "", respiratoryRate: "", oxygenSaturation: "",
    weight: "", notes: "",
  });

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

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl">
      <PageHeader
        title="Record Vitals"
        description="Enter patient vital signs and measurements"
      />

      <div className="glass-card mt-6 p-5 md:p-8">
        <Field label="Patient" required>
          <select required className="input-field" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
            <option value="">Select patient...</option>
            {patients?.map((p) => (
              <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.medicalId})</option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-3 mt-6">
          <Field label="Temperature (F)" hint="e.g. 98.6">
            <input type="number" step="0.1" className="input-field" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} placeholder="98.6" />
          </Field>
          <Field label="Heart Rate (bpm)" hint="e.g. 72">
            <input type="number" className="input-field" value={form.heartRate} onChange={(e) => setForm({ ...form, heartRate: e.target.value })} placeholder="72" />
          </Field>
          <Field label="Blood Pressure">
            <div className="flex items-center gap-2">
              <input type="number" className="input-field" value={form.bloodPressureSystolic} onChange={(e) => setForm({ ...form, bloodPressureSystolic: e.target.value })} placeholder="120" />
              <span className="text-muted-foreground font-medium">/</span>
              <input type="number" className="input-field" value={form.bloodPressureDiastolic} onChange={(e) => setForm({ ...form, bloodPressureDiastolic: e.target.value })} placeholder="80" />
            </div>
          </Field>
          <Field label="Respiratory Rate" hint="breaths/min">
            <input type="number" className="input-field" value={form.respiratoryRate} onChange={(e) => setForm({ ...form, respiratoryRate: e.target.value })} placeholder="16" />
          </Field>
          <Field label="SpO2 (%)" hint="Oxygen saturation">
            <input type="number" step="0.1" className="input-field" value={form.oxygenSaturation} onChange={(e) => setForm({ ...form, oxygenSaturation: e.target.value })} placeholder="98" />
          </Field>
          <Field label="Weight (kg)">
            <input type="number" step="0.1" className="input-field" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="70" />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Clinical Notes">
            <textarea rows={2} className="input-field resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional observations..." />
          </Field>
        </div>

        <button
          disabled={isSaving}
          className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60"
          onClick={handleSave}
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4" />}
          {isSaving ? "Saving..." : "Save Vitals"}
        </button>
      </div>
    </div>
  );
}
