import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Video, TrendingUp, Award, Globe, BarChart3, ArrowLeft } from "lucide-react";

const FeatureRow = ({ icon, title, text, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
      className="flex gap-4 items-start group"
    >
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-14 h-14 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors flex-shrink-0"
      >
        {React.cloneElement(icon, { className: "w-7 h-7 text-blue-400" })}
      </motion.div>
      <div>
        <h3 className="text-xl font-bold uppercase italic mb-2 text-white">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{text}</p>
      </div>
    </motion.div>
  );
};

const PerformanceGraph = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 opacity-20 blur-3xl rounded-full" />
      
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 border border-white/10 shadow-2xl backdrop-blur-sm">
        <div className="flex justify-between items-end h-48 gap-3 mb-6">
          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg relative group cursor-pointer"
            >
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-lg">
                {h}%
              </span>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-cyan-400 text-sm uppercase tracking-widest font-bold">
            Performance Analytics
          </p>
          <p className="text-slate-500 text-xs mt-1">Real-time tracking & insights</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function About() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Link to="/">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Back to Home</span>
          </motion.button>
        </Link>
      </div>

      {/* Main Content */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl font-black italic uppercase mb-4">
              Why <span className="text-blue-500">SportNova?</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              We're revolutionizing athletic talent discovery with cutting-edge technology and data-driven insights.
            </p>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-1 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto mt-4 rounded-full" 
            />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-8"
            >
              <FeatureRow 
                icon={<Video />} 
                title="Upload Performance Videos"
                text="Showcase your best moments with seamless video uploads. Support for all major formats with automatic optimization." 
                delay={0.5}
              />
              <FeatureRow 
                icon={<TrendingUp />} 
                title="AI-Powered Analytics"
                text="Track stamina, speed, strength, and technique with advanced AI algorithms that provide actionable insights." 
                delay={0.6}
              />
              <FeatureRow 
                icon={<Award />} 
                title="Get Discovered by Scouts"
                text="Your profile is matched with scouts and coaches searching for talent that matches your exact skillset and potential." 
                delay={0.7}
              />
              <FeatureRow 
                icon={<Globe />} 
                title="Global Opportunities"
                text="Connect with teams, academies, and recruiters from around the world looking for emerging talent." 
                delay={0.8}
              />
            </motion.div>

            <PerformanceGraph />
          </div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {[
              { value: "10K+", label: "Active Athletes" },
              { value: "500+", label: "Scouts & Coaches" },
              { value: "50+", label: "Countries" },
              { value: "95%", label: "Success Rate" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-xl border border-white/10 text-center"
              >
                <div className="text-4xl font-black text-blue-500 mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}