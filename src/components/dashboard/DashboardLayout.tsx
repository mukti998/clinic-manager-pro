import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-mesh bg-dots">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
