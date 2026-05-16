import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCcw, Wallet, MapPin, ArrowRight, Download, Calendar, X, Activity, Terminal, ShoppingBag, Search, Plus, Shield, Settings, User, ChevronDown, Phone, Waves, Eye, EyeOff, Check
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

const PHRASES = [
  { jp: 'Sumimasen', en: 'Excuse me', kana: 'すみません' },
  { jp: 'Arigato', en: 'Thank you', kana: 'ありがとう' },
  { jp: 'Oishii', en: 'Delicious', kana: 'おいしい' },
  { jp: 'Kore Onegaishimasu', en: 'This please', kana: 'これ おねがいします' },
  { jp: 'Toire wa doko desu ka?', en: 'Where is the toilet?', kana: 'トイレはどこですか？' },
];

const EXPLORE_SPOTS = [
  { name: 'Meiji Jingu', type: 'Shrine', distance: '53m • 51km', img: 'https://images.unsplash.com/photo-1720783199805-bf399ed5173c?q=80&w=800&v=1' },
  { name: 'Akihabara', type: 'Tech District', distance: '59m • 53km', img: 'https://images.unsplash.com/photo-1571497245719-ce3e7f16db1f?q=80&w=800&v=1' },
  { name: 'Shinjuku Gyoen', type: 'Garden', distance: '1h 4m • 54km', img: 'https://images.unsplash.com/photo-1545601445-4d6a0a0565f0?q=80&w=800&v=1' },
  { name: 'Chiba Station', type: 'Urban Center', distance: '1h 29m • 89.2km', img: import.meta.env.BASE_URL + 'chiba.png' },
];

const HIGHLIGHTS = [
  {
    title: 'Shibuya Crossing',
    subtitle: "3.2km away • World's busiest intersection",
    tag: 'Trending',
    density: 'High',
    img: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1000&auto=format&fit=crop',
    link: 'https://www.google.com/maps/search/Shibuya+Crossing'
  },
  {
    title: 'Tokyo Dome',
    subtitle: "10.5km away • Major events & entertainment",
    tag: 'Priority',
    density: 'Medium',
    img: import.meta.env.BASE_URL + 'tokyo_dome.png',
    link: 'https://www.google.com/maps/search/Tokyo+Dome'
  },
  {
    title: 'Yokohama Minatomirai',
    subtitle: "20m Transit • Futuristic port city skyline",
    tag: 'Intel',
    density: 'Medium',
    img: import.meta.env.BASE_URL + 'yokohama.png',
    link: 'https://www.google.com/maps/search/Yokohama+Minatomirai'
  },
  {
    title: 'Kyoto Temples',
    subtitle: "Future Deployment • Historic capital",
    tag: 'Planned',
    density: 'High',
    img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop',
    link: 'https://www.google.com/maps/search/Kyoto'
  }
];

const AppLauncher = ({ app, delay }) => (
  <motion.a
    href={app.url}
    onPointerDown={() => triggerHaptic('medium')}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    transition={{ delay, type: "spring", damping: 20, stiffness: 200 }}
    className="group flex items-center justify-between py-4 px-5 hover:bg-g-aluminium transition-all relative rounded-2xl mx-1 ripple bg-g-surface border border-g-outline/10 shadow-sm mb-3"
  >
    <div className="flex flex-col gap-1 pl-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-g-primary uppercase tracking-widest bg-g-primary-container px-2 py-0.5 rounded-md">ID: {app.node}</span>
        <span className="text-[10px] font-medium text-g-text-variant">{app.version}</span>
      </div>
      <span className="text-xl font-bold text-g-text tracking-tight mt-0.5">{app.name}</span>
    </div>
    <div className="pr-2">
      <div className="w-10 h-10 rounded-full bg-g-primary-container flex items-center justify-center group-hover:bg-g-primary group-hover:text-white transition-colors text-g-primary">
        <ArrowRight size={18} />
      </div>
    </div>
  </motion.a>
);

