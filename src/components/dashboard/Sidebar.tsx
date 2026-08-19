import { NavLink, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  Activity,
  BarChart3,
  Beaker,
  BedDouble,
  ChevronLeft,
  ClipboardList,
  CreditCard,
  FlaskConical,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Pill,
  Search,
  Shield,
  Stethoscope,
  Users,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

// ─── Navigation group types ──────────────────────────────
interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  to: string;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

// ─── Role → Navigation mapping ───────────────────────────
function getNavigation(role: string | undefined): NavGroup[] {
  const overview: NavItem = { id: "home", icon: Home, label: "Overview", to: "/dashboard" };

  switch (role) {
    case "admin":
      return [
        { id: "main", label: "Main", items: [overview] },
        {
          id: "operations",
          label: "Operations",
          items: [
            { id: "patients", icon: Users, label: "All Patients", to: "/dashboard/patients" },
            { id: "staff", icon: Shield, label: "Staff Management", to: "/dashboard/admin-staff" },
          ],
        },
        {
          id: "finance",
          label: "Finance",
          items: [
            { id: "financial", icon: BarChart3, label: "Financial Reports", to: "/dashboard/admin-reports" },
          ],
        },
      ];

    case "doctor":
      return [
        { id: "main", label: "Main", items: [overview] },
        {
          id: "clinical",
          label: "Clinical",
          items: [
            { id: "dq", icon: ClipboardList, label: "My Queue", to: "/dashboard/doctor-queue" },
            { id: "patients", icon: Users, label: "Patient Records", to: "/dashboard/patients" },
          ],
        },
      ];

    case "receptionist":
      return [
        { id: "main", label: "Main", items: [overview] },
        {
          id: "front-desk",
          label: "Front Desk",
          items: [
            { id: "r", icon: UserPlus, label: "Register Patient", to: "/dashboard/register" },
            { id: "q", icon: Users, label: "Queue", to: "/dashboard/queue" },
            { id: "c", icon: CreditCard, label: "Checkout", to: "/dashboard/checkout" },
          ],
        },
      ];

    case "pharmacist":
      return [
        { id: "main", label: "Main", items: [overview] },
        {
          id: "pharmacy",
          label: "Pharmacy",
          items: [
            { id: "pq", icon: Pill, label: "Prescription Queue", to: "/dashboard/pharmacy-queue" },
          ],
        },
      ];

    case "lab_technician":
      return [
        { id: "main", label: "Main", items: [overview] },
        {
          id: "laboratory",
          label: "Laboratory",
          items: [
            { id: "lq", icon: FlaskConical, label: "Lab Orders", to: "/dashboard/lab-queue" },
          ],
        },
      ];

    case "nurse":
      return [
        { id: "main", label: "Main", items: [overview] },
        {
          id: "nursing",
          label: "Nursing",
          items: [
            { id: "na", icon: Heart, label: "Assigned Patients", to: "/dashboard/nurse-assignments" },
            { id: "v", icon: Activity, label: "Record Vitals", to: "/dashboard/vitals" },
          ],
        },
      ];

    default:
      return [
        { id: "main", label: "Main", items: [overview] },
        {
          id: "data",
          label: "Data",
          items: [{ id: "patients", icon: Users, label: "Patients", to: "/dashboard/patients" }],
        },
      ];
  }
}

const DEPT_NAMES: Record<string, string> = {
  card_office: "Card Office",
  doctor: "Doctor",
  laboratory: "Laboratory",
  pharmacy: "Pharmacy",
  nursing: "Nursing",
  admin: "Administration",
  radiology: "Radiology",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "badge-danger",
  doctor: "badge-info",
  nurse: "badge-success",
  receptionist: "badge-warning",
  pharmacist: "badge-primary",
  lab_technician: "badge-neutral",
};

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const role = (user?.role as string) || "user";
  const groups = getNavigation(role);

  return (
    <aside
      className={`flex h-screen flex-col border-r border-white/[0.06] bg-sidebar transition-all duration-200 ${
        collapsed ? "w-[68px]" : "w-60"
      }`}
    >
      {/* ─── Logo & Brand ─────────────────────────────── */}
      <div className="flex h-14 items-center gap-2.5 border-b border-white/[0.06] px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <Stethoscope className="size-4 text-primary" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground">
              Rayan
            </span>
            <span className="text-[10px] text-muted-foreground">
              Hospital System
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <ChevronLeft
            className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* ─── Navigation ──────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {groups.map((group) => (
          <div key={group.id}>
            {!collapsed && (
              <div className="sidebar-group-label">{group.label}</div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.to}
                  end={item.to === "/dashboard"}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── User Section ────────────────────────────── */}
      <div className="border-t border-white/[0.06] p-3">
        <div className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {DEPT_NAMES[(user as Record<string, unknown>)?.department as string] || role}
                </p>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                title="Sign out"
              >
                <LogOut className="size-3.5" />
              </button>
            </>
          )}
          {collapsed && (
            <button
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              title="Sign out"
            >
              <LogOut className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
