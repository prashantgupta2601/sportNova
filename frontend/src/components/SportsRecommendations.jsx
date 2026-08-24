import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, Trophy, Dumbbell, Zap, Activity, Brain, 
  Utensils, ChevronRight, Loader2, AlertCircle, RefreshCw,
  Search, History, Download, X, Clock, Send, Sparkles, 
  MessageSquare, Lightbulb
} from "lucide-react";
import api from "../api/api";
import jsPDF from "jspdf";

const SportsRecommendations = ({ userRole = "player" }) => {
  const [activeTab, setActiveTab] = useState("Cricket");
  const [recommendations, setRecommendations] = useState([]);
  
  // --- States for Search & Chat Mode ---
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false); // Determines if we show Chat UI or Card UI
  
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadedCount, setLoadedCount] = useState(5);

  const sports = [
    "Cricket", "Football", "Basketball", "Tennis", 
    "Badminton", "Hockey", "Volleyball", "Swimming"
  ];

  // Colors for "Drill" Categories
  const categoryColors = {
    Technique: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Fitness: "bg-green-500/10 text-green-400 border-green-500/20",
    Mental: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Strategy: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Nutrition: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Insight: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", // New for Search
    Fact: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", // New for Search
  };

  const categoryIcons = {
    Technique: <Activity className="w-4 h-4" />,
    Fitness: <Dumbbell className="w-4 h-4" />,
    Mental: <Brain className="w-4 h-4" />,
    Strategy: <Target className="w-4 h-4" />,
    Nutrition: <Utensils className="w-4 h-4" />,
    Insight: <Lightbulb className="w-4 h-4" />,
    Fact: <Sparkles className="w-4 h-4" />,
  };

  const roleInfo = {
    player: {
      title: "AI Sports Companion",
      subtitle: "Get drills, tips, or ask specific questions",
      icon: <Zap className="w-6 h-6 text-purple-500" />
    },
    coach: {
      title: "AI Coach Assistant",
      subtitle: "Expert coaching strategies and answers",
      icon: <Trophy className="w-6 h-6 text-yellow-500" />
    },
    scout: {
      title: "AI Scouting Insights",
      subtitle: "Talent ID and evaluation metrics",
      icon: <Target className="w-6 h-6 text-green-500" />
    },
    admin: {
      title: "AI Program Manager",
      subtitle: "Operational insights and answers",
      icon: <Activity className="w-6 h-6 text-blue-500" />
    }
  };

  const currentRoleInfo = roleInfo[userRole] || roleInfo.player;

  // --- 1. Load History on Mount ---
  useEffect(() => {
    const savedHistory = localStorage.getItem('aiSportsHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  // --- 2. Save History Helper ---
  const saveToHistory = (query, results, mode) => {
    const newEntry = {
      id: Date.now(),
      query: query,
      results: results,
      mode: mode, // 'search' or 'training'
      timestamp: new Date().toISOString()
    };
    const updatedHistory = [newEntry, ...chatHistory].slice(0, 20);
    setChatHistory(updatedHistory);
    localStorage.setItem('aiSportsHistory', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('aiSportsHistory');
  };

  // --- 3. SEARCH Handler (Questions) ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setError("");
    setCurrentSearchQuery(searchQuery);
    setIsSearchMode(true); // Switch to Chat UI
    setActiveTab(""); // Clear active tab

    try {
      // Sending 'type: search' to tell backend this is a Question
      const res = await api.post("/recommendations/generate", {
        sport: searchQuery, 
        count: 5,
        type: "search" 
      });
      
      if (res.data.recommendations) {
        setRecommendations(res.data.recommendations);
        saveToHistory(searchQuery, res.data.recommendations, 'search');
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError(err.response?.data?.message || "Failed to get AI response.");
    } finally {
      setSearchLoading(false);
    }
  };

  // --- 4. TABS Handler (Drills) ---
  const fetchRecommendations = async (sport, count = 5) => {
    setLoading(true);
    setError("");
    
    try {
      // Default type is 'training' in backend
      const res = await api.post("/recommendations/generate", {
        sport,
        count
      });
      
      if (res.data.recommendations) {
        setRecommendations(res.data.recommendations);
        setLoadedCount(count);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (sport) => {
    setActiveTab(sport);
    setSearchQuery("");
    setIsSearchMode(false); // Switch to Card UI
    setLoadedCount(5);
    setRecommendations([]); 
    fetchRecommendations(sport, 5);
  };

  // --- 5. Load From History ---
  const loadFromHistory = (item) => {
    setSearchQuery(item.query);
    setCurrentSearchQuery(item.query);
    setRecommendations(item.results);
    setIsSearchMode(item.mode === 'search'); // Restore correct UI mode
    
    if (item.mode !== 'search') {
        setActiveTab(item.query); // Highlight tab if it was a tab click
    } else {
        setActiveTab("");
    }
    setShowHistory(false);
  };

  // --- 6. PDF Download ---
  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;
    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(isSearchMode ? "AI Sports Insight" : "Sports Training Plan", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 10;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(isSearchMode ? `Question: "${currentSearchQuery}"` : `Sport: ${activeTab}`, margin, y);
    y += 15;

    // Content
    doc.setFontSize(11);
    recommendations.forEach((rec, index) => {
      if (y > 270) { doc.addPage(); y = 20; }

      // Title Style
      doc.setFont(undefined, 'bold');
      const titlePrefix = isSearchMode ? "• " : `${index + 1}. `;
      doc.text(`${titlePrefix}${rec.title}`, margin, y);
      y += 7;

      // Description Style
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(rec.description, maxLineWidth);
      doc.text(lines, margin, y);
      y += (lines.length * 6) + 10; 
    });

    const fileName = isSearchMode ? "AI_Answer.pdf" : "Training_Plan.pdf";
    doc.save(`${fileName}_${Date.now()}.pdf`);
  };

  return (
    <div className="w-full text-white">
      
      {/* --- HEADER --- */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
                <h2 className="text-xl font-black uppercase flex items-center gap-2">
                    {currentRoleInfo.icon}
                    {currentRoleInfo.title}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    {currentRoleInfo.subtitle}
                </p>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-2">
                 <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-2 rounded-lg border transition-colors relative ${
                        showHistory ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                    title="History"
                >
                    <History className="w-5 h-5" />
                </button>
                <button
                    onClick={downloadPDF}
                    disabled={recommendations.length === 0}
                    className="p-2 bg-slate-800 hover:bg-green-600 rounded-lg border border-slate-700 hover:border-green-500 transition-colors disabled:opacity-50"
                    title="Download PDF"
                >
                    <Download className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* --- SEARCH BAR --- */}
        <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask specific questions (e.g., 'Diet for fast bowlers', 'Who is the GOAT of tennis?')"
                className="w-full pl-12 pr-24 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-lg"
            />
            <button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
                {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">Ask AI</span>
            </button>
        </form>

        {/* --- HISTORY DROPDOWN --- */}
        <AnimatePresence>
            {showHistory && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden backdrop-blur-sm"
                >
                    <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Recent Activity
                        </span>
                        {chatHistory.length > 0 && (
                            <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-300">
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                        {chatHistory.length === 0 ? (
                            <p className="text-center text-slate-500 text-sm py-4">No recent history.</p>
                        ) : (
                            chatHistory.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => loadFromHistory(item)}
                                    className="w-full text-left p-3 hover:bg-slate-800 rounded-lg group transition-colors flex items-center justify-between"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-300 group-hover:text-purple-400 truncate max-w-[250px]">
                                            {item.query}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded border ${
                                        item.mode === 'search' 
                                            ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' 
                                            : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                                    }`}>
                                        {item.mode === 'search' ? 'Q&A' : 'Training'}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* --- SPORT TABS --- */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sports.map((sport) => (
          <button
            key={sport}
            onClick={() => handleTabClick(sport)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              activeTab === sport && !isSearchMode
                ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* --- RESULTS AREA --- */}
      <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-6 min-h-[300px] relative">
        
        {/* Title Bar */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-800/50 pb-4">
             <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                {isSearchMode ? (
                    <>
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        AI Answer
                        {currentSearchQuery && <span className="text-sm font-normal text-slate-400 ml-2 border-l border-slate-700 pl-2">"{currentSearchQuery}"</span>}
                    </>
                ) : activeTab ? (
                    <>
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {activeTab} Training Plan
                    </>
                ) : "Ready to assist"}
            </h3>
        </div>
        
        {/* Loading State */}
        {(loading || searchLoading) && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Loader2 className="w-10 h-10 mb-4 animate-spin text-purple-500" />
            <p className="text-sm font-medium animate-pulse text-purple-400">
                {searchLoading ? "Analyzing your question..." : "Generating training plan..."}
            </p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 mb-4">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{error}</p>
            </div>
        )}

        {/* Empty State */}
        {!loading && !searchLoading && recommendations.length === 0 && !error && (
             <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                <Brain className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm">Select a sport above or ask a question to begin.</p>
            </div>
        )}

        {/* --- CONTENT RENDER LOGIC --- */}
        {!loading && !searchLoading && recommendations.length > 0 && (
            <AnimatePresence mode="wait">
                
                {/* === VIEW 1: SEARCH / CHAT MODE === */}
                {isSearchMode ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="prose prose-invert max-w-none"
                    >
                        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-600/20 rounded-lg shrink-0 mt-1">
                                    <MessageSquare className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="space-y-6 w-full">
                                    {recommendations.map((rec, index) => (
                                        <div key={index} className="border-b border-slate-800/50 last:border-0 pb-4 last:pb-0">
                                            {/* We use the 'title' as a subheading if provided */}
                                            {rec.title && (
                                                <h4 className="text-md font-bold text-slate-200 mb-2">
                                                    {rec.title}
                                                </h4>
                                            )}
                                            <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                                                {rec.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                
                /* === VIEW 2: DRILL / TAB MODE === */
                    <motion.div className="space-y-4">
                        {recommendations.map((rec, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-900/10 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-base font-bold text-slate-200 flex items-center gap-3">
                                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 text-xs text-slate-400 font-mono group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                            {index + 1}
                                        </span>
                                        {rec.title}
                                    </h3>
                                    
                                    {rec.category && (
                                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                            categoryColors[rec.category] || "bg-slate-800 text-slate-400 border-slate-700"
                                        }`}>
                                            {categoryIcons[rec.category] || <Activity className="w-3 h-3" />}
                                            {rec.category}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed pl-10 border-l-2 border-slate-800 ml-3.5 group-hover:border-purple-500/30 transition-colors">
                                    {rec.description}
                                </p>
                            </motion.div>
                        ))}
                        
                        {/* Load More Button (Only active in Drill/Tab Mode) */}
                        <div className="mt-8 text-center border-t border-slate-800 pt-6">
                            <button 
                                onClick={() => fetchRecommendations(activeTab, loadedCount + 5)} 
                                className="group flex items-center justify-center gap-2 mx-auto px-5 py-2 rounded-full bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-400 hover:text-white transition-all text-sm font-medium"
                            >
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                Load More Drills
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SportsRecommendations; 