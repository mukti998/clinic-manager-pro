import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import MobileNav from "./MobileNav";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-mesh bg-dots">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto pb-4 md:pb-0">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
