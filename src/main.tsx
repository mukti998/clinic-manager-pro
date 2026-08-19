import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { Toaster } from "sonner";
import "./index.css";

import Landing from "./pages/Landing.tsx";
import AuthPage from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import { RequireAuth } from "@/components/RequireAuth";
import { ConvexReactClient } from "convex/react";
import { isConvexConfigured, enableDemoMode } from "@/lib/demo-data";
import { DemoConvexClient } from "@/lib/demo-convex-client";

import type { ReactNode } from "react";
import { Component } from "react";

// ─── Error Boundary ──────────────────────────────────────
interface ErrorBoundaryState { hasError: boolean; error: Error | null }
class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0d14", color: "#e0e0e0", fontFamily: "system-ui" }}>
          <div style={{ textAlign: "center", maxWidth: 480, padding: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Something went wrong</h1>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>{this.state.error?.message || "An unexpected error occurred."}</p>
            <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              style={{ padding: "10px 24px", borderRadius: 8, background: "#3b82f6", color: "#fff", border: "none", fontSize: 14, cursor: "pointer" }}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Create Convex client (real or demo) ─────────────────
let convexClient: any;

if (isConvexConfigured()) {
  convexClient = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
} else {
  enableDemoMode();
  convexClient = new DemoConvexClient();
}

// ─── App Routes ──────────────────────────────────────────
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// ─── Render ──────────────────────────────────────────────
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ConvexAuthProvider client={convexClient}>
        <AppRoutes />
      </ConvexAuthProvider>
      <Toaster theme="dark" position="top-right" />
    </ErrorBoundary>
  </StrictMode>,
);
