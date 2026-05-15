import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCcw, Wallet, Sliders, Crosshair,
  MapPin, Activity, Clock, ArrowRight,
  User, Plane, Anchor, Cpu, Power
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

const GridItem = ({ label, icon: Icon, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className="onyx-grid-item"
  >
    <div className="flex items-center gap-4 mb-8">
      {/* Trigger build reload */}
      <div className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 rounded-xl text-onyx-secondary shadow-xl transition-colors duration-300">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-onyx-purple uppercase tracking-[0.4em]">{label}</span>
        <div className="w-8 h-[1px] bg-onyx-purple/20 mt-1" />
      </div>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </motion.div>
);

const DataPoint = ({ icon: Icon, label, value, accent = false }) => (
  <div className="onyx-data-row group">
    <Icon size={12} className={cn("transition-colors", accent ? "text-onyx-accent" : "text-onyx-muted group-hover:text-white")} />
    <span className="flex-1 text-onyx-muted group-hover:text-white transition-colors">{label}</span>
    <span className={cn("font-black tabular-nums tracking-tighter text-sm", accent ? "text-onyx-accent" : "text-white")}>{value}</span>
  </div>
);

const NodeLink = React.memo(({ app, delay }) => {
  const handleTap = () => { triggerHaptic('medium'); };

  return (
    <motion.a
      href={app.url}
      onPointerDown={handleTap}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.8 }}
      className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-onyx-purple/30 hover:bg-white/[0.04] transition-all active:scale-[0.98]"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black text-onyx-secondary uppercase tracking-[0.4em]">Node_{app.node}</span>
          <span className="text-[7px] font-mono text-white/20">{app.version}</span>
        </div>
        <span className="text-xl font-black uppercase tracking-tighter group-hover:text-onyx-purple transition-colors">{app.name}</span>
      </div>
      <ArrowRight size={18} className="text-white/10 group-hover:text-onyx-purple transition-colors" />
    </motion.a>
  );
});

export default function App() {
  const [systemBudget, setSystemBudget] = useState(() => localStorage.getItem('onyx_total_budget') || '585000');
  const [time, setTime] = useState(new Date());

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

  return (
    <div className="min-h-screen bg-black text-white relative font-['Outfit']">
      <div className="onyx-grain" />
      <div className="onyx-scanlines" />

      {/* Atmospheric Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(192,132,252,0.08)_0%,transparent_50%)]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto pb-24">
        {/* HERO SECTION */}
        <section className="flex flex-col items-center justify-center py-24 px-6 border-b border-zinc-900/50">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-center uppercase leading-none mb-10"
          >
            Onyx <span className="text-onyx-purple">Japan</span> 2026
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl text-center text-onyx-muted font-bold text-sm md:text-base leading-relaxed tracking-wide"
          >
            Fujisawa Command Base: <span className="text-white">Almont Inn</span><br />
            Deployment: <span className="text-white">June 09 — July 06</span> | 26 Full Days<br />
            Daily Liquidity: <span className="text-onyx-accent">¥{parseInt(systemBudget / 26).toLocaleString()}</span>
          </motion.p>
        </section>

        {/* INTELLIGENCE GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b border-zinc-900/50">
          <GridItem label="Finances" icon={Wallet} delay={0.1}>
            <DataPoint label="Liquid Cash" value="¥470,000" icon={Activity} />
            <DataPoint label="NZD Pool" value="450 | 330 | 330" icon={RefreshCcw} />
            <DataPoint label="Total Lattice" value={`¥${parseInt(systemBudget).toLocaleString()}`} icon={Anchor} accent />
          </GridItem>

          <GridItem label="Logistics" icon={Sliders} delay={0.2}>
            <DataPoint label="Tactical Loadout" value="5-7 Outfits" icon={User} />
            <DataPoint label="Sanitation" value="Floor 4 Cycles" icon={Activity} />
            <DataPoint label="Atmosphere" value="Rain Protocol" icon={Plane} accent />
          </GridItem>

          <GridItem label="Missions" icon={Crosshair} delay={0.3}>
            <DataPoint label="Procurement" value="Onitsuka Tiger" icon={Activity} />
            <DataPoint label="Academic" value="Waseda Merch" icon={Activity} />
            <DataPoint label="Engagement" value="Noge Crawl" icon={Activity} accent />
          </GridItem>

          <GridItem label="Geography" icon={MapPin} delay={0.4}>
            <DataPoint label="Sector 01" value="Yokohama (3.8M)" icon={Activity} />
            <DataPoint label="Base Station" value="Fujisawa" icon={Activity} />
            <DataPoint label="Coastal" value="Enoshima" icon={Activity} accent />
          </GridItem>
        </section>

        {/* NODE REGISTRY */}
        <section className="p-8 md:p-16 border-b border-zinc-900/50">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-[1px] bg-onyx-purple/30" />
            <span className="text-[10px] font-black text-onyx-purple uppercase tracking-[0.6em]">Registry Lattice</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {APPS.map((app, i) => <NodeLink key={app.id} app={app} delay={0.5 + (i * 0.1)} />)}
          </div>
        </section>

        {/* SYSTEM FOOTER NODE */}
        <footer className="p-8 md:p-16 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-700">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-onyx-purple uppercase tracking-[0.4em] mb-1">Local Registry Time</span>
              <span className="text-xl font-black tabular-nums tracking-tighter">
                {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Tokyo' })}
              </span>
            </div>
            <div className="w-[1px] h-10 bg-zinc-900" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-onyx-purple uppercase tracking-[0.4em] mb-1">System Core</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white">Onyx_P-V1.2</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={forceRefresh}
              className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <RefreshCcw size={12} />
              <span>Sync Protocol</span>
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
