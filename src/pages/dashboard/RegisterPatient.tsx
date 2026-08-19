import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowRight, Loader2, Shield, Stethoscope, UserPlus, Users } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { Field, SectionTitle, PageHeader } from "@/components/dashboard/Shared";

export default function RegisterPatient() {
  const createPatient = useMutation(api.patients.create);
  const createVisit = useMutation(api.visits.create);
  const doctors = useQuery(api.staff.getByRole, { role: "doctor" });
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", dateOfBirth: "", gender: "male" as "male" | "female" | "other",
    bloodType: "O+" as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-",
    phone: "", email: "", address: "", emergencyContactName: "", emergencyContactPhone: "",
    allergies: "", medicalHistory: "", insuranceProvider: "", insurancePolicyNumber: "",
    doctorId: "", consultationFee: "50", reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.doctorId) { toast.error("Please select a doctor."); return; }
    setIsSubmitting(true);
    try {
      const allergies = form.allergies ? form.allergies.split(",").map((a) => a.trim()).filter(Boolean) : undefined;
      const patientId = await createPatient({
        firstName: form.firstName, lastName: form.lastName, dateOfBirth: form.dateOfBirth,
        gender: form.gender, bloodType: form.bloodType, phone: form.phone,
        email: form.email || undefined, address: form.address || undefined,
        emergencyContactName: form.emergencyContactName || undefined,
        emergencyContactPhone: form.emergencyContactPhone || undefined,
        allergies, medicalHistory: form.medicalHistory || undefined,
        insuranceProvider: form.insuranceProvider || undefined,
        insurancePolicyNumber: form.insurancePolicyNumber || undefined,
      });
      const { tokenNumber } = await createVisit({
        patientId, doctorId: form.doctorId as Id<"users">,
        consultationFee: Number(form.consultationFee) || 50,
        reason: form.reason || undefined,
      });
      toast.success(`Patient registered. Token #${tokenNumber} generated.`);
      navigate("/dashboard/queue");
    } catch { toast.error("Failed to register patient."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
      <PageHeader
        title="Register New Patient"
        description="Register patient information and assign to a doctor"
      />

      <form onSubmit={handleSubmit} className="glass-card mt-6 p-5 md:p-8">
        {/* ─── Personal Information ────────────────────── */}
        <SectionTitle icon={UserPlus} label="Personal Information" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First Name" required>
            <input required className="input-field" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" />
          </Field>
          <Field label="Last Name" required>
            <input required className="input-field" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" />
          </Field>
          <Field label="Date of Birth" required>
            <input required type="date" className="input-field" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </Field>
          <Field label="Gender" required>
            <select required className="input-field" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" | "other" })}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Phone Number" required>
            <input required className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 123-4567" />
          </Field>
          <Field label="Email">
            <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="patient@email.com" />
          </Field>
        </div>

        {/* ─── Doctor Assignment ───────────────────────── */}
        <div className="mt-8">
          <SectionTitle icon={Stethoscope} label="Doctor Assignment" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Assign Doctor" required>
              <select required className="input-field" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
                <option value="">Select a doctor...</option>
                {doctors?.map((d) => (
                  <option key={d._id} value={d.userId || d._id}>
                    Dr. {d.firstName} {d.lastName} ({d.specialization || d.department})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Consultation Fee ($)" required>
              <input required type="number" className="input-field" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} placeholder="50" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Reason for Visit">
                <textarea rows={2} className="input-field resize-none" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Chief complaint or reason for visit..." />
              </Field>
            </div>
          </div>
        </div>

        {/* ─── Emergency Contact ───────────────────────── */}
        <div className="mt-8">
          <SectionTitle icon={Shield} label="Emergency Contact" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact Name">
              <input className="input-field" value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} placeholder="Emergency contact name" />
            </Field>
            <Field label="Contact Phone">
              <input className="input-field" value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} placeholder="+1 (555) 987-6543" />
            </Field>
          </div>
        </div>

        {/* ─── Medical Information ─────────────────────── */}
        <div className="mt-8">
          <SectionTitle icon={Users} label="Medical Information" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Blood Type" required>
              <select required className="input-field" value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value as typeof form.bloodType })}>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bt) => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </Field>
            <Field label="Allergies" hint="Comma-separated">
              <input className="input-field" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Penicillin, Peanuts" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Medical History">
                <textarea rows={2} className="input-field resize-none" value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} placeholder="Previous surgeries, chronic conditions, medications..." />
              </Field>
            </div>
          </div>
        </div>

        {/* ─── Submit ──────────────────────────────────── */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            {isSubmitting ? "Registering..." : "Register & Generate Token"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-xl px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
