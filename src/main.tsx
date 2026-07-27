import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AgencyPanel from "@/components/AgencyPanel";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Uygulama kök elementi bulunamadı.");
}

createRoot(root).render(
  <StrictMode>
    <AgencyPanel />
  </StrictMode>
);
