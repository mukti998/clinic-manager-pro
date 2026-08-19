import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import {
  Heart,
  LogOut,
  Stethoscope,
} from "lucide-react";
import type { Role } from "@/convex/schema";

import SidebarNav from "@/components/dashboard/SidebarNav";

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

const ROLE_DEPARTMENT: Record<string, string> = {
  doctor: "doctor",
  pharmacist: "pharmacy",
  lab_technician: "laboratory",
  nurse: "nursing",
  admin: "admin",
  receptionist: "card_office",
};
const DEPT_LABELS: Record<string, string> = {
  card_office: "Card Office", doctor: "Doctor", laboratory: "Laboratory",
  pharmacy: "Pharmacy", nursing: "Nursing", radiology: "Radiology", admin: "Admin",
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const userRole = (user?.role as Role) || undefined;
  const handleSignOut = async () => { await signOut(); navigate("/"); };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-mesh bg-dots">
      <aside className="glass-strong flex w-64 flex-col border-r border-white/5">
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
            <Heart className="size-4.5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground font-mono">rayan</span>
        </div>
        {userRole && (
          <div className="mx-4 mb-2">
            <div className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
              <Stethoscope className="size-3.5 text-primary" />
              <span className="font-medium text-primary capitalize">{userRole.replace("_", " ")}</span>
              <span className="ml-auto text-muted-foreground">{DEPT_LABELS[ROLE_DEPARTMENT[userRole] || ""] || "general"}</span>
            </div>
          </div>
        )}
        <nav className="mt-4 flex-1">
          <SidebarNav role={userRole} />
        </nav>
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{user?.name?.[0]?.toUpperCase() || "U"}</div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate font-mono">{user?.email || "staff"}</p>
            </div>
            <button onClick={handleSignOut} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/50 hover:text-foreground" title="Sign out">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
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
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
