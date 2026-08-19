import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

function App() {
  return (
    <div style={{ background: "#0a0a1a", color: "white", padding: "40px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>Rayan Hospital System</h1>
      <p style={{ color: "#88aaff" }}>If you see this, the app is loading correctly.</p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
