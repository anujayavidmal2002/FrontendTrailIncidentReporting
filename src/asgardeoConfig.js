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
    baseUrl: "https://api.asgardeo.io/t/choreolabs",
    clientID: "uNGhoKNMeoYtQPQDlWH771IXbV0a",
    signInRedirectURL: window.location.origin,
    signOutRedirectURL: window.location.origin,
    resourceServerURL: "http://localhost:8000/api",
  };
};

const config = getRuntimeConfig();

const asgardeoConfig = {
  clientID: config.clientID,
  baseUrl: config.baseUrl,
  signInRedirectURL: config.signInRedirectURL,
  signOutRedirectURL: config.signOutRedirectURL,
  // Add SCIM API scopes for user management
  scope: [
    "openid",
    "profile",
    "email",
    "roles",
    "groups",
    "internal_user_mgt_view",    // View user accounts in the organization
    "internal_user_mgt_list",    // Search/list user accounts in the organization
    "internal_user_mgt_create",  // Create new user accounts in the organization
    "internal_user_mgt_update",  // Update user accounts in the organization
    "internal_user_mgt_delete",  // Delete user accounts in the organization
  ],
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
