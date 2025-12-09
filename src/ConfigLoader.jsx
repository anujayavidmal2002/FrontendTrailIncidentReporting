import React, { useEffect, useState } from "react";

// Initialize fetch interceptor once at module load (before component mounts)
function initializeFetchInterceptor() {
  if (window._fetchInterceptorInstalled) {
    return; // Already installed
  }

  const originalFetch = window.fetch;

  window.fetch = function (...args) {
    let [url, options] = args;

    // If URL starts with /api/, prepend backend URL
    if (typeof url === "string" && url.startsWith("/api/")) {
      const backendUrl =
        window.config?.resourceServerURL || "http://localhost:3001";
      const newUrl = `${backendUrl}${url}`;
      console.log(`🔄 Redirecting API call: ${url} → ${newUrl}`);
      url = newUrl;
    }

    return originalFetch(url, options);
  };

  window._fetchInterceptorInstalled = true;
  console.log("✅ Fetch interceptor installed");
}

// Initialize immediately (synchronously, before React renders)
initializeFetchInterceptor();

const ConfigLoader = ({ children }) => {
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    // Check if config already loaded by static <script> tag in index.html
    if (window.config) {
      console.log("✅ Config already loaded:", window.config);
      setConfigLoaded(true);
      return;
    }

    // Fallback: Load config.js dynamically if not already loaded
    const script = document.createElement("script");
    script.src = "/config.js";
    script.async = false;
    script.onload = () => {
      console.log("✅ Config dynamically loaded:", window.config);
      setConfigLoaded(true);
    };
    script.onerror = () => {
      console.warn("⚠️ Config.js not found, using defaults");
      // Set default config
      window.config = {
        baseUrl: "https://api.asgardeo.io/t/trailincidents",
        clientID: "ssebnfk92ztqREI0A8cI0qNy_o0a",
        signInRedirectURL: "http://localhost:3000",
        signOutRedirectURL: "http://localhost:3000",
        resourceServerURL: "http://localhost:3001",
      };
      setConfigLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove the script node on cleanup to avoid DOM conflicts during HMR
      // The script has already executed; removing it won't change behavior
    };
  }, []);

  if (!configLoaded) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "sans-serif",
        }}
      >
        Loading configuration...
      </div>
    );
  }

  return children;
};

export default ConfigLoader;
