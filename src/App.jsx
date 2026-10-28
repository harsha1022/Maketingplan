import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';

import LandingPage        from './pages/LandingPage';
import RegisterPage       from './pages/RegisterPage';
import ConfirmationPage   from './pages/ConfirmationPage';
import LeaderboardPage    from './pages/LeaderboardPage';
import AdminLoginPage     from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPromotersPage from './pages/admin/AdminPromotersPage';
import AdminRegistrationsPage from './pages/admin/AdminRegistrationsPage';
import AdminSettingsPage  from './pages/admin/AdminSettingsPage';

function RequireAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><span className="spinner" style={{width:32,height:32,borderColor:'var(--color-gray-300)',borderTopColor:'var(--color-navy-800)'}} /></div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"              element={<LandingPage />} />
      <Route path="/register"      element={<RegisterPage />} />
      <Route path="/confirmation"  element={<ConfirmationPage />} />
      <Route path="/leaderboard"   element={<LeaderboardPage />} />

      {/* Admin */}
      <Route path="/admin/login"   element={<AdminLoginPage />} />
      <Route path="/admin"         element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
      <Route path="/admin/promoters" element={<RequireAdmin><AdminPromotersPage /></RequireAdmin>} />
      <Route path="/admin/registrations" element={<RequireAdmin><AdminRegistrationsPage /></RequireAdmin>} />
      <Route path="/admin/settings" element={<RequireAdmin><AdminSettingsPage /></RequireAdmin>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {!isSupabaseConfigured && (
          <div className="demo-banner">
            ⚠️ <strong>Demo Mode</strong> — Supabase is not configured. All data is simulated locally.
            See <a href="https://github.com/your-repo#setup" target="_blank" rel="noreferrer">setup instructions</a> to connect a real database.
          </div>
        )}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
