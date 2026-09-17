import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import PageHeader from '../../components/ui/PageHeader';
import { GlassCard, StatCard } from '../../components/ui/GlassCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Layers, Users, CheckCircle } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return <div className="glass rounded-xl p-3"><p className="text-xs text-slate-400">{label}</p><p className="text-white font-bold">{payload[0].value}</p></div>;
  }
  return null;
};

export default function AdminAnalytics() {
  const [stats, setStats] = useState({ events: 0, tickets: 0, completed: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function load() {
      const [eventsRes, ticketsRes, completedRes] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact' }),
        supabase.from('tickets').select('id', { count: 'exact' }),
        supabase.from('events').select('id', { count: 'exact' }).eq('status', 'completed'),
      ]);
      setStats({ events: eventsRes.count || 0, tickets: ticketsRes.count || 0, completed: completedRes.count || 0 });

      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
      }
      const tickRes = await supabase.from('tickets').select('created_at').gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString());
      const counts = {}; days.forEach(d => { counts[d] = 0; });
      (tickRes.data || []).forEach(t => { const day = t.created_at?.split('T')[0]; if (counts[day] !== undefined) counts[day]++; });
      setChartData(days.map(d => ({ day: d.slice(5), tickets: counts[d] })));
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Queue performance and usage metrics" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Events" value={stats.events} icon={Layers} color="#00d4ff" delay={0} />
        <StatCard title="Tickets Issued" value={stats.tickets} icon={Users} color="#7c3aed" delay={0.08} />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="#10b981" delay={0.16} />
      </div>
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Tickets Issued – Last 7 Days</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="tickets" fill="url(#grad2)" radius={[6, 6, 0, 0]} />
            <defs><linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00d4ff" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient></defs>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
