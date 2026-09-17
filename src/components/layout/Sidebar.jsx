import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/useStore';
import {
  LayoutDashboard, Users, Settings, LogOut, ChevronLeft, ChevronRight,
  QrCode, ListChecks, BarChart3, ShieldCheck, UserCog, Layers, History
} from 'lucide-react';

const navByRole = {
  superadmin: [
    { label: 'Overview', icon: LayoutDashboard, to: '/superadmin' },
    { label: 'Manage Admins', icon: UserCog, to: '/superadmin/admins' },
    { label: 'System Stats', icon: BarChart3, to: '/superadmin/stats' },
    { label: 'Settings', icon: Settings, to: '/superadmin/settings' },
  ],
  admin: [
    { label: 'Overview', icon: LayoutDashboard, to: '/admin' },
    { label: 'Manage Staff', icon: Users, to: '/admin/staff' },
    { label: 'Manage Queues', icon: Layers, to: '/admin/queues' },
    { label: 'Analytics', icon: BarChart3, to: '/admin/analytics' },
    { label: 'Settings', icon: Settings, to: '/admin/settings' },
  ],
  staff: [
    { label: 'Overview', icon: LayoutDashboard, to: '/staff' },
    { label: 'Active Events', icon: ListChecks, to: '/staff/events' },
    { label: 'Past Events', icon: History, to: '/staff/past-events' },
    { label: 'Settings', icon: Settings, to: '/staff/settings' },
  ],
};

const roleColors = {
  superadmin: { accent: '#7c3aed', label: 'Super Admin', icon: ShieldCheck },
  admin: { accent: '#00d4ff', label: 'Admin', icon: UserCog },
  staff: { accent: '#10b981', label: 'Staff', icon: Users },
};

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const navigate = useNavigate();
  const role = profile?.role || 'staff';
  const navItems = navByRole[role] || navByRole.staff;
  const roleInfo = roleColors[role] || roleColors.staff;
  const RoleIcon = roleInfo.icon;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="glass hidden md:flex flex-col h-screen sticky top-0 z-40 overflow-hidden flex-shrink-0"
      style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Logo */}
      <div className="flex items-center px-4 py-5 gap-3" style={{ minHeight: 72 }}>
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}
        >
          <QrCode size={18} color="white" />
        </motion.div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-lg gradient-text whitespace-nowrap"
            >
              Queueless
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Role badge */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mx-3 mb-4 px-3 py-2 rounded-xl flex items-center gap-2"
            style={{
              background: `${roleInfo.accent}15`,
              border: `1px solid ${roleInfo.accent}30`,
            }}
          >
            <RoleIcon size={14} style={{ color: roleInfo.accent }} />
            <span className="text-xs font-semibold" style={{ color: roleInfo.accent }}>
              {roleInfo.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav links */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length <= 2}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'sidebar-link-active'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    style={{ color: isActive ? '#00d4ff' : undefined }}
                    className="flex-shrink-0"
                  />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info + sign out */}
      <div className="px-2 pb-4 space-y-2">
        <AnimatePresence>
          {!sidebarCollapsed && profile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="text-sm font-medium text-white truncate">
                {profile.username || profile.email || 'User'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={toggleSidebarCollapsed}
          className="flex items-center justify-center w-full py-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
