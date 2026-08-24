import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Video, Users, Trophy, Target, Lock, Eye, 
  BarChart3, ArrowLeft, Zap, Shield, Globe 
} from "lucide-react";

const FeatureCard = ({ icon, title, desc, color, delay = 0 }) => {
  const colorMap = {
    blue: { text: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/50", shadow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]" },
    orange: { text: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/50", shadow: "hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]" },
    green: { text: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/50", shadow: "hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]" },
    red: { text: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/50", shadow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]" },
    purple: { text: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/50", shadow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]" },
    cyan: { text: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-500/50", shadow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]" },
  };

  const colors = colorMap[color];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`group bg-slate-900/60 backdrop-blur-sm p-8 rounded-xl border ${colors.border} border-opacity-20 hover:border-opacity-100 transition-all ${colors.shadow}`}
    >
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`${colors.bg} w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:${colors.bg.replace('/20', '/30')} transition-all`}
      >
        {React.cloneElement(icon, { className: `w-8 h-8 ${colors.text}` })}
      </motion.div>
      <h3 className="text-xl font-bold uppercase italic text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-white to-transparent group-hover:w-full transition-all duration-500" />
    </motion.div>
  );
};

export default function Features() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
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
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl font-black italic uppercase mb-4">
              Platform <span className="bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">Features</span>
            </h1>
            <p className="text-slate-400 text-lg">Powerful tools designed for athletes, coaches, and scouts.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Video />} 
              title="Smart Video Analysis" 
              desc="AI-powered frame-by-frame breakdown of your performance with technique suggestions." 
              color="blue" 
              delay={0.1}
            />
            <FeatureCard 
              icon={<BarChart3 />} 
              title="Performance Tracking" 
              desc="Monitor progress over time with detailed charts, graphs, and trend analysis." 
              color="orange" 
              delay={0.2}
            />
            <FeatureCard 
              icon={<Users />} 
              title="Scout Network" 
              desc="Connect directly with verified scouts and coaches actively looking for talent." 
              color="green" 
              delay={0.3}
            />
            <FeatureCard 
              icon={<Trophy />} 
              title="Achievement System" 
              desc="Earn badges, certifications, and recognition for milestones and improvements." 
              color="red" 
              delay={0.4}
            />
            <FeatureCard 
              icon={<Lock />} 
              title="Privacy Controls" 
              desc="Complete control over who sees your data. Share selectively with teams and scouts." 
              color="purple" 
              delay={0.5}
            />
            <FeatureCard 
              icon={<Target />} 
              title="Goal Setting" 
              desc="Set personalized targets and receive AI recommendations to achieve them faster." 
              color="cyan" 
              delay={0.6}
            />
          </div>

          {/* Additional Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-20 grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Real-Time Updates",
                desc: "Instant notifications when scouts view your profile or new opportunities match your skills."
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure Platform",
                desc: "Bank-level encryption and data protection to keep your information safe and private."
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Global Reach",
                desc: "Access opportunities from teams and academies in over 50 countries worldwide."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm p-6 rounded-lg border border-white/10"
              >
                <div className="text-blue-400 mb-3">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
