import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Menu, X, User, LogOut, LayoutDashboard, Video,
  BarChart, Users, ShieldCheck, Mail, ChevronRight,
  Sparkles, TrendingUp, Award, Phone, PlayCircle,
  Trophy, Activity, Target, Zap, Eye, Globe, Lock, CheckCircle
} from "lucide-react";

import api from "../api/api";

const LegalModal = ({ title, content, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-sm shadow-2xl p-8 overflow-y-auto max-h-[80vh]">
        <button 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-all hover:rotate-90"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-2xl font-black uppercase italic tracking-wider text-white mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
          <span className="text-blue-500">|</span> {title}
        </h3>
        <div className="text-slate-300 space-y-4 whitespace-pre-line font-medium">
          {content}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", content: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.clear();
          setUser(null);
        });
    }
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoutUser = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  const openModal = (type) => {
    if (type === "privacy") {
      setModalContent({
        title: "Privacy Policy",
        content: "1. Data Collection\nWe collect performance data, videos, and profile details.\n\n2. Game Analysis\nUsed strictly for AI insights.\n\nContact: shivamkumarp447@gmail.com",
      });
    } else if (type === "terms") {
      setModalContent({
        title: "Terms of Service",
        content: "1. Fair Use\nUpload only authentic gameplay.\n\n2. Conduct\nRespect coaches & athletes.\n\n3. Liability\nAI analysis accuracy may vary.",
      });
    } else {
      setModalContent({
        title: "Support",
        content: "We're available 24/7.\n\nEmail: shivamkumarp447@gmail.com\nPhone: +91 8252980774",
      });
    }
    setModalOpen(true);
  };

  const navigateHome = () => (window.location.href = "/");

  return (
    <div className="bg-slate-950 text-white overflow-x-hidden relative font-sans">
      <LegalModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalContent.title} content={modalContent.content} />
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 blur-[150px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, #3b82f6 10px, #3b82f6 11px)" }} />
      </div>

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? "bg-slate-950/90 border-b border-white/10 backdrop-blur-xl shadow-lg" : "bg-transparent pt-4"}`}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={navigateHome}>
            <img src="/logo.png" alt="SportNova Logo" className="h-12 w-auto hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm uppercase font-bold tracking-wide italic">
            <Link to="/about" className="text-slate-400 hover:text-white transition-colors relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-1 bg-blue-600 skew-x-[-20deg] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link to="/features" className="text-slate-400 hover:text-white transition-colors relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-1 bg-blue-600 skew-x-[-20deg] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link to="/contact" className="text-slate-400 hover:text-white transition-colors relative group">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-1 bg-blue-600 skew-x-[-20deg] group-hover:w-full transition-all duration-300" />
            </Link>

            {user ? (
              <>
                <a href={user.role === "coach" ? "/coach" : user.role === "admin" ? "/admin" : user.role === "scout" ? "/scout" : "/dashboard"} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-sm skew-x-[-10deg] flex items-center gap-2">
                  <span className="skew-x-[10deg] flex gap-2"><LayoutDashboard className="w-4 h-4" /> Dashboard</span>
                </a>
                <button onClick={logoutUser} className="border border-red-500/50 text-red-400 px-6 py-2 rounded-sm skew-x-[-10deg] hover:bg-red-500 hover:text-white">
                  <span className="skew-x-[10deg] flex gap-2"><LogOut className="w-4 h-4" /> Exit</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <a href="/login" className="text-white hover:text-blue-400 font-bold italic">Login</a>
                <a href="/register" className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-2 rounded-sm skew-x-[-10deg] hover:scale-105 transition-transform">
                  <span className="skew-x-[10deg] flex items-center gap-2">Join Now <ChevronRight className="w-4 h-4" /></span>
                </a>
              </div>
            )}
          </nav>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </header>

      <div className={`fixed top-[80px] left-0 right-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 ${isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
        <div className="p-6 space-y-4 font-bold uppercase italic">
          <Link to="/about" className="block text-slate-300 hover:text-white py-3 border-b border-white/5" onClick={() => setIsMenuOpen(false)}>About</Link>
          <Link to="/features" className="block text-slate-300 hover:text-white py-3 border-b border-white/5" onClick={() => setIsMenuOpen(false)}>Features</Link>
          <Link to="/contact" className="block text-slate-300 hover:text-white py-3 border-b border-white/5" onClick={() => setIsMenuOpen(false)}>Contact</Link>
          <div className="pt-4 space-y-3 not-italic">
            {user ? (
              <button onClick={() => { logoutUser(); setIsMenuOpen(false); }} className="w-full bg-red-600 py-3 rounded-sm">Logout</button>
            ) : (
              <>
                <a href="/login" className="block text-center py-3 text-slate-300">Login</a>
                <a href="/register" className="block bg-blue-600 text-white py-3 rounded-sm text-center">Join Now</a>
              </>
            )}
          </div>
        </div>
      </div>

      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <ContactSection />
      <FooterSection openModal={openModal} />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative z-10 pt-48 pb-32 px-6 overflow-hidden text-center">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 px-5 py-2 rounded-full mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="text-sm text-blue-300 font-bold uppercase tracking-widest">Talent Unleashed</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-7xl md:text-8xl font-black italic uppercase leading-[0.9] mb-8">
          DOMINATE <br />
          <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-white text-transparent bg-clip-text animate-gradient">THE GAME</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="max-w-2xl mx-auto text-slate-400 text-xl font-medium leading-relaxed">
          <span className="text-white font-bold">SportNova</span> connects raw talent with world-class opportunities. Upload your highlights, get AI analysis, and get scouted.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
          <motion.a href="/register" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="group bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 rounded-lg shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] transition-all">
            <span className="flex items-center justify-center gap-3 font-black uppercase tracking-wide">Start Career <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
          </motion.a>
          <motion.a href="#features" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="group border border-white/20 px-8 py-4 rounded-lg backdrop-blur-sm hover:bg-white/5 transition-all">
            <span className="flex items-center justify-center gap-3 font-bold uppercase tracking-wide"><PlayCircle className="w-5 h-5" /> How It Works</span>
          </motion.a>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="mt-24 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-white/10 py-12 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.1)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto px-6">
            <StatCard number="10k+" label="Athletes" icon={<Users className="w-6 h-6 text-blue-500" />} delay={0.9} />
            <StatCard number="1.2k+" label="Scouts" icon={<Eye className="w-6 h-6 text-orange-500" />} delay={1.0} />
            <StatCard number="98%" label="Match Rate" icon={<Target className="w-6 h-6 text-green-500" />} delay={1.1} />
            <StatCard number="#1" label="Rated Platform" icon={<Trophy className="w-6 h-6 text-yellow-500" />} delay={1.2} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 bg-gradient-to-b from-slate-900/30 to-transparent border-y border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-5xl font-black italic uppercase mb-4">Why <span className="text-blue-500">SportNova?</span></h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">We're revolutionizing athletic talent discovery with cutting-edge technology and data-driven insights.</p>
          <motion.div initial={{ width: 0 }} whileInView={{ width: 96 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, delay: 0.3 }} className="h-1 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto mt-4 rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }} className="space-y-8">
            <FeatureRow icon={<Video />} title="Upload Performance Videos" text="Showcase your best moments with seamless video uploads. Support for all major formats with automatic optimization." delay={0.1} />
            <FeatureRow icon={<TrendingUp />} title="AI-Powered Analytics" text="Track stamina, speed, strength, and technique with advanced AI algorithms that provide actionable insights." delay={0.2} />
            <FeatureRow icon={<Award />} title="Get Discovered by Scouts" text="Your profile is matched with scouts and coaches searching for talent that matches your exact skillset and potential." delay={0.3} />
            <FeatureRow icon={<Globe />} title="Global Opportunities" text="Connect with teams, academies, and recruiters from around the world looking for emerging talent." delay={0.4} />
          </motion.div>
          <PerformanceGraph />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-5xl font-black italic uppercase mb-4">Platform <span className="bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">Features</span></h2>
          <p className="text-slate-400 text-lg">Powerful tools designed for athletes, coaches, and scouts.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon={<Video />} title="Smart Video Analysis" desc="AI-powered frame-by-frame breakdown of your performance with technique suggestions." color="blue" delay={0.1} />
          <FeatureCard icon={<BarChart />} title="Advanced Analytics" desc="Deep performance stats with trend analysis and predictive modeling." color="orange" delay={0.2} />
          <FeatureCard icon={<Users />} title="Player Comparison" desc="Head-to-head metrics comparison with benchmarking against top performers." color="green" delay={0.3} />
          <FeatureCard icon={<ShieldCheck />} title="Coach Dashboard" desc="Comprehensive team management with player tracking and assessment tools." color="red" delay={0.4} />
          <FeatureCard icon={<Eye />} title="Scout Network" desc="Direct access to talent scouts and recruiters actively seeking athletes." color="purple" delay={0.5} />
          <FeatureCard icon={<Zap />} title="Real-Time Updates" desc="Instant notifications for scout views, messages, and recruitment opportunities." color="cyan" delay={0.6} />
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contact" className="py-24 px-6 bg-gradient-to-b from-transparent to-slate-900/30">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h2 className="text-5xl font-black italic uppercase mb-4">Get in <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text">Touch</span></h2>
          <p className="text-slate-400 text-lg">We're here to help you reach your athletic potential.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.a href="mailto:shivamkumarp447@gmail.com" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: 0.2 }} whileHover={{ scale: 1.02, translateY: -5 }} className="group bg-gradient-to-br from-slate-900 to-slate-800 p-8 border border-blue-500/20 rounded-lg hover:border-blue-500/50 transition-all shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <Mail className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase italic text-white">Email Support</h3>
                <p className="text-sm text-blue-400">24/7 Response</p>
              </div>
            </div>
            <p className="text-slate-300 mb-2 font-medium">shivamkumarp447@gmail.com</p>
            <span className="text-blue-400 text-sm font-bold uppercase group-hover:underline flex items-center gap-2">Send Message <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
          </motion.a>

          <motion.a href="tel:+918252980774" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: 0.3 }} whileHover={{ scale: 1.02, translateY: -5 }} className="group bg-gradient-to-br from-slate-900 to-slate-800 p-8 border border-green-500/20 rounded-lg hover:border-green-500/50 transition-all shadow-lg hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <Phone className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase italic text-white">Direct Line</h3>
                <p className="text-sm text-green-400">Instant Connect</p>
              </div>
            </div>
            <p className="text-slate-300 mb-2 font-medium">+91 8252980774</p>
            <span className="text-green-400 text-sm font-bold uppercase group-hover:underline flex items-center gap-2">Call Now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
          </motion.a>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: 0.4 }} className="mt-12 text-center bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-lg p-8">
          <h3 className="text-xl font-bold mb-4 text-white">Need Help Getting Started?</h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">Our team is available to answer questions, provide platform demos, and help you maximize your athletic profile. Whether you're an athlete, coach, or scout, we're here to support your journey.</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /><span>Quick Response</span></div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /><span>Expert Guidance</span></div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /><span>Free Consultation</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FooterSection({ openModal }) {
  return (
    <footer className="relative py-16 px-6 border-t border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="SportNova" className="h-12 drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
              <span className="text-2xl font-black italic text-white">SPORTNOVA</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-6 max-w-md">Empowering athletes worldwide with cutting-edge AI technology and connecting talent with opportunities. Your journey to greatness starts here.</p>
            <div className="flex gap-4">
              <motion.a href="#" whileHover={{ scale: 1.1, y: -2 }} className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"><Globe className="w-5 h-5" /></motion.a>
              <motion.a href="mailto:shivamkumarp447@gmail.com" whileHover={{ scale: 1.1, y: -2 }} className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"><Mail className="w-5 h-5" /></motion.a>
              <motion.a href="tel:+918252980774" whileHover={{ scale: 1.1, y: -2 }} className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"><Phone className="w-5 h-5" /></motion.a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4 flex items-center gap-2"><span className="text-blue-500">|</span> Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-slate-400 hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link to="/features" className="text-slate-400 hover:text-blue-400 transition-colors">Features</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-blue-400 transition-colors">Contact</Link></li>
              <li><a href="/register" className="text-slate-400 hover:text-blue-400 transition-colors">Get Started</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4 flex items-center gap-2"><span className="text-blue-500">|</span> Legal</h4>
            <ul className="space-y-3">
              <li><button onClick={() => openModal("privacy")} className="text-slate-400 hover:text-blue-400 transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => openModal("terms")} className="text-slate-400 hover:text-blue-400 transition-colors">Terms of Service</button></li>
              <li><button onClick={() => openModal("support")} className="text-slate-400 hover:text-blue-400 transition-colors">Support</button></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mb-8">
          <div className="flex flex-wrap justify-center gap-8 text-slate-500 text-sm">
            <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-green-500" /><span>Secure Platform</span></div>
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-500" /><span>Verified Scouts</span></div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-500" /><span>Trusted by 10k+ Athletes</span></div>
            <div className="flex items-center gap-2"><Award className="w-4 h-4 text-yellow-500" /><span>#1 Talent Platform</span></div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>© {new Date().getFullYear()} SportNova Inc.</span>
            <span className="text-slate-700">|</span>
            <span>All rights reserved</span>
          </div>
          <div className="text-slate-500 text-sm flex items-center gap-2">Made with <span className="text-red-500 animate-pulse">❤</span> for Athletes</div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
    </footer>
  );
}

