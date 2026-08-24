import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  User, Lock, Mail, ArrowRight, AlertCircle, 
  CheckCircle2, Eye, EyeOff, ShieldCheck, Megaphone, Search 
} from "lucide-react";

import api from "../api/api";


export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "player", age: "", gender: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/register", form);
      if (res.data.token) {
        setMsg("Registration successful! Redirecting...");
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setTimeout(() => { navigate("/login"); }, 1500);
      } else {
        setError(res.data.message || "Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans relative overflow-hidden selection:bg-blue-500 selection:text-white">
      
      {/* --- DYNAMIC SPORTS BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-slate-950" />
        {/* Stadium Spotlights */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px] mix-blend-screen" />
        {/* Speed Lines Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #3b82f6 10px, #3b82f6 11px)` }} 
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* --- LOGO --- */}
        <div className="flex justify-center mb-8">
          <img 
            src="/logo.png" 
            alt="SportNova Logo" 
            className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
          />
        </div>

        {/* --- FORM CONTAINER --- */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-sm border border-white/10 shadow-2xl relative group">
          
          {/* Decorative Border Glow */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 to-transparent opacity-20 group-hover:opacity-40 transition-opacity rounded-sm pointer-events-none" />

          <div className="text-center mb-8 relative">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">
              Join The <span className="text-blue-500">Squad</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium">Create your athlete profile.</p>
          </div>

          <form className="space-y-5 relative" onSubmit={handleSubmit}>
            
            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-white transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  name="name" 
                  placeholder="John Doe" 
                  type="text" 
                  required 
                  value={form.name} 
                  className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-700/50 rounded-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" 
                  onChange={handleChange} 
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  name="email" 
                  placeholder="you@example.com" 
                  type="email" 
                  required 
                  value={form.email} 
                  className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-700/50 rounded-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" 
                  onChange={handleChange} 
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-white transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  name="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={form.password} 
                  className="w-full pl-12 pr-12 py-3 bg-slate-950 border border-slate-700/50 rounded-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" 
                  onChange={handleChange} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Age and Gender Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Age Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Age</label>
                <input 
                  name="age" 
                  placeholder="25" 
                  type="number" 
                  min="5" 
                  max="100" 
                  value={form.age} 
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700/50 rounded-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" 
                  onChange={handleChange} 
                />
              </div>

              {/* Gender Select */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Gender</label>
                <select 
                  name="gender" 
                  value={form.gender} 
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700/50 rounded-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" 
                  onChange={handleChange}
                >
                  <option value="" className="bg-slate-900">Select</option>
                  <option value="male" className="bg-slate-900">Male</option>
                  <option value="female" className="bg-slate-900">Female</option>
                  <option value="other" className="bg-slate-900">Other</option>
                </select>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Select Role</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="cursor-pointer group">
                  <input type="radio" name="role" value="player" checked={form.role === 'player'} onChange={handleChange} className="hidden" />
                  <div className={`p-3 text-center rounded-sm border transition-all duration-300 relative overflow-hidden ${form.role === 'player' ? 'bg-blue-600 border-blue-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}>
                    {form.role === 'player' && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />}
                    <ShieldCheck className={`w-5 h-5 mx-auto mb-1 ${form.role === 'player' ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`font-black uppercase italic tracking-wider text-xs ${form.role === 'player' ? 'text-white' : 'text-slate-400'}`}>Player</span>
                  </div>
                </label>
                <label className="cursor-pointer group">
                  <input type="radio" name="role" value="coach" checked={form.role === 'coach'} onChange={handleChange} className="hidden" />
                  <div className={`p-3 text-center rounded-sm border transition-all duration-300 relative overflow-hidden ${form.role === 'coach' ? 'bg-orange-600 border-orange-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}>
                    {form.role === 'coach' && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />}
                    <Megaphone className={`w-5 h-5 mx-auto mb-1 ${form.role === 'coach' ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`font-black uppercase italic tracking-wider text-xs ${form.role === 'coach' ? 'text-white' : 'text-slate-400'}`}>Coach</span>
                  </div>
                </label>
                <label className="cursor-pointer group">
                  <input type="radio" name="role" value="scout" checked={form.role === 'scout'} onChange={handleChange} className="hidden" />
                  <div className={`p-3 text-center rounded-sm border transition-all duration-300 relative overflow-hidden ${form.role === 'scout' ? 'bg-green-600 border-green-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}>
                    {form.role === 'scout' && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />}
                    <Search className={`w-5 h-5 mx-auto mb-1 ${form.role === 'scout' ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`font-black uppercase italic tracking-wider text-xs ${form.role === 'scout' ? 'text-white' : 'text-slate-400'}`}>Scout</span>
                  </div>
                </label>
                <label className="cursor-pointer group">
                  <input type="radio" name="role" value="admin" checked={form.role === 'admin'} onChange={handleChange} className="hidden" />
                  <div className={`p-3 text-center rounded-sm border transition-all duration-300 relative overflow-hidden ${form.role === 'admin' ? 'bg-purple-600 border-purple-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}>
                    {form.role === 'admin' && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />}
                    <ShieldCheck className={`w-5 h-5 mx-auto mb-1 ${form.role === 'admin' ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`font-black uppercase italic tracking-wider text-xs ${form.role === 'admin' ? 'text-white' : 'text-slate-400'}`}>Admin</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button (Skewed Style) */}
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-sm skew-x-[-10deg] transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-70 disabled:hover:scale-100 mt-6"
            >
              <div className="skew-x-[10deg] flex items-center justify-center gap-2 font-black uppercase tracking-wide">
                {isLoading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Processing...</span></>
                ) : (
                  <><span>Start Career</span><ArrowRight className="w-5 h-5" /></>
                )}
              </div>
            </button>
          </form>

          {/* Feedback Messages */}
          {error && (
            <div className="mt-6 p-3 bg-red-500/10 border-l-4 border-red-500 flex items-start gap-3 text-red-400 text-sm font-medium animate-pulse">
              <AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {msg && (
            <div className="mt-6 p-3 bg-green-500/10 border-l-4 border-green-500 flex items-start gap-3 text-green-400 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" /><span>{msg}</span>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-slate-400 text-sm font-medium">
              Already have an account? <Link to="/login" className="text-blue-400 hover:text-white transition-colors font-bold uppercase italic tracking-wider ml-1 hover:underline decoration-blue-500 underline-offset-4">Sign In</Link>
            </p>
            <p className="text-xs text-slate-600 mt-4">
              Need help? <a href="mailto:shivamkumarp447@gmail.com" className="hover:text-slate-400 transition-colors">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}