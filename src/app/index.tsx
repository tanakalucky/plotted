import "./styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ErrorBoundary } from "@/app/providers/ErrorBoundary";
import { PlottedApp } from "@/pages/home";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <PlottedApp />
    </ErrorBoundary>
  </StrictMode>,
);