export default function App() {
  const [time, setTime] = useState(new Date());
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [wallet, setWallet] = useState(() => {
    const saved = localStorage.getItem('onyx_wallet');
    return saved ? JSON.parse(saved) : { liquid: 585000, suica: 12450 };
  });
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [tempWallet, setTempWallet] = useState(wallet);

  useEffect(() => {
    if (isWalletModalOpen) setTempWallet(wallet);
  }, [isWalletModalOpen, wallet]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'onyx_wallet') {
        setWallet(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    localStorage.setItem('onyx_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    if (activeTab !== 'home') return;
    const highlightInterval = setInterval(() => {
      setHighlightIndex((prev) => (prev + 1) % HIGHLIGHTS.length);
    }, 6000);
    return () => clearInterval(highlightInterval);
  }, [activeTab]);

  // Preload next image to prevent white flash
  useEffect(() => {
    const nextIndex = (highlightIndex + 1) % HIGHLIGHTS.length;
    const img = new Image();
    img.src = HIGHLIGHTS[nextIndex].img;
  }, [highlightIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text, index) => {
    triggerHaptic('medium');
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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

  const filteredApps = useMemo(() => {
    if (!searchQuery) return APPS;
    return APPS.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const filteredSpots = useMemo(() => {
    if (!searchQuery) return EXPLORE_SPOTS;
    return EXPLORE_SPOTS.filter(spot => spot.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  return (
    <div className={cn(
      "h-screen w-screen max-w-md mx-auto overflow-hidden relative selection:bg-g-primary-container flex flex-col transition-colors duration-700",
      isStealthMode ? "bg-[#E0E0E0] grayscale" : "bg-g-bg"
    )}>
      {/* Dynamic Island Spacer */}
      <div className="h-14 w-full shrink-0"></div>

      {/* Header Section */}
      <header className="px-6 py-4 flex justify-between items-center z-20 shrink-0 bg-g-bg/90 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-mono font-medium text-g-text-variant">
              Fujisawa Base • {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' })} JST
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-g-text flex items-center gap-2">
            {activeTab === 'home' ? 'Fujisawa, Japan' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            <ChevronDown size={20} className="text-g-primary mt-1" />
          </h1>
        </div>
        <button className="w-10 h-10 rounded-full overflow-hidden border border-g-outline/30 shadow-sm active:scale-95 transition-transform ripple shrink-0">
          <div className="w-full h-full bg-g-primary text-white flex items-center justify-center font-bold text-lg">O</div>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 pt-4 relative z-10">

        {/* Tactical Search */}
        <div className="relative group mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps, destinations, or intel..."
            className="w-full bg-g-surface border border-g-outline/20 shadow-elevation-1 rounded-full py-4 px-12 text-sm text-g-text focus:outline-none focus:border-g-primary/40 focus:ring-2 focus:ring-g-primary/20 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-g-text-variant" size={20} />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-g-text-variant hover:text-g-text">
              <X size={18} />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Recommended Section */}
              {!searchQuery && (
                <section>
                  <div className="label-text mb-3 ml-2">Recommended for you</div>
                  <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden group shadow-elevation-2 bg-g-aluminium">
                    <AnimatePresence initial={false}>
                      <motion.img
                        key={highlightIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        src={HIGHLIGHTS[highlightIndex].img}
                        alt={HIGHLIGHTS[highlightIndex].title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10 pointer-events-none"></div>

                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 z-20">
                      <MapPin size={14} className="text-g-primary" />
                      <span className="text-[11px] font-bold text-g-text">Density: {HIGHLIGHTS[highlightIndex].density}</span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`text-${highlightIndex}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                          className="flex justify-between items-end mb-2"
                        >
                          <div>
                            <span className="px-2 py-0.5 rounded text-g-primary bg-white/90 text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">{HIGHLIGHTS[highlightIndex].tag}</span>
                            <h2 className="text-2xl font-bold">{HIGHLIGHTS[highlightIndex].title}</h2>
                            <p className="text-sm font-medium opacity-90">{HIGHLIGHTS[highlightIndex].subtitle}</p>
                          </div>
                          <a
                            href={HIGHLIGHTS[highlightIndex].link}
                            target="_blank"
                            onClick={() => triggerHaptic('medium')}
                            className="w-12 h-12 rounded-full bg-g-primary flex items-center justify-center shadow-elevation-2 active:scale-90 transition-transform cursor-pointer ripple"
                          >
                            <ArrowRight size={20} className="text-white" />
                          </a>
                        </motion.div>
                      </AnimatePresence>

                      {/* Pagination Dots */}
                      <div className="flex gap-1.5 items-center justify-center mt-2">
                        {HIGHLIGHTS.map((_, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              triggerHaptic('light');
                              setHighlightIndex(i);
                            }}
                            className={cn("h-1.5 rounded-full transition-all cursor-pointer", i === highlightIndex ? "w-4 bg-white" : "w-1.5 bg-white/40")}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Digital Wallet Card */}
              <div
                onClick={() => {
                  triggerHaptic('medium');
                  setIsWalletModalOpen(true);
                }}
                className="relative w-full h-48 rounded-[24px] overflow-hidden p-6 flex flex-col justify-between shadow-elevation-2 aluminium-gradient ripple cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <div className="text-gray-800 font-bold text-2xl tracking-tight flex items-center gap-2">
                      <Wallet size={24} className="text-gray-700" />
                      Apple Wallet
                    </div>
                    <div className="text-xs font-medium text-gray-500 mt-1">Mission Funds & Transit</div>
                  </div>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 21.3c-2.3-2.6-3.5-5.8-3.5-9.3s1.2-6.7 3.5-9.3M12 18.5c-1.6-1.8-2.5-4-2.5-6.5s.9-4.7 2.5-6.5M15.5 15.7c-.8-1-1.3-2.3-1.3-3.7s.5-2.7 1.3-3.7M19 13.4c-.3-.4-.5-.9-.5-1.4s.2-1 .5-1.4" /></svg>
                </div>

                <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Liquid Cash</div>
                    <div className="text-3xl font-bold tracking-tight text-gray-900 font-sans flex items-baseline gap-1">
                      <span className="text-xl text-gray-500">¥</span>{wallet.liquid.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center justify-end gap-1">
                      Suica <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14.899A7 7 0 1 1 15.69 8.13c-1.28.819-2.77 1.275-4.5 1.275a8.84 8.84 0 0 1-5.089-1.528A7 7 0 0 0 4 14.899Z" /><path d="M17.857 5.703a6 6 0 0 0-8.967 8.967 6 6 0 0 0 8.967-8.967Z" /></svg>
                    </div>
                    <div className="text-xl font-bold tracking-tight text-gray-800 font-sans flex items-baseline gap-1 justify-end">
                      <span className="text-sm text-gray-500">¥</span>{wallet.suica.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Essential Phrases */}
              <section>
                <div className="label-text mb-3 ml-2">Essential Phrases</div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {PHRASES.map((phrase, i) => (
                    <button
                      key={phrase.jp}
                      onClick={() => copyToClipboard(phrase.jp, i)}
                      className="shrink-0 material-card px-5 py-3 flex flex-col items-start gap-1 ripple active:scale-95 transition-transform"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-g-text">{phrase.jp}</span>
                        {copiedIndex === i && <Check size={14} className="text-g-primary" />}
                      </div>
                      <span className="text-xs font-medium text-g-text-variant">{phrase.en}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Itinerary Timeline */}
              <section>
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="text-lg font-bold text-g-text">Timeline</h3>
                  <span className="text-[10px] font-bold uppercase text-g-primary bg-g-primary-container px-2 py-1 rounded-md">Active</span>
                </div>

                <div className="space-y-3">
                  <div className="material-card bg-g-primary-container p-4 flex items-center gap-4 border-none ripple">
                    <div className="w-12 h-12 rounded-full bg-g-primary text-white flex items-center justify-center shrink-0">
                      <Activity size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="font-bold text-g-primary text-base">Fujisawa Hub</h4>
                        <span className="text-xs font-bold text-g-primary">Active</span>
                      </div>
                      <p className="text-sm font-medium text-g-primary/80">Almont Inn Deployment</p>
                    </div>
                  </div>

                  <div className="material-card p-4 flex items-center gap-4 ripple">
                    <div className="w-12 h-12 rounded-full bg-g-aluminium text-g-text-variant flex items-center justify-center shrink-0">
                      <ShoppingBag size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="font-bold text-g-text text-base">Onitsuka Tigers</h4>
                        <span className="text-xs font-bold text-g-text-variant">Pending</span>
                      </div>
                      <p className="text-sm font-medium text-g-text-variant">Shopping • Tokyo</p>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="label-text ml-2">Regional Intel</div>
              <div className="grid grid-cols-1 gap-4">
                {filteredSpots.map((spot) => (
                  <div key={spot.name} className="material-card overflow-hidden ripple cursor-pointer group pb-4">
                    <img src={spot.img} alt={spot.name} className="w-full h-40 object-cover" />
                    <div className="px-4 pt-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-g-text">{spot.name}</h3>
                        <p className="text-sm font-medium text-g-text-variant">{spot.type} • {spot.distance}</p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(spot.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => { e.stopPropagation(); triggerHaptic('medium'); }}
                        className="w-10 h-10 rounded-full bg-g-primary-container text-g-primary flex items-center justify-center group-hover:bg-g-primary group-hover:text-white transition-colors ripple"
                      >
                        <ArrowRight size={18} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'safety' && (
            <motion.div
              key="safety"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <section className="material-card p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-g-text">Safety Protocol</h2>
                    <p className="text-sm text-g-text-variant font-medium">Emergency services</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-g-bg rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Phone size={20} className="text-g-primary" />
                      <span className="text-base font-bold text-g-text">Police (Emergency)</span>
                    </div>
                    <span className="text-xl font-mono font-bold text-g-primary">110</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-g-bg rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Phone size={20} className="text-g-primary" />
                      <span className="text-base font-bold text-g-text">Ambulance / Fire</span>
                    </div>
                    <span className="text-xl font-mono font-bold text-g-primary">119</span>
                  </div>
                </div>
              </section>

              <section className="material-card p-6 bg-g-primary-container border-none">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-g-primary text-white flex items-center justify-center">
                    <Waves size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-g-primary">Rainy Season Protocol</h3>
                    <p className="text-sm font-medium text-g-primary/80">Status: ACTIVE • Increased prep required.</p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="label-text ml-2">System Registry</div>
              <div className="space-y-3">
                <button
                  onClick={() => setIsStealthMode(!isStealthMode)}
                  className="w-full material-card p-5 flex justify-between items-center ripple"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-g-aluminium flex items-center justify-center text-g-text">
                      {isStealthMode ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                    <div className="text-left">
                      <div className="text-base font-bold text-g-text">Stealth Mode</div>
                      <div className="text-sm font-medium text-g-text-variant">Grayscale visuals</div>
                    </div>
                  </div>
                  <div className={cn("w-12 h-6 rounded-full relative transition-colors border", isStealthMode ? "bg-g-primary border-g-primary" : "bg-g-aluminium border-g-outline")}>
                    <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", isStealthMode ? "right-1" : "left-1 shadow-sm")} />
                  </div>
                </button>

                <button
                  onClick={exportMissionData}
                  className="w-full material-card p-5 flex justify-between items-center ripple"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-g-primary-container text-g-primary flex items-center justify-center">
                      <Download size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-base font-bold text-g-text">Export Intel</div>
                      <div className="text-sm font-medium text-g-text-variant">Backup data to JSON</div>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-g-text-variant" />
                </button>

                <button
                  onClick={forceRefresh}
                  className="w-full material-card p-5 flex justify-between items-center ripple"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-g-primary-container text-g-primary flex items-center justify-center">
                      <RefreshCcw size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-base font-bold text-g-text">Force Sync</div>
                      <div className="text-sm font-medium text-g-text-variant">Clear cache</div>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-g-text-variant" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Material 3 Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-g-surface border-t border-g-outline/20 pt-2 pb-safe px-2 pb-6">
        <nav className="w-full flex justify-around items-center max-w-sm mx-auto">

          <button
            onClick={() => { triggerHaptic('light'); setActiveTab('home'); }}
            className={cn("nav-item flex flex-col items-center gap-1 w-16 group", activeTab === 'home' && "nav-active")}
          >
            <div className="nav-icon-container w-16 h-8 rounded-full flex items-center justify-center transition-colors duration-200 text-g-text-variant group-hover:bg-g-aluminium">
              <Activity size={22} className={cn(activeTab === 'home' && "fill-current")} />
            </div>
            <span className="text-[11px] font-medium text-g-text-variant transition-colors duration-200">Home</span>
          </button>

          <button
            onClick={() => { triggerHaptic('light'); setActiveTab('explore'); }}
            className={cn("nav-item flex flex-col items-center gap-1 w-16 group", activeTab === 'explore' && "nav-active")}
          >
            <div className="nav-icon-container w-16 h-8 rounded-full flex items-center justify-center transition-colors duration-200 text-g-text-variant group-hover:bg-g-aluminium">
              <MapPin size={22} className={cn(activeTab === 'explore' && "fill-current")} />
            </div>
            <span className="text-[11px] font-medium text-g-text-variant transition-colors duration-200">Explore</span>
          </button>

          {/* Central FAB aligned with Material Design */}
          <button
            onClick={() => { triggerHaptic('heavy'); setIsLauncherOpen(true); }}
            className="relative -top-4 w-14 h-14 rounded-2xl bg-g-primary text-white flex items-center justify-center shadow-elevation-3 hover:bg-blue-700 active:bg-blue-800 transition-colors ripple mx-2"
          >
            <Plus size={28} />
          </button>

          <button
            onClick={() => { triggerHaptic('light'); setActiveTab('safety'); }}
            className={cn("nav-item flex flex-col items-center gap-1 w-16 group", activeTab === 'safety' && "nav-active")}
          >
            <div className="nav-icon-container w-16 h-8 rounded-full flex items-center justify-center transition-colors duration-200 text-g-text-variant group-hover:bg-g-aluminium">
              <Shield size={22} className={cn(activeTab === 'safety' && "fill-current")} />
            </div>
            <span className="text-[11px] font-medium text-g-text-variant transition-colors duration-200">Safety</span>
          </button>

          <button
            onClick={() => { triggerHaptic('light'); setActiveTab('settings'); }}
            className={cn("nav-item flex flex-col items-center gap-1 w-16 group", activeTab === 'settings' && "nav-active")}
          >
            <div className="nav-icon-container w-16 h-8 rounded-full flex items-center justify-center transition-colors duration-200 text-g-text-variant group-hover:bg-g-aluminium">
              <Settings size={22} className={cn(activeTab === 'settings' && "fill-current")} />
            </div>
            <span className="text-[11px] font-medium text-g-text-variant transition-colors duration-200">Setup</span>
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {isWalletModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsWalletModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white rounded-t-[32px] p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-g-outline/30 rounded-full mx-auto mb-8" />
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-bold text-g-text tracking-tight">Wallet Funds</h3>
                  <p className="text-xs font-medium text-g-text-variant mt-1">Please input funds to sync</p>
                </div>
                <button onClick={() => setIsWalletModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-g-aluminium text-g-text ripple"><X size={20} /></button>
              </div>

              <div className="space-y-10">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em]">Liquid Cash</label>
                    <span className="text-[10px] font-mono text-g-primary">TOTAL CASH</span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-0 text-3xl font-medium text-g-outline">¥</span>
                    <input
                      type="number"
                      value={tempWallet.liquid}
                      onChange={(e) => setTempWallet({ ...tempWallet, liquid: parseInt(e.target.value) || 0 })}
                      className="w-full bg-transparent border-b-2 border-g-outline/20 focus:border-g-primary py-4 pl-8 text-4xl font-bold text-g-text outline-none tabular-nums transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em]">Suica Balance</label>
                    <span className="text-[10px] font-mono text-g-primary">SUICA NFC</span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-0 text-3xl font-medium text-g-outline">¥</span>
                    <input
                      type="number"
                      value={tempWallet.suica}
                      onChange={(e) => setTempWallet({ ...tempWallet, suica: parseInt(e.target.value) || 0 })}
                      className="w-full bg-transparent border-b-2 border-g-outline/20 focus:border-g-primary py-4 pl-8 text-4xl font-bold text-g-text outline-none tabular-nums transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setWallet(tempWallet);
                  setIsWalletModalOpen(false);
                  triggerHaptic('heavy');
                }}
                className="w-full h-16 bg-g-primary text-white font-bold uppercase tracking-widest rounded-2xl shadow-elevation-2 mt-12 active:scale-[0.98] transition-transform ripple"
              >
                Sync New Balances
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Node Registry Bottom Sheet */}
      <AnimatePresence>
        {isLauncherOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsLauncherOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
              className="fixed bottom-0 left-0 w-full h-[85vh] bg-g-bg z-50 flex flex-col shadow-elevation-3 rounded-t-[32px] overflow-hidden"
            >
              {/* Material Drag Handle */}
              <div className="w-full flex justify-center pt-4 pb-2 bg-g-bg">
                <div className="w-12 h-1.5 rounded-full bg-g-outline/30"></div>
              </div>

              <div className="px-6 py-4 flex justify-between items-center bg-g-bg mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-g-text tracking-tight">Mission Apps</h2>
                  <p className="text-sm font-medium text-g-text-variant mt-0.5">Deployment ready modules</p>
                </div>
                <button
                  onClick={() => setIsLauncherOpen(false)}
                  className="w-10 h-10 rounded-full bg-g-aluminium flex items-center justify-center text-g-text hover:bg-g-outline/30 transition-colors ripple"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col px-4 pb-24 pt-2 no-scrollbar">
                {filteredApps.length > 0 ? (
                  filteredApps.map((app, i) => <AppLauncher key={app.id} app={app} delay={i * 0.04} />)
                ) : (
                  <div className="px-10 py-20 text-center">
                    <div className="text-sm font-bold uppercase tracking-widest text-g-text-variant">No matching apps found</div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
