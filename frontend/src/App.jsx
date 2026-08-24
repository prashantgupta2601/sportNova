// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CoachDashboard from "./pages/CoachDashboard";
import AdminPanel from "./pages/AdminPanel";
import ScoutDashboard from "./pages/ScoutDashboard";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";


// -----------------------------------------------------------------------------
// 🔐 AUTH PROTECTION WRAPPER
// -----------------------------------------------------------------------------
function ProtectedRoute({ children, roles }) {
  const { user, token, loading } = useAuth();

  // Wait for AuthContext to load user state
  if (loading) return <div className="text-white p-10">Loading...</div>;

  // No token → not logged in
  if (!token) return <Navigate to="/login" replace />;

  // If specific roles are required → check them
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}


// -----------------------------------------------------------------------------
// 🚫 If logged in → redirect away from login/register
// -----------------------------------------------------------------------------
function PublicRoute({ children }) {
  const { token } = useAuth();
  if (token) return <Navigate to="/" replace />;
  return children;
}


// -----------------------------------------------------------------------------
// MAIN ROUTING
// -----------------------------------------------------------------------------
export default function App() {
  return (
    <Routes>

      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/contact" element={<Contact />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* PLAYER Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["player"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* COACH Dashboard */}
      <Route
        path="/coach"
        element={
          <ProtectedRoute roles={["coach"]}>
            <CoachDashboard />
          </ProtectedRoute>
        }
      />

      {/* ADMIN Panel */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* SCOUT Dashboard */}
      <Route
        path="/scout"
        element={
          <ProtectedRoute roles={["scout"]}>
            <ScoutDashboard />
          </ProtectedRoute>
        }
      />

      {/* Unauthorized Page */}
      <Route
        path="/unauthorized"
        element={
          <div className="text-center text-white p-20">
            <h1 className="text-3xl font-bold">Access Denied</h1>
            <p className="text-slate-400 mt-4">You do not have permission to access this page.</p>
          </div>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
