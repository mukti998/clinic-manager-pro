import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { Suspense, lazy } from "react";
import "./index.css";
import { ConvexSafeBoundary } from "@/components/ConvexSafeBoundary";

import type { ReactNode } from "react";
import { Component } from "react";

// ═══════════════════════════════════════════════════════════
// Error Boundary — always visible, never white-screen
// ═══════════════════════════════════════════════════════════
interface EBState { hasError: boolean; error: Error | null }
class RootErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false, error: null };
  static getDerivedStateFromError(e: Error) { return { hasError: true, error: e }; }
  componentDidCatch(e: Error, info: React.ErrorInfo) { console.error("[Rayan]", e, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0d14", color: "#e0e0e0", fontFamily: "system-ui" }}>
          <div style={{ textAlign: "center", maxWidth: 520, padding: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Rayan — Something went wrong</h1>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 24, fontFamily: "monospace", wordBreak: "break-word" }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
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

// ═══════════════════════════════════════════════════════════
// Loading spinner for lazy-loaded pages
// ═══════════════════════════════════════════════════════════
function Loading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0d14" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ fontSize: 14, color: "#888" }}>Loading Rayan…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Lazy-loaded pages — NO top-level Convex imports in any of these
// ═══════════════════════════════════════════════════════════
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// ═══════════════════════════════════════════════════════════
// App Shell — the actual routing tree
// ═══════════════════════════════════════════════════════════
function AppShell() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Suspense fallback={<Loading />}><Landing /></Suspense>} />
        <Route path="/auth" element={<Suspense fallback={<Loading />}><AuthPage redirectAfterAuth="/dashboard" /></Suspense>} />
        <Route path="/dashboard" element={
          <ConvexSafeBoundary>
            <Suspense fallback={<Loading />}>
              <Suspense fallback={<Loading />}>
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              </Suspense>
            </Suspense>
          </ConvexSafeBoundary>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// Lazy RequireAuth
const RequireAuth = lazy(() =>
  import("@/components/RequireAuth").then((m) => ({ default: m.RequireAuth }))
);

// ═══════════════════════════════════════════════════════════
// Phase 1: RENDER IMMEDIATELY (synchronous, no awaits)
// This ensures the UI is visible within milliseconds.
// ═══════════════════════════════════════════════════════════
function renderSync() {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <RootErrorBoundary>
        <AppShell />
      </RootErrorBoundary>
    </StrictMode>
  );
}

// ═══════════════════════════════════════════════════════════
// Phase 2: Set up Convex in background (after UI is visible)
// If Convex fails, app still works in demo mode.
// ═══════════════════════════════════════════════════════════
async function setupConvexInBackground() {
  try {
    // Try to load Convex — timeout after 5 seconds
    const result = await Promise.race([
      Promise.all([
        import("@convex-dev/auth/react"),
        import("convex/react"),
        import("@/lib/demo-data"),
      ]),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Convex load timeout")), 5000)),
    ]);

    const [authMod, convexMod, dataMod] = result;
    const { isConvexConfigured, enableDemoMode } = dataMod;

    if (!isConvexConfigured()) {
      enableDemoMode();
      console.log("[Rayan] Demo mode active (no VITE_CONVEX_URL)");
      return;
    }

    // Initialize Convex hooks for use-auth.ts
    const { initConvexHooks } = await import("@/hooks/use-auth");
    initConvexHooks({
      useConvexAuth: convexMod.useConvexAuth,
      useQuery: convexMod.useQuery,
      useAuthActions: authMod.useAuthActions,
    });

    // Create client
    const url = import.meta.env.VITE_CONVEX_URL as string;
    const ConvexReactClient = convexMod.ConvexReactClient;
    const client = new ConvexReactClient(url);

    // Re-render with ConvexAuthProvider
    const { ConvexAuthProvider } = authMod;
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <RootErrorBoundary>
          <ConvexAuthProvider client={client}>
            <AppShell />
          </ConvexAuthProvider>
        </RootErrorBoundary>
      </StrictMode>
    );

    console.log("[Rayan] Convex connected:", url);
  } catch (err) {
    console.warn("[Rayan] Convex setup failed, using demo mode:", err);
    try {
      const { enableDemoMode } = await import("@/lib/demo-data");
      enableDemoMode();
    } catch { /* ignore */ }
  }
}

// ═══════════════════════════════════════════════════════════
// BOOT: render immediately, then set up Convex async
// ═══════════════════════════════════════════════════════════
renderSync();
setupConvexInBackground();
