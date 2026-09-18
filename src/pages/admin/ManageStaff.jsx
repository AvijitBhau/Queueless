import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import { GlassCard } from '../../components/ui/GlassCard';
import { Plus, User, Eye, EyeOff, ToggleLeft, ToggleRight, Trash2, Clock, AlertCircle } from 'lucide-react';
import { timeAgo } from '../../lib/queueUtils';
import toast from 'react-hot-toast';

export default function ManageStaff() {
  const { profile } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // ── Initial fetch (runs when profile becomes available) ──────────────────
  useEffect(() => { fetchStaff(); }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchStaff() {
    if (!profile?.id) return;
    setLoading(true);
    const { data, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'staff')
      .eq('created_by', profile.id)
      .order('created_at', { ascending: false });

    if (fetchErr) {
      // Surface the actual error. Common cause: recursive RLS on public.profiles.
      // Fix: run supabase/migrations/002_fix_profiles_rls.sql in Supabase SQL Editor.
      console.error('[ManageStaff] fetchStaff error:', fetchErr.message, fetchErr);
      toast.error(`Could not load staff list: ${fetchErr.message}`);
    } else {
      setStaff(data || []);
    }
    setLoading(false);
  }

  // ── Supabase Realtime: auto-refresh when profiles table changes ───────────
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('manage-staff-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          // Re-fetch filtered staff list whenever any profile changes.
          fetchStaff();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Create ───────────────────────────────────────────────────────────────
  async function createStaff() {
    setCreating(true); setError('');
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('create-user', {
        body: { username: form.username, email: form.email, password: form.password, role: 'staff' },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      toast.success(`Staff "${form.username}" created!`);
      setShowModal(false);
      setForm({ username: '', email: '', password: '' });
      // Explicit refetch as immediate fallback; Realtime subscription will also fire.
      await fetchStaff();
    } catch (err) { setError(err.message); }
    finally { setCreating(false); }
  }

  // ── Toggle / Delete ──────────────────────────────────────────────────────
  async function toggleActive(member) {
    await supabase.from('profiles').update({ is_active: !member.is_active }).eq('id', member.id);
    toast.success(`Account ${member.is_active ? 'deactivated' : 'activated'}`);
    fetchStaff();
  }

  async function deleteStaff(id) {
    if (!window.confirm('Delete this staff account?')) return;
    await supabase.from('profiles').delete().eq('id', id);
    toast.success('Staff deleted');
    fetchStaff();
  }

  return (
    <div>
      <PageHeader title="Manage Staff" subtitle={`${staff.length} staff member${staff.length !== 1 ? 's' : ''}`}
        actions={
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => { setShowModal(true); setError(''); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} />Create Staff
          </motion.button>
        }
      />
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #00d4ff' }} /></div>
      ) : staff.length === 0 ? (
        <GlassCard className="p-12 text-center"><User size={48} className="mx-auto text-slate-600 mb-4" /><p className="text-slate-400">No staff accounts yet.</p></GlassCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {staff.map((member, i) => (
              <motion.div key={member.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-5 flex items-center gap-4" style={{ borderLeft: `3px solid ${member.is_active ? '#00d4ff' : '#64748b'}` }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'rgba(0,212,255,0.2)', color: '#67e8f9' }}>
                  {(member.username || member.email || 'S')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">{member.username || 'Staff'}</p>
                    <span className={member.is_active ? 'badge-active' : 'badge-inactive'}>{member.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{member.email}</p>
                  <div className="flex items-center gap-1 mt-1"><Clock size={11} className="text-slate-500" /><p className="text-xs text-slate-500">Created {timeAgo(member.created_at)}</p></div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(member)} className="p-2 rounded-lg hover:bg-white/10 transition-all">
                    {member.is_active ? <ToggleRight size={22} className="text-emerald-400" /> : <ToggleLeft size={22} className="text-slate-500" />}
                  </button>
                  <button onClick={() => deleteStaff(member.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-all text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Staff Account">
        <div className="space-y-4">
          <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
            <div className="relative"><input className="input-glass pl-9" placeholder="staff_name" value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))} /></div></div>
          <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
            <div className="relative"><input className="input-glass pl-9" type="email" placeholder="staff@example.com" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} /></div></div>
          <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input className="input-glass pl-9 pr-9" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div></div>
          {error && (<div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}><AlertCircle size={14} className="text-red-400" /><p className="text-red-400 text-sm">{error}</p></div>)}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-glass flex-1">Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={createStaff}
              disabled={creating || !form.email || !form.password || !form.username}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
              {creating ? <><div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white' }} />Creating...</> : 'Create Staff'}
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
