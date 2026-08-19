import "@vly-ai/integrations";
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";

// Eager imports for reliability — avoids lazy-load chunk failures in production
import Landing from "./pages/Landing.tsx";
import AuthPage from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import DashboardLayout from "./components/dashboard/DashboardLayout.tsx";
import HomeView from "./pages/dashboard/HomeView.tsx";
import RegisterPatient from "./pages/dashboard/RegisterPatient.tsx";
import ReceptionistQueue from "./pages/dashboard/ReceptionistQueue.tsx";
import VisitDetail from "./pages/dashboard/VisitDetail.tsx";
import CheckoutView from "./pages/dashboard/CheckoutView.tsx";
import DoctorQueue from "./pages/dashboard/DoctorQueue.tsx";
import DoctorConsult from "./pages/dashboard/DoctorConsult.tsx";
import LabQueueView from "./pages/dashboard/LabQueueView.tsx";
import PharmacyQueueView from "./pages/dashboard/PharmacyQueueView.tsx";
import NurseAssignments from "./pages/dashboard/NurseAssignments.tsx";
import VitalsEntry from "./pages/dashboard/VitalsEntry.tsx";
import PatientListView from "./pages/dashboard/PatientListView.tsx";
import AdminFinancial from "./pages/dashboard/AdminFinancial.tsx";
import AdminStaff from "./pages/dashboard/AdminStaff.tsx";

function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="relative size-8">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
        </div>
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error) { console.warn("[VlyToolbar] Caught error:", err.message); }
  render() { return this.state.hasError ? null : this.props.children; }
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || "Unknown error", stack: error.stack || "" };
  }
  componentDidCatch(err: Error) { console.error("[Root crash]:", err); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 mx-auto mb-4">
              <span className="text-xl">⚠</span>
            </div>
            <p className="text-sm font-semibold">Runtime Error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">{this.state.message}</p>
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
    window.parent.postMessage({ type: "iframe-route-change", path: location.pathname }, "*");
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
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />

              {/* Dashboard routes — RequireAuth guards, DashboardLayout provides shell */}
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
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
