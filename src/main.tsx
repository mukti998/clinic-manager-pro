import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";

function App() {
  return (
    <div style={{ background: "#0a0a1a", color: "white", padding: "40px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>Rayan Hospital System</h1>
      <p style={{ color: "#88aaff" }}>Convex + Router loaded.</p>
    </div>
  );
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="*" element={<App />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ConvexAuthProvider>
  </StrictMode>,
);
