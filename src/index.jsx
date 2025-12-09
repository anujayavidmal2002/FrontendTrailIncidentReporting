import React from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "@asgardeo/auth-react";
import asgardeoConfig from "./asgardeoConfig";
import App from "./App";
import ConfigLoader from "./ConfigLoader";
import "./global.css";

// Intercept fetch to redirect API calls to backend
const originalFetch = window.fetch;
window.fetch = function (...args) {
  let [url, options] = args;

  // If URL starts with /api/, prepend backend URL
  if (typeof url === "string" && url.startsWith("/api/")) {
    const backendUrl =
      window.config?.resourceServerURL || "http://localhost:3001";
    url = `${backendUrl}${url}`;
    console.log("🔄 Redirecting API call to:", url);
  }

  return originalFetch(url, options);
};

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ConfigLoader>
      <AuthProvider config={asgardeoConfig}>
        <App />
      </AuthProvider>
    </ConfigLoader>
  </React.StrictMode>
);
