import {
  Activity,
  BarChart3,
  ClipboardList,
  CreditCard,
  FlaskConical,
  Heart,
  Home,
  Pill,
  Shield,
  Users,
  UserPlus,
} from "lucide-react";
import { NavLink } from "react-router";

function getNavForRole(role: string | undefined) {
  const base = [{ id: "home", icon: Home, label: "Overview", to: "/dashboard" }];
  switch (role) {
    case "receptionist":
      return [...base,
        { id: "register", icon: UserPlus, label: "Register", to: "/dashboard/register" },
        { id: "queue", icon: Users, label: "Queue", to: "/dashboard/queue" },
        { id: "checkout", icon: CreditCard, label: "Checkout", to: "/dashboard/checkout" },
      ];
    case "doctor":
      return [...base,
        { id: "doctor-queue", icon: ClipboardList, label: "My Queue", to: "/dashboard/doctor-queue" },
        { id: "patients", icon: Users, label: "Patients", to: "/dashboard/patients" },
      ];
    case "pharmacist":
      return [...base,
        { id: "pharmacy-queue", icon: Pill, label: "Prescriptions", to: "/dashboard/pharmacy-queue" },
      ];
    case "lab_technician":
      return [...base,
        { id: "lab-queue", icon: FlaskConical, label: "Lab Orders", to: "/dashboard/lab-queue" },
      ];
    case "nurse":
      return [...base,
        { id: "nurse-assignments", icon: Heart, label: "Assigned", to: "/dashboard/nurse-assignments" },
        { id: "vitals", icon: Activity, label: "Vitals", to: "/dashboard/vitals" },
      ];
    case "admin":
      return [...base,
        { id: "admin-reports", icon: BarChart3, label: "Financial", to: "/dashboard/admin-reports" },
        { id: "admin-staff", icon: Shield, label: "Staff", to: "/dashboard/admin-staff" },
        { id: "patients", icon: Users, label: "Patients", to: "/dashboard/patients" },
      ];
    default:
      return [...base, { id: "patients", icon: Users, label: "Patients", to: "/dashboard/patients" }];
  }
}

export default function SidebarNav({ role }: { role: string | undefined }) {
  const navItems = getNavForRole(role);

  return (
    <div className="space-y-1 px-3">
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.to}
          end={item.to === "/dashboard"}
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
    </div>
  );
}
