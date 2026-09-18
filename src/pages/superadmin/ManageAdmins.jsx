import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import { GlassCard } from '../../components/ui/GlassCard';
import { Plus, User, Eye, EyeOff, ToggleLeft, ToggleRight, Trash2, Clock, AlertCircle } from 'lucide-react';
import { timeAgo } from '../../lib/queueUtils';
import toast from 'react-hot-toast';

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // ── Initial fetch ────────────────────────────────────────────────────────
  useEffect(() => { fetchAdmins(); }, []);

  async function fetchAdmins() {
    setLoading(true);
    const { data, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });

    if (fetchErr) {
      // Surface the actual error so it is visible during debugging.
      // Common cause: recursive RLS on public.profiles.
      // Fix: run supabase/migrations/002_fix_profiles_rls.sql in Supabase SQL Editor.
      console.error('[ManageAdmins] fetchAdmins error:', fetchErr.message, fetchErr);
      toast.error(`Could not load admin list: ${fetchErr.message}`);
    } else {
      setAdmins(data || []);
    }
    setLoading(false);
  }

  // ── Supabase Realtime: auto-refresh when any profile is INSERT/UPDATE/DELETE'd ──
  // This means newly created accounts appear immediately without a manual refresh.
  useEffect(() => {
    const channel = supabase
      .channel('manage-admins-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          // Re-fetch the filtered admin list whenever profiles table changes.
          // We do a full refetch (not optimistic update) for correctness.
          fetchAdmins();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Create ───────────────────────────────────────────────────────────────
  async function createAdmin() {
    setCreating(true); setError('');
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('create-user', {
        body: { username: form.username, email: form.email, password: form.password, role: 'admin' },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      toast.success(`Admin "${form.username}" created!`);
      setShowModal(false);
      setForm({ username: '', email: '', password: '' });
      // Explicit refetch as immediate fallback; Realtime subscription will also fire.
      await fetchAdmins();
    } catch (err) { setError(err.message); }
    finally { setCreating(false); }
  }

  // ── Toggle / Delete ──────────────────────────────────────────────────────
  async function toggleActive(admin) {
    await supabase.from('profiles').update({ is_active: !admin.is_active }).eq('id', admin.id);
    toast.success(`Account ${admin.is_active ? 'deactivated' : 'activated'}`);
    fetchAdmins();
  }

  async function deleteAdmin(id) {
    if (!window.confirm('Delete this admin account?')) return;
    await supabase.from('profiles').delete().eq('id', id);
    toast.success('Admin deleted');
    fetchAdmins();
  }

  return (
    <div>
      <PageHeader title="Manage Admins"
        subtitle={`${admins.length} admin account${admins.length !== 1 ? 's' : ''} registered`}
        actions={
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setShowModal(true); setError(''); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} />Create Admin
          </motion.button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #7c3aed' }} />
        </div>
      ) : admins.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <User size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No admin accounts yet. Click "Create Admin" to add one.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {admins.map((admin, i) => (
              <motion.div key={admin.id}
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-5 flex items-center gap-4"
                style={{ borderLeft: `3px solid ${admin.is_active ? '#10b981' : '#64748b'}` }}
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'rgba(124,58,237,0.25)', color: '#a78bfa' }}>
                  {(admin.username || admin.email || 'A')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">{admin.username || 'Admin'}</p>
                    <span className={admin.is_active ? 'badge-active' : 'badge-inactive'}>{admin.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{admin.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={11} className="text-slate-500" />
                    <p className="text-xs text-slate-500">Created {timeAgo(admin.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(admin)} className="p-2 rounded-lg hover:bg-white/10 transition-all" title={admin.is_active ? 'Deactivate' : 'Activate'}>
                    {admin.is_active ? <ToggleRight size={22} className="text-emerald-400" /> : <ToggleLeft size={22} className="text-slate-500" />}
                  </button>
                  <button onClick={() => deleteAdmin(admin.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-all text-slate-500 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Admin Account">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
            <div className="relative">
              <input className="input-glass pl-9" placeholder="john_admin" value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
            <div className="relative">
              <input className="input-glass pl-9" type="email" placeholder="admin@example.com" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input className="input-glass pl-9 pr-9" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle size={14} className="text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-glass flex-1">Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={createAdmin} disabled={creating || !form.email || !form.password || !form.username}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
              {creating ? <><div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white' }} />Creating...</> : 'Create Account'}
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
