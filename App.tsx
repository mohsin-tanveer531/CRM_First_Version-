// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login        from './routes/Login';
import Dashboard    from './routes/Dashboard';
import ManageUsers  from './routes/ManageUsers';
import ManageSuperAdmins from './routes/ManageSuperAdmins';
import ManageProcessors from './routes/Processors';
import InactivityTimer from "./utils/InactivityTimer";

import Alerts       from './routes/Alerts';

export default function App() {
  return (
    <BrowserRouter>
    <InactivityTimer />
      <Routes>
        {/* ── public ─────────────────────────────────────────── */}
        <Route path="/"        element={<Navigate to="/login" replace />} />
        <Route path="login"    element={<Login />} />
        

        {/* ── protected pages (each one renders its own sidebar/top-bar) ── */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />

        <Route
          path="manage-users"
          element={
            <ProtectedRoute>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="processors"
          element={
            <ProtectedRoute>
              <ManageProcessors />
            </ProtectedRoute>
          }
        />
         <Route
          path="/super-admins"
          element={
            <ProtectedRoute>
              <ManageSuperAdmins  />
            </ProtectedRoute>
          }
        />

        {/* ── anything unknown → login ───────────────────────── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
