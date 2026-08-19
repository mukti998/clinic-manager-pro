import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";

import { RequireAuth } from "@/components/RequireAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

import Landing from "./pages/Landing";
import AuthPage from "./pages/Auth";
import NotFound from "./pages/NotFound";
import HomeView from "./pages/dashboard/HomeView";
import RegisterPatient from "./pages/dashboard/RegisterPatient";
import ReceptionistQueue from "./pages/dashboard/ReceptionistQueue";
import VisitDetail from "./pages/dashboard/VisitDetail";
import CheckoutView from "./pages/dashboard/CheckoutView";
import DoctorQueue from "./pages/dashboard/DoctorQueue";
import DoctorConsult from "./pages/dashboard/DoctorConsult";
import LabQueueView from "./pages/dashboard/LabQueueView";
import PharmacyQueueView from "./pages/dashboard/PharmacyQueueView";
import NurseAssignments from "./pages/dashboard/NurseAssignments";
import VitalsEntry from "./pages/dashboard/VitalsEntry";
import PatientListView from "./pages/dashboard/PatientListView";
import AdminFinancial from "./pages/dashboard/AdminFinancial";
import AdminStaff from "./pages/dashboard/AdminStaff";

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in WebContainer environment). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route
              path="/auth"
              element={<AuthPage redirectAfterAuth="/dashboard" />}
            />

            {/* Dashboard — auth guard, then layout, then pages */}
            <Route path="/dashboard" element={<RequireAuth />}>
              <Route element={<DashboardLayout />}>
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
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
