import React, { useState, useEffect } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { MapPin, Shield, Camera, Loader2, LogOut } from "lucide-react";

const LoginPage = ({ onLoginSuccess, authenticated }) => {
  const { signIn, signOut, state } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clearingSession, setClearingSession] = useState(false);
  const [alreadyProcessed, setAlreadyProcessed] = useState(false);

  // Check on mount if we need to clear automatic authentication
  useEffect(() => {
    const manualLogin = sessionStorage.getItem("manual_login");
    if ((state?.isAuthenticated || authenticated) && manualLogin !== "true") {
      // User is authenticated but didn't manually log in
      // Force sign out to clear Asgardeo session
      console.log("⚠️ Automatic authentication detected - clearing session");
      setClearingSession(true);
      const forceSignOut = async () => {
        try {
          localStorage.clear();
          sessionStorage.clear();
          await signOut();
          console.log("✅ Session cleared successfully");
        } catch (err) {
          console.error("Error during forced sign out:", err);
          localStorage.clear();
          sessionStorage.clear();
        } finally {
          setClearingSession(false);
        }
      };
      forceSignOut();
    }
  }, [state?.isAuthenticated, authenticated, signOut]);

  // Get user info from state directly (faster)
  const user = state?.isAuthenticated
    ? {
        email: state.email || state.username,
        given_name:
          state.displayName?.split(" ")[0] || state.username?.split("@")[0],
        family_name: state.displayName?.split(" ")[1] || "",
      }
    : null;

  // Only notify parent when authenticated AND user manually logged in
  useEffect(() => {
    const manualLogin = sessionStorage.getItem("manual_login");
    if (
      state?.isAuthenticated &&
      user &&
      onLoginSuccess &&
      manualLogin === "true" &&
      !alreadyProcessed
    ) {
      console.log("✅ User authenticated:", user);
      setAlreadyProcessed(true);
      onLoginSuccess(user);
    } else if (state?.isAuthenticated && manualLogin !== "true") {
      // If authenticated but no manual login flag, ignore it
      console.log(
        "⚠️ Automatic authentication detected - ignoring. Please click login button."
      );
    }
  }, [state?.isAuthenticated, user, onLoginSuccess, alreadyProcessed]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(
        "🔄 Initiating Asgardeo login with forced re-authentication..."
      );
      // Mark this as a manual login attempt
      sessionStorage.setItem("manual_login", "true");
      // CRITICAL: Add prompt parameter to force re-authentication
      await signIn({ prompt: "login" });
    } catch (err) {
      console.error("❌ Login failed:", err);
      setError("Login failed. Please try again.");
      setIsLoading(false);
      // Clear the manual login flag on error
      sessionStorage.removeItem("manual_login");
    }
  };

  const handleLogout = async () => {
    try {
      console.log("🔄 Logging out from Asgardeo...");
      setIsLoading(true);
      // Clear local storage and session storage first
      localStorage.clear();
      sessionStorage.clear();
      // Sign out from Asgardeo - this will redirect and end the session
      await signOut();
      setError(null);
      console.log("✅ Logout successful - please log in again");
      // Force page reload after a brief delay
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (err) {
      console.error("❌ Logout failed:", err);
      setError("Logout failed. Please try again.");
      setIsLoading(false);
      // Force clear storage even on error
      localStorage.clear();
      sessionStorage.clear();
      // Force reload on error
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  };

  // Only show welcome screen if authenticated AND manually logged in
  const manualLogin = sessionStorage.getItem("manual_login");

  // If we've already processed and notified parent, don't render anything
  if (alreadyProcessed) {
    return null; // Parent will handle rendering the main app
  }

  // Never show welcome screen without manual login flag
  if (manualLogin !== "true") {
    // Fall through to show login page below
  } else if (state?.isAuthenticated && user && manualLogin === "true") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Trail Incident Reporting
            </h1>
            <p className="text-gray-600">
              Report and track incidents with photo evidence
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user?.given_name?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    "U"}
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Welcome!</h2>
              <p className="text-gray-600 mt-2 break-all">
                {user?.email || user?.sub || "User"}
              </p>
              {user?.given_name && (
                <p className="text-sm text-gray-500 mt-1">
                  {user.given_name} {user?.family_name || ""}
                </p>
              )}
            </div>

            <div className="space-y-3 mb-8 bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-800 text-sm">
                ✓ Authentication Status:
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>Real Google authentication via Asgardeo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>Using your actual Google account</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>No test users - enterprise-grade security</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                console.log("🔄 Continuing to dashboard...");
                setAlreadyProcessed(true);
                if (onLoginSuccess && user) {
                  onLoginSuccess(user);
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Continue to Dashboard
            </button>

            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full mt-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </>
              )}
            </button>
          </div>

          <div className="text-center mt-6 text-sm text-gray-500">
            <p>Secured by WSO2 Asgardeo</p>
          </div>
        </div>
      </div>
    );
  }

  // Login page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trail Incident Reporting
          </h1>
          <p className="text-gray-600">
            Report and track incidents with photo evidence
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
            Sign In to Continue
          </h2>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-gray-700">
              <Camera className="w-5 h-5 text-blue-600" />
              <span>Upload incident photos</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Automatic GPS location detection</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Secure Google/Asgardeo authentication</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting to Asgardeo...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Sign in with Google via Asgardeo
              </>
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Enterprise Authentication
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            ✓ Real authentication with your actual Google account
            <br />
            ✓ No test users - enterprise-grade security
            <br />✓ Powered by WSO2 Asgardeo
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
