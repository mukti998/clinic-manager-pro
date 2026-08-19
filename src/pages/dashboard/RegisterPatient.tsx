import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Loader2,
  Shield,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { Field, SectionTitle } from "@/components/dashboard/Shared";

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

  const cls = "w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white/6";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Register New Patient</h1>
      <p className="mt-1 text-sm text-muted-foreground">Register patient and assign to doctor — token generated after payment</p>

      <form onSubmit={handleSubmit} className="glass glass-strong mt-8 rounded-xl p-8">
        <SectionTitle icon={UserPlus} label="Patient Information" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First Name" required><input required className={cls} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" /></Field>
          <Field label="Last Name" required><input required className={cls} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" /></Field>
          <Field label="Date of Birth" required><input required type="date" className={cls} value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></Field>
          <Field label="Gender" required>
            <select required className={cls} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" | "other" })}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </Field>
          <Field label="Phone" required><input required className={cls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 123-4567" /></Field>
          <Field label="Email"><input type="email" className={cls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" /></Field>
        </div>

        <SectionTitle icon={Stethoscope} label="Assignment" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Assign Doctor" required>
            <select required className={cls} value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
              <option value="">Select doctor...</option>
              {doctors?.map((d) => <option key={d._id} value={d.userId || d._id}>Dr. {d.firstName} {d.lastName} ({d.specialization || d.department})</option>)}
            </select>
          </Field>
          <Field label="Consultation Fee ($)" required>
            <input required type="number" className={cls} value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} placeholder="50" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Reason for Visit">
              <textarea rows={2} className={`${cls} resize-none`} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Chief complaint..." />
            </Field>
          </div>
        </div>

        <SectionTitle icon={Shield} label="Emergency Contact" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact Name"><input className={cls} value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} placeholder="Jane Doe" /></Field>
          <Field label="Contact Phone"><input className={cls} value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} placeholder="+1 (555) 987-6543" /></Field>
        </div>

        <SectionTitle icon={Users} label="Medical" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Blood Type" required>
            <select required className={cls} value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value as typeof form.bloodType })}>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bt) => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </Field>
          <Field label="Allergies (comma separated)"><input className={cls} value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Penicillin, Peanuts" /></Field>
          <div className="sm:col-span-2">
            <Field label="Medical History">
              <textarea rows={2} className={`${cls} resize-none`} value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} placeholder="Previous surgeries, chronic conditions..." />
            </Field>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button type="submit" disabled={isSubmitting} className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            {isSubmitting ? "Registering..." : "Register & Generate Token"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
