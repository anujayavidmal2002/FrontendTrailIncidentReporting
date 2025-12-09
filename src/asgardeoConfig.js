/**
 * Asgardeo SDK Configuration
 * Frontend-only OAuth2 authentication
 *
 * Uses window.config for runtime configuration (loaded from /config.js)
 * Config file can be updated via Choreo ConfigMap without rebuilding the app
 */

// Get runtime config from window.config (set by config.js file)
const getRuntimeConfig = () => {
  if (typeof window !== "undefined" && window.config) {
    return window.config;
  }
  // Default config for local development (can be overridden by config.js)
  return {
    baseUrl: "https://api.asgardeo.io/t/trailincidents",
    clientID: "ssebnfk92ztqREI0A8cI0qNy_o0a",
    signInRedirectURL: window.location.origin,
    signOutRedirectURL: window.location.origin,
    resourceServerURL: "http://localhost:3001",
  };
};

const config = getRuntimeConfig();

const asgardeoConfig = {
  clientID: config.clientID,
  baseUrl: config.baseUrl,
  signInRedirectURL: config.signInRedirectURL,
  signOutRedirectURL: config.signOutRedirectURL,
  scope: ["openid", "profile", "email"],
  resourceServerURLs: [config.resourceServerURL],
  clockTolerance: 300,
  // Enable session management and proper logout
  enablePKCE: true,
  storage: "sessionStorage", // Use session storage instead of localStorage for better security
};

// Log configuration (without sensitive data)
console.log("🔐 Asgardeo OAuth Configuration Loaded:", {
  clientID: asgardeoConfig.clientID ? "✓ Set" : "✗ Missing",
  baseUrl: asgardeoConfig.baseUrl,
  signInRedirectURL: asgardeoConfig.signInRedirectURL,
  scopes: asgardeoConfig.scope.join(", "),
  resourceServers: asgardeoConfig.resourceServerURLs,
});

export default asgardeoConfig;
