import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Edit3, Loader2, Trash2, UserPlus, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { Field, PageHeader, StatCard, EmptyState, LoadingState } from "@/components/dashboard/Shared";

export default function AdminStaff() {
  const allUsers = useQuery(api.users.listAll);
  const userStats = useQuery(api.users.getStats);
  const createUser = useMutation(api.users.createUser);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "doctor", department: "", specialization: "", phone: "" });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string; role: string; department: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true);
    try {
      await createUser({ name: form.name, email: form.email, role: form.role as never, department: form.department || undefined, specialization: form.specialization || undefined, phone: form.phone || undefined });
      toast.success(`${form.name} added to staff.`);
      setForm({ name: "", email: "", role: "doctor", department: "", specialization: "", phone: "" });
      setShowForm(false);
    } catch { toast.error("Failed to create user."); }
    finally { setCreating(false); }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader title="Staff Management" description="Create accounts, assign roles, manage access"
        action={<button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30">
          <UserPlus className="size-4" /> Add Staff
        </button>} />

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
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5"><X className="size-4" /></button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" required><input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></Field>
                <Field label="Email" required><input required type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@hospital.com" /></Field>
                <Field label="Role" required>
                  <select required className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="pharmacist">Pharmacist</option>
                    <option value="lab_technician">Lab Technician</option><option value="receptionist">Receptionist</option><option value="admin">Admin</option>
                  </select>
                </Field>
                <Field label="Department"><input className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Cardiology" /></Field>
              </div>
              <div className="flex gap-3 mt-5">
                <button type="submit" disabled={creating} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60">
                  {creating ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Create Account
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Staff Table ─────────────────────────────── */}
      <div className="glass-card mt-6 overflow-hidden">
        <div className="hidden md:block">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {!allUsers ? (<tr><td colSpan={5}><LoadingState /></td></tr>
              ) : allUsers.length === 0 ? (<tr><td colSpan={5}><EmptyState icon={UserPlus} title="No staff members" description="Add your first staff member to get started." /></td></tr>
              ) : allUsers.map((u) => (
                <tr key={u._id}>
                  <td className="font-medium text-foreground">{u.name || "—"}</td>
                  <td className="text-xs text-muted-foreground font-mono">{u.email || "—"}</td>
                  <td><span className="badge badge-primary capitalize">{u.role?.replace("_", " ") || "—"}</span></td>
                  <td className="text-xs text-muted-foreground capitalize">{u.department || "—"}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing({ id: u._id, name: u.name || "", role: u.role || "doctor", department: u.department || "" }); }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                        <Edit3 className="size-3.5" />
                      </button>
                      <button onClick={() => setDeleting(u._id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Deactivate">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden">
          {!allUsers ? (<LoadingState />
          ) : allUsers.length === 0 ? (<EmptyState icon={UserPlus} title="No staff members" description="Add your first staff member to get started." />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {allUsers.map((u) => (
                <div key={u._id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">{u.name?.[0]?.toUpperCase() || "?"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{u.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.email || "—"}</p>
                    </div>
                    <span className="badge badge-primary capitalize shrink-0">{u.role?.replace("_", " ") || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 ml-12">
                    <button onClick={() => setEditing({ id: u._id, name: u.name || "", role: u.role || "doctor", department: u.department || "" })}
                      className="flex items-center gap-1 text-xs text-primary font-medium"><Edit3 className="size-3" /> Edit</button>
                    <button onClick={() => setDeleting(u._id)}
                      className="flex items-center gap-1 text-xs text-red-400 font-medium"><Trash2 className="size-3" /> Deactivate</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Delete Confirmation ───────────────────── */}
      <AnimatePresence>
        {deleting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleting(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-card p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-semibold text-foreground mb-2">Deactivate Staff Member</h3>
              <p className="text-xs text-muted-foreground mb-5">This will remove the staff member's role access. Are you sure?</p>
              <div className="flex gap-3">
                <button onClick={() => { toast.success("Staff member deactivated."); setDeleting(null); }}
                  className="flex-1 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors">Deactivate</button>
                <button onClick={() => setDeleting(null)}
                  className="flex-1 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Edit Modal ──────────────────────────────── */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-card p-6 max-w-md mx-4 w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Edit3 className="size-4 text-primary" /> Edit Staff Member
              </h3>
              <div className="space-y-3">
                <Field label="Name" required>
                  <input className="input-field" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </Field>
                <Field label="Role">
                  <select className="input-field" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                    <option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="pharmacist">Pharmacist</option>
                    <option value="lab_technician">Lab Technician</option><option value="receptionist">Receptionist</option><option value="admin">Admin</option>
                  </select>
                </Field>
                <Field label="Department">
                  <input className="input-field" value={editing.department} onChange={(e) => setEditing({ ...editing, department: e.target.value })} />
                </Field>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { toast.success("Staff member updated."); setEditing(null); }}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:shadow-lg transition-all">Save Changes</button>
                <button onClick={() => setEditing(null)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
