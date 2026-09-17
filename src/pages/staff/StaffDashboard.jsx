import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { generateQueueCode, buildQueueUrl } from '../../lib/queueUtils';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import { GlassCard } from '../../components/ui/GlassCard';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Calendar, Users, ChevronRight, QrCode, CheckCircle, Clock, Copy } from 'lucide-react';
import { timeAgo } from '../../lib/queueUtils';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showQR, setShowQR] = useState(null); // event object
  const [form, setForm] = useState({ name: '', time_per_person: 5 });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchEvents(); }, [profile]);

  async function fetchEvents() {
    if (!profile?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*, tickets(count)')
      .eq('created_by', profile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setEvents(data || []);
    setLoading(false);
  }

  async function createEvent() {
    if (!form.name.trim()) { toast.error('Enter an event name'); return; }
    setCreating(true);
    const queueCode = generateQueueCode();
    const { data, error } = await supabase.from('events').insert({
      name: form.name.trim(),
      time_per_person: Number(form.time_per_person),
      queue_code: queueCode,
      created_by: profile.id,
      status: 'active',
    }).select().single();

    if (error) { toast.error(error.message); setCreating(false); return; }
    toast.success('Event created! QR code ready.');
    setCreating(false);
    setShowCreate(false);
    setForm({ name: '', time_per_person: 5 });
    setShowQR(data);
    fetchEvents();
  }

  const copyQRUrl = (event) => {
    navigator.clipboard.writeText(buildQueueUrl(event.queue_code));
    toast.success('Link copied!');
  };

  return (
    <div>
      <PageHeader
        title="Staff Dashboard"
        subtitle={`Welcome, ${profile?.username || 'Staff'}! Manage your queue events.`}
        actions={
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Create Event
          </motion.button>
        }
      />

      {/* Active Events Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #10b981' }} />
        </div>
      ) : events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-16 text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(0,212,255,0.2))' }}
          >
            <Calendar size={36} className="text-emerald-400" />
          </motion.div>
          <h2 className="text-xl font-bold text-white mb-2">No Active Events</h2>
          <p className="text-slate-400 mb-6">Create your first queue event to get started.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            + Create Event
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {events.map((event, i) => {
              const ticketCount = event.tickets?.[0]?.count || 0;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="glass rounded-2xl p-6 cursor-pointer group"
                  style={{ border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge-active">LIVE</span>
                        <span className="text-xs text-slate-500">{timeAgo(event.created_at)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white truncate">{event.name}</h3>
                    </div>
                    {/* Animated live dot */}
                    <div className="relative flex-shrink-0 ml-3 mt-1">
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400 absolute inset-0 ring-pulse" />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-300">{ticketCount} in queue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-300">{event.time_per_person}min each</span>
                    </div>
                  </div>

                  {/* QR Code preview */}
                  <div
                    className="w-full aspect-square max-w-[100px] mx-auto mb-4 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{ background: 'white', padding: '8px' }}
                  >
                    <QRCodeSVG
                      value={buildQueueUrl(event.queue_code)}
                      size={84}
                      bgColor="#ffffff"
                      fgColor="#0f0c29"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowQR(event); }}
                      className="btn-glass flex-1 flex items-center justify-center gap-1.5 text-xs"
                    >
                      <QrCode size={13} /> QR Code
                    </button>
                    <button
                      onClick={() => navigate(`/staff/events/${event.id}`)}
                      className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-xs"
                    >
                      Manage <ChevronRight size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create Event Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Queue Event">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Event Name</label>
            <input
              className="input-glass"
              placeholder="e.g. Bank Counter, Registration Desk..."
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && createEvent()}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Time per Person (minutes)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={1} max={60} step={1}
                value={form.time_per_person}
                onChange={(e) => setForm(f => ({ ...f, time_per_person: e.target.value }))}
                className="flex-1 accent-cyan-400"
              />
              <div className="glass rounded-xl px-4 py-2 min-w-[64px] text-center">
                <span className="text-xl font-bold text-cyan-400">{form.time_per_person}</span>
                <span className="text-xs text-slate-400 ml-1">min</span>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-4 flex items-center gap-3"
            style={{ border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-slate-300">
              A unique QR code will be generated for customers to join the queue.
              Ticket numbers start at <span className="text-white font-semibold">#1</span>.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="btn-glass flex-1">Cancel</button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={createEvent}
              disabled={creating || !form.name.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {creating
                ? <><div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white' }} />Creating...</>
                : '🚀 Create Queue'}
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal open={!!showQR} onClose={() => setShowQR(null)} title={showQR?.name || 'Queue QR Code'} maxWidth="max-w-sm">
        {showQR && (
          <div className="flex flex-col items-center gap-5">
            <p className="text-sm text-slate-400 text-center">
              Scan to join the queue. Share this with customers.
            </p>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-white rounded-2xl p-5"
              style={{ boxShadow: '0 0 40px rgba(0,212,255,0.3)' }}
            >
              <QRCodeSVG
                value={buildQueueUrl(showQR.queue_code)}
                size={220}
                bgColor="#ffffff"
                fgColor="#0f0c29"
                includeMargin
              />
            </motion.div>
            <div className="w-full glass rounded-xl px-4 py-3 flex items-center gap-3">
              <p className="flex-1 text-xs text-slate-300 font-mono truncate">
                {buildQueueUrl(showQR.queue_code)}
              </p>
              <button onClick={() => copyQRUrl(showQR)} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10">
                <Copy size={14} className="text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-slate-500">Queue Code: <span className="font-mono text-cyan-400">{showQR.queue_code}</span></p>
          </div>
        )}
      </Modal>
    </div>
  );
}
