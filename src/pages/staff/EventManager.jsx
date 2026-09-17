import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useRealtimeQueue } from '../../hooks/useRealtimeQueue';
import { calcEstimatedWait } from '../../lib/queueUtils';
import { SkipForward, PauseCircle, PlayCircle, CheckCircle, Users, Clock, ArrowLeft, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

function TicketBadge({ number, onAction, actionLabel, actionColor, children }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, x: 30 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: -30 }}
      className="glass rounded-xl p-3 flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.08)', color: '#f1f5f9' }}>
        #{number}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
      {onAction && (
        <button onClick={onAction}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
          style={{ background: `${actionColor}20`, border: `1px solid ${actionColor}40`, color: actionColor }}>
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}

export default function EventManager() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Derived state
  const waitingTickets = tickets.filter(t => t.status === 'waiting').sort((a, b) => a.ticket_number - b.ticket_number);
  const servingTicket = tickets.find(t => t.status === 'serving');
  const holdTickets = tickets.filter(t => t.status === 'hold').sort((a, b) => a.ticket_number - b.ticket_number);
  const doneTickets = tickets.filter(t => t.status === 'done');

  const fetchAll = useCallback(async () => {
    const [eventRes, ticketRes] = await Promise.all([
      supabase.from('events').select('*').eq('id', eventId).single(),
      supabase.from('tickets').select('*').eq('event_id', eventId).order('ticket_number'),
    ]);
    if (eventRes.data) setEvent(eventRes.data);
    if (ticketRes.data) setTickets(ticketRes.data);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Subscribe to realtime updates
  useRealtimeQueue(eventId, fetchAll);

  async function callNext() {
    if (!waitingTickets.length) { toast('No more people in queue!', { icon: '🎉' }); return; }
    setActionLoading(true);
    try {
      // Mark current serving as done
      if (servingTicket) {
        await supabase.from('tickets').update({ status: 'done', served_at: new Date().toISOString() }).eq('id', servingTicket.id);
      }
      // Promote first waiting to serving
      const next = waitingTickets[0];
      await supabase.from('tickets').update({ status: 'serving' }).eq('id', next.id);
      await fetchAll();
      toast.success(`Now serving #${next.ticket_number}`);
    } finally { setActionLoading(false); }
  }

  async function holdCurrent() {
    if (!servingTicket) { toast.error('No one is currently being served'); return; }
    setActionLoading(true);
    await supabase.from('tickets').update({ status: 'hold' }).eq('id', servingTicket.id);
    // Optionally auto-call next
    if (waitingTickets.length > 0) {
      await supabase.from('tickets').update({ status: 'serving' }).eq('id', waitingTickets[0].id);
      toast.success(`#${servingTicket.ticket_number} held. Now serving #${waitingTickets[0].ticket_number}`);
    } else {
      toast(`#${servingTicket.ticket_number} placed on hold`, { icon: '⏸' });
    }
    await fetchAll();
    setActionLoading(false);
  }

  async function recallHeld(ticket) {
    setActionLoading(true);
    // If someone is currently being served, first hold them
    if (servingTicket) {
      await supabase.from('tickets').update({ status: 'hold' }).eq('id', servingTicket.id);
    }
    await supabase.from('tickets').update({ status: 'serving' }).eq('id', ticket.id);
    await fetchAll();
    toast.success(`Recalling #${ticket.ticket_number}`);
    setActionLoading(false);
  }

  async function endEvent() {
    if (!window.confirm('Mark this event as completed? This cannot be undone.')) return;
    await supabase.from('events').update({ status: 'completed' }).eq('id', eventId);
    toast.success('Event marked as completed');
    navigate('/staff');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #10b981' }} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Event not found.</p>
        <button onClick={() => navigate('/staff')} className="btn-glass mt-4">Go Back</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/staff')} className="p-2 rounded-xl hover:bg-white/10 transition-all">
          <ArrowLeft size={20} className="text-slate-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{event.name}</h1>
            <span className="badge-active">LIVE</span>
          </div>
          <p className="text-sm text-slate-400">{event.time_per_person} min per person</p>
        </div>
        <button onClick={endEvent} className="btn-danger text-sm flex items-center gap-1.5 flex-shrink-0">
          <CheckCircle size={15} /> End Event
        </button>
      </div>

      {/* Main layout: 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* === LEFT: Queue Stats + Controls === */}
        <div className="lg:col-span-2 space-y-5">

          {/* Currently Serving + Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-6 md:p-8"
            style={{ border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Currently Serving</p>
            <div className="flex items-center justify-center my-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={servingTicket?.ticket_number ?? 'none'}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.3, y: -20 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="text-center"
                >
                  {servingTicket ? (
                    <>
                      <div className="text-7xl md:text-9xl font-black text-glow-cyan" style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace' }}>
                        #{servingTicket.ticket_number}
                      </div>
                      <p className="text-slate-400 mt-2 text-sm">Currently being served</p>
                    </>
                  ) : (
                    <>
                      <div className="text-5xl font-black text-slate-600">—</div>
                      <p className="text-slate-500 mt-2 text-sm">No one being served yet</p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next in queue preview */}
            {waitingTickets[0] && (
              <div className="flex justify-center mb-5">
                <div className="glass-dark rounded-xl px-5 py-2 flex items-center gap-2">
                  <Hash size={13} className="text-slate-500" />
                  <span className="text-sm text-slate-400">Next up: </span>
                  <span className="text-sm font-bold text-white">#{waitingTickets[0].ticket_number}</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={holdCurrent}
                disabled={actionLoading || !servingTicket}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', color: '#fcd34d' }}
              >
                <PauseCircle size={18} />
                Hold
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={callNext}
                disabled={actionLoading || (!waitingTickets.length && !servingTicket)}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #10b981, #00d4ff)' }}
              >
                {actionLoading
                  ? <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white' }} />
                  : <><SkipForward size={18} /> Next</>
                }
              </motion.button>
            </div>
          </motion.div>

          {/* Queue Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Waiting', value: waitingTickets.length, color: '#00d4ff' },
              { label: 'On Hold', value: holdTickets.length, color: '#f59e0b' },
              { label: 'Served', value: doneTickets.length, color: '#10b981' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                className="glass rounded-xl p-4 text-center" style={{ borderTop: `2px solid ${s.color}` }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Waiting Queue List */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-400" />
                <h3 className="font-semibold text-white">Waiting Queue</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock size={13} />
                <span>Est. wait for last: {calcEstimatedWait(waitingTickets.length, event.time_per_person)}</span>
              </div>
            </div>

            {waitingTickets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">Queue is empty 🎉</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                <AnimatePresence>
                  {waitingTickets.map((ticket, i) => (
                    <TicketBadge key={ticket.id} number={ticket.ticket_number}>
                      <p className="text-xs text-slate-400">
                        Position <span className="text-white font-semibold">#{i + 1}</span> in queue
                        {i === 0 && <span className="text-cyan-400 ml-2">← next</span>}
                      </p>
                      <p className="text-xs text-slate-500">Wait: {calcEstimatedWait(i, event.time_per_person)}</p>
                    </TicketBadge>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* === RIGHT: Hold Queue === */}
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-5 h-full"
            style={{ border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <PauseCircle size={16} className="text-amber-400" />
              <h3 className="font-semibold text-white">On Hold</h3>
              {holdTickets.length > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d' }}>
                  {holdTickets.length}
                </span>
              )}
            </div>

            {holdTickets.length === 0 ? (
              <div className="text-center py-12">
                <PauseCircle size={32} className="mx-auto text-slate-700 mb-2" />
                <p className="text-slate-500 text-sm">No held tickets</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {holdTickets.map((ticket) => (
                    <TicketBadge
                      key={ticket.id}
                      number={ticket.ticket_number}
                      onAction={() => recallHeld(ticket)}
                      actionLabel="Recall"
                      actionColor="#10b981"
                    >
                      <p className="text-xs text-amber-400 font-medium">On hold</p>
                      <p className="text-xs text-slate-500">Tap Recall when ready</p>
                    </TicketBadge>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Served today */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
            className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={16} className="text-emerald-400" />
              <h3 className="font-semibold text-white">Served</h3>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7' }}>
                {doneTickets.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {doneTickets.slice(-12).map(t => (
                <span key={t.id} className="text-xs px-2 py-1 rounded-lg font-mono"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }}>
                  #{t.ticket_number}
                </span>
              ))}
              {doneTickets.length === 0 && <p className="text-xs text-slate-500">None yet</p>}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
