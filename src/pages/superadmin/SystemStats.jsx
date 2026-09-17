import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import PageHeader from '../../components/ui/PageHeader';
import { GlassCard, StatCard } from '../../components/ui/GlassCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Layers, CheckCircle } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl p-3">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-white font-bold">{payload[0].value} events</p>
      </div>
    );
  }
  return null;
};

export default function SystemStats() {
  const [data, setData] = useState({ admins: 0, staff: 0, activeEvents: 0, completedEvents: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function load() {
      const [admins, staff, active, completed] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'admin'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'staff'),
        supabase.from('events').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('events').select('id', { count: 'exact' }).eq('status', 'completed'),
      ]);
      setData({ admins: admins.count || 0, staff: staff.count || 0, activeEvents: active.count || 0, completedEvents: completed.count || 0 });

      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
      }
      const eventsRes = await supabase.from('events').select('created_at').gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString());
      const counts = {}; days.forEach(d => { counts[d] = 0; });
      (eventsRes.data || []).forEach(e => { const day = e.created_at.split('T')[0]; if (counts[day] !== undefined) counts[day]++; });
      setChartData(days.map(d => ({ day: d.slice(5), events: counts[d] })));
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader title="System Stats" subtitle="Platform-wide usage metrics" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Admins" value={data.admins} icon={Users} color="#7c3aed" delay={0} />
        <StatCard title="Staff" value={data.staff} icon={Users} color="#00d4ff" delay={0.08} />
        <StatCard title="Live Queues" value={data.activeEvents} icon={Layers} color="#10b981" delay={0.16} />
        <StatCard title="Completed" value={data.completedEvents} icon={CheckCircle} color="#f59e0b" delay={0.24} />
      </div>
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Events Created – Last 7 Days</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="events" fill="url(#grad)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#00d4ff" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
