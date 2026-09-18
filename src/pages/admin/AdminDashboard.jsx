import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { StatCard } from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { Users, Layers, CheckCircle, TrendingUp, Activity, UserCheck, HeartPulse } from 'lucide-react';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ staff: 0, activeEvents: 0, completedEvents: 0, patientsToday: 0, waiting: 0, serving: 0 });

  useEffect(() => {
    async function fetchStats() {
      if (!profile?.id) return;
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const [staffRes, activeRes, completedRes, todayRes, waitingRes, servingRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'staff').eq('created_by', profile.id),
        supabase.from('events').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('events').select('id', { count: 'exact' }).eq('status', 'completed'),
        supabase.from('tickets').select('id', { count: 'exact' }).gte('created_at', todayStart.toISOString()),
        supabase.from('tickets').select('id', { count: 'exact' }).eq('status', 'waiting'),
        supabase.from('tickets').select('id', { count: 'exact' }).eq('status', 'serving'),
      ]);
      setStats({
        staff: staffRes.count || 0,
        activeEvents: activeRes.count || 0,
        completedEvents: completedRes.count || 0,
        patientsToday: todayRes.count || 0,
        waiting: waitingRes.count || 0,
        serving: servingRes.count || 0,
      });
    }
    fetchStats();
  }, [profile]);

  return (
    <div>
      <PageHeader title="PHC Admin Dashboard" subtitle={`Welcome back, ${profile?.username || 'Admin'} — Primary Health Centre`} />

      {/* Patient Footfall Stats */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity size={12} className="text-emerald-400" /> Patient Footfall — Today
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard title="Patients Today" value={stats.patientsToday} icon={UserCheck} color="#10b981" delay={0} />
          <StatCard title="Currently Waiting" value={stats.waiting} icon={Users} color="#00d4ff" delay={0.06} />
          <StatCard title="Being Served" value={stats.serving} icon={Activity} color="#f59e0b" delay={0.12} />
          <StatCard title="Completed Today" value={Math.max(0, stats.patientsToday - stats.waiting - stats.serving)} icon={CheckCircle} color="#7c3aed" delay={0.18} />
        </div>
      </div>

      {/* Operations Stats */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers size={12} className="text-cyan-400" /> Operations Overview
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard title="Healthcare Staff" value={stats.staff} icon={Users} color="#00d4ff" delay={0.24} />
          <StatCard title="Live Patient Queues" value={stats.activeEvents} icon={Layers} color="#10b981" delay={0.3} />
          <StatCard title="Completed Queues" value={stats.completedEvents} icon={CheckCircle} color="#f59e0b" delay={0.36} />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { label: 'Healthcare Staff', desc: 'Manage PHC staff accounts', icon: Users, color: '#00d4ff', to: '/admin/staff' },
            { label: 'Patient Queues', desc: 'Create and manage queues', icon: Layers, color: '#10b981', to: '/admin/queues' },
            { label: 'Patient Analytics', desc: 'View footfall & performance', icon: TrendingUp, color: '#7c3aed', to: '/admin/analytics' },
            { label: 'Health Intelligence', desc: 'Medicine stock & resources', icon: HeartPulse, color: '#ef4444', to: '/admin/health-intelligence' },
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
