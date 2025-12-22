import React, { useState, useEffect } from "react";
import { Users as UsersIcon, Copy, Check } from "lucide-react";
import { useAuthContext } from "@asgardeo/auth-react";
import { API_URL } from "./App";

const AllUsers = () => {
  const { state, getBasicUserInfo, getAccessToken } = useAuthContext();
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    userName: "",
    email: "",
    givenName: "",
    familyName: "",
    password: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Get current user info
      const info = await getBasicUserInfo();

      setCurrentUser({
        openid: info.sub,
        email: info.email,
        name: info.displayName || info.username || info.email?.split("@")[0] || "User",
        firstName: info.givenName || "Not Provided",
        lastName: info.familyName || "Not Provided",
        orgName: info.orgName || "N/A",
        role: info.role || "Not Assigned",
        roles: Array.isArray(info.roles) ? info.roles : [],
        jobTitle: info["urn:scim:schemas:extension:enterprise:2.0:User"]?.jobTitle || "Not Provided",
        manager: info["urn:scim:schemas:extension:enterprise:2.0:User"]?.manager?.displayName || "N/A",
        raw: info,
      });

      // Fetch all users via SCIM
      await fetchUsersViaSCIM();
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Failed to load user information from Asgardeo");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersViaSCIM = async () => {
    try {
      // Call Laravel backend API instead of Asgardeo directly
      const backendEndpoint = `${API_URL}/users`;

      // Get the actual access token using the Asgardeo SDK method
      const token = await getAccessToken();

      if (!token) {
        console.error("❌ No access token available!");
        setError("Authentication token missing. Please log in again.");
        return;
      }

      console.log("📡 Fetching users from Laravel backend:", backendEndpoint);
      console.log("🔑 Access token available: ✓");

      const response = await fetch(backendEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Use standard Authorization Bearer header
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("📊 Backend Response Status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Users fetched successfully:", data.Resources?.length || 0, "users");

        if (data.Resources && Array.isArray(data.Resources)) {
          const formattedUsers = data.Resources.map((user) => {
            const enterprise = user["urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"] || {};
            return {
              id: user.id,
              userName: user.userName,
              email: user.emails?.[0]?.value || "N/A",
              displayName: user.displayName || user.userName,
              givenName: user.name?.givenName || "N/A",
              familyName: user.name?.familyName || "N/A",
              jobTitle: enterprise.jobTitle || "Not Assigned",
              organization: enterprise.organization || "N/A",
              manager: enterprise.manager?.displayName || "N/A",
              department: enterprise.department || "N/A",
              roles: user.roles?.map((r) => r.display || r.value) || [],
              active: user.active,
              createdAt: user.meta?.created,
              lastModified: user.meta?.lastModified,
              raw: user,
            };
          });
          setAllUsers(formattedUsers);
        }
      } else if (response.status === 403) {
        console.error("🚫 403 Forbidden - Backend lacks SCIM permissions");
        setError("Backend server lacks required SCIM permissions. Check server configuration.");
      } else if (response.status === 401) {
        console.error("🔐 401 Unauthorized - SCIM API requires service account credentials");
        setError("Your account doesn't have permission to access the SCIM API. A service account with M2M credentials is required to manage users. Contact your administrator to configure Asgardeo service accounts.");
      } else {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status}:`, errorText);
        setError(`API error: ${response.status}. Check console for details.`);
      }
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      setError("Failed to connect to backend server. Make sure it's running on port 8000.");
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const backendEndpoint = `${API_URL}/users`;

      // Get the actual access token using the Asgardeo SDK method
      const token = await getAccessToken();

      if (!token) {
        console.error("❌ No access token available!");
        setError("Authentication token missing. Please log in again.");
        return;
      }

      const payload = {
        userName: newUserForm.userName,
        email: newUserForm.email,
        givenName: newUserForm.givenName,
        familyName: newUserForm.familyName,
        password: newUserForm.password,
        active: true,
      };

      const response = await fetch(backendEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("✅ User created successfully!");
        setNewUserForm({ userName: "", email: "", givenName: "", familyName: "", password: "" });
        setShowCreateModal(false);
        fetchUserData();
      } else if (response.status === 403) {
        setError("You don't have permission to create users. Check server SCIM configuration.");
      } else if (response.status === 422) {
        const errorData = await response.json();
        setError(`Validation error: ${JSON.stringify(errorData.messages)}`);
      } else {
        const errorData = await response.text();
        setError(`Failed to create user: ${response.status} - ${errorData}`);
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError("Failed to create user. Make sure backend is running.");
    }
  };

  const updateUser = async (userId, updatedData) => {
    try {
      const asgardeoBaseUrl = window.config?.baseUrl || "https://api.asgardeo.io/t/choreolabs";
      const scimEndpoint = `${asgardeoBaseUrl}/scim2/Users/${userId}`;

      const response = await fetch(scimEndpoint, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${state?.access_token}`,
          "Content-Type": "application/scim+json",
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert("✅ User updated successfully!");
        fetchUserData();
      } else if (response.status === 403) {
        setError("You don't have permission to update users (internal_org_user_mgt_update scope required)");
      } else {
        setError(`Failed to update user: ${response.status}`);
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update user");
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userName}?`)) {
      return;
    }

    try {
      const backendEndpoint = `${API_URL}/users/${userId}`;

      // Get the actual access token using the Asgardeo SDK method
      const token = await getAccessToken();

      if (!token) {
        console.error("❌ No access token available!");
        setError("Authentication token missing. Please log in again.");
        return;
      }

      const response = await fetch(backendEndpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("✅ User deleted successfully!");
        fetchUserData();
      } else if (response.status === 403) {
        setError("You don't have permission to delete users. Check server SCIM configuration.");
      } else if (response.status === 404) {
        setError("User not found");
      } else {
        setError(`Failed to delete user: ${response.status}`);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user. Make sure backend is running.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information from SCIM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        <UsersIcon className="w-8 h-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "profile"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Profile
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${
            activeTab === "users"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          All Users {allUsers.length > 0 && <span className="ml-1 text-xs bg-green-600 text-white rounded-full px-2 py-0.5">{allUsers.length}</span>}
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && currentUser && (
        <div className="grid gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 h-24"></div>
            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
              <p className="text-gray-600">{currentUser.email}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {/* OpenID Section */}
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase">OpenID (Subject)</span>
                    <button
                      onClick={() => copyToClipboard(currentUser.openid, "openid")}
                      className="text-gray-400 hover:text-green-600"
                    >
                      {copiedId === "openid" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-sm font-mono text-gray-700 break-all">{currentUser.openid}</p>
                </div>

                {/* Email Section */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase">Email</span>
                    <button
                      onClick={() => copyToClipboard(currentUser.email, "email")}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      {copiedId === "email" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-sm font-mono text-gray-700 break-all">{currentUser.email}</p>
                </div>

                {/* Profile Section */}
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-xs font-bold text-gray-400 uppercase">Full Name</span>
                  <p className="text-sm text-gray-700 font-medium mt-2">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                </div>

                {/* Organization Section */}
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <span className="text-xs font-bold text-gray-400 uppercase">Organization</span>
                  <p className="text-sm text-gray-700 font-medium mt-2">{currentUser.orgName}</p>
                </div>



                {/* Roles List Section */}
                {Array.isArray(currentUser?.roles) && currentUser.roles.length > 0 && (
                  <div className="p-4 bg-pink-50 rounded-xl border border-pink-100 md:col-span-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">All Assigned Roles</span>
                    <div className="mt-3 flex flex-wrap gap-2">
{Array.isArray(currentUser?.roles) ? (
  currentUser.roles.map((role, idx) => (
    <span
      key={idx}
      className="inline-block px-3 py-1 bg-pink-200 text-pink-900 text-xs font-semibold rounded-full mr-1"
    >
      {typeof role === 'object' ? (role.display || role.value) : role}
    </span>
  ))
) : (
  <span className="text-gray-500 text-xs italic">No roles assigned</span>
)}
                    </div>
                  </div>
                )}
              </div>

              {/* Debug Section */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <details className="group">
                  <summary className="cursor-pointer list-none text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center gap-2">
                    <span className="group-open:rotate-90 transition-transform">▶</span>
                    RAW USER DATA FROM ASGARDEO
                  </summary>
                  <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-green-400 font-mono">{JSON.stringify(currentUser.raw, null, 2)}</pre>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              + Create New User
            </button>
          </div>

          {/* Create User Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Create New User</h2>
                <form onSubmit={createUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={newUserForm.userName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, userName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={newUserForm.givenName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, givenName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={newUserForm.familyName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, familyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Last Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Password"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                    >
                      Create User
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {allUsers.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-600 mb-2">No users found via SCIM API</p>
              {error && error.includes("SCIM") && (
                <p className="text-xs text-gray-500 mt-2">Note: User management requires Asgardeo service account configuration</p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Organization</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Job Title</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Roles</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-3 text-sm font-mono text-gray-900">{user.email}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">
                          <div className="font-medium">{user.displayName}</div>
                          <div className="text-xs text-gray-500">
                            {user.givenName} {user.familyName}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-700">{user.organization}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{user.jobTitle}</td>
                        <td className="px-6 py-3 text-sm">
                          {Array.isArray(user.roles) && user.roles.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map((role, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded"
                                >
                                  {typeof role === 'object' ? (role.display || role.value) : role}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">No roles</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {user.active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => deleteUser(user.id, user.displayName)}
                            className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded hover:bg-red-200 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Information */}
      <div className="mt-8 space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">About User Information (SCIM 2.0):</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>OpenID (Subject):</strong> Your unique identifier from Asgardeo</li>
            <li>• <strong>Email:</strong> Your email address from your Asgardeo account</li>
            <li>• <strong>Profile:</strong> Your name information from Asgardeo</li>
            <li>• <strong>Organization:</strong> Your organization from Asgardeo profile (SCIM enterprise extension)</li>
            <li>• <strong>Job Title:</strong> Your job title from enterprise extension (SCIM)</li>
            <li>• <strong>Department:</strong> Your department from enterprise extension (SCIM)</li>
            <li>• <strong>Manager:</strong> Your manager information from enterprise extension (SCIM)</li>
            <li>• <strong>Role:</strong> Your assigned role in the organization from Asgardeo</li>
            <li>• <strong>All Users:</strong> Fetched from SCIM 2.0 /Users endpoint with enterprise extensions</li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">Required SCIM Scopes:</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>✓ <strong>internal_org_user_mgt_view:</strong> View user accounts in the organization</li>
            <li>✓ <strong>internal_org_user_mgt_list:</strong> Search/list user accounts in the organization</li>
            <li className="mt-2 text-xs text-green-700">These scopes are automatically requested during login to enable SCIM API access.</li>
          </ul>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">SCIM Enterprise Extension Fields:</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• <strong>Schema:</strong> urn:ietf:params:scim:schemas:extension:enterprise:2.0:User</li>
            <li>• <strong>jobTitle:</strong> User's job title in the organization</li>
            <li>• <strong>organization:</strong> User's organization name</li>
            <li>• <strong>department:</strong> User's department</li>
            <li>• <strong>manager:</strong> User's direct manager information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;
