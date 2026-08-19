import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import {
  Activity,
  BarChart3,
  Heart,
  Home,
  LogOut,
  Pill,
  Stethoscope,
  Users,
  UserPlus,
  ClipboardList,
  CreditCard,
  FlaskConical,
  Shield,
} from "lucide-react";
import type { Role } from "@/convex/schema";
import { NavLink } from "react-router";

const ROLE_DEPARTMENT: Record<string, string> = {
  doctor: "doctor",
  pharmacist: "pharmacy",
  lab_technician: "laboratory",
  nurse: "nursing",
  admin: "admin",
  receptionist: "card_office",
};

const DEPT_LABELS: Record<string, string> = {
  card_office: "Card Office",
  doctor: "Doctor",
  laboratory: "Laboratory",
  pharmacy: "Pharmacy",
  nursing: "Nursing",
  radiology: "Radiology",
  admin: "Admin",
};

interface NavItem {
  id: string;
  icon: React.FC<{ className?: string }>;
  label: string;
  to: string;
}

function getNavForRole(role: string | undefined): NavItem[] {
  const base = [{ id: "home", icon: Home, label: "Overview", to: "/dashboard" }];
  switch (role) {
    case "receptionist":
      return [
        ...base,
        { id: "register", icon: UserPlus, label: "Register", to: "/dashboard/register" },
        { id: "queue", icon: Users, label: "Queue", to: "/dashboard/queue" },
        { id: "checkout", icon: CreditCard, label: "Checkout", to: "/dashboard/checkout" },
      ];
    case "doctor":
      return [
        ...base,
        { id: "doctor-queue", icon: ClipboardList, label: "My Queue", to: "/dashboard/doctor-queue" },
        { id: "patients", icon: Users, label: "Patients", to: "/dashboard/patients" },
      ];
    case "pharmacist":
      return [
        ...base,
        { id: "pharmacy-queue", icon: Pill, label: "Prescriptions", to: "/dashboard/pharmacy-queue" },
      ];
    case "lab_technician":
      return [
        ...base,
        { id: "lab-queue", icon: FlaskConical, label: "Lab Orders", to: "/dashboard/lab-queue" },
      ];
    case "nurse":
      return [
        ...base,
        { id: "nurse-assignments", icon: Heart, label: "Assigned", to: "/dashboard/nurse-assignments" },
        { id: "vitals", icon: Activity, label: "Vitals", to: "/dashboard/vitals" },
      ];
    case "admin":
      return [
        ...base,
        { id: "admin-reports", icon: BarChart3, label: "Financial", to: "/dashboard/admin-reports" },
        { id: "admin-staff", icon: Shield, label: "Staff", to: "/dashboard/admin-staff" },
        { id: "patients", icon: Users, label: "Patients", to: "/dashboard/patients" },
      ];
    default:
      return [...base, { id: "patients", icon: Users, label: "Patients", to: "/dashboard/patients" }];
  }
}

export function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const userRole = (user?.role as Role) || undefined;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = getNavForRole(userRole);

  return (
    <aside className="glass-strong flex w-64 flex-col border-r border-white/5">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
          <Heart className="size-4.5 text-primary" />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground font-mono">
          rayan
        </span>
      </div>

      {userRole && (
        <div className="mx-4 mb-2">
          <div className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
            <Stethoscope className="size-3.5 text-primary" />
            <span className="font-medium text-primary capitalize">
              {userRole.replace("_", " ")}
            </span>
            <span className="ml-auto text-muted-foreground">
              {DEPT_LABELS[ROLE_DEPARTMENT[userRole] || ""] || "general"}
            </span>
          </div>
        </div>
      )}

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.id === "home"}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "glass bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/40 hover:text-foreground"
              }`
            }
          >
            <item.icon className="size-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate font-mono">
              {user?.email || "staff"}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/50 hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
