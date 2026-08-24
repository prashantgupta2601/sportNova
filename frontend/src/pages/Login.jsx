import React, { useState } from "react";
import axios from "axios";
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

// --- REAL API CLIENT ---
import api from "../api/api";


export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", form);

      if (res.data.token && res.data.user) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setMsg("Login successful! Redirecting...");

        setTimeout(() => {
          const role = res.data.user.role;
          if (role === "coach") {
            window.location.href = "/coach";
          } else if (role === "admin") {
            window.location.href = "/admin";
          } else if (role === "scout") {
            window.location.href = "/scout";
          } else {
            window.location.href = "/dashboard";
          }
        }, 800);
      } else {
        setError(res.data.message || "Login failed: No token from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans relative overflow-hidden selection:bg-blue-500 selection:text-white">
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, #3b82f6 10px, #3b82f6 11px)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logo.png"
            alt="SportNova Logo"
            className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/80 p-8 rounded-sm border border-white/10 shadow-2xl relative group">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">
              Enter The <span className="text-blue-500">Arena</span>
            </h2>
            <p className="text-slate-400 text-sm">Access your athlete dashboard.</p>
          </div>

          <div className="space-y-6">

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-blue-400 uppercase ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 text-slate-500" />
                <input
                  name="email"
                  type="email"
                  placeholder="coach@example.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-sm text-white"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-blue-400 uppercase ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 text-slate-500" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 bg-slate-950 border border-slate-700 rounded-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-slate-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-sm skew-x-[-10deg]"
            >
              <div className="skew-x-[10deg] flex items-center justify-center gap-2 font-bold uppercase tracking-wide">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Accessing...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-3 bg-red-500/10 border-l-4 border-red-500 flex gap-3 text-red-400 text-sm">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {/* Success Message */}
          {msg && (
            <div className="mt-6 p-3 bg-green-500/10 border-l-4 border-green-500 flex gap-3 text-green-400 text-sm">
              <CheckCircle2 size={20} /> {msg}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-blue-400 hover:underline ml-1"
            >
              Create Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
