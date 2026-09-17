import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/ui/PageHeader';
import { GlassCard } from '../../components/ui/GlassCard';
import { History, ChevronRight, Clock, Users, CheckCircle } from 'lucide-react';
import { timeAgo } from '../../lib/queueUtils';

export default function PastEvents() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!profile?.id) return;
      setLoading(true);
      const { data } = await supabase
        .from('events')
        .select('*, tickets(count)')
        .eq('created_by', profile.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      setEvents(data || []);
      setLoading(false);
    }
    fetch();
  }, [profile]);

  return (
    <div>
      <PageHeader title="Past Events" subtitle={`${events.length} completed event${events.length !== 1 ? 's' : ''}`} />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #10b981' }} />
        </div>
      ) : events.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <History size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No completed events yet.</p>
          <p className="text-slate-500 text-sm mt-1">Events you end will appear here.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {events.map((event, i) => {
            const ticketCount = event.tickets?.[0]?.count || 0;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5 flex items-center gap-4"
                style={{ borderLeft: '3px solid #64748b' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(100,116,139,0.15)' }}>
                  <CheckCircle size={18} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">{event.name}</p>
                    <span className="badge-inactive">Completed</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Users size={11} className="text-slate-500" />
                      <span className="text-xs text-slate-400">{ticketCount} served</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={11} className="text-slate-500" />
                      <span className="text-xs text-slate-400">{event.time_per_person}min/person</span>
                    </div>
                    <span className="text-xs text-slate-500">{timeAgo(event.created_at)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
