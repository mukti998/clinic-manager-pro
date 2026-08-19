import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, UserPlus, X } from "lucide-react";
import { Field, PageHeader, StatCard, EmptyState, LoadingState } from "@/components/dashboard/Shared";

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
      await createUser({
        name: form.name, email: form.email, role: form.role as never,
        department: form.department || undefined, specialization: form.specialization || undefined,
        phone: form.phone || undefined,
      });
      toast.success(`${form.name} added to staff.`);
      setForm({ name: "", email: "", role: "doctor", department: "", specialization: "", phone: "" });
      setShowForm(false);
    } catch { toast.error("Failed to create user."); }
    finally { setCreating(false); }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Staff Management"
        description="Create accounts, assign roles, manage access"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            <UserPlus className="size-4" /> Add Staff
          </button>
        }
      />

      {/* ─── Stats ───────────────────────────────────── */}
      {userStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mt-6">
          <StatCard label="Doctors" value={userStats.doctors} icon={UserPlus} color="text-blue-400" bgColor="bg-blue-400/10" />
          <StatCard label="Nurses" value={userStats.nurses} icon={UserPlus} color="text-emerald-400" bgColor="bg-emerald-400/10" />
          <StatCard label="Total Staff" value={userStats.total} icon={UserPlus} color="text-primary" bgColor="bg-primary/10" />
        </div>
      )}

      {/* ─── Create Form ─────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={handleCreate} className="glass-card mt-6 p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">New Staff Member</h3>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5">
                  <X className="size-4" />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" required>
                  <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                </Field>
                <Field label="Email" required>
                  <input required type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@hospital.com" />
                </Field>
                <Field label="Role" required>
                  <select required className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="lab_technician">Lab Technician</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Admin</option>
                  </select>
                </Field>
                <Field label="Department">
                  <input className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Cardiology" />
                </Field>
              </div>
              <div className="flex gap-3 mt-5">
                <button type="submit" disabled={creating}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60">
                  {creating ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Create Account
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Staff Table ─────────────────────────────── */}
      <div className="glass-card mt-6 overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {!allUsers ? (
                <tr><td colSpan={4}><LoadingState /></td></tr>
              ) : allUsers.length === 0 ? (
                <tr><td colSpan={4}>
                  <EmptyState
                    icon={UserPlus}
                    title="No staff members"
                    description="Add your first staff member to get started."
                  />
                </td></tr>
              ) : allUsers.map((u) => (
                <tr key={u._id}>
                  <td className="font-medium text-foreground">{u.name || "—"}</td>
                  <td className="text-xs text-muted-foreground font-mono">{u.email || "—"}</td>
                  <td><span className="badge badge-primary capitalize">{u.role?.replace("_", " ") || "—"}</span></td>
                  <td className="text-xs text-muted-foreground capitalize">{u.department || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          {!allUsers ? (
            <LoadingState />
          ) : allUsers.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No staff members"
              description="Add your first staff member to get started."
            />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {allUsers.map((u) => (
                <div key={u._id} className="flex items-center gap-3 p-4">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                    {u.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{u.email || "—"}</p>
                  </div>
                  <span className="badge badge-primary capitalize shrink-0">{u.role?.replace("_", " ") || "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
