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

    // Wait for config to be set by the static script tag in index.html
    let attempts = 0;
    const maxAttempts = 50; // ~5 seconds with 100ms intervals
    let isMounted = true;

    const checkConfig = () => {
      if (!isMounted) return;

      if (window.config) {
        console.log("✅ Config loaded:", window.config);
        setConfigLoaded(true);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkConfig, 100);
      } else {
        // Fallback: timeout reached, use default config
        console.warn("⚠️ Config.js timeout, using defaults");
        window.config = {
          baseUrl: "https://api.asgardeo.io/t/trailincidents",
          clientID: "ssebnfk92ztqREI0A8cI0qNy_o0a",
          signInRedirectURL: "http://localhost:3000",
          signOutRedirectURL: "http://localhost:3000",
          resourceServerURL: "http://localhost:8000/api",
        };
        if (isMounted) {
          setConfigLoaded(true);
        }
      }
    };

    checkConfig();

    return () => {
      isMounted = false;
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
