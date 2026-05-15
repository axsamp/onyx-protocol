import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCcw, Wallet, MapPin, ArrowRight, Download, Wifi, Calendar, ChevronUp, X, Clock, Activity
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const triggerHaptic = (type = 'light') => {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(type === 'light' ? 10 : 20);
    }
  } catch (e) { }
};

const APPS = [
  { id: 'itinerary', name: 'Itinerary Command', url: 'https://axsamp.github.io/onyx-itinerary/', version: 'V4.1.5', node: '01' },
  { id: 'budget', name: 'Budget Buffer', url: 'https://axsamp.github.io/budget-buffer/', version: 'V3.8.2', node: '02' },
  { id: 'converter', name: 'Unit Converter', url: 'https://axsamp.github.io/onyx-converter/', version: 'V2.5.6', node: '03' },
  { id: 'stamps', name: 'Stamp Collector', url: 'https://axsamp.github.io/onyx-stamps/', version: 'V1.9.11', node: '04' },
  { id: 'signal', name: 'Onyx Signal', url: 'https://axsamp.github.io/onyx-recorder/', version: 'V1.0.2', node: '05' },
];

const BudgetRing = ({ budget }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  // Calculate remaining percentage. For now, we'll show 100% since we are at start of mission,
  // or we could mock a small initial spend.
  const total = parseInt(budget) || 585000;
  const remaining = total; // In a future update, we can subtract aggregated expenses
  const percentage = 100; 
  const strokeDashoffset = 0; // Full circle

  return (
    <div className="relative w-full aspect-square flex items-center justify-center p-6 bg-onyx-text/[0.02] backdrop-blur-3xl border border-onyx-text/5 rounded-[32px] shadow-2xl overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-onyx-accent/5 to-transparent opacity-50" />
      <svg className="w-full h-full -rotate-90 transform drop-shadow-[0_0_15px_rgba(255,193,7,0.1)]">
        <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-onyx-text/5" />
        <motion.circle
          cx="50%" cy="50%" r={radius}
          stroke="currentColor" strokeWidth="6" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          className="text-onyx-accent"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <Activity size={16} className="text-onyx-accent mb-1 opacity-80" />
        <span className="text-[9px] font-mono text-onyx-text/40 tracking-widest uppercase">Liquid</span>
        <span className="text-xl font-black text-onyx-text tracking-tighter tabular-nums mt-1">{percentage}%</span>
      </div>
    </div>
  );
};

const LogisticsCard = ({ budget }) => (
  <div className="col-span-2 w-full h-full flex flex-col justify-between p-6 bg-onyx-text/[0.02] backdrop-blur-3xl border border-onyx-text/5 rounded-[32px] shadow-2xl relative overflow-hidden">
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-onyx-secondary/10 blur-3xl rounded-full" />
    <div className="flex justify-between items-start z-10">
      <div className="flex flex-col">
        <span className="text-[9px] font-black text-onyx-secondary uppercase tracking-[0.4em]">Deployment</span>
        <span className="text-3xl font-black text-onyx-text tracking-tighter mt-1">DAY 1 <span className="text-onyx-text/30">/ 26</span></span>
      </div>
      <Calendar size={18} className="text-onyx-secondary/80" />
    </div>
    <div className="flex flex-col gap-2 z-10 mt-6">
      <div className="flex justify-between text-[9px] font-mono text-onyx-text/40 uppercase tracking-widest">
        <span>Liquid Pool</span>
        <span className="text-onyx-accent">¥{parseInt(budget).toLocaleString()}</span>
      </div>
      <div className="w-full h-1 bg-onyx-text/10 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5, delay: 0.2 }} className="h-full bg-onyx-accent" />
      </div>
    </div>
  </div>
);

const LocationNode = () => (
  <div className="col-span-1 w-full aspect-square flex flex-col justify-between p-6 bg-onyx-text/[0.02] backdrop-blur-3xl border border-onyx-text/5 rounded-[32px] shadow-2xl relative overflow-hidden">
    <MapPin size={18} className="text-onyx-text/40" />
    <div className="flex flex-col z-10 mt-4">
      <span className="text-[9px] font-black text-onyx-text/40 uppercase tracking-[0.4em]">Sector 01</span>
      <span className="text-xl font-black text-onyx-text tracking-tighter leading-none mt-1">Fujisawa<br/>Base</span>
    </div>
  </div>
);

const AppLauncher = ({ app, delay }) => (
  <motion.a
    href={app.url}
    onPointerDown={() => triggerHaptic('medium')}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    transition={{ delay, type: "spring", stiffness: 400, damping: 25 }}
    className="flex items-center justify-between p-5 bg-onyx-text/[0.03] border border-onyx-text/10 rounded-2xl active:scale-[0.98] transition-all"
  >
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-[8px] font-black text-onyx-secondary uppercase tracking-[0.4em]">Node_{app.node}</span>
        <span className="text-[8px] font-mono text-onyx-text/40">{app.version}</span>
      </div>
      <span className="text-xl font-black uppercase tracking-tighter text-onyx-text">{app.name}</span>
    </div>
    <div className="w-10 h-10 rounded-full bg-onyx-text/10 flex items-center justify-center">
      <ArrowRight size={16} className="text-onyx-text/60" />
    </div>
  </motion.a>
);

