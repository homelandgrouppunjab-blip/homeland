import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-[color:var(--lux-ivory)]/50">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
