import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 3500,
          /* ── Base style: clean white card ── */
          style: {
            borderRadius: "14px",
            background: "#ffffff",
            color: "#0f172a",
            fontSize: "13px",
            fontWeight: "500",
            fontFamily: "Inter, system-ui, sans-serif",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 10px 32px -4px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)",
            padding: "12px 16px",
            maxWidth: "360px",
          },
          /* ── Per-type overrides ── */
          success: {
            iconTheme: { primary: "#16a34a", secondary: "#f0fdf4" },
            style: {
              borderRadius: "14px",
              background: "#ffffff",
              color: "#0f172a",
              fontSize: "13px",
              fontWeight: "500",
              fontFamily: "Inter, system-ui, sans-serif",
              border: "1px solid #bbf7d0",
              boxShadow:
                "0 10px 32px -4px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)",
              padding: "12px 16px",
              maxWidth: "360px",
            },
          },
          error: {
            iconTheme: { primary: "#dc2626", secondary: "#fef2f2" },
            style: {
              borderRadius: "14px",
              background: "#ffffff",
              color: "#0f172a",
              fontSize: "13px",
              fontWeight: "500",
              fontFamily: "Inter, system-ui, sans-serif",
              border: "1px solid #fecaca",
              boxShadow:
                "0 10px 32px -4px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)",
              padding: "12px 16px",
              maxWidth: "360px",
            },
          },
          loading: {
            iconTheme: { primary: "#0284c7", secondary: "#e0f2fe" },
          },
        }}
      />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
