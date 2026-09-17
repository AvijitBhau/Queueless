import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export function GlassCard({ children, className, hover = false, onClick, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      className={clsx(
        'glass rounded-2xl',
        hover && 'glass-hover cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({ title, value, icon: Icon, color = '#00d4ff', change, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-2xl p-5"
      style={{ borderTop: `2px solid ${color}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change && <p className="text-xs text-slate-400 mt-1">{change}</p>}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}
