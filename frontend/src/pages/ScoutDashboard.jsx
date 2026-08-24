import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, LogOut, Eye, Filter, Trophy, Activity,
  MapPin, Mail, ChevronRight, BarChart2, Loader2
} from "lucide-react";
import api from "../api/api";
import SportsRecommendations from "../components/SportsRecommendations";

export default function ScoutDashboard() {
  const navigate = useNavigate();

  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false); // New: Loading state
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("");
  const [selectedAthleteId, setSelectedAthleteId] = useState(null); // Renamed for clarity
  const [athletePerformance, setAthletePerformance] = useState([]);

  useEffect(() => {
    const loadAthletes = async () => {
      setLoading(true);
      try {
        const res = await api.get("/coach/players");
        
        // ✅ FIX: Robust array check
        const athletesArray = Array.isArray(res.data)
          ? res.data
          : res.data?.players || res.data?.data || [];

        setAthletes(athletesArray);
      } catch (err) {
        console.error("Error loading athletes:", err);
        setAthletes([]);
      } finally {
        setLoading(false);
      }
    };

    loadAthletes();
  }, []);

  const loadAthletePerformance = async (athleteId) => {
    try {
      setSelectedAthleteId(athleteId);
      setLoading(true); // Show loading while fetching details
      const res = await api.get(`/coach/player/${athleteId}/performance`);

      const performanceArray = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setAthletePerformance(performanceArray);
    } catch (err) {
      console.error("Error loading performance:", err);
      setAthletePerformance([]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ✅ NEW: Find the full object of the selected athlete to show details
  const currentAthlete = useMemo(() => {
    return athletes.find(a => a._id === selectedAthleteId);
  }, [athletes, selectedAthleteId]);

  const filteredAthletes = useMemo(() => {
    if (!Array.isArray(athletes)) return [];
    return athletes.filter((a) => {
      const matchesSearch = !searchTerm || a.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSport = !sportFilter || a.sport?.toLowerCase() === sportFilter.toLowerCase();
      return matchesSearch && matchesSport;
    });
  }, [searchTerm, sportFilter, athletes]);

  // Helper to calculate average score
  const getAverageScore = (perf) => Math.round((perf.speed + perf.stamina + perf.strength) / 3);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 lg:p-6 font-sans">
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-center bg-slate-900/90 backdrop-blur p-5 rounded-xl border border-white/10 mb-6 shadow-lg"
      >
        <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-2">
          <Activity className="text-green-500" />
          Sport<span className="text-green-500">Nova</span> Scout
        </h1>

        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 md:mt-0 px-5 py-2 border border-red-500/50 text-red-400 hover:bg-red-600 hover:text-white transition-all rounded-full flex items-center gap-2 text-sm font-bold"
        >
          <LogOut className="w-4 h-4" /> Logout
        </motion.button>
      </motion.div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* LEFT PANEL: SEARCH & LIST (3 Cols) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 bg-slate-900/80 p-4 rounded-xl border border-white/10 h-[80vh] flex flex-col"
        >
          <div className="mb-4">
            <h2 className="text-sm font-bold uppercase text-slate-400 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter Talent
            </h2>
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search athlete..."
                className="w-full p-2.5 pl-9 rounded-lg bg-slate-800 border border-slate-700 focus:border-green-500 focus:outline-none transition-colors text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Users className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>

            <select
              className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 focus:border-green-500 focus:outline-none text-sm"
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
            >
              <option value="">All Sports</option>
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="cricket">Cricket</option>
              <option value="athletics">Athletics</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {filteredAthletes.map((athlete, index) => (
              <motion.div
                key={athlete._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => loadAthletePerformance(athlete._id)}
                className={`p-3 rounded-lg cursor-pointer border transition-all relative group ${
                  selectedAthleteId === athlete._id
                    ? "border-green-500 bg-green-500/10"
                    : "border-slate-800 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-green-400 transition-colors">
                      {athlete.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 capitalize">
                      {athlete.sport || "Unknown Sport"}
                    </p>
                  </div>
                  {selectedAthleteId === athlete._id && (
                    <ChevronRight className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </motion.div>
            ))}
            {filteredAthletes.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-10">No athletes found.</div>
            )}
          </div>
        </motion.div>

        {/* MIDDLE PANEL: DETAILED VIEW (6 Cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-6 bg-slate-900/80 p-6 rounded-xl border border-white/10 h-[80vh] overflow-y-auto custom-scrollbar"
        >
          {!currentAthlete ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
              <Eye className="w-20 h-20 mb-4 stroke-1" />
              <p className="text-lg font-light">Select an athlete from the list</p>
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-8 border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-3xl font-black uppercase text-white mb-1">
                    {currentAthlete.name}
                  </h2>
                  <div className="flex items-center gap-4 text-slate-400 text-sm">
                    <span className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                      <Trophy className="w-3 h-3 text-green-400" /> {currentAthlete.sport}
                    </span>
                    {currentAthlete.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {currentAthlete.email}
                      </span>
                    )}
                    {currentAthlete.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {currentAthlete.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-center border border-green-500/30">
                  <div className="text-xs uppercase tracking-widest opacity-80">Age</div>
                  <div className="text-xl font-bold">{currentAthlete.age || "N/A"}</div>
                </div>
              </div>

              {/* Performance Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <BarChart2 className="text-green-500" /> Performance History
                </h3>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                  </div>
                ) : athletePerformance.length === 0 ? (
                  <div className="p-8 bg-slate-800/50 rounded-xl text-center border border-dashed border-slate-700">
                    <p className="text-slate-400">No performance data recorded yet.</p>
                  </div>
                ) : (
                  athletePerformance.map((perf, index) => {
                    const avgScore = getAverageScore(perf);
                    return (
                      <motion.div
                        key={perf._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-slate-600 transition-all shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                            {new Date(perf.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                             <div className="text-right">
                                <span className="block text-xs text-slate-500 uppercase">Avg Rating</span>
                                <span className={`text-lg font-bold ${avgScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                                  {avgScore}/100
                                </span>
                             </div>
                          </div>
                        </div>

                        {/* Progress Bars for Stats */}
                        <div className="space-y-3">
                          {[
                            { label: "Speed", value: perf.speed, color: "bg-blue-500" },
                            { label: "Strength", value: perf.strength, color: "bg-red-500" },
                            { label: "Stamina", value: perf.stamina, color: "bg-yellow-500" }
                          ].map((stat) => (
                            <div key={stat.label}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-300">{stat.label}</span>
                                <span className="text-slate-400">{stat.value}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${stat.value}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`h-full ${stat.color}`} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </motion.div>

        {/* RIGHT PANEL: SUMMARY & STATS (3 Cols) */}
        <motion.div 
           initial={{ opacity: 0, x: 30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.3 }}
           className="lg:col-span-3 space-y-4"
        >
          {/* Quick Stats Card */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-white/10">
            <h3 className="text-sm font-bold uppercase text-slate-400 mb-4">Dashboard Stats</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-800 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">{athletes.length}</div>
                  <div className="text-xs text-slate-500">Total Players</div>
               </div>
               <div className="bg-slate-800 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">{filteredAthletes.length}</div>
                  <div className="text-xs text-slate-500">Visible</div>
               </div>
            </div>
          </div>

          {/* Contextual Action / Info */}
          <div className="bg-gradient-to-br from-green-900/40 to-slate-900 p-5 rounded-xl border border-green-500/20">
            <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Scouting Tip
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Focus on <span className="text-white font-semibold">Stamina</span> for endurance sports. 
              Click on an athlete to view their detailed progression over time.
            </p>
          </div>
        </motion.div>

        {/* BOTTOM SECTION: RECOMMENDATIONS */}
        <div className="lg:col-span-12 mt-4">
          <SportsRecommendations userRole="scout" />
        </div>
      </div>
    </div>
  );
}