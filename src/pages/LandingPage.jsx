import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  QrCode, Users, Zap, ShieldCheck, BarChart3, Bell,
  ChevronRight, ArrowRight, Menu, X, Check, Star,
  Stethoscope, Pill, Wifi, TrendingUp, Activity, Mail,
  Phone, MapPin, Send, AlertTriangle, Layers, CheckCircle2,
  HeartPulse, Cpu, Globe
} from 'lucide-react';

function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

function GB({ children, color = '#00d4ff' }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ background: color + '18', border: '1px solid ' + color + '40', color }}>
      {children}
    </span>
  );
}

function Ctr({ end, suffix = '', label, color, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => {
      let s = 0; const step = end / 60;
      const id = setInterval(() => {
        s += step;
        if (s >= end) { setN(end); clearInterval(id); } else setN(Math.floor(s));
      }, 16);
      return () => clearInterval(id);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [inView, end, delay]);
  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-black" style={{ color }}>{n.toLocaleString()}{suffix}</p>
      <p className="text-slate-400 text-sm mt-2">{label}</p>
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [sc, setSc] = useState(false);
  useEffect(() => {
    const h = () => setSc(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  const links = [
    { label: 'Problem', href: '#problem' },
    { label: 'How It Works', href: '#how' },
    { label: 'Features', href: '#features' },
    { label: 'Contact', href: '#contact' },
  ];
  return (
    <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{ background: sc ? 'rgba(15,12,41,0.88)' : 'transparent', backdropFilter: sc ? 'blur(24px)' : 'none', borderBottom: sc ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#00d4ff,#7c3aed)' }}>
            <HeartPulse size={16} color="white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Queue<span style={{ color: '#00d4ff' }}>Less</span>
            <span className="text-xs font-semibold ml-1.5 px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(0,212,255,0.12)', color: '#67e8f9' }}>Health</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a key={l.label} href={l.href} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors hover:bg-white/5">{l.label}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">Log In</Link>
          <Link to="/login" className="btn-primary text-sm flex items-center gap-1.5 px-5 py-2.5">Get Started <ChevronRight size={14} /></Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
          {open ? <X size={20} className="text-white" /> : <Menu size={20} className="text-slate-400" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden" style={{ background: 'rgba(15,12,41,0.97)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-5 py-4 space-y-1">
              {links.map(l => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm">{l.label}</a>
              ))}
              <div className="pt-3 mt-1 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <Link to="/login" onClick={() => setOpen(false)} className="block text-center px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm">Log In</Link>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-primary text-center text-sm py-3">Get Started Free</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-24 pb-16 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.18),transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(0,212,255,0.14),transparent 70%)', filter: 'blur(60px)' }} />
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6 flex justify-center">
          <GB color="#10b981"><Activity size={11} /> AI-Powered Patient Flow Intelligence</GB>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black leading-[1.06] tracking-tight text-white mb-6">
          Healthcare Queues{' '}
          <span style={{ background: 'linear-gradient(90deg,#00d4ff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Reimagined.
          </span>
          <br />No More Waiting Chaos.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          QueueLess Health brings real-time patient flow, digital token management, and medicine stock intelligence to every
          Primary Health Centre — so your staff focuses on care, not chaos.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/login" className="btn-primary flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl"
            style={{ boxShadow: '0 0 32px rgba(0,212,255,0.25)' }}>
            Start Free Today <ArrowRight size={18} />
          </Link>
          <a href="#how" className="flex items-center gap-2 px-8 py-4 text-base font-medium text-slate-300 hover:text-white transition-colors rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            See How It Works <ChevronRight size={16} />
          </a>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          {['No credit card required', 'Setup in under 5 minutes', 'Works on any device', 'Real-time sync'].map((t, i) => (
            <span key={i} className="flex items-center gap-1.5"><Check size={11} className="text-emerald-400" /> {t}</span>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 60, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }} className="mt-16 relative">
          <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to bottom,transparent,rgba(15,12,41,0.9))' }} />
          <div className="glass rounded-3xl p-1 mx-auto max-w-4xl"
            style={{ border: '1px solid rgba(0,212,255,0.2)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-yellow-500/60" /><div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4 h-6 rounded-lg flex items-center px-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs text-slate-500 font-mono">app.queueless.health/admin</span>
              </div>
            </div>
            <div className="p-5 grid grid-cols-4 gap-3">
              {[{ label: 'Patients Today', value: '128', color: '#00d4ff' }, { label: 'Waiting', value: '17', color: '#f59e0b' }, { label: 'Served', value: '96', color: '#10b981' }, { label: 'Live Queues', value: '4', color: '#7c3aed' }].map(s => (
                <div key={s.label} className="glass rounded-2xl p-4 text-center" style={{ borderTop: '2px solid ' + s.color }}>
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 grid grid-cols-3 gap-3">
              {['General OPD  •  18 waiting', 'Pharmacy Counter  •  6 waiting', 'Lab Samples  •  3 waiting'].map(q => (
                <div key={q} className="glass rounded-xl p-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
                  <span className="text-xs text-slate-300">{q}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProblemSolution() {
  const pr = [
    { icon: AlertTriangle, t: 'Patients wait 2-3 hours with no idea where they stand in the queue' },
    { icon: Pill, t: 'Medicine stock-outs discovered only after patients arrive at the pharmacy' },
    { icon: Users, t: 'Staff overwhelmed managing physical token slips and handwritten lists' },
    { icon: BarChart3, t: 'No real-time visibility into PHC footfall or resource utilisation' },
  ];
  const sl = [
    { icon: QrCode, t: 'QR-based digital tokens — patients join queues from their phones instantly' },
    { icon: Bell, t: 'Auto-notifications when their turn is near — no anxious waiting' },
    { icon: Activity, t: 'Live dashboard shows stock levels, patient counts, and queue status' },
    { icon: Cpu, t: 'AI-driven early warnings for stock-outs before they impact care' },
  ];
  return (
    <section id="problem" className="py-28 px-5">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-16">
          <GB color="#ef4444"><AlertTriangle size={11} /> The Real Problem</GB>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-4">
            PHCs Are Drowning in<br /><span style={{ color: '#ef4444' }}>Avoidable Chaos</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            India has 30 000+ Primary Health Centres serving millions daily — most still run on paper tokens and guesswork.
          </p>
        </FadeUp>
        <div className="grid md:grid-cols-2 gap-8">
          <FadeUp delay={0.1}>
            <div className="glass rounded-3xl p-8 h-full" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <X size={18} className="text-red-400" /></div>
                <h3 className="text-lg font-bold text-white">Without QueueLess</h3>
              </div>
              <div className="space-y-4">
                {pr.map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                    className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)' }}>
                    <p.icon size={15} className="text-red-400 flex-shrink-0 mt-0.5" /><p className="text-sm text-slate-300">{p.t}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div className="glass rounded-3xl p-8 h-full" style={{ border: '1px solid rgba(16,185,129,0.25)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <Check size={18} className="text-emerald-400" /></div>
                <h3 className="text-lg font-bold text-white">With QueueLess Health</h3>
              </div>
              <div className="space-y-4">
                {sl.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                    className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.07)' }}>
                    <s.icon size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" /><p className="text-sm text-slate-300">{s.t}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="py-20 px-5">
      <div className="max-w-5xl mx-auto">
        <FadeUp>
          <div className="glass rounded-3xl p-10 md:p-16" style={{ border: '1px solid rgba(0,212,255,0.15)', background: 'rgba(0,212,255,0.03)' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              <Ctr end={85} suffix="%" label="Drop in wait-time complaints" color="#00d4ff" delay={0} />
              <Ctr end={30000} suffix="+" label="PHCs across India" color="#7c3aed" delay={0.1} />
              <Ctr end={99} suffix="%" label="Platform uptime" color="#10b981" delay={0.2} />
              <Ctr end={5} suffix=" min" label="Average setup time" color="#f59e0b" delay={0.3} />
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: '01', icon: Stethoscope, c: '#7c3aed', t: 'PHC Creates a Queue', d: 'Admin or staff creates a patient queue in seconds. Name it, set time per patient, done.' },
    { n: '02', icon: QrCode, c: '#00d4ff', t: 'Patients Scan & Join', d: 'A unique QR code is generated instantly. Patients scan with any phone, no app download needed, and get a digital token.' },
    { n: '03', icon: Bell, c: '#10b981', t: 'Auto-Alerts on Their Turn', d: 'Patients are notified when they are next. No more crowded waiting areas.' },
    { n: '04', icon: BarChart3, c: '#f59e0b', t: 'Staff Gets Live Insights', d: 'Dashboard shows real-time queue status, patient footfall, medicine stock, and utilisation all in one place.' },
  ];
  return (
    <section id="how" className="py-28 px-5">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-16">
          <GB color="#7c3aed"><Layers size={11} /> How It Works</GB>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-4">
            Up and Running in{' '}
            <span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Minutes
            </span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">No complex integrations. No paper forms. Just scan, queue, and serve.</p>
        </FadeUp>
        <div className="relative">
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.3),rgba(124,58,237,0.3),transparent)' }} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="glass rounded-3xl p-7 h-full text-center relative" style={{ border: '1px solid ' + s.c + '22' }}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: s.c + '20', color: s.c, border: '1px solid ' + s.c + '40' }}>{s.n}</div>
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-5 mt-2 flex items-center justify-center"
                    style={{ background: s.c + '18', border: '1px solid ' + s.c + '30' }}>
                    <s.icon size={24} style={{ color: s.c }} />
                  </div>
                  <h3 className="font-bold text-white mb-3 text-sm">{s.t}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.d}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { icon: QrCode, c: '#00d4ff', t: 'Instant QR Joining', b: 'Zero friction', d: 'Patients scan a QR at the entrance and join without any app download or account.' },
    { icon: Wifi, c: '#7c3aed', t: 'True Real-Time Sync', b: 'Live always', d: 'Supabase Realtime powers instant updates across staff dashboard and patient screen.' },
    { icon: Bell, c: '#10b981', t: 'Smart Notifications', b: 'Auto alerts', d: 'Push alerts when only 3 people are ahead so patients know exactly when to come.' },
    { icon: Pill, c: '#f59e0b', t: 'Medicine Stock Intel', b: 'AI-powered', d: 'Track key medicines. Colour-coded risk levels flag stock-outs days in advance.' },
    { icon: ShieldCheck, c: '#7c3aed', t: 'Role-Based Access', b: 'Secure', d: 'Super Admin to Admin to Staff hierarchy. Each role sees exactly what they need.' },
    { icon: Activity, c: '#00d4ff', t: 'Patient Flow Analytics', b: 'Auto metrics', d: 'Footfall, waiting count, served count from live ticket data. No manual entry.' },
    { icon: TrendingUp, c: '#10b981', t: 'Demand Forecasting', b: 'Predictive', d: 'Historical data surfaces early warnings before resources run out.' },
    { icon: Globe, c: '#f59e0b', t: 'Works on Any Device', b: 'Universal', d: 'Fully responsive. Staff on desktop, patients on any smartphone, no install needed.' },
  ];
  return (
    <section id="features" className="py-28 px-5">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-16">
          <GB color="#00d4ff"><Zap size={11} /> Platform Features</GB>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-4">
            Everything a PHC Needs. <span style={{ color: '#00d4ff' }}>Nothing It Does Not.</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Purpose-built for public health. Lightweight, fast, operational even on slow connections.
          </p>
        </FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {feats.map((f, i) => (
            <FadeUp key={i} delay={i * 0.06}>
              <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}
                className="glass rounded-2xl p-6 h-full" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: f.c + '16' }}>
                    <f.icon size={20} style={{ color: f.c }} />
                  </div>
                  <GB color={f.c}>{f.b}</GB>
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">{f.t}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.d}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const qs = [
    { t: 'Before QueueLess, our OPD was packed and patients argued. Now they wait outside, get notified, and arrive calm. Our staff loves it.', n: 'Dr. Meena Sharma', r: 'Medical Officer, PHC Rajgarh', a: 'MS' },
    { t: 'Medicine stock visibility alone justified the switch. We caught a Paracetamol stock-out three days before it hit patients.', n: 'Rakesh Verma', r: 'Pharmacist, CHC Block Level', a: 'RV' },
    { t: 'Setup took under 10 minutes. We printed the QR, stuck it on the door, and patients scanned and queued. Remarkable simplicity.', n: 'Anita Patel', r: 'Admin Coordinator, PHC Dholka', a: 'AP' },
  ];
  return (
    <section className="py-24 px-5">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-14">
          <GB color="#f472b6"><Star size={11} /> Testimonials</GB>
          <h2 className="text-4xl font-black text-white mt-4">Trusted by Healthcare Workers</h2>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {qs.map((q, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div className="glass rounded-2xl p-7 h-full flex flex-col" style={{ border: '1px solid rgba(244,114,182,0.15)' }}>
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, s) => <Star key={s} size={13} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1 italic">"{q.t}"</p>
                <div className="flex items-center gap-3 mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', color: 'white' }}>{q.a}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{q.n}</p>
                    <p className="text-xs text-slate-500">{q.r}</p>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="py-20 px-5">
      <div className="max-w-4xl mx-auto">
        <FadeUp>
          <div className="rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.25) 0%,rgba(0,212,255,0.15) 100%)', border: '1px solid rgba(0,212,255,0.25)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(0,212,255,0.1),transparent 70%)' }} />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#00d4ff,#7c3aed)' }}>
                <HeartPulse size={28} color="white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Ready to Transform Your PHC?</h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                Join hundreds of health centres already using QueueLess for better patient experiences and smarter resource management.
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-base font-semibold rounded-2xl"
                style={{ boxShadow: '0 0 40px rgba(0,212,255,0.3)' }}>
                Get Started Free <ArrowRight size={18} />
              </Link>
              <p className="text-xs text-slate-500 mt-4">No credit card - 5-minute setup - Free for public PHCs</p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', org: '', message: '' });
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="py-28 px-5">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-14">
          <GB color="#00d4ff"><Mail size={11} /> Contact</GB>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-4">
            Get Your PHC <span style={{ color: '#00d4ff' }}>On Board</span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Reach out for a demo, onboarding help, or any questions. We respond within one business day.
          </p>
        </FadeUp>
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            {[
              { icon: Mail, label: 'Email', value: 'hello@queueless.health', color: '#00d4ff' },
              { icon: Phone, label: 'Phone', value: '+91 98765 43210', color: '#7c3aed' },
              { icon: MapPin, label: 'Based in', value: 'Ahmedabad, Gujarat, India', color: '#10b981' },
            ].map((c, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="glass rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.color + '16' }}>
                    <c.icon size={18} style={{ color: c.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{c.label}</p>
                    <p className="text-sm text-slate-200 font-medium mt-0.5">{c.value}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
            <FadeUp delay={0.3}>
              <div className="glass rounded-2xl p-5" style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">What happens next</p>
                {['We review your message within 24 h', 'Schedule a free 20-min demo call', 'Free setup for your PHC'].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{s}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
          <FadeUp className="md:col-span-3" delay={0.15}>
            <div className="glass rounded-3xl p-8" style={{ border: '1px solid rgba(0,212,255,0.15)' }}>
              {sent ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <Check size={28} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-400 text-sm">We will get back to you within one business day.</p>
                  <button onClick={() => setSent(false)} className="mt-6 text-xs text-slate-500 hover:text-slate-300 transition-colors">Send another</button>
                </motion.div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</label>
                      <input className="input-glass" placeholder="Dr. Anita Patel" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                      <input className="input-glass" type="email" placeholder="you@phc.gov.in" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Organisation</label>
                    <input className="input-glass" placeholder="PHC Rajgarh, Gujarat" required value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Message</label>
                    <textarea className="input-glass resize-none" rows={4} placeholder="Tell us about your PHC..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                  </div>
                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                    <Send size={16} /> Send Message
                  </motion.button>
                </form>
              )}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="py-10 px-5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#00d4ff,#7c3aed)' }}>
            <HeartPulse size={13} color="white" />
          </div>
          <span className="font-bold text-white text-sm">QueueLess Health</span>
        </div>
        <p className="text-xs text-slate-500 text-center">2026 QueueLess Health - Built for India PHCs - Powered by Supabase and React</p>
        <div className="flex items-center gap-5 text-xs text-slate-500">
          <Link to="/login" className="hover:text-slate-300 transition-colors">Log In</Link>
          <a href="#contact" className="hover:text-slate-300 transition-colors">Contact</a>
          <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <ProblemSolution />
      <Stats />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CTABanner />
      <Contact />
      <Footer />
    </div>
  );
}
