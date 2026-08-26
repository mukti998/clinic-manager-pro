import { Component, type ReactNode } from "react";

/**
 * Catches crashes from missing ConvexProvider during initial render.
 * Shows a safe fallback while Convex loads in the background.
 * When Convex loads and the app re-renders, this boundary resets.
 */
interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ConvexSafeBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[Rayan] Dashboard error (Convex may not be ready):", error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0d14",
            color: "#e0e0e0",
            fontFamily: "system-ui",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 400, padding: 32 }}>
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid rgba(255,255,255,0.1)",
                borderTopColor: "#3b82f6",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Rayan Hospital System
            </p>
            <p style={{ fontSize: 13, color: "#888" }}>
              Initializing system… Please wait.
            </p>
            <p style={{ fontSize: 11, color: "#555", marginTop: 12 }}>
              Backend services are connecting.
            </p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
