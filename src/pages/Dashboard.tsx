/**
 * This file is no longer used.
 * Routing is handled by main.tsx with nested routes inside DashboardLayout.
 * Individual page components are in src/pages/dashboard/
 */
import { Navigate } from "react-router";

export default function Dashboard() {
  // Fallback redirect if somehow reached directly
  return <Navigate to="/dashboard" replace />;
}
