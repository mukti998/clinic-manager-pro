import { useAuth } from "@/hooks/use-auth";
import { Bell, ChevronRight, Search } from "lucide-react";
import { useLocation, Link } from "react-router";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Overview",
  register: "Register Patient",
  queue: "Queue",
  checkout: "Checkout",
  "doctor-queue": "Doctor Queue",
  "lab-queue": "Lab Orders",
  "pharmacy-queue": "Pharmacy",
  "nurse-assignments": "Nursing",
  vitals: "Record Vitals",
  patients: "Patients",
  "admin-reports": "Financial Reports",
  "admin-staff": "Staff Management",
};

function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  // Skip "dashboard" segment since it's always the root
  const crumbs = segments.slice(1); // Remove "dashboard"

  if (crumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground">
      <Link to="/dashboard" className="hover:text-foreground transition-colors">
        Dashboard
      </Link>
      {crumbs.map((segment, i) => {
        const isLast = i === crumbs.length - 1;
        const label = ROUTE_LABELS[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
        return (
          <span key={segment} className="flex items-center gap-1">
            <ChevronRight className="size-3" />
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <span>{label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default function TopHeader() {
  const { user } = useAuth();
  const role = (user?.role as string)?.replace(/_/g, " ") || "user";

  const ROLE_BADGE: Record<string, string> = {
    admin: "badge-danger",
    doctor: "badge-info",
    nurse: "badge-success",
    receptionist: "badge-warning",
    pharmacist: "badge-primary",
    "lab technician": "badge-neutral",
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/[0.06] bg-background/60 backdrop-blur-xl px-6">
      <div className="flex items-center gap-4">
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span className={`badge ${ROLE_BADGE[role] || "badge-neutral"} capitalize hidden sm:inline-flex`}>
          {role}
        </span>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
        </button>

        {/* User avatar */}
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
  );
}
