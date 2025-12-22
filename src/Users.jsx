import React, { useState, useEffect } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { Users as UsersIcon, Copy, Check, ShieldCheck } from "lucide-react";

const Users = () => {
  const { state, getBasicUserInfo } = useAuthContext();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const info = await getBasicUserInfo();
      
      // Based on your JSON, we map the available fields
      setUser({
        openid: info.sub,
        email: info.email || "Not provided",
        // Fallback logic: If displayName/givenName is missing, use email prefix
        name: info.displayName || info.username || info.email?.split('@')[0] || "User",
        firstName: info.givenName || "Not Provided",
        lastName: info.familyName || "Not Provided",
        orgName: info.orgName || "N/A",
        roles: info.roles || "Not Assigned",
        raw: info
      });
    } catch (err) {
      setError("Failed to load user information");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Loading profile...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        <UsersIcon className="w-8 h-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900">User Identity</h1>
      </div>

      {user && (
        <div className="grid gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 h-24"></div>
            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                  <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-3xl font-bold text-green-600">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {user.name}
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                  </h2>
                  <p className="text-gray-500">{user.email}</p>
                </div>
                <div className="px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-100 w-fit">
                  {user.orgName} Organization
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {/* ID Section */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase">Subject ID</span>
                    <button onClick={() => copyToClipboard(user.openid, 'sub')} className="text-gray-400 hover:text-green-600">
                      {copiedId === 'sub' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-sm font-mono text-gray-700 break-all">{user.openid}</p>
                </div>

                {/* Name Section */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase">Full Name</span>
                  <p className="text-sm text-gray-700 font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-orange-500 mt-1 italic">
                    {user.firstName === "Not Provided" ? "⚠️ Edit profile in Asgardeo to see names" : ""}
                  </p>
                </div>
              </div>

              {/* Debug Section */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <details className="group">
                  <summary className="cursor-pointer list-none text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center gap-2">
                    <span className="group-open:rotate-90 transition-transform">▶</span>
                    RAW TOKEN PAYLOAD
                  </summary>
                  <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-green-400 font-mono">
                      {JSON.stringify(user.raw, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;