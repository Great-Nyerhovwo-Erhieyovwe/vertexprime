// src/pages/Admin/AdminDashboard.tsx
import { NavLink, Outlet } from "react-router-dom";
import {
  FaUsers,
  FaTags,
  FaSignOutAlt,
  FaExchangeAlt,
  FaChartLine,
  FaHome,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useLogout } from "../../hooks/useAuth";

export const AdminDashboard = () => {
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined);
  };

  const handleFreezeUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/freeze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("User frozen successfully");
        return true;
      }
    } catch (error) {
      console.error("Error freezing user:", error);
    }
    return false;
  };

  const handleUnfreezeUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/unfreeze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("User unfrozen successfully");
        return true;
      }
    } catch (error) {
      console.error("Error unfreezing user:", error);
    }
    return false;
  };

  const handleBanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("User banned successfully");
        return true;
      }
    } catch (error) {
      console.error("Error banning user:", error);
    }
    return false;
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/unban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("User unbanned successfully");
        return true;
      }
    } catch (error) {
      console.error("Error unbanning user:", error);
    }
    return false;
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return false;
    }
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("User deleted successfully");
        return true;
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    return false;
  };

  const navItems = [
    { to: ".", label: "Dashboard", icon: <FaHome /> },
    { to: "users", label: "Users", icon: <FaUsers /> },
    { to: "transactions", label: "Transactions", icon: <FaExchangeAlt /> },
    { to: "upgrades", label: "Upgrade Plans", icon: <FaTags /> },
    { to: "reports", label: "Reports", icon: <FaChartLine /> },
  ];

  const contextValue = {
    handleFreezeUser,
    handleUnfreezeUser,
    handleBanUser,
    handleUnbanUser,
    handleDeleteUser,
  };

  return (
    <div className="flex min-h-screen bg-primary/10">
      {/* Sidebar */}
      <aside className="glass fixed inset-y-0 left-0 z-20 flex w-64 flex-col overflow-y-auto border-r border-white/10 py-6">
        <div className="mb-8 px-4 text-center">
          <h1 className="text-2xl font-bold text-accent">Admin Panel</h1>
          <p className="mt-1 text-xs text-white/60">Management Dashboard</p>
        </div>

        <nav className="flex-1 space-y-2 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "."}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md p-3 text-sm font-medium transition-all ${isActive
                  ? "bg-accent text-primary shadow-lg shadow-accent/50"
                  : "text-white/80 hover:bg-primary/30 hover:text-white"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-white/10 px-4 pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex w-full items-center gap-3 rounded-md bg-red-600/80 py-2.5 px-3 font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            <FaSignOutAlt />
            {logoutMutation.isPending ? "Logging out..." : "Log Out"}
          </motion.button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="ml-64 flex-1 p-6">
        <Outlet context={contextValue} />
      </main>
    </div>
  );
};

export default AdminDashboard;