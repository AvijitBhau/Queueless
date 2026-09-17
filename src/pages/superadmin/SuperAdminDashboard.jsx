import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { StatCard } from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';
import { Users, ShieldCheck, Activity, TrendingUp } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, events: 0 });

  useEffect(() => {
    async function fetchStats() {
      const [admins, events] = await Promise.all([
        supabase.from('profiles').select('is_active').eq('role', 'admin'),
        supabase.from('events').select('id', { count: 'exact' }).eq('status', 'active'),
      ]);
      const total = admins.data?.length || 0;
      const active = admins.data?.filter(a => a.is_active).length || 0;
      setStats({ total, active, events: events.count || 0 });
    }
    fetchStats();
  }, []);

  return (
    <div>
      <PageHeader title="Super Admin" subtitle="System-wide overview and control panel" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Admins" value={stats.total} icon={Users} color="#7c3aed" delay={0} />
        <StatCard title="Active Admins" value={stats.active} icon={Activity} color="#10b981" delay={0.08} />
        <StatCard title="Live Queues" value={stats.events} icon={TrendingUp} color="#00d4ff" delay={0.16} />
        <StatCard title="System Status" value="Healthy" icon={ShieldCheck} color="#10b981" delay={0.24} />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Manage Admins', desc: 'Create and control admin accounts', icon: Users, color: '#7c3aed', to: '/superadmin/admins' },
            { label: 'System Stats', desc: 'View usage analytics', icon: TrendingUp, color: '#00d4ff', to: '/superadmin/stats' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className="glass-hover glass rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}20` }}>
                  <Icon size={18} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
