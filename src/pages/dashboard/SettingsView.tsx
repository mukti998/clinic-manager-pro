import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { isDemoMode } from "@/lib/demo-data";
import { toast } from "sonner";
import {
  Building2, Database, Globe, Mail, Phone, Save, Shield, Users,
} from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/Shared";

const HOSPITAL_INFO = {
  name: "Rayan Hospital",
  address: "123 Medical Center Drive",
  phone: "+1 (555) 000-1234",
  email: "admin@rayan-hospital.org",
  website: "www.rayan-hospital.org",
  license: "MED-LIC-2024-001",
};

export default function SettingsView() {
  const { user } = useAuth();
  const role = user?.role as string | undefined;
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success("Settings saved successfully.");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
      <PageHeader title="Settings" description="Hospital configuration and system preferences" />

      {/* ─── Hospital Information ───────────────────── */}
      <div className="glass-card mt-6 p-5 md:p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
          <Building2 className="size-4 text-primary" /> Hospital Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hospital Name</label>
            <input className="input-field" defaultValue={HOSPITAL_INFO.name} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Address</label>
            <input className="input-field" defaultValue={HOSPITAL_INFO.address} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Phone className="size-3" /> Phone
            </label>
            <input className="input-field" defaultValue={HOSPITAL_INFO.phone} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Mail className="size-3" /> Email
            </label>
            <input className="input-field" defaultValue={HOSPITAL_INFO.email} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Globe className="size-3" /> Website
            </label>
            <input className="input-field" defaultValue={HOSPITAL_INFO.website} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Shield className="size-3" /> License Number
            </label>
            <input className="input-field" defaultValue={HOSPITAL_INFO.license} />
          </div>
        </div>
        <button onClick={handleSave}
          className="mt-5 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30">
          <Save className="size-4" /> {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* ─── Department Configuration ───────────────── */}
      <div className="glass-card mt-6 p-5 md:p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
          <Users className="size-4 text-primary" /> Departments
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {["Cardiology", "Pediatrics", "Orthopedics", "Neurology", "Oncology", "Emergency"].map((dept) => (
            <div key={dept} className="glass rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-foreground">{dept}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Active</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── System Information ─────────────────────── */}
      <div className="glass-card mt-6 p-5 md:p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
          <Database className="size-4 text-primary" /> System Information
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <span className="text-xs text-muted-foreground">Version</span>
            <span className="text-xs font-medium text-foreground">1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <span className="text-xs text-muted-foreground">Database</span>
            <span className="text-xs font-medium text-foreground">Convex</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-muted-foreground">Mode</span>
            <span className={`text-xs font-medium ${isDemoMode() ? "text-amber-400" : "text-emerald-400"}`}>
              {isDemoMode() ? "Demo" : "Live"}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Admin Only: Role Permissions ──────────── */}
      {role === "admin" && (
        <div className="glass-card mt-6 p-5 md:p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
            <Shield className="size-4 text-primary" /> Role Permissions
          </h3>
          <div className="space-y-3">
            {[
              { role: "Admin", access: "Full system access, financial reports, staff management" },
              { role: "Doctor", access: "Patient consultations, lab orders, prescriptions" },
              { role: "Nurse", access: "Vitals recording, patient assignments" },
              { role: "Receptionist", access: "Patient registration, payments, queue management" },
              { role: "Pharmacist", access: "Prescription queue, dispensing" },
              { role: "Lab Technician", access: "Lab orders, results entry" },
            ].map((r) => (
              <div key={r.role} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.role}</p>
                  <p className="text-xs text-muted-foreground">{r.access}</p>
                </div>
                <span className="badge badge-success text-[10px]">Active</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
