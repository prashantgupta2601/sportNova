import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Shield, Trash2, LogOut, Search, LayoutDashboard, 
  UserCog, Trophy, ChevronDown, AlertCircle, Ban, Menu, X,
  Filter, Download, RefreshCw
} from "lucide-react";

// --- REAL API ---
import api from "../api/api";
import SportsRecommendations from "../components/SportsRecommendations";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [msg, setMsg] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterRole, setFilterRole] = useState("");
  const navigate = useNavigate();

  // 🚨 redirect if not admin
  const validateAdmin = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.user.role !== "admin") {
        navigate("/dashboard");
      }

    } catch (err) {
      navigate("/login");
    }
  };

  // Load all users
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle both array (old format) and paginated object (new format)
      const usersData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setUsers(usersData);
    } catch (err) {
      console.log(err);
      setMsg("Error loading users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateAdmin();
    loadUsers();
  }, []);

  // Change User Role
  const changeRole = async (id, role) => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.patch(
        `/admin/users/${id}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(users.map(u => u._id === id ? res.data : u));
      setMsg(`User role updated to ${role.toUpperCase()}`);

      setTimeout(() => setMsg(""), 2000);
    } catch (err) {
      console.log(err);
      setMsg("Error updating role");
    }
  };

  // Delete User
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(users.filter(u => u._id !== id));
      setMsg("User deleted");

      setTimeout(() => setMsg(""), 2000);
    } catch (err) {
      console.log(err);
      setMsg("Error deleting user");
    }
  };

  // Logout
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Filter Users - Enhanced with role filter
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    return matchesSearch && matchesRole;
  }) : [];

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'border-purple-500 text-purple-400 bg-purple-500/10';
      case 'coach': return 'border-blue-500 text-blue-400 bg-blue-500/10';
      case 'scout': return 'border-green-500 text-green-400 bg-green-500/10';
      default: return 'border-emerald-500 text-emerald-400 bg-emerald-500/10';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'coach': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'scout': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  // Stats calculation
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    coaches: users.filter(u => u.role === 'coach').length,
    players: users.filter(u => u.role === 'player').length,
    scouts: users.filter(u => u.role === 'scout').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans pb-10">
      
      {/* HEADER - Mobile Responsive */}
      <div className="relative z-10 w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50"
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              
              {/* Logo & Title */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black italic uppercase">
                    System <span className="text-purple-500">Admin</span>
                  </h1>
                  <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">
                    Global Command Interface
                  </p>
                </div>
                <h1 className="sm:hidden text-lg font-black italic uppercase">
                  <span className="text-purple-500">Admin</span>
                </h1>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadUsers}
                  className="p-2 border border-slate-700 hover:border-blue-500 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout} 
                  className="border border-red-500/30 text-red-400 px-4 sm:px-6 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> 
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="md:hidden overflow-hidden"
                >
                  <div className="pt-4 pb-2 space-y-2 border-t border-white/10 mt-4">
                    <button
                      onClick={() => {
                        loadUsers();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" /> Refresh Users
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full p-3 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-lg flex items-center gap-2 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Stats Cards - Responsive Grid */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <StatCard icon={<Users />} label="Total Users" value={stats.total} color="blue" />
            <StatCard icon={<Shield />} label="Admins" value={stats.admins} color="purple" />
            <StatCard icon={<UserCog />} label="Coaches" value={stats.coaches} color="blue" />
            <StatCard icon={<Trophy />} label="Players" value={stats.players} color="emerald" />
            <StatCard icon={<Users />} label="Scouts" value={stats.scouts} color="green" />
          </div>

          {/* FEEDBACK MESSAGE */}
          <AnimatePresence>
            {msg && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-3 sm:p-4 bg-blue-500/10 border-l-4 border-blue-500 text-blue-400 text-sm sm:text-base flex items-center gap-2 rounded-r-lg mb-6"
              >
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
                <span>{msg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* USER TABLE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden shadow-2xl"
          >

            {/* Toolbar - Responsive */}
            <div className="p-4 sm:p-6 border-b border-white/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-lg sm:text-xl font-black uppercase flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5" /> User Database
                  <span className="text-sm text-slate-500 font-normal">({filteredUsers.length})</span>
                </h2>

                {/* Search - Full width on mobile */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Filter by Role */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-slate-400" />
                <button
                  onClick={() => setFilterRole("")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterRole === "" ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterRole("admin")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterRole === "admin" ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  Admins
                </button>
                <button
                  onClick={() => setFilterRole("coach")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterRole === "coach" ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  Coaches
                </button>
                <button
                  onClick={() => setFilterRole("player")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterRole === "player" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  Players
                </button>
                <button
                  onClick={() => setFilterRole("scout")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterRole === "scout" ? "bg-green-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  Scouts
                </button>
              </div>
            </div>

            {/* Table - Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800">
                    <th className="p-5 text-sm font-bold uppercase text-slate-400">Identity</th>
                    <th className="p-5 text-sm font-bold uppercase text-slate-400">Role</th>
                    <th className="p-5 text-sm font-bold uppercase text-slate-400">Status</th>
                    <th className="p-5 text-sm font-bold uppercase text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Loading users...
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-slate-500">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, index) => (
                      <motion.tr 
                        key={u._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                        className="border-b border-slate-800/50"
                      >
                        {/* NAME */}
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-lg text-white font-bold">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold">{u.name}</div>
                              <div className="text-xs text-slate-500">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* ROLE */}
                        <td className="p-5">
                          <select
                            value={u.role}
                            onChange={(e) => changeRole(u._id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border cursor-pointer transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${getRoleColor(u.role)}`}
                          >
                            <option value="player">Player</option>
                            <option value="coach">Coach</option>
                            <option value="scout">Scout</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        {/* STATUS */}
                        <td className="p-5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase rounded-lg">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Active
                          </span>
                        </td>

                        {/* DELETE */}
                        <td className="p-5 text-right">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteUser(u._id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Card View - Mobile */}
            <div className="md:hidden space-y-3 p-4">
              {loading ? (
                <div className="p-10 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Loading...
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                filteredUsers.map((u, index) => (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 space-y-3"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-lg text-white font-bold text-lg">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{u.name}</div>
                        <div className="text-xs text-slate-500 truncate">{u.email}</div>
                      </div>
                      <div className="flex-shrink-0">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteUser(u._id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Role & Status */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-slate-500 block mb-1">Role</label>
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u._id, e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg text-xs font-bold uppercase border ${getRoleColor(u.role)}`}
                        >
                          <option value="player">Player</option>
                          <option value="coach">Coach</option>
                          <option value="scout">Scout</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Status</label>
                        <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase rounded-lg">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                          Active
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* AI RECOMMENDATIONS SECTION - FIXED STYLING */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden shadow-2xl p-4 sm:p-6"
          >
            <SportsRecommendations userRole="admin" />
          </motion.div>

        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color }) {
  const colorMap = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    emerald: "from-emerald-500 to-teal-500",
    green: "from-green-500 to-emerald-500",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className="bg-slate-900/60 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-5 hover:border-white/20 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 sm:p-2.5 bg-gradient-to-br ${colorMap[color]} rounded-lg opacity-80`}>
          {React.cloneElement(icon, { className: "w-4 h-4 sm:w-5 sm:h-5 text-white" })}
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-black">{value}</div>
        </div>
      </div>
      <div className="text-xs sm:text-sm text-slate-400 font-medium">{label}</div>
    </motion.div>
  );
}