import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-mesh bg-dots">
      <div className="glass-strong rounded-2xl p-12 text-center max-w-md">
        <h1 className="text-2xl font-bold text-foreground mb-2">Test 2: Just Router</h1>
        <p className="text-sm text-muted-foreground">React Router loaded</p>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
