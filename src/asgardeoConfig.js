/**
 * Asgardeo SDK Configuration
 * Frontend-only OAuth2 authentication
 */

const asgardeoConfig = {
  clientID:
    process.env.REACT_APP_ASGARDEO_CLIENT_ID || "u2yvUONka0RYJ5NE7sPTuNOP6Xoa",
  baseUrl:
    process.env.REACT_APP_ASGARDEO_BASE_URL ||
    "https://api.asgardeo.io/t/trekincidents",
  signInRedirectURL:
    process.env.REACT_APP_ASGARDEO_REDIRECT_URL || window.location.origin,
  signOutRedirectURL:
    process.env.REACT_APP_ASGARDEO_REDIRECT_URL || window.location.origin,
  scope: ["openid", "profile", "email"],
  resourceServerURLs: [
    process.env.REACT_APP_API_URL || "http://localhost:3001",
  ],
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
