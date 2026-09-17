import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full animate-spin"
            style={{ border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #00d4ff' }}
          />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    const roleDash = { superadmin: '/superadmin', admin: '/admin', staff: '/staff' };
    return <Navigate to={roleDash[profile.role] || '/staff'} replace />;
  }

  return children;
}
