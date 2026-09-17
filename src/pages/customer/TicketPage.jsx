import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { calcEstimatedWait, sendBrowserNotification } from '../../lib/queueUtils';
import { Ticket, Users, Clock, ChevronRight, Bell, BellOff, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'queueless_ticket';

function getStoredTicket(queueCode) {
  try {
    const stored = JSON.parse(localStorage.getItem(`${STORAGE_KEY}_${queueCode}`) || 'null');
    return stored;
  } catch { return null; }
}
function storeTicket(queueCode, ticket) {
  localStorage.setItem(`${STORAGE_KEY}_${queueCode}`, JSON.stringify(ticket));
}

export default function TicketPage() {
  const { queueCode } = useParams();
  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [notifGranted, setNotifGranted] = useState(false);
  const notifSentRef = useRef(false);

  // Derived
  const servingTicket = allTickets.find(t => t.status === 'serving');
  const waitingBefore = ticket
    ? allTickets.filter(t => t.status === 'waiting' && t.ticket_number < ticket.ticket_number).length
    : 0;
  const myStatus = ticket ? allTickets.find(t => t.id === ticket.id)?.status : null;
  const peopleAhead = waitingBefore + (servingTicket && servingTicket.ticket_number < ticket?.ticket_number ? 1 : 0);
  const estimatedWait = calcEstimatedWait(peopleAhead, event?.time_per_person || 5);

  const loadData = useCallback(async () => {
    // Fetch event
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('queue_code', queueCode)
      .single();

    if (!eventData) { setError('Queue not found. Please scan the QR code again.'); setLoading(false); return; }
    setEvent(eventData);

    // Fetch all tickets
    const { data: ticketData } = await supabase
      .from('tickets')
      .select('*')
      .eq('event_id', eventData.id)
      .order('ticket_number');
    setAllTickets(ticketData || []);

    // Restore my ticket from storage
    const stored = getStoredTicket(queueCode);
    if (stored) {
      const myTicket = (ticketData || []).find(t => t.id === stored.id);
      if (myTicket) setTicket(myTicket);
    }

    setLoading(false);
  }, [queueCode]);

  useEffect(() => { loadData(); }, [loadData]);

  // Realtime subscription
  useEffect(() => {
    if (!event?.id) return;
    const channel = supabase
      .channel(`customer-${event.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `event_id=eq.${event.id}` }, () => {
        loadData();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [event?.id, loadData]);

  // Notification when ≤3 people ahead
  useEffect(() => {
    if (ticket && peopleAhead <= 3 && peopleAhead >= 0 && !notifSentRef.current && myStatus === 'waiting') {
      notifSentRef.current = true;
      sendBrowserNotification(
        '🎫 Your turn is approaching!',
        `Only ${peopleAhead} person${peopleAhead !== 1 ? 's' : ''} ahead. Please move to the counter now.`
      ).then(() => setNotifGranted(true));
    }
  }, [peopleAhead, ticket, myStatus]);

  async function joinQueue() {
    if (!event || event.status !== 'active') return;
    setJoining(true);
    try {
      // Get next ticket number
      const maxNum = allTickets.length > 0 ? Math.max(...allTickets.map(t => t.ticket_number)) : 0;
      const nextNum = maxNum + 1;

      const { data, error: insertErr } = await supabase.from('tickets').insert({
        event_id: event.id,
        ticket_number: nextNum,
        status: 'waiting',
      }).select().single();

      if (insertErr) throw insertErr;
      setTicket(data);
      storeTicket(queueCode, data);
      await loadData();

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(p => setNotifGranted(p === 'granted'));
      }
    } catch (err) {
      setError('Failed to join queue. Please try again.');
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="orb orb-1" /><div className="orb orb-2" />
        <Loader2 size={32} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="orb orb-1" /><div className="orb orb-2" />
        <div className="glass rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-white font-semibold mb-2">Queue Not Found</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (event?.status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="orb orb-1" /><div className="orb orb-2" />
        <div className="glass rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-white font-bold text-xl mb-2">Event Completed</p>
          <p className="text-slate-400 text-sm">This queue session has ended. Thank you!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="max-w-sm mx-auto relative z-10 pt-8 pb-16">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
            <Ticket size={24} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{event?.name}</h1>
          <p className="text-slate-400 text-sm mt-1">Live Queue</p>
        </div>

        {/* Currently Serving Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 mb-4 flex items-center justify-between"
          style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Currently Serving</p>
            <AnimatePresence mode="wait">
              <motion.p key={servingTicket?.ticket_number ?? 'none'}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-3xl font-black mt-0.5" style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace' }}>
                {servingTicket ? `#${servingTicket.ticket_number}` : '—'}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">In Queue</p>
            <p className="text-2xl font-bold text-white">{allTickets.filter(t => t.status === 'waiting').length}</p>
          </div>
        </motion.div>

        {/* === MY TICKET === */}
        {ticket ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="glass-strong rounded-3xl p-8 mb-4 text-center relative overflow-hidden"
            style={{ border: `2px solid ${myStatus === 'serving' ? '#10b981' : myStatus === 'hold' ? '#f59e0b' : 'rgba(0,212,255,0.3)'}` }}>

            {/* Glow pulse behind ticket number */}
            {myStatus === 'serving' && (
              <div className="absolute inset-0 pointer-events-none">
                <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-3xl" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.1), transparent)' }} />
              </div>
            )}

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Your Ticket</p>
            <AnimatePresence mode="wait">
              <motion.div key={myStatus} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <p className="text-8xl font-black text-glow-cyan mb-2"
                  style={{ color: myStatus === 'serving' ? '#10b981' : myStatus === 'hold' ? '#f59e0b' : '#00d4ff', fontFamily: 'JetBrains Mono, monospace' }}>
                  #{ticket.ticket_number}
                </p>
              </motion.div>
            </AnimatePresence>

            {myStatus === 'serving' && (
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1, repeat: Infinity }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-2"
                style={{ background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.5)', color: '#6ee7b7' }}>
                🎉 YOUR TURN! Go to the counter now!
              </motion.div>
            )}

            {myStatus === 'hold' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-2"
                style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d' }}>
                ⏸ On Hold — Wait for recall
              </div>
            )}

            {myStatus === 'done' && (
              <p className="text-slate-400 text-sm">✅ You have been served. Thank you!</p>
            )}

            {myStatus === 'waiting' && (
              <div className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-dark rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users size={13} className="text-slate-400" />
                      <span className="text-xs text-slate-400">Ahead</span>
                    </div>
                    <p className="text-xl font-bold text-white">{peopleAhead}</p>
                  </div>
                  <div className="glass-dark rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock size={13} className="text-slate-400" />
                      <span className="text-xs text-slate-400">Est. Wait</span>
                    </div>
                    <p className="text-sm font-bold text-white">{estimatedWait}</p>
                  </div>
                </div>

                {peopleAhead <= 3 && (
                  <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }}
                    className="rounded-xl p-3 text-center text-sm font-semibold"
                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#fcd34d' }}>
                    ⚡ Almost your turn! Please move to the counter.
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* === JOIN QUEUE button === */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-8 mb-4 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)' }}>
              <Ticket size={28} className="text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Join this Queue</h2>
            <p className="text-slate-400 text-sm mb-6">
              Tap below to get your ticket number.<br />
              Currently <span className="text-white font-semibold">{allTickets.filter(t => t.status === 'waiting').length}</span> people waiting.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={joinQueue}
              disabled={joining}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
            >
              {joining ? (
                <><Loader2 size={18} className="animate-spin" />Getting your ticket...</>
              ) : (
                <>🎫 Get My Ticket <ChevronRight size={18} /></>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Notification toggle */}
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          {notifGranted ? (
            <Bell size={16} className="text-cyan-400 flex-shrink-0" />
          ) : (
            <BellOff size={16} className="text-slate-500 flex-shrink-0" />
          )}
          <p className="text-xs text-slate-400 flex-1">
            {notifGranted
              ? 'Notifications enabled — you\'ll be alerted when your turn approaches.'
              : 'Enable notifications to be alerted when your turn is near.'}
          </p>
          {!notifGranted && (
            <button
              onClick={() => Notification.requestPermission().then(p => setNotifGranted(p === 'granted'))}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0"
              style={{ background: 'rgba(0,212,255,0.15)', color: '#67e8f9', border: '1px solid rgba(0,212,255,0.3)' }}
            >
              Enable
            </button>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Powered by Queueless • This page updates in real time
        </p>
      </div>
    </div>
  );
}
