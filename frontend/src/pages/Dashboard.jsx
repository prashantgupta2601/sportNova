import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, LogOut, Zap, Heart, Dumbbell, Trophy, Upload, 
  Video, Plus, CheckCircle2, AlertCircle, Link as LinkIcon, 
  HelpCircle, BarChart3, ChevronRight, Menu, X, TrendingUp,
  Award, Target, Sparkles, RefreshCw, Calendar, Clock
} from "lucide-react";
import SportsRecommendations from "../components/SportsRecommendations";

// REAL API
const api = axios.create({
  baseURL: "http://localhost:5000",
});

// --------------------- CHART - Enhanced ---------------------
const PerformanceChart = ({ data }) => {
  // Ensure data is an array
  const chartData = Array.isArray(data) ? data : [];
  const maxValue = chartData.length > 0 
    ? Math.max(...chartData.map(d => Math.max(d.speed || 0, d.strength || 0)), 100)
    : 100;

  return (
    <div className="relative h-full w-full flex items-end justify-between gap-2 sm:gap-3 px-2 sm:px-4 pb-2 pt-8">
      {/* Grid Lines */}
      <div className="absolute inset-0 z-0 flex flex-col justify-between px-4 pb-2 opacity-10 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-full h-px bg-white"></div>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 z-10">
          <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
          <span className="uppercase tracking-widest text-xs font-bold">No Data Available</span>
        </div>
      ) : (
        chartData.slice(-10).map((d, i) => (
          <div key={i} className="group relative w-full h-full flex items-end justify-center z-10">
            {/* Tooltip */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-white text-[10px] uppercase font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
              <div className="text-blue-400 mb-1">{d.sport}</div>
              <div className="flex gap-2">
                <span>Speed: {d.speed || 0}</span>
                <span>Str: {d.strength || 0}</span>
              </div>
            </div>

            {/* Bars */}
            <div className="w-full max-w-[40px] h-[80%] flex items-end gap-[2px]">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${((d.speed || 0) / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="w-1/2 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm hover:from-blue-500 hover:to-blue-300 transition-colors"
              />
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${((d.strength || 0) / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 + 0.1 }}
                className="w-1/2 bg-gradient-to-t from-orange-600 to-orange-400 rounded-sm hover:from-orange-500 hover:to-orange-300 transition-colors"
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// --------------------- DASHBOARD ---------------------

export default function Dashboard() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ sport: "", speed: "", stamina: "", strength: "", videoUrl: "" });
  const [videoFile, setVideoFile] = useState(null);
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    verifyLogin();
    loadData();
  }, []);

  // redirect if not logged in
  const verifyLogin = () => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  };

  // Load user performances
  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/performance/my", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle both array (old format) and paginated object (new format)
      const performances = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setList(performances);
    } catch (err) {
      console.log(err);
      setList([]); // Set empty array on error to prevent map errors
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (videoFile) fd.append("videoFile", videoFile);

      const token = localStorage.getItem("token");

      const res = await api.post("/performance/add", fd, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setMsg("Performance recorded successfully!");
      loadData();

      setForm({ sport: "", speed: "", stamina: "", strength: "", videoUrl: "" });
      setVideoFile(null);

      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.log(err);
      setMsg("Error saving performance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Calculate stats
  const stats = {
    total: Array.isArray(list) ? list.length : 0,
    avgSpeed: Array.isArray(list) && list.length > 0 ? Math.round(list.reduce((sum, p) => sum + (p.speed || 0), 0) / list.length) : 0,
    avgStamina: Array.isArray(list) && list.length > 0 ? Math.round(list.reduce((sum, p) => sum + (p.stamina || 0), 0) / list.length) : 0,
    avgStrength: Array.isArray(list) && list.length > 0 ? Math.round(list.reduce((sum, p) => sum + (p.strength || 0), 0) / list.length) : 0,
  };

  // --------------------- UI ---------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white pb-12">

      {/* HEADER - Sticky */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black italic">
                  Athlete <span className="text-blue-500">Hub</span>
                </h1>
                <p className="text-[10px] text-slate-500 hidden sm:block">Performance Dashboard</p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <a 
                href="mailto:shivam@gmail.com" 
                className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                <HelpCircle className="w-4 h-4" /> Support
              </a>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadData}
                className="p-2 border border-slate-700 hover:border-blue-500 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout} 
                className="border border-red-500 text-red-400 px-4 sm:px-6 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Exit
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
                  <a 
                    href="mailto:shivam@gmail.com"
                    className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2"
                  >
                    <HelpCircle className="w-4 h-4" /> Support
                  </a>
                  <button
                    onClick={() => {
                      loadData();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Refresh
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6 sm:space-y-8">

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard icon={<Trophy />} label="Total Records" value={stats.total} color="blue" />
          <StatsCard icon={<Zap />} label="Avg Speed" value={stats.avgSpeed} color="blue" />
          <StatsCard icon={<Heart />} label="Avg Stamina" value={stats.avgStamina} color="orange" />
          <StatsCard icon={<Dumbbell />} label="Avg Strength" value={stats.avgStrength} color="purple" />
        </div>

        {/* Feedback Message */}
        <AnimatePresence>
          {msg && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={`p-3 sm:p-4 border-l-4 rounded-r-lg text-sm sm:text-base flex items-center gap-2 ${
                msg.includes("Error") 
                  ? "bg-red-500/10 border-red-500 text-red-400" 
                  : "bg-green-500/10 border-green-500 text-green-400"
              }`}
            >
              {msg.includes("Error") ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              <span>{msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GRID */}
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8">

          {/* LEFT FORM */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="bg-slate-900/80 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-white/10 sticky top-24">

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <Plus className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-black uppercase">New Record</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

                <div>
                  <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">Sport</label>
                  <input 
                    name="sport" 
                    placeholder="e.g., Football, Basketball" 
                    value={form.sport}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-slate-950/50 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">Performance Metrics</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="relative">
                      <input 
                        name="speed" 
                        placeholder="Speed" 
                        type="number" 
                        value={form.speed} 
                        onChange={handleChange}
                        className="w-full p-3 bg-slate-950/50 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <Zap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 opacity-50" />
                    </div>
                    <div className="relative">
                      <input 
                        name="stamina" 
                        placeholder="Stamina" 
                        type="number" 
                        value={form.stamina} 
                        onChange={handleChange}
                        className="w-full p-3 bg-slate-950/50 border border-slate-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                      />
                      <Heart className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 opacity-50" />
                    </div>
                    <div className="relative">
                      <input 
                        name="strength" 
                        placeholder="Power" 
                        type="number" 
                        value={form.strength} 
                        onChange={handleChange}
                        className="w-full p-3 bg-slate-950/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <Dumbbell className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 opacity-50" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">Video URL (Optional)</label>
                  <div className="relative">
                    <input 
                      name="videoUrl" 
                      placeholder="https://youtube.com/..." 
                      value={form.videoUrl} 
                      onChange={handleChange}
                      className="w-full p-3 pl-10 bg-slate-950/50 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">Upload Video (Optional)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={(e) => setVideoFile(e.target.files[0])}
                      className="w-full p-3 bg-slate-950/50 border border-slate-700 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-400 file:cursor-pointer hover:file:bg-blue-500/30 transition-colors text-sm"
                    />
                  </div>
                  {videoFile && (
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {videoFile.name}
                    </p>
                  )}
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 py-3 sm:py-4 rounded-lg mt-4 font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> Confirm Entry
                    </>
                  )}
                </motion.button>

              </form>
            </div>
          </motion.div>


          {/* RIGHT CHART & LOGS */}
          <div className="lg:col-span-7 space-y-6">

            {/* CHART */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-slate-900/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/10 h-[300px] sm:h-[350px]"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black uppercase flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" /> Metrics Analysis
                </h2>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-slate-400">Speed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span className="text-slate-400">Strength</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-800 rounded-xl h-[calc(100%-50px)]">
                <PerformanceChart data={list} />
              </div>
            </motion.div>

            {/* LOGS */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-slate-900/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/10"
            >
              <h2 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-400" /> Recent Logs
                <span className="text-sm text-slate-500 font-normal">({list.length})</span>
              </h2>

              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {!Array.isArray(list) || list.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-bold">No records yet</p>
                    <p className="text-sm">Start tracking your performance!</p>
                  </div>
                ) : (
                  list.map((p, index) => (
                    <motion.div 
                      key={p._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="bg-slate-950/50 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30 flex-shrink-0">
                            <Trophy className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg">{p.sport}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(p.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(p.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Video Links */}
                        {(p.videoUrl || p.videoFile) && (
                          <div className="flex gap-2">
                            {p.videoUrl && (
                              <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href={p.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                                title="View Video"
                              >
                                <Video className="w-4 h-4 text-blue-400" />
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
                                title="Uploaded Video"
                              >
                                <Upload className="w-4 h-4 text-green-400" />
                              </motion.a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Zap className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-slate-400">Speed</span>
                          </div>
                          <div className="text-xl font-bold text-blue-400">{p.speed}</div>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Heart className="w-3 h-3 text-orange-400" />
                            <span className="text-xs text-slate-400">Stamina</span>
                          </div>
                          <div className="text-xl font-bold text-orange-400">{p.stamina}</div>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-lg text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Dumbbell className="w-3 h-3 text-purple-400" />
                            <span className="text-xs text-slate-400">Power</span>
                          </div>
                          <div className="text-xl font-bold text-purple-400">{p.strength}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

          </div>

        </div>

        {/* AI RECOMMENDATIONS SECTION - FIXED STYLING */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-6 overflow-hidden shadow-2xl mt-8"
        >
          <SportsRecommendations />
        </motion.div>

      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon, label, value, color }) {
  const colorMap = {
    blue: { gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-500/20", border: "border-blue-500/30" },
    orange: { gradient: "from-orange-500 to-red-500", bg: "bg-orange-500/20", border: "border-orange-500/30" },
    purple: { gradient: "from-purple-500 to-pink-500", bg: "bg-purple-500/20", border: "border-purple-500/30" },
  };

  const colors = colorMap[color];

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className="bg-slate-900/60 backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 ${colors.bg} border ${colors.border} rounded-lg`}>
          {React.cloneElement(icon, { className: "w-4 h-4 sm:w-5 sm:h-5 text-white" })}
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-black mb-1">{value}</div>
      <div className="text-xs sm:text-sm text-slate-400 font-medium">{label}</div>
    </motion.div>
  );
}