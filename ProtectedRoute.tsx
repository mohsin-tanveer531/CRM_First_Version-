// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    // Not authenticated → redirect to login
    return <Navigate to="/login" replace />;
  }
  // Otherwise, render whatever was passed inside <ProtectedRoute> … </ProtectedRoute>
  return <>{children}</>;
}
