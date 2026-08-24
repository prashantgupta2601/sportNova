import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Activity, Trophy, Search, LogOut, PlayCircle,
  FileVideo, Zap, Dumbbell, Heart, Swords, TrendingUp,
  ChevronRight, Menu, X, Filter, RefreshCw, BarChart2,
  Target, Award, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import api from "../api/api";
import SportsRecommendations from "../components/SportsRecommendations";

// --- CHART COMPONENT - Enhanced ---
const PerformanceChart = ({ data }) => {
  // Ensure data is an array
  const chartData = Array.isArray(data) ? data : [];
  const maxValue = chartData.length > 0 
    ? Math.max(...chartData.map(d => Math.max(d.speed || 0, d.stamina || 0)), 100)
    : 100;

  return (
    <div className="h-48 flex items-end justify-between px-2 sm:px-4 pb-4 gap-1 sm:gap-2 relative">
      {/* Grid Background */}
      <div className="absolute inset-0 border-b border-l border-white/10 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {chartData.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-bold uppercase">
          <BarChart2 className="w-8 h-8 mb-2 opacity-50" />
          Select player to load metrics
        </div>
      ) : (
        chartData.map((p, i) => (
          <div key={i} className="relative w-full flex items-end group">
            {/* Speed Bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${((p.speed || 0) / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:from-blue-500 hover:to-blue-300 transition-all cursor-pointer"
            />
            {/* Stamina Overlay */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${((p.stamina || 0) / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
              className="absolute bottom-0 w-full bg-gradient-to-t from-orange-500/70 to-orange-400/70 rounded-t"
            />
            {/* Tooltip */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
              <div className="text-xs font-bold text-blue-400">Speed: {p.speed || 0}</div>
              <div className="text-xs font-bold text-orange-400">Stamina: {p.stamina || 0}</div>
              <div className="text-[10px] text-slate-400 mt-1">{p.sport || 'Unknown'}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default function CoachDashboard() {
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [performance, setPerformance] = useState([]);

  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [msg, setMsg] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Comparison
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [compareData, setCompareData] = useState(null);

  useEffect(() => { loadPlayers(); }, []);

  const loadPlayers = async () => {
    try {
      const res = await api.get("/coach/players");
      // Handle both array (old format) and paginated object (new format)
      const playersData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setPlayers(playersData);
      setFilteredPlayers(playersData);
    } catch (err) {
      console.log(err);
      setMsg("Failed to load players.");
      setPlayers([]);
      setFilteredPlayers([]);
    }
  };

  const loadPerformance = async (playerId) => {
    try {
      setSelectedPlayer(playerId);
      const res = await api.get(`/coach/player/${playerId}/performance`);
      // Handle array response
      const performanceData = Array.isArray(res.data) ? res.data : [];
      setPerformance(performanceData);
      setMobileSidebarOpen(false); // Close sidebar on mobile after selection
    } catch (err) {
      console.log(err);
      setMsg("Could not load performance.");
      setPerformance([]);
    }
  };

  const comparePlayers = async () => {
    if (!p1 || !p2 || p1 === p2) return;

    try {
      const res = await api.get(`/coach/compare?p1=${p1}&p2=${p2}`);
      setCompareData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Search filter
  useEffect(() => {
    setFilteredPlayers(
      players.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, players]);

  // Get selected player info
  const selectedPlayerInfo = players.find(p => p._id === selectedPlayer);

  // Calculate average performance
  const avgPerformance = Array.isArray(performance) && performance.length > 0 ? {
    speed: Math.round(performance.reduce((sum, p) => sum + (p.speed || 0), 0) / performance.length),
    stamina: Math.round(performance.reduce((sum, p) => sum + (p.stamina || 0), 0) / performance.length),
    strength: Math.round(performance.reduce((sum, p) => sum + (p.strength || 0), 0) / performance.length),
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">

      {/* HEADER - Sticky with backdrop blur */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider">
                  Tactical <span className="text-blue-500">Command</span>
                </h1>
                <p className="text-[10px] text-slate-500 hidden sm:block">Coach Dashboard</p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadPlayers}
                className="p-2 border border-slate-700 hover:border-blue-500 rounded-lg transition-colors"
                title="Refresh Players"
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="px-5 py-2 border border-red-500 text-red-400 hover:bg-red-600 hover:text-white transition rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
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
                      loadPlayers();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Refresh Players
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full p-3 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* MAIN CONTENT */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Stats Overview - Mobile Friendly */}
        {selectedPlayerInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {selectedPlayerInfo.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedPlayerInfo.name}</h3>
                  <p className="text-sm text-slate-400">{selectedPlayerInfo.position || "Player"}</p>
                </div>
              </div>
              {avgPerformance && (
                <div className="flex gap-3">
                  <div className="bg-slate-800/50 rounded-lg px-3 py-2 text-center">
                    <div className="text-xs text-slate-400">Avg Speed</div>
                    <div className="text-lg font-bold text-blue-400">{avgPerformance.speed}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg px-3 py-2 text-center">
                    <div className="text-xs text-slate-400">Avg Stamina</div>
                    <div className="text-lg font-bold text-orange-400">{avgPerformance.stamina}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg px-3 py-2 text-center">
                    <div className="text-xs text-slate-400">Avg Strength</div>
                    <div className="text-lg font-bold text-purple-400">{avgPerformance.strength}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* GRID LAYOUT */}
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">

          {/* LEFT: PLAYER LIST - Hidden on mobile by default, toggle with button */}
          <div className="lg:col-span-3 relative">
            
            {/* Mobile Toggle Button */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden w-full mb-4 p-3 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center gap-2 font-bold"
            >
              <Users className="w-5 h-5" />
              {mobileSidebarOpen ? "Hide Players" : "Show Players"} ({filteredPlayers.length})
            </button>

            {/* Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`${
                mobileSidebarOpen ? 'block' : 'hidden'
              } lg:block bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border border-white/10 lg:h-[calc(100vh-200px)] overflow-y-auto`}
            >

              <h2 className="text-lg font-bold uppercase mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Players
                <span className="text-sm text-slate-500 font-normal">({filteredPlayers.length})</span>
              </h2>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Player Cards */}
              <div className="space-y-2">
                {filteredPlayers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No players found</p>
                  </div>
                ) : (
                  filteredPlayers.map((p, index) => (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => loadPerformance(p._id)}
                      className={`p-3 rounded-lg cursor-pointer border transition-all ${
                        selectedPlayer === p._id 
                          ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20" 
                          : "border-slate-700 bg-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                          selectedPlayer === p._id 
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white" 
                            : "bg-slate-700 text-slate-300"
                        }`}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate">{p.name}</div>
                          <div className="text-xs text-slate-400 truncate">{p.position || "Player"}</div>
                        </div>
                        {selectedPlayer === p._id && (
                          <ChevronRight className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

            </motion.div>
          </div>

          {/* MIDDLE: PERFORMANCE FEED */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-5 bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border border-white/10 lg:h-[calc(100vh-200px)] overflow-y-auto"
          >
            <h2 className="text-lg font-bold uppercase mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" /> Recent Performance
            </h2>

            {!selectedPlayer ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20">
                <Target className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-center">Select a player to view performance</p>
              </div>
            ) : performance.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20">
                <BarChart2 className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-center">No performance data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {performance.map((p, index) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{p.sport}</h3>
                        <p className="text-xs text-slate-400">
                          {new Date(p.createdAt).toLocaleDateString()} at {new Date(p.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      {/* Video buttons */}
                      <div className="flex gap-2">
                        {p.videoUrl && (
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={p.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                          >
                            <PlayCircle className="w-4 h-4 text-blue-400" />
                          </motion.a>
                        )}

                        {p.videoFile && (
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={`http://localhost:5000${p.videoFile}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
                          >
                            <FileVideo className="w-4 h-4 text-green-400" />
                          </motion.a>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <Stat icon={<Zap />} label="Speed" value={p.speed} color="blue" />
                      <Stat icon={<Heart />} label="Stamina" value={p.stamina} color="orange" />
                      <Stat icon={<Dumbbell />} label="Strength" value={p.strength} color="purple" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT: ANALYTICS */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">

            {/* Trend Chart */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border border-white/10"
            >
              <h2 className="text-lg font-bold uppercase flex items-center gap-2 mb-4">
                <TrendingUp className="text-purple-400" /> Trend Analysis
              </h2>

              <div className="border border-slate-700 bg-slate-950/50 rounded-xl overflow-hidden">
                <PerformanceChart data={performance} />
              </div>

              {/* Legend */}
              {performance.length > 0 && (
                <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-slate-400">Speed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span className="text-slate-400">Stamina</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Comparison */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border border-white/10"
            >
              <h2 className="text-lg font-bold uppercase flex items-center gap-2 mb-4">
                <Swords className="text-orange-400" /> Compare Players
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Player 1</label>
                  <select
                    value={p1}
                    onChange={(e) => setP1(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Player 1</option>
                    {players.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Player 2</label>
                  <select
                    value={p2}
                    onChange={(e) => setP2(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Player 2</option>
                    {players.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!p1 || !p2 || p1 === p2}
                  onClick={comparePlayers}
                  className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Compare Players
                </motion.button>
              </div>

              {/* Comparison Result */}
              {compareData && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4 space-y-4 pt-4 border-t border-slate-700"
                >
                  {["speed", "stamina", "strength"].map((stat) => (
                    <ComparisonBar
                      key={stat}
                      label={stat.toUpperCase()}
                      p1={compareData.p1[stat]}
                      p2={compareData.p2[stat]}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* AI RECOMMENDATIONS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <SportsRecommendations userRole="coach" />
        </motion.div>

      </div>
    </div>
  );
}

// --- HELPERS ---
const Stat = ({ icon, label, value, color }) => {
  const colorMap = {
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
  };

  const colors = colorMap[color];

  return (
    <div className={`${colors.bg} border ${colors.border} p-3 rounded-lg text-center`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        {React.cloneElement(icon, { className: `w-3 h-3 ${colors.text}` })}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className={`text-xl font-bold ${colors.text}`}>{value}</div>
    </div>
  );
};

const ComparisonBar = ({ label, p1, p2 }) => {
  const total = p1 + p2;
  const pct1 = ((p1 / total) * 100).toFixed(1);
  const pct2 = ((p2 / total) * 100).toFixed(1);
  const winner = p1 > p2 ? 1 : 2;

  return (
    <div>
      <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
        <div className="flex items-center gap-1">
          <span className="font-bold">Player 1</span>
          {winner === 1 && <ArrowUpRight className="w-3 h-3 text-green-400" />}
        </div>
        <span className="font-bold text-white">{label}</span>
        <div className="flex items-center gap-1">
          {winner === 2 && <ArrowUpRight className="w-3 h-3 text-green-400" />}
          <span className="font-bold">Player 2</span>
        </div>
      </div>

      <div className="flex h-4 rounded-full overflow-hidden border border-slate-700">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${pct1}%` }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-blue-500" 
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${pct2}%` }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600" 
        />
      </div>

      <div className="flex justify-between text-sm mt-2 font-bold">
        <span className="text-blue-400">{p1}</span>
        <span className="text-orange-400">{p2}</span>
      </div>
    </div>
  );
};