export default function App() {
  const [systemBudget, setSystemBudget] = useState(() => localStorage.getItem('onyx_total_budget') || '585000');
  const [time, setTime] = useState(new Date());
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemBudget(localStorage.getItem('onyx_total_budget') || '585000');
      setTime(new Date());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const forceRefresh = useCallback(() => {
    triggerHaptic('heavy');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        for (const reg of regs) reg.unregister();
        window.location.reload(true);
      });
    } else window.location.reload(true);
  }, []);

  const exportMissionData = useCallback(() => {
    triggerHaptic('medium');
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('onyx_')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key));
        } catch (e) {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onyx_mission_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050505] text-onyx-text font-['Outfit'] relative">
      {/* Morphing Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,rgba(255,193,7,0.08)_0%,transparent_50%)] blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1.1, 1, 1.1], rotate: [45, 0, 45] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] right-[10%] w-[100%] h-[100%] bg-[radial-gradient(ellipse_at_center,rgba(161,161,170,0.05)_0%,transparent_50%)] blur-[120px]" 
        />
      </div>

      <div className="onyx-grain" />

      {/* Dynamic Island Header (Top 60px Clearance) */}
      <header className="absolute top-0 left-0 w-full pt-14 pb-4 px-8 flex justify-between items-center z-40">
        <div className="flex items-center gap-2 opacity-60">
          <Clock size={12} className="text-onyx-text" />
          <span className="text-[10px] font-mono tracking-widest">
            {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' })} JST
          </span>
        </div>
        <div className="flex items-center gap-2 opacity-60">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-onyx-accent">Link Active</span>
          <Wifi size={12} className="text-onyx-accent" />
        </div>
      </header>

      {/* Main Dashboard View */}
      <main className="h-full w-full pt-28 px-6 pb-32 flex flex-col gap-6 relative z-10">
        
        {/* Massive Greeting */}
        <div className="flex flex-col mb-4">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black text-onyx-secondary uppercase tracking-[0.4em] mb-2">Protocol Online</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl font-black uppercase tracking-tighter leading-none">
            Onyx <span className="text-onyx-accent">Command</span>
          </motion.h1>
        </div>

        {/* Widget Cluster */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
             <BudgetRing budget={systemBudget} />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
             <LocationNode />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="col-span-2 h-40">
             <LogisticsCard budget={systemBudget} />
          </motion.div>
        </div>

      </main>

      {/* The Dock (Default visible state) */}
      <div className="fixed bottom-0 left-0 w-full z-40 pb-8 pt-4 px-6 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto flex items-center justify-between bg-onyx-text/[0.05] backdrop-blur-3xl border border-onyx-text/10 rounded-full p-2 pr-6 shadow-2xl">
          <button 
            onClick={() => { triggerHaptic('heavy'); setIsLauncherOpen(true); }}
            className="flex items-center gap-3 bg-onyx-accent text-black px-6 py-4 rounded-full font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,193,7,0.3)]"
          >
            <ChevronUp size={16} />
            <span>Launchpad</span>
          </button>

          <div className="flex items-center gap-2">
            <button onClick={exportMissionData} className="w-12 h-12 flex items-center justify-center rounded-full bg-onyx-text/10 hover:bg-onyx-text/20 transition-colors active:scale-95 text-onyx-text/60">
              <Download size={16} />
            </button>
            <button onClick={forceRefresh} className="w-12 h-12 flex items-center justify-center rounded-full bg-onyx-text/10 hover:bg-onyx-text/20 transition-colors active:scale-95 text-onyx-text/60">
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* The Tactical Bottom Sheet (Launcher) */}
      <AnimatePresence>
        {isLauncherOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsLauncherOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 w-full h-[85vh] bg-[#050505]/95 backdrop-blur-3xl border-t border-onyx-text/10 rounded-t-[40px] z-50 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
            >
              <div className="w-full flex justify-center pt-4 pb-6" onClick={() => setIsLauncherOpen(false)}>
                <div className="w-16 h-1.5 bg-onyx-text/20 rounded-full" />
              </div>
              
              <div className="px-8 pb-4 flex justify-between items-center">
                <span className="text-2xl font-black uppercase tracking-tighter">Registry</span>
                <button onClick={() => setIsLauncherOpen(false)} className="w-10 h-10 rounded-full bg-onyx-text/10 flex items-center justify-center active:scale-95">
                  <X size={16} className="text-onyx-text/60" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-20 flex flex-col gap-3 no-scrollbar">
                {APPS.map((app, i) => <AppLauncher key={app.id} app={app} delay={0.1 + (i * 0.05)} />)}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
