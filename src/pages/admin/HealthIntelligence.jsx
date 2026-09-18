import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import PageHeader from '../../components/ui/PageHeader';
import { GlassCard } from '../../components/ui/GlassCard';
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Pill, Activity, Cpu, RefreshCw, ShieldAlert, Zap } from 'lucide-react';

const BASE_MEDICINES = [
  { id: 1, name: 'Paracetamol (500mg)', category: 'Analgesic / Antipyretic', stock: 850, dailyUsage: 120, unit: 'tabs', icon: '💊', color: '#10b981' },
  { id: 2, name: 'ORS Sachet', category: 'Rehydration', stock: 210, dailyUsage: 45, unit: 'sachets', icon: '🧂', color: '#00d4ff' },
  { id: 3, name: 'Amoxicillin (250mg)', category: 'Antibiotic', stock: 180, dailyUsage: 60, unit: 'caps', icon: '💊', color: '#7c3aed' },
  { id: 4, name: 'Insulin (Regular)', category: 'Antidiabetic', stock: 22, dailyUsage: 8, unit: 'vials', icon: '💉', color: '#f59e0b' },
  { id: 5, name: 'Azithromycin (250mg)', category: 'Antibiotic', stock: 40, dailyUsage: 25, unit: 'tabs', icon: '💊', color: '#ef4444' },
  { id: 6, name: 'Metformin (500mg)', category: 'Antidiabetic', stock: 320, dailyUsage: 35, unit: 'tabs', icon: '💊', color: '#10b981' },
  { id: 7, name: 'Chloroquine (150mg)', category: 'Antimalarial', stock: 95, dailyUsage: 18, unit: 'tabs', icon: '💊', color: '#00d4ff' },
];

