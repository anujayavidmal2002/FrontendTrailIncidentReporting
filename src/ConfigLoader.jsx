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
      if (script.parentNode) {
        document.head.removeChild(script);
      }
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
