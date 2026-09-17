import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { StatCard } from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { Users, Layers, CheckCircle, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ staff: 0, activeEvents: 0, completedEvents: 0 });

  useEffect(() => {
    async function fetchStats() {
      if (!profile?.id) return;
      const [staffRes, activeRes, completedRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'staff').eq('created_by', profile.id),
        supabase.from('events').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('events').select('id', { count: 'exact' }).eq('status', 'completed'),
      ]);
      setStats({ staff: staffRes.count || 0, activeEvents: activeRes.count || 0, completedEvents: completedRes.count || 0 });
    }
    fetchStats();
  }, [profile]);

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle={`Welcome back, ${profile?.username || 'Admin'}`} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Staff Members" value={stats.staff} icon={Users} color="#00d4ff" delay={0} />
        <StatCard title="Live Queues" value={stats.activeEvents} icon={Layers} color="#10b981" delay={0.08} />
        <StatCard title="Completed Events" value={stats.completedEvents} icon={CheckCircle} color="#f59e0b" delay={0.16} />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Manage Staff', desc: 'Create and manage staff', icon: Users, color: '#00d4ff', to: '/admin/staff' },
            { label: 'Manage Queues', desc: 'Create and run queues', icon: Layers, color: '#10b981', to: '/admin/queues' },
            { label: 'Analytics', desc: 'View performance data', icon: TrendingUp, color: '#7c3aed', to: '/admin/analytics' },
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
