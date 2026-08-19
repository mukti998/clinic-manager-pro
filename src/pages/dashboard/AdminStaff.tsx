import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { Field, inputCls } from "@/components/dashboard/Shared";

export default function AdminStaff() {
  const allUsers = useQuery(api.users.listAll);
  const userStats = useQuery(api.users.getStats);
  const createUser = useMutation(api.users.createUser);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "doctor", department: "", specialization: "", phone: "" });
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createUser({ name: form.name, email: form.email, role: form.role as never, department: form.department || undefined, specialization: form.specialization || undefined, phone: form.phone || undefined });
      toast.success(`${form.name} added to staff.`);
      setForm({ name: "", email: "", role: "doctor", department: "", specialization: "", phone: "" });
      setShowForm(false);
    } catch { toast.error("Failed to create user."); }
    finally { setCreating(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Staff Management</h1><p className="mt-1 text-sm text-muted-foreground">Create accounts, assign roles, manage access</p></div>
        <button onClick={() => setShowForm(!showForm)} className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"><UserPlus className="size-4" /> Add Staff</button>
      </div>
      {userStats && (
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[{ label: "Doctors", value: userStats.doctors }, { label: "Pharmacists", value: userStats.pharmacists }, { label: "Lab Technicians", value: userStats.labTechs }].map((s) => (
            <div key={s.label} className="glass glass-strong rounded-xl p-4 flex items-center justify-between"><p className="text-xs text-muted-foreground font-medium">{s.label}</p><p className="text-xl font-bold text-foreground">{s.value}</p></div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={handleCreate} className="glass glass-strong mt-6 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">New Staff Member</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" required><input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" /></Field>
                <Field label="Email" required><input required type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@hospital.com" /></Field>
                <Field label="Role" required>
                  <select required className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="pharmacist">Pharmacist</option>
                    <option value="lab_technician">Lab Technician</option><option value="receptionist">Receptionist</option><option value="admin">Admin</option>
                  </select>
                </Field>
                <Field label="Department"><input className={inputCls} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Cardiology" /></Field>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" disabled={creating} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-60">{creating ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Create Account</button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="glass glass-strong mt-6 overflow-hidden rounded-xl">
        <table className="w-full">
          <thead><tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Department</th>
          </tr></thead>
          <tbody>
            {!allUsers ? <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin inline mr-2" />Loading...</td></tr>
            : allUsers.length === 0 ? <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">No staff found.</td></tr>
            : allUsers.map((u) => (
              <tr key={u._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                <td className="px-6 py-3 text-sm font-medium text-foreground">{u.name || "\u2014"}</td>
                <td className="px-6 py-3 text-xs text-muted-foreground font-mono">{u.email || "\u2014"}</td>
                <td className="px-6 py-3"><span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">{u.role?.replace("_", " ") || "\u2014"}</span></td>
                <td className="px-6 py-3 text-xs text-muted-foreground">{u.department || "\u2014"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
