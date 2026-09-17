import { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/ui/PageHeader';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuth } from '../../hooks/useAuth';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export default function SuperAdminSettings() {
  const { profile } = useAuth();
  const [newPass, setNewPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const updatePassword = async () => {
    if (!newPass || newPass.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) toast.error(error.message);
    else { toast.success('Password updated!'); setNewPass(''); }
    setLoading(false);
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your super admin account" />
      <div className="max-w-lg space-y-5">
        <GlassCard className="p-6" delay={0}>
          <div className="flex items-center gap-2 mb-4"><User size={16} className="text-violet-400" /><h2 className="font-semibold text-white">Account Info</h2></div>
          <div className="space-y-2">
            <div className="flex items-center gap-3"><span className="text-sm text-slate-400 w-24">Username</span><span className="text-sm text-white">{profile?.username || '—'}</span></div>
            <div className="flex items-center gap-3"><span className="text-sm text-slate-400 w-24">Email</span><span className="text-sm text-white">{profile?.email || '—'}</span></div>
            <div className="flex items-center gap-3"><span className="text-sm text-slate-400 w-24">Role</span><span className="badge-serving">Super Admin</span></div>
          </div>
        </GlassCard>
        <GlassCard className="p-6" delay={0.1}>
          <div className="flex items-center gap-2 mb-4"><Lock size={16} className="text-violet-400" /><h2 className="font-semibold text-white">Change Password</h2></div>
          <div className="space-y-3">
            <div className="relative">
              {/* <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" /> */}
              <input className="input-glass pl-9 pr-9" type={showPass ? 'text' : 'password'} placeholder="New password (min 8 chars)" value={newPass} onChange={e => setNewPass(e.target.value)} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={updatePassword} disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Password'}
            </motion.button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