function StatCard({ number, label, icon, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay }} whileHover={{ scale: 1.05, y: -5 }} className="group text-center flex flex-col items-center cursor-pointer relative">
      <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }} className="mb-3">{icon}</motion.div>
      <div className="text-4xl font-black italic mb-1 bg-gradient-to-r from-white to-slate-300 text-transparent bg-clip-text">{number}</div>
      <div className="text-slate-400 text-xs uppercase tracking-widest">{label}</div>
      <div className="absolute -inset-2 bg-blue-500/0 group-hover:bg-blue-500/5 rounded-xl transition-all -z-10" />
    </motion.div>
  );
}

function FeatureRow({ icon, title, text, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay }} className="flex gap-4 items-start group">
      <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-14 h-14 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors flex-shrink-0">
        {React.cloneElement(icon, { className: "w-7 h-7 text-blue-400" })}
      </motion.div>
      <div>
        <h3 className="text-xl font-bold uppercase italic mb-2 text-white">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{text}</p>
      </div>
    </motion.div>
  );
}

function PerformanceGraph() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8 }} className="relative">
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 opacity-20 blur-3xl rounded-full" />
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 border border-white/10 shadow-2xl backdrop-blur-sm">
        <div className="flex justify-between items-end h-48 gap-3 mb-6">
          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
            <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, delay: i * 0.1 }} whileHover={{ scale: 1.05 }} className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg relative group cursor-pointer">
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-lg">{h}%</span>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-cyan-400 text-sm uppercase tracking-widest font-bold">Performance Analytics</p>
          <p className="text-slate-500 text-xs mt-1">Real-time tracking & insights</p>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc, color, delay = 0 }) {
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
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay }} whileHover={{ y: -8, scale: 1.02 }} className={`group bg-slate-900/60 backdrop-blur-sm p-8 rounded-xl border ${colors.border} border-opacity-20 hover:border-opacity-100 transition-all ${colors.shadow}`}>
      <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className={`${colors.bg} w-16 h-16 rounded-lg flex items-center justify-center mb-6 transition-all`}>
        {React.cloneElement(icon, { className: `w-8 h-8 ${colors.text}` })}
      </motion.div>
      <h3 className="text-xl font-bold uppercase italic text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-white to-transparent group-hover:w-full transition-all duration-500" />
    </motion.div>
  );
}