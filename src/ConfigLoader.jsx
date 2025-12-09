import React, { useEffect, useState } from "react";

const ConfigLoader = ({ children }) => {
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    // Load config.js dynamically
    const script = document.createElement("script");
    script.src = "/config.js";
    script.async = false;
    script.onload = () => {
      console.log("✅ Config loaded:", window.config);

      // Set up fetch interceptor AFTER config is loaded
      setupFetchInterceptor();

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

      // Set up fetch interceptor with fallback config
      setupFetchInterceptor();

      setConfigLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Function to set up fetch interceptor
  const setupFetchInterceptor = () => {
    if (window._fetchInterceptorInstalled) {
      console.log("⚠️ Fetch interceptor already installed");
      return;
    }

    console.log("🔧 Setting up fetch interceptor...");
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
  };

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
