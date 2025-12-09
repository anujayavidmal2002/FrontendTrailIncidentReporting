import React from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "@asgardeo/auth-react";
import asgardeoConfig from "./asgardeoConfig";
import App from "./App";
import ConfigLoader from "./ConfigLoader";
import "./global.css";

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
