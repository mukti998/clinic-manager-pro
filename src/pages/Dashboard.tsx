import { useState } from "react";
import { Routes, Route, NavLink, Navigate, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  Activity, ArrowLeft, BarChart3, ClipboardList, CreditCard, FlaskConical, Heart,
  Home, LogOut, Menu, Pill, Settings, Shield, Stethoscope, Users, UserPlus, Bell, X,
} from "lucide-react";
import type { Role } from "@/convex/schema";

import HomeView from "./dashboard/HomeView";
import RegisterPatient from "./dashboard/RegisterPatient";
import ReceptionistQueue from "./dashboard/ReceptionistQueue";
import VisitDetail from "./dashboard/VisitDetail";
import CheckoutView from "./dashboard/CheckoutView";
import DoctorQueue from "./dashboard/DoctorQueue";
import DoctorConsult from "./dashboard/DoctorConsult";
import LabQueueView from "./dashboard/LabQueueView";
import PharmacyQueueView from "./dashboard/PharmacyQueueView";
import NurseAssignments from "./dashboard/NurseAssignments";
import VitalsEntry from "./dashboard/VitalsEntry";
import PatientListView from "./dashboard/PatientListView";
import AdminFinancial from "./dashboard/AdminFinancial";
import AdminStaff from "./dashboard/AdminStaff";
import SettingsView from "./dashboard/SettingsView";

// ─── Role-based navigation groups ─────────────────────────
interface NavItem {
  id: string;
  icon: React.FC<{ className?: string }>;
  label: string;
  to: string;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

function getNavigation(role: string | undefined): NavGroup[] {
  const overview: NavItem = { id: "home", icon: Home, label: "Overview", to: "/dashboard" };
  const settings: NavItem = { id: "settings", icon: Settings, label: "Settings", to: "/dashboard/settings" };
  switch (role) {
    case "admin":
      return [
        { label: "Main", items: [overview] },
        { label: "Operations", items: [
          { id: "patients", icon: Users, label: "All Patients", to: "/dashboard/patients" },
          { id: "staff", icon: Shield, label: "Staff Management", to: "/dashboard/admin-staff" },
        ]},
        { label: "Finance", items: [
          { id: "financial", icon: BarChart3, label: "Financial Reports", to: "/dashboard/admin-reports" },
        ]},
        { label: "System", items: [settings] },
      ];
    case "doctor":
      return [
        { label: "Main", items: [overview] },
        { label: "Clinical", items: [
          { id: "dq", icon: ClipboardList, label: "My Queue", to: "/dashboard/doctor-queue" },
          { id: "patients", icon: Users, label: "Patient Records", to: "/dashboard/patients" },
        ]},
        { label: "System", items: [settings] },
      ];
    case "receptionist":
      return [
        { label: "Main", items: [overview] },
        { label: "Front Desk", items: [
          { id: "r", icon: UserPlus, label: "Register Patient", to: "/dashboard/register" },
          { id: "q", icon: Users, label: "Queue", to: "/dashboard/queue" },
          { id: "c", icon: CreditCard, label: "Checkout", to: "/dashboard/checkout" },
        ]},
        { label: "System", items: [settings] },
      ];
    case "pharmacist":
      return [
        { label: "Main", items: [overview] },
        { label: "Pharmacy", items: [
          { id: "pq", icon: Pill, label: "Prescription Queue", to: "/dashboard/pharmacy-queue" },
        ]},
        { label: "System", items: [settings] },
      ];
    case "lab_technician":
      return [
        { label: "Main", items: [overview] },
        { label: "Laboratory", items: [
          { id: "lq", icon: FlaskConical, label: "Lab Orders", to: "/dashboard/lab-queue" },
        ]},
        { label: "System", items: [settings] },
      ];
    case "nurse":
      return [
        { label: "Main", items: [overview] },
        { label: "Nursing", items: [
          { id: "na", icon: Heart, label: "Assigned Patients", to: "/dashboard/nurse-assignments" },
          { id: "v", icon: Activity, label: "Record Vitals", to: "/dashboard/vitals" },
        ]},
        { label: "System", items: [settings] },
      ];
    default:
      return [
        { label: "Main", items: [overview] },
        { label: "Data", items: [
          { id: "patients", icon: Users, label: "Patients", to: "/dashboard/patients" },
          settings,
        ]},
      ];
  }
}

const ROLE_BADGE: Record<string, string> = {
  admin: "badge-danger", doctor: "badge-info", nurse: "badge-success",
  receptionist: "badge-warning", pharmacist: "badge-primary", lab_technician: "badge-neutral",
};
const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator", doctor: "Doctor", nurse: "Nurse",
  receptionist: "Receptionist", pharmacist: "Pharmacist", lab_technician: "Lab Technician",
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = (user?.role as Role) || undefined;
  const groups = getNavigation(role);
  const isSubPage = location.pathname !== "/dashboard" && location.pathname !== "/dashboard/";

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-white/[0.06] px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
          <Stethoscope className="size-4 text-primary" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-bold tracking-tight text-foreground">Rayan</span>
          <p className="text-[10px] text-muted-foreground -mt-0.5">Hospital System</p>
        </div>
        <button onClick={() => setMobileOpen(false)} className="md:hidden rounded-md p-1.5 text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="sidebar-group-label">{group.label}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.to}
                  end={item.to === "/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      {/* User */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{user?.name || "User"}</p>
            <p className="text-[10px] text-muted-foreground truncate">{ROLE_LABELS[role || ""] || role || "User"}</p>
          </div>
          <button onClick={async () => { await signOut(); navigate("/"); }}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" title="Sign out">
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-mesh bg-dots">
      {/* ─── Desktop Sidebar ───────────────────────── */}
      <aside className="flex w-60 flex-col border-r border-white/[0.06] bg-sidebar shrink-0 hidden md:flex">
        <SidebarContent />
      </aside>

      {/* ─── Mobile Sidebar Overlay ────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex w-64 h-full flex-col border-r border-white/[0.06] bg-sidebar animate-in slide-in-from-left">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ─── Main Area ────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between border-b border-white/[0.06] bg-background/60 backdrop-blur-xl px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileOpen(true)} className="md:hidden rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
              <Menu className="size-4" />
            </button>
            {isSubPage && (
              <button onClick={() => navigate(-1)} className="hidden md:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                <ArrowLeft className="size-4" /> Back
              </button>
            )}
            <span className={`badge ${ROLE_BADGE[role || ""] || "badge-neutral"} capitalize hidden sm:inline-flex`}>
              {role?.replace(/_/g, " ") || "user"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-medium text-foreground leading-tight">{user?.name || "User"}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{user?.email || ""}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-enter">
            <Routes>
              <Route index element={<HomeView />} />
              <Route path="register" element={<RegisterPatient />} />
              <Route path="queue" element={<ReceptionistQueue />} />
              <Route path="queue/:visitId" element={<VisitDetail />} />
              <Route path="checkout" element={<CheckoutView />} />
              <Route path="doctor-queue" element={<DoctorQueue />} />
              <Route path="doctor-queue/:visitId" element={<DoctorConsult />} />
              <Route path="lab-queue" element={<LabQueueView />} />
              <Route path="pharmacy-queue" element={<PharmacyQueueView />} />
              <Route path="nurse-assignments" element={<NurseAssignments />} />
              <Route path="vitals" element={<VitalsEntry />} />
              <Route path="patients" element={<PatientListView />} />
              <Route path="admin-reports" element={<AdminFinancial />} />
              <Route path="admin-staff" element={<AdminStaff />} />
              <Route path="settings" element={<SettingsView />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
