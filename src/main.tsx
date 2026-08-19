import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div style={{ background: "#0a0a1a", color: "white", padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Test 1: Just React + CSS</h1>
    </div>
  </StrictMode>,
);
