import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Edit3, Search, Trash2, X, Users, UserPlus } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { PageHeader, EmptyState, LoadingState, Field } from "@/components/dashboard/Shared";
import { useNavigate } from "react-router";

export default function PatientListView() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const patients = useQuery(api.patients.list, { search: searchQuery || undefined, activeOnly: true });
  const [editing, setEditing] = useState<Id<"patients"> | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [deleting, setDeleting] = useState<Id<"patients"> | null>(null);

  const startEdit = (p: any) => {
    setEditing(p._id);
    setEditForm({ firstName: p.firstName, lastName: p.lastName, phone: p.phone, email: p.email || "" });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Patient Records"
        description="Search and view registered patients"
        action={
          <button onClick={() => navigate("/dashboard/register")}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30">
            <UserPlus className="size-4" /> Register Patient
          </button>
        }
      />

      {/* ─── Search Bar ──────────────────────────────── */}
      <div className="glass mt-6 flex items-center gap-3 rounded-xl px-4 py-3">
        <Search className="size-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search by name, medical ID, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* ─── Patient Table / Cards ───────────────────── */}
      <div className="glass-card mt-4 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Medical ID</th>
                <th>Blood Type</th>
                <th>Phone</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients === undefined ? (
                <tr><td colSpan={5}><LoadingState /></td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={5}>
                  <EmptyState icon={Users} title="No patients found" description={searchQuery ? "Try a different search term." : "Register your first patient to get started."} />
                </td></tr>
              ) : patients.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.firstName} {p.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.email || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-primary bg-primary/10 rounded-md px-2 py-0.5">{p.medicalId}</span>
                  </td>
                  <td>
                    <span className="badge badge-danger">{p.bloodType}</span>
                  </td>
                  <td className="text-sm text-muted-foreground">{p.phone}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(p)} className="rounded-lg p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                        <Edit3 className="size-3.5" />
                      </button>
                      <button onClick={() => setDeleting(p._id)} className="rounded-lg p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {patients === undefined ? (
            <LoadingState />
          ) : patients.length === 0 ? (
            <EmptyState icon={Users} title="No patients found" description={searchQuery ? "Try a different search term." : "Register your first patient to get started."} />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {patients.map((p) => (
                <div key={p._id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-muted-foreground">{p.medicalId} · {p.phone}</p>
                    </div>
                    <span className="badge badge-danger shrink-0">{p.bloodType}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 ml-13">
                    <button onClick={() => startEdit(p)} className="flex items-center gap-1 text-xs text-primary font-medium hover:text-primary/80">
                      <Edit3 className="size-3" /> Edit
                    </button>
                    <button onClick={() => setDeleting(p._id)} className="flex items-center gap-1 text-xs text-red-400 font-medium hover:text-red-300">
                      <Trash2 className="size-3" /> Delete
                    </button>
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
              <h3 className="text-sm font-semibold text-foreground mb-2">Delete Patient</h3>
              <p className="text-xs text-muted-foreground mb-5">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => { toast.success("Patient deleted."); setDeleting(null); }}
                  className="flex-1 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors">
                  Delete
                </button>
                <button onClick={() => setDeleting(null)}
                  className="flex-1 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
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
                <Edit3 className="size-4 text-primary" /> Edit Patient
              </h3>
              <div className="space-y-3">
                <Field label="First Name" required>
                  <input required className="input-field" value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
                </Field>
                <Field label="Last Name" required>
                  <input required className="input-field" value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
                </Field>
                <Field label="Phone" required>
                  <input required className="input-field" value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                </Field>
                <Field label="Email">
                  <input type="email" className="input-field" value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                </Field>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { toast.success("Patient updated."); setEditing(null); }}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:shadow-lg transition-all">
                  Save Changes
                </button>
                <button onClick={() => setEditing(null)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
