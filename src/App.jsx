import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';

// Layout
import DashboardShell from './components/layout/DashboardShell';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Landing
import LandingPage from './pages/LandingPage';

// SuperAdmin
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import ManageAdmins from './pages/superadmin/ManageAdmins';
import SystemStats from './pages/superadmin/SystemStats';
import SuperAdminSettings from './pages/superadmin/SuperAdminSettings';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStaff from './pages/admin/ManageStaff';
import ManageQueues from './pages/admin/ManageQueues';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import HealthIntelligence from './pages/admin/HealthIntelligence';

// Staff
import StaffDashboard from './pages/staff/StaffDashboard';
import EventManager from './pages/staff/EventManager';
import PastEvents from './pages/staff/PastEvents';
import StaffSettings from './pages/staff/StaffSettings';

// Customer
import TicketPage from './pages/customer/TicketPage';

// / → show landing for guests, redirect to dashboard for logged-in users
function RootRoute() {
  const { user, profile, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #00d4ff' }} />
    </div>
  );
  // Authenticated — go to the right dashboard
  if (user) {
    if (profile?.role === 'superadmin') return <Navigate to="/superadmin" replace />;
    if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/staff" replace />;
  }
  // Guest — show landing page
  return <LandingPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15,12,41,0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#f1f5f9',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/q/:queueCode" element={<TicketPage />} />
        <Route path="/" element={<RootRoute />} />

        {/* SuperAdmin Routes */}
        <Route path="/superadmin" element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <DashboardShell />
          </ProtectedRoute>
        }>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="admins" element={<ManageAdmins />} />
          <Route path="stats" element={<SystemStats />} />
          <Route path="settings" element={<SuperAdminSettings />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardShell />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="staff" element={<ManageStaff />} />
          <Route path="queues" element={<ManageQueues />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="health-intelligence" element={<HealthIntelligence />} />
          <Route path="settings" element={<AdminSettings />} />
          {/* Admin can also manage individual events */}
          <Route path="events/:eventId" element={<EventManager />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <DashboardShell />
          </ProtectedRoute>
        }>
          <Route index element={<StaffDashboard />} />
          <Route path="events" element={<StaffDashboard />} />
          <Route path="events/:eventId" element={<EventManager />} />
          <Route path="past-events" element={<PastEvents />} />
          <Route path="settings" element={<StaffSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
