import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-mesh bg-dots">
      <div className="glass-strong rounded-2xl p-12 text-center max-w-md">
        <h1 className="text-2xl font-bold text-foreground mb-2">Rayan Hospital System</h1>
        <p className="text-sm text-muted-foreground">Convex + Router loaded</p>
      </div>
    </div>
  );
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </ConvexAuthProvider>
  </StrictMode>,
);
