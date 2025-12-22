import React, { useState, useEffect } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import {
  Leaf,
  ClipboardList,
  AlertTriangle,
  Menu,
  X,
  LogOut,
  FileText,
  DollarSign,
  MapPin,
  Building2,
  Users as UsersIcon,
} from "lucide-react";
import IncidentForm from "./IncidentForm";
import AdminDashboard from "./AdminDashboard";
import LoginPage from "./LoginPage";

import Users from "./Users";
import AllUsers from "./AllUsers";

// Use the proxy to access the backend API
export const API_URL = window.config?.resourceServerURL || "/api";

const VIEWS = {
  REPORT: "report",
  ADMIN: "admin",
  USERS: "users",
  ALL_USERS: "all_users",
};

export default function App() {
  const { state, isLoading, signOut, signIn } = useAuthContext();
  const [view, setView] = useState(VIEWS.REPORT);
  const [navOpen, setNavOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [hasManuallyLoggedIn, setHasManuallyLoggedIn] = useState(false);

  // Check if user has manually logged in this session
  useEffect(() => {
    const manualLogin = sessionStorage.getItem("manual_login");
    if (manualLogin === "true") {
      setHasManuallyLoggedIn(true);
    }
  }, []);

  // User login success handler
  const handleLoginSuccess = (userInfo) => {
    console.log("✅ Login successful:", userInfo);
    setUser(userInfo);
    setHasManuallyLoggedIn(true);
    sessionStorage.setItem("manual_login", "true");
  };

  const handleLogout = async () => {
    try {
      console.log("🔄 Starting logout process...");
      setUser(null);
      setHasManuallyLoggedIn(false);
      // Clear any local state first
      localStorage.clear();
      sessionStorage.clear();
      // Sign out from Asgardeo with session termination
      // This will redirect to Asgardeo logout page and end the session
      await signOut();
      console.log("✅ Logout successful - please log in again");
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (err) {
      console.error("❌ Logout error:", err);
      // Force logout even if there's an error
      setUser(null);
      setHasManuallyLoggedIn(false);
      localStorage.clear();
      sessionStorage.clear();
      // Force reload to clear all state
      window.location.href = "/";
    }
  };

  // Show login page if not authenticated OR if user hasn't manually logged in
  // This prevents automatic re-authentication from cached Asgardeo sessions
  if (!hasManuallyLoggedIn) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        authenticated={state?.isAuthenticated}
      />
    );
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Main app - user is authenticated
  return (
    <div className="min-h-screen flex bg-green-50">
      <aside
        className={`bg-white shadow-lg border-r border-green-100 transition-all duration-200 flex flex-col fixed left-0 top-0 bottom-0 ${
          navOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex items-center justify-between px-3 py-4 border-b border-green-100 flex-shrink-0">
          <div
            className={`flex items-center gap-2 text-lg font-bold text-primary ${
              navOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            } transition-opacity`}
          >
            <Leaf className="w-6 h-6 text-green-700" />
            <span>Trail Incidents</span>
          </div>
          <button
            className="p-2 rounded hover:bg-green-50 text-primary"
            onClick={() => setNavOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            {navOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-2">
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition hover:bg-green-50 ${
              view === VIEWS.ADMIN
                ? "bg-green-100 text-primary border border-green-200 shadow-sm"
                : "text-green-900"
            }`}
            onClick={() => setView(VIEWS.ADMIN)}
          >
            <ClipboardList size={16} />
            {navOpen && <span>Reported Incidents</span>}
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition hover:bg-green-50 ${
              view === VIEWS.REPORT
                ? "bg-green-100 text-primary border border-green-200 shadow-sm"
                : "text-green-900"
            }`}
            onClick={() => setView(VIEWS.REPORT)}
          >
            <ClipboardList size={16} />
            {navOpen && <span>Report Incident</span>}
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition hover:bg-green-50 ${
              view === VIEWS.USERS
                ? "bg-green-100 text-primary border border-green-200 shadow-sm"
                : "text-green-900"
            }`}
            onClick={() => setView(VIEWS.USERS)}
          >
            <UsersIcon size={16} />
            {navOpen && <span>My Profile</span>}
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition hover:bg-green-50 ${
              view === VIEWS.ALL_USERS
                ? "bg-green-100 text-primary border border-green-200 shadow-sm"
                : "text-green-900"
            }`}
            onClick={() => setView(VIEWS.ALL_USERS)}
          >
            <UsersIcon size={16} />
            {navOpen && <span>All Users</span>}
          </button>

          <div className="mt-4 pt-4 border-t border-green-100">
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition bg-red-100 text-red-800 border border-red-200 shadow hover:bg-red-200 w-full"
              onClick={() => window.open("tel:112")}
            >
              <AlertTriangle size={16} />
              {navOpen && <span>Emergency</span>}
            </button>
            <button
              className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition bg-gray-100 text-gray-800 border border-gray-200 shadow hover:bg-gray-200 w-full"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              {navOpen && <span>Logout</span>}
            </button>
          </div>
        </nav>
        <div
          className={`px-3 py-4 text-[11px] text-green-700 border-t border-green-100 mt-auto ${
            navOpen ? "block" : "hidden sm:block"
          }`}
        >
          Stay safe out there. 🌲
        </div>
      </aside>

      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          navOpen ? "ml-64" : "ml-16"
        }`}
      >
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-primary text-white shadow-md">
          <div className="flex items-center gap-2 text-xl font-bold">
            <Leaf className="w-7 h-7 text-green-100" />
            <span>Trail Incident Reporting</span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-50">
                  {user.email || user.given_name || "User"}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {view === VIEWS.REPORT && (
            <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full animate-fadeIn">
              <IncidentForm />
            </div>
          )}
          {view === VIEWS.ADMIN && (
            <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full animate-fadeIn">
              <AdminDashboard />
            </div>
          )}
          {view === VIEWS.USERS && (
            <div className="animate-fadeIn">
              <Users />
            </div>
          )}
          {view === VIEWS.ALL_USERS && (
            <div className="animate-fadeIn">
              <AllUsers />
            </div>
          )}

        </main>
        <footer className="text-center py-3 text-xs text-green-900 opacity-60 bg-green-100 mt-5">
          &copy; {new Date().getFullYear()} Trail Incident Reporting — Built
          with Nature in Mind 🌲
        </footer>
      </div>
    </div>
  );
}
