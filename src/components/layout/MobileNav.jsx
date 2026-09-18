import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, Users, Settings, LogOut, X, Menu,
  QrCode, ListChecks, BarChart3, ShieldCheck, UserCog, Layers, History, HeartPulse
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
    { label: 'Healthcare Staff', icon: Users, to: '/admin/staff' },
    { label: 'Patient Queues', icon: Layers, to: '/admin/queues' },
    { label: 'Analytics', icon: BarChart3, to: '/admin/analytics' },
    { label: 'Health Intelligence', icon: HeartPulse, to: '/admin/health-intelligence' },
    { label: 'Settings', icon: Settings, to: '/admin/settings' },
  ],
  staff: [
    { label: 'Overview', icon: LayoutDashboard, to: '/staff' },
    { label: 'Active Queues', icon: ListChecks, to: '/staff/events' },
    { label: 'Completed Queues', icon: History, to: '/staff/past-events' },
    { label: 'Settings', icon: Settings, to: '/staff/settings' },
  ],
};

const roleColors = {
  superadmin: { accent: '#7c3aed', label: 'Super Admin', icon: ShieldCheck },
  admin: { accent: '#00d4ff', label: 'PHC Admin', icon: UserCog },
  staff: { accent: '#10b981', label: 'Healthcare Staff', icon: Users },
};

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const role = profile?.role || 'staff';
  const navItems = navByRole[role] || navByRole.staff;
  const roleInfo = roleColors[role] || roleColors.staff;
  const RoleIcon = roleInfo.icon;

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile top bar */}
      <header
        className="md:hidden glass flex items-center justify-between px-4 py-3 sticky top-0 z-50"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}
          >
            <QrCode size={14} color="white" />
          </div>
          <span className="font-bold gradient-text">QueueLess <span style={{ color: '#10b981' }}>Health</span></span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Menu size={20} className="text-white" />
        </button>
      </header>

      {/* Overlay + Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 glass-strong flex flex-col md:hidden"
              style={{ borderRight: '1px solid rgba(255,255,255,0.15)' }}
            >
              <div className="flex items-center justify-between px-5 py-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}
                  >
                    <QrCode size={18} color="white" />
                  </div>
                  <span className="font-bold text-lg gradient-text">QueueLess <span style={{ color: '#10b981' }}>Health</span></span>
                </div>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X size={18} className="text-slate-400" />
                </button>
              </div>

              <div className="mx-4 mb-4 px-3 py-2 rounded-xl flex items-center gap-2"
                style={{ background: `${roleInfo.accent}15`, border: `1px solid ${roleInfo.accent}30` }}
              >
                <RoleIcon size={14} style={{ color: roleInfo.accent }} />
                <span className="text-xs font-semibold" style={{ color: roleInfo.accent }}>{roleInfo.label}</span>
              </div>

              <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                      <NavLink
                        to={item.to}
                        end={item.to.split('/').length <= 2}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            isActive ? 'sidebar-link-active' : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon size={18} style={{ color: isActive ? '#00d4ff' : undefined }} />
                            {item.label}
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="px-3 pb-6 space-y-2">
                {profile && (
                  <div className="px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate">{profile.username || profile.email || 'User'}</p>
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