function getRisk(daysLeft) {
  if (daysLeft <= 3) return { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', Icon: AlertTriangle };
  if (daysLeft <= 7) return { label: 'Low', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', Icon: TrendingDown };
  if (daysLeft <= 14) return { label: 'Moderate', color: '#00d4ff', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.25)', Icon: Activity };
  return { label: 'Adequate', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', Icon: CheckCircle };
}

function StockBar({ daysLeft }) {
  const pct = Math.min(100, (daysLeft / 30) * 100);
  const risk = getRisk(daysLeft);
  return (
    <div className="mt-3 mb-1">
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ background: risk.color }} />
      </div>
    </div>
  );
}

function MedicineCard({ med, index, patientLoad }) {
  const adjustedUsage = Math.round(med.dailyUsage * patientLoad);
  const daysLeft = adjustedUsage > 0 ? Math.floor(med.stock / adjustedUsage) : 99;
  const risk = getRisk(daysLeft);
  const RiskIcon = risk.Icon;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
      className="glass rounded-2xl p-5" style={{ border: `1px solid ${risk.border}` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{med.icon}</span>
            <h3 className="font-semibold text-white text-sm truncate">{med.name}</h3>
          </div>
          <p className="text-xs text-slate-500">{med.category}</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0 ml-2"
          style={{ background: risk.bg, border: `1px solid ${risk.border}`, color: risk.color }}>
          <RiskIcon size={10} />{risk.label}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center mb-1">
        <div><p className="text-xl font-black" style={{ color: med.color }}>{med.stock.toLocaleString()}</p><p className="text-xs text-slate-500">{med.unit}</p></div>
        <div><p className="text-xl font-black text-slate-300">{adjustedUsage}</p><p className="text-xs text-slate-500">/ day</p></div>
        <div><p className="text-xl font-black" style={{ color: risk.color }}>{daysLeft > 30 ? '30+' : daysLeft}</p><p className="text-xs text-slate-500">days left</p></div>
      </div>
      <StockBar daysLeft={daysLeft} />
      {daysLeft <= 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mt-2 flex items-center gap-1.5 text-xs rounded-lg px-3 py-1.5"
          style={{ background: risk.bg, color: risk.color }}>
          <Zap size={10} />
          {daysLeft <= 3 ? 'URGENT: Reorder immediately — critical stock level' : `Reorder recommended within ${daysLeft} days`}
        </motion.div>
      )}
    </motion.div>
  );
}

const RESOURCES = [
  { label: 'OPD Beds', total: 12, occupied: 9 },
  { label: 'Observation Beds', total: 6, occupied: 4 },
  { label: 'Doctors On-Duty', total: 3, occupied: 2 },
  { label: 'Nurses On-Duty', total: 8, occupied: 7 },
];

function ResourceBar({ label, total, occupied }) {
  const pct = (occupied / total) * 100;
  const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981';
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{occupied}/{total}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}

export default function HealthIntelligence() {
  const [patientLoad, setPatientLoad] = useState(1.0);
  const [todayPatients, setTodayPatients] = useState(0);
  const [avgPatients] = useState(85);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    async function fetchLoad() {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const { count } = await supabase.from('tickets').select('id', { count: 'exact' }).gte('created_at', todayStart.toISOString());
      const today = count || 0;
      setTodayPatients(today);
      setPatientLoad(today > 0 ? Math.max(0.5, today / avgPatients) : 1.0);
      setLastUpdated(new Date());
    }
    fetchLoad();
    const interval = setInterval(fetchLoad, 60000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = BASE_MEDICINES.filter(m => {
    const u = Math.round(m.dailyUsage * patientLoad);
    return u > 0 && Math.floor(m.stock / u) <= 3;
  }).length;
  const lowCount = BASE_MEDICINES.filter(m => {
    const u = Math.round(m.dailyUsage * patientLoad);
    const d = u > 0 ? Math.floor(m.stock / u) : 99;
    return d > 3 && d <= 7;
  }).length;

  return (
    <div>
      <PageHeader title="Health Resource Intelligence" subtitle="Medicine stock visibility · Resource utilisation · Demand forecasting" />

      <AnimatePresence>
        {criticalCount > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center gap-3 rounded-2xl px-5 py-4"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)' }}>
            <ShieldAlert size={18} className="text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-400">
                Warning: {criticalCount} medicine{criticalCount > 1 ? 's' : ''} at critical stock level
                {lowCount > 0 && ` and ${lowCount} more running low`}
              </p>
              <p className="text-xs text-red-300 mt-0.5">Immediate procurement action required. Notify PHC coordinator.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Patients Today', value: todayPatients, color: '#10b981', icon: '👥' },
          { label: 'Daily Average', value: avgPatients, color: '#00d4ff', icon: '📊' },
          { label: 'Load vs. Avg', value: Math.round(patientLoad * 100) + '%', color: patientLoad > 1.2 ? '#ef4444' : patientLoad > 0.9 ? '#f59e0b' : '#10b981', icon: patientLoad > 1 ? '📈' : '📉' },
          { label: 'Items at Risk', value: criticalCount + lowCount, color: criticalCount > 0 ? '#ef4444' : '#f59e0b', icon: '⚠️' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Pill size={16} className="text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Medicine Stock Monitor</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw size={11} />
              <span>Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          {patientLoad > 1.15 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-4 flex items-center gap-2 text-xs rounded-xl px-4 py-2.5"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d' }}>
              <TrendingUp size={12} />
              <span>Higher patient footfall today — usage estimates adjusted upward</span>
            </motion.div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BASE_MEDICINES.map((med, i) => (
              <MedicineCard key={med.id} med={med} index={i} patientLoad={patientLoad} />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Cpu size={16} className="text-cyan-400" />
              <h2 className="text-base font-semibold text-white">Resource Utilisation</h2>
            </div>
            {RESOURCES.map((r) => (<ResourceBar key={r.label} {...r} />))}
            <p className="text-xs text-slate-500 mt-3">Live capacity updated every session</p>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-amber-400" />
              <h2 className="text-base font-semibold text-white">AI Recommendations</h2>
            </div>
            <div className="space-y-3">
              {[
                { priority: 'High', color: '#ef4444', text: 'Azithromycin stock critically low. Request emergency transfer from PHC-District Warehouse.' },
                { priority: 'Medium', color: '#f59e0b', text: 'Insulin vials running low. Estimated stockout in 2-3 days. Raise indent today.' },
                { priority: 'Info', color: '#00d4ff', text: 'Patient footfall is above daily average. Monitor ORS and Paracetamol closely.' },
                { priority: 'Info', color: '#10b981', text: 'OPD beds at 75% occupancy. No redistribution needed at this time.' },
              ].map((rec, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: rec.color + '18', border: '1px solid ' + rec.color + '30' }}>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                    style={{ background: rec.color + '25', color: rec.color }}>{rec.priority}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{rec.text}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}