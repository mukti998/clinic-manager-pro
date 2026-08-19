import { NavLink } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  Activity,
  ClipboardList,
  CreditCard,
  FlaskConical,
  Heart,
  Home,
  Pill,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";

function getMobileNav(role: string | undefined) {
  const items = [{ id: "home", icon: Home, label: "Home", to: "/dashboard" }];

  switch (role) {
    case "receptionist":
      return [
        ...items,
        { id: "r", icon: UserPlus, label: "Register", to: "/dashboard/register" },
        { id: "q", icon: Users, label: "Queue", to: "/dashboard/queue" },
        { id: "c", icon: CreditCard, label: "Checkout", to: "/dashboard/checkout" },
      ];
    case "doctor":
      return [
        ...items,
        { id: "dq", icon: ClipboardList, label: "Queue", to: "/dashboard/doctor-queue" },
        { id: "p", icon: Users, label: "Patients", to: "/dashboard/patients" },
      ];
    case "pharmacist":
      return [
        ...items,
        { id: "pq", icon: Pill, label: "Rx Queue", to: "/dashboard/pharmacy-queue" },
      ];
    case "lab_technician":
      return [
        ...items,
        { id: "lq", icon: FlaskConical, label: "Lab", to: "/dashboard/lab-queue" },
      ];
    case "nurse":
      return [
        ...items,
        { id: "na", icon: Heart, label: "Assigned", to: "/dashboard/nurse-assignments" },
        { id: "v", icon: Activity, label: "Vitals", to: "/dashboard/vitals" },
      ];
    case "admin":
      return [
        ...items,
        { id: "as", icon: Shield, label: "Staff", to: "/dashboard/admin-staff" },
        { id: "ar", icon: CreditCard, label: "Finance", to: "/dashboard/admin-reports" },
        { id: "p", icon: Users, label: "Patients", to: "/dashboard/patients" },
      ];
    default:
      return [...items, { id: "p", icon: Users, label: "Patients", to: "/dashboard/patients" }];
  }
}

export default function MobileNav() {
  const { user } = useAuth();
  const role = (user?.role as string) || undefined;
  const items = getMobileNav(role);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-background/90 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <item.icon className="size-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
