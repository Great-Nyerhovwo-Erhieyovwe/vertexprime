import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
}

const SettingsPageContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "preferences"
  >("profile");
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:4000/api/dashboard/user', { headers: { 'Authorization': `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setProfile({
        firstName: d.firstName || '',
        lastName: d.lastName || '',
        email: d.email || '',
        phone: d.phone || '',
        avatar: (d.firstName && d.lastName) ? `${d.firstName[0]}${d.lastName[0]}` : ''
      }))
      .catch(() => {});
  }, []);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfileChange = (
    field: keyof UserProfile,
    value: string
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      {/* Settings Container */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {["profile", "security", "preferences"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Picture */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Profile Picture
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {profile.avatar}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Upload Photo
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) =>
                        handleProfileChange("firstName", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) =>
                        handleProfileChange("lastName", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        handleProfileChange("email", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        handleProfileChange("phone", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Change Password */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Change Password
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Two-Factor Authentication
                </h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Enable Two-Factor Authentication
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Enable
                  </button>
                </div>
              </div>

              {/* Connected Devices */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Connected Devices
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      name: "Chrome on Windows",
                      lastActive: "Just now",
                      current: true,
                    },
                    {
                      name: "Safari on iPhone",
                      lastActive: "2 hours ago",
                      current: false,
                    },
                  ].map((device, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {device.name}
                          {device.current && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          Last active: {device.lastActive}
                        </p>
                      </div>
                      {!device.current && (
                        <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              {/* Email Preferences */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Email Preferences
                </h2>
                <div className="space-y-3">
                  {[
                    "Trade notifications",
                    "Market updates",
                    "Account alerts",
                    "Weekly reports",
                  ].map((pref, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <span className="text-gray-700">{pref}</span>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Language & Currency */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Display Preferences
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                      <option>JPY</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Theme */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Theme</h2>
                <div className="flex gap-4">
                  {["Light", "Dark", "Auto"].map((theme) => (
                    <button
                      key={theme}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-colors"
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:4000/api/dashboard/user', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d) {
          setUserProfile({
            name: `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'User',
            email: d.email || '',
            isVerified: d.emailVerified
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <DashboardLayout user={userProfile || { name: 'User', email: '' }}>
      <SettingsPageContent />
    </DashboardLayout>
  );
};

export default SettingsPage;
