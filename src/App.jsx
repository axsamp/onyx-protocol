import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCcw, Wallet, MapPin, ArrowRight, Download, Calendar, X, Activity, Terminal, ShoppingBag, Search, Plus, Shield, Settings, User, ChevronDown, Phone, Waves, Eye, EyeOff, Check,
  ChevronLeft, ChevronRight, TrendingUp, Pizza, Bus, Ticket, MoreHorizontal, Trash2, Info, Palette
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
  { id: 'converter', name: 'Unit Converter', url: 'https://axsamp.github.io/onyx-converter/', version: 'V2.5.6', node: '02' },
  { id: 'stamps', name: 'Stamp Collector', url: 'https://axsamp.github.io/onyx-stamps/', version: 'V1.9.11', node: '03' },
  { id: 'signal', name: 'Onyx Signal', url: 'https://axsamp.github.io/onyx-recorder/', version: 'V1.0.2', node: '04' },
];

const CATEGORIES = {
  Food: { icon: Pizza, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-950/40' },
  Transit: { icon: Bus, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/40' },
  Shopping: { icon: ShoppingBag, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-950/40' },
  Activity: { icon: Ticket, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/40' },
  Other: { icon: MoreHorizontal, color: 'text-g-text-variant', bg: 'bg-g-aluminium dark:bg-g-aluminium/20' },
};

const MISSION_NODES = {
  fujisawa: { lat: 35.3362, lng: 139.4870, name: 'Fujisawa Hub' },
  shibuya: { lat: 35.6580, lng: 139.7016, name: 'Shibuya Crossing' },
  shinjuku: { lat: 35.6895, lng: 139.7004, name: 'Shinjuku Node' },
  tokyo: { lat: 35.6812, lng: 139.7671, name: 'Tokyo Ops' },
  chiba: { lat: 35.6133, lng: 140.1130, name: 'Chiba Station' }
};

const FARE_MATRIX = {
  'fujisawa-shibuya': 990,
  'fujisawa-shinjuku': 990,
  'fujisawa-tokyo': 990,
  'fujisawa-chiba': 1340,
  'shibuya-tokyo': 210,
  'shibuya-shinjuku': 160,
  'shinjuku-tokyo': 210,
  'shinjuku-chiba': 820,
  'tokyo-chiba': 650,
  'shibuya-chiba': 820
};

const THEME_PALETTES = {
  cobalt: {
    light: { primary: '#0B57D0', primaryContainer: '#D3E3FD', bg: '#F0F4F8' },
    dark: { primary: '#8AB4F8', primaryContainer: '#3C4043', bg: '#202124' }
  },
  vermilion: {
    light: { primary: '#C04836', primaryContainer: '#FCDCD6', bg: '#FAF4F2' },
    dark: { primary: '#FF8A75', primaryContainer: '#4A2B25', bg: '#241E1D' }
  },
  matcha: {
    light: { primary: '#386B40', primaryContainer: '#D2E7C4', bg: '#F3F7F2' },
    dark: { primary: '#81C784', primaryContainer: '#223825', bg: '#1E231F' }
  },
  sakura: {
    light: { primary: '#C64E74', primaryContainer: '#FFD9E2', bg: '#FAF5F6' },
    dark: { primary: '#FCAEC5', primaryContainer: '#4C232F', bg: '#231F20' }
  },
  yuzu: {
    light: { primary: '#7E5700', primaryContainer: '#FFF1C5', bg: '#FCFAF5' },
    dark: { primary: '#F5BE48', primaryContainer: '#4D3100', bg: '#1A1916' }
  }
};

const getRouteFare = (fromId, toId) => {
  if (!fromId || !toId || fromId === toId) return null;
  const key1 = `${fromId}-${toId}`;
  const key2 = `${toId}-${fromId}`;
  return FARE_MATRIX[key1] || FARE_MATRIX[key2] || null;
};

const formatCurrency = (amount) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(Math.round(amount));

const formatDateSafely = (dateString, offset = 0) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '2026-01-01';
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  } catch (e) { return '2026-01-01'; }
};

// Haversine formula to calculate distance in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const PHRASES = [
  // Essential Category
  { jp: 'すみません', romaji: 'Sumimasen', en: 'Excuse me / Sorry', cat: 'essential' },
  { jp: 'ありがとうございます', romaji: 'Arigatou gozaimasu', en: 'Thank you very much', cat: 'essential' },
  { jp: 'はい', romaji: 'Hai', en: 'Yes', cat: 'essential' },
  { jp: 'いいえ', romaji: 'Iie', en: 'No', cat: 'essential' },
  { jp: '日本語がわかりません', romaji: 'Nihongo ga wakarimasen', en: "I don't understand Japanese", cat: 'essential' },

  // Transit Category
  { jp: '改札口はどこですか？', romaji: 'Kaisatsuguchi wa doko desu ka?', en: 'Where is the ticket gate?', cat: 'transit' },
  { jp: 'この電車は東京に行きますか？', romaji: 'Kono densha wa Tōkyō ni ikimasu ka?', en: 'Does this train go to Tokyo?', cat: 'transit' },
  { jp: '切符売り場はどこですか？', romaji: 'Kippu uriba wa doko desu ka?', en: 'Where is the ticket office?', cat: 'transit' },
  { jp: '切符の買い方を教えてください', romaji: 'Kippu no kaikata o oshiete kudasai', en: 'Please show me how to buy a ticket', cat: 'transit' },

  // Dining Category
  { jp: 'お水をください', romaji: 'Omizu o kudasai', en: 'Water, please', cat: 'dining' },
  { jp: 'これ、お願いします', romaji: 'Kore, onegai shimasu', en: 'This one, please (ordering)', cat: 'dining' },
  { jp: '美味しいです', romaji: 'Oishii desu', en: 'It is delicious', cat: 'dining' },
  { jp: 'お会計をお願いします', romaji: 'Okaikei o onegai shimasu', en: 'The bill, please', cat: 'dining' },
  { jp: 'いただきます', romaji: 'Itadakimasu', en: 'Thank you for the meal (before)', cat: 'dining' },
  { jp: 'ごちそうさまでした', romaji: 'Gochisōsama deshita', en: 'Thank you for the meal (after)', cat: 'dining' },

  // Shopping Category
  { jp: 'これはいくらですか？', romaji: 'Kore wa ikura desu ka?', en: 'How much is this?', cat: 'shopping' },
  { jp: 'カードでお願いします', romaji: 'Kādo de onegai shimasu', en: 'Credit card, please', cat: 'shopping' },
  { jp: 'レシートはいいです', romaji: 'Reshīto wa ii desu', en: "I don't need a receipt", cat: 'shopping' },
  { jp: '袋をください', romaji: 'Fukuro o kudasai', en: 'A plastic bag, please', cat: 'shopping' },
  { jp: 'Suicaで払えますか？', romaji: 'Suica de haraemasu ka?', en: 'Can I pay with Suica?', cat: 'shopping' }
];

const EXPLORE_SPOTS = [
  { name: 'Meiji Jingu', type: 'Shrine', distance: '53m • 51km', img: 'https://images.unsplash.com/photo-1720783199805-bf399ed5173c?q=80&w=800&v=1' },
  { name: 'Akihabara', type: 'Tech District', distance: '59m • 53km', img: 'https://images.unsplash.com/photo-1571497245719-ce3e7f16db1f?q=80&w=800&v=1' },
  { name: 'Shinjuku Gyoen', type: 'Garden', distance: '1h 4m • 54km', img: 'https://images.unsplash.com/photo-1545601445-4d6a0a0565f0?q=80&w=800&v=1' },
  { name: 'Chiba Station', type: 'Urban Center', distance: '1h 29m • 89.2km', img: import.meta.env.BASE_URL + 'chiba.png?v=2' },
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
    title: 'Shizuoka Vistas',
    subtitle: "1h Shinkansen • Mt. Fuji views & tea slopes",
    tag: 'Nature',
    density: 'Low',
    img: import.meta.env.BASE_URL + 'shizuoka.png',
    link: 'https://www.google.com/maps/search/Shizuoka+Prefecture'
  },
  {
    title: 'Nagoya Castle',
    subtitle: "1.5h Shinkansen • Historic castle & legacy museum",
    tag: 'Priority',
    density: 'Medium',
    img: import.meta.env.BASE_URL + 'nagoya.png',
    link: 'https://www.google.com/maps/search/Nagoya+Castle'
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
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25, delay: delay, ease: "easeOut" }}
    className="group flex items-center justify-between py-4 px-5 hover:bg-g-aluminium transition-colors duration-200 relative rounded-2xl mx-1 bg-g-surface border border-g-outline/10 shadow-sm mb-3 will-change-[opacity]"
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
  const [callsign, setCallsign] = useState(() => {
    return localStorage.getItem('onyx_callsign') || 'JD';
  });

  useEffect(() => {
    localStorage.setItem('onyx_callsign', callsign);
  }, [callsign]);

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [fullscreenPhrase, setFullscreenPhrase] = useState(null);
  const [isTransitLogged, setIsTransitLogged] = useState(false);
  const [wallet, setWallet] = useState(() => {
    const saved = localStorage.getItem('onyx_wallet');
    return saved ? JSON.parse(saved) : { liquid: 24500, suica: 12840 };
  });

  const [budgetSettings, setBudgetSettings] = useState(() => {
    const saved = localStorage.getItem('onyx_budget_settings');
    const def = { totalBudget: 100000, startDate: '2026-01-01', endDate: '2026-01-07' };
    if (!saved) return def;
    try {
      return JSON.parse(saved);
    } catch (e) { return def; }
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('onyx_budget_expenses');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) { return []; }
  });

  const [currentDayOffset, setCurrentDayOffset] = useState(() => {
    const saved = localStorage.getItem('onyx_budget_day_offset');
    return saved ? parseInt(saved) : 0;
  });

  const [lastKnownNode, setLastKnownNode] = useState(() => {
    return localStorage.getItem('onyx_last_known_node') || 'fujisawa';
  });

  const lastKnownNodeRef = useRef(lastKnownNode);
  useEffect(() => {
    lastKnownNodeRef.current = lastKnownNode;
  }, [lastKnownNode]);

  const [pendingTransitPrompt, setPendingTransitPrompt] = useState(() => {
    const saved = localStorage.getItem('onyx_pending_transit_prompt');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (lastKnownNode) {
      localStorage.setItem('onyx_last_known_node', lastKnownNode);
    }
  }, [lastKnownNode]);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('onyx_theme') || 'cobalt';
  });

  useEffect(() => {
    localStorage.setItem('onyx_theme', theme);
  }, [theme]);

  useEffect(() => {
    const colors = THEME_PALETTES[theme][isStealthMode ? 'dark' : 'light'];
    const root = document.documentElement;
    root.style.setProperty('--theme-g-primary', colors.primary);
    root.style.setProperty('--theme-g-primary-container', colors.primaryContainer);
    root.style.setProperty('--theme-g-bg', colors.bg);
  }, [theme, isStealthMode]);

  useEffect(() => {
    if (pendingTransitPrompt) {
      localStorage.setItem('onyx_pending_transit_prompt', JSON.stringify(pendingTransitPrompt));
    } else {
      localStorage.removeItem('onyx_pending_transit_prompt');
    }
  }, [pendingTransitPrompt]);

  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: '', category: 'Food', note: '', paymentMethod: 'cash' });

  const formRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAddingExpense) {
      // Focus input programmatically with preventScroll to stop iOS from scrolling down
      const focusTimer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus({ preventScroll: true });
        }
      }, 200);

      // Multiple staggered triggers to ensure scrollTop remains 0 during the entrance transitions
      const scrollTimers = [50, 150, 300, 500, 700].map(delay =>
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.scrollTop = 0;
          }
        }, delay)
      );

      return () => {
        clearTimeout(focusTimer);
        scrollTimers.forEach(clearTimeout);
      };
    }
  }, [isAddingExpense]);

  // Sync budget settings to localStorage
  useEffect(() => {
    localStorage.setItem('onyx_budget_settings', JSON.stringify(budgetSettings));
  }, [budgetSettings]);

  // Sync budget expenses to localStorage
  useEffect(() => {
    localStorage.setItem('onyx_budget_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Sync current day offset to localStorage
  useEffect(() => {
    localStorage.setItem('onyx_budget_day_offset', currentDayOffset.toString());
  }, [currentDayOffset]);

  const updateTripTimeline = useCallback((newStartDate, newLength) => {
    const start = new Date(newStartDate);
    const end = new Date(start);
    end.setDate(start.getDate() + newLength - 1);
    const formattedEndDate = end.toISOString().split('T')[0];
    setBudgetSettings(prev => ({
      ...prev,
      startDate: newStartDate,
      endDate: formattedEndDate
    }));
  }, []);

  const totalDays = useMemo(() => {
    const start = new Date(budgetSettings.startDate);
    const end = new Date(budgetSettings.endDate);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
  }, [budgetSettings.startDate, budgetSettings.endDate]);

  const [durationInput, setDurationInput] = useState('');

  useEffect(() => {
    if (isConfigModalOpen) {
      setDurationInput(totalDays.toString());
    }
  }, [isConfigModalOpen, totalDays]);

  const targetDailyBudget = useMemo(() => budgetSettings.totalBudget / totalDays, [budgetSettings.totalBudget, totalDays]);
  const currentTripDayDate = useMemo(() => formatDateSafely(budgetSettings.startDate, currentDayOffset), [budgetSettings.startDate, currentDayOffset]);
  // Pre-compile daily spent totals into a linear-time hash-map
  const dailyTotalsMap = useMemo(() => {
    const map = {};
    expenses.forEach(exp => {
      map[exp.date] = (map[exp.date] || 0) + Number(exp.amount);
    });
    return map;
  }, [expenses]);

  const getDayTotal = useCallback((dateStr) => dailyTotalsMap[dateStr] || 0, [dailyTotalsMap]);

  const cumulativeBuffer = useMemo(() => {
    let buffer = 0;
    for (let i = 0; i < currentDayOffset; i++) {
      buffer += (targetDailyBudget - getDayTotal(formatDateSafely(budgetSettings.startDate, i)));
    }
    return buffer;
  }, [budgetSettings.startDate, targetDailyBudget, getDayTotal, currentDayOffset]);

  const todaySpent = useMemo(() => getDayTotal(currentTripDayDate), [getDayTotal, currentTripDayDate]);
  const todayAllowance = useMemo(() => targetDailyBudget + cumulativeBuffer, [targetDailyBudget, cumulativeBuffer]);
  const totalRemaining = useMemo(() => budgetSettings.totalBudget - expenses.reduce((sum, exp) => sum + Number(exp.amount), 0), [budgetSettings.totalBudget, expenses]);

  const handleAddExpense = (e) => {
    if (e) e.preventDefault();
    const val = Number(newExpense.amount);
    if (!newExpense.amount || isNaN(val) || val === 0) return;

    triggerHaptic('medium');
    const expense = {
      id: Date.now(),
      date: currentTripDayDate,
      amount: Math.abs(val),
      category: newExpense.category,
      note: newExpense.note.trim(),
      paymentMethod: newExpense.paymentMethod
    };

    setExpenses(prev => [expense, ...prev]);

    // Live Wallet Sync
    setWallet(prev => {
      const next = { ...prev };
      if (newExpense.paymentMethod === 'suica') {
        next.suica = Math.max(0, next.suica - Math.abs(val));
      } else {
        next.liquid = Math.max(0, next.liquid - Math.abs(val));
      }
      return next;
    });

    setNewExpense({ amount: '', category: 'Food', note: '', paymentMethod: 'cash' });
    setIsAddingExpense(false);
  };

  const handleDeleteExpense = useCallback((id) => {
    triggerHaptic('light');
    setExpenses(prev => {
      const expToDelete = prev.find(e => e.id === id);
      if (expToDelete) {
        setWallet(walletPrev => {
          const next = { ...walletPrev };
          if (expToDelete.paymentMethod === 'suica') {
            next.suica += expToDelete.amount;
          } else {
            next.liquid += expToDelete.amount;
          }
          return next;
        });
      }
      return prev.filter(e => e.id !== id);
    });
  }, []);

  const [customFareInput, setCustomFareInput] = useState('');

  // Sync custom fare input with the active prompt fare
  useEffect(() => {
    if (pendingTransitPrompt) {
      setCustomFareInput(pendingTransitPrompt.fare.toString());
    }
  }, [pendingTransitPrompt]);

  const handleLogTransit = () => {
    if (!pendingTransitPrompt) return;

    const finalFare = Number(customFareInput) || pendingTransitPrompt.fare;
    const fromName = MISSION_NODES[pendingTransitPrompt.from]?.name || pendingTransitPrompt.from;
    const toName = MISSION_NODES[pendingTransitPrompt.to]?.name || pendingTransitPrompt.to;

    // Add to ledger
    const expense = {
      id: Date.now(),
      amount: finalFare,
      category: 'Transit',
      note: `${fromName} ➔ ${toName}`,
      paymentMethod: 'suica',
      date: currentTripDayDate
    };

    setExpenses(prev => [expense, ...prev]);

    // Deduct from Suica
    setWallet(prev => {
      const next = { ...prev };
      next.suica = Math.max(0, next.suica - finalFare);
      return next;
    });

    // 🎭 TRIGGERS THE ULTRA-SATISFYING SUCCESS MORPH!
    setIsTransitLogged(true);
    triggerHaptic('heavy');

    // Smoothly clear prompt after success presentation
    setTimeout(() => {
      setIsTransitLogged(false);
      setPendingTransitPrompt(null);
    }, 1300);
  };

  const renderTransitPrompt = () => {
    if (!pendingTransitPrompt) return null;
    const fromName = MISSION_NODES[pendingTransitPrompt.from]?.name || pendingTransitPrompt.from;
    const toName = MISSION_NODES[pendingTransitPrompt.to]?.name || pendingTransitPrompt.to;

    // 🎭 If logged successfully, morph layout instantly into a compact, gorgeous "OK! [Check]" badge!
    if (isTransitLogged) {
      return (
        <motion.div
          key="transit-success-pill"
          initial={{ opacity: 0, scale: 0.85, y: 12, filter: 'blur(2px)' }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.85, y: -12, filter: 'blur(2px)' }}
          transition={{ type: "spring", damping: 18, stiffness: 220 }}
          className="relative w-full rounded-full py-4 px-6 bg-g-primary-container border border-g-primary/20 shadow-elevation-1 flex items-center justify-center text-g-primary [will-change:transform,opacity,filter] [transform-style:preserve-3d] [backface-visibility:hidden] transform-gpu"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 18, delay: 0.05 }}
            className="flex items-center gap-2.5 font-display text-xs font-black uppercase tracking-wider"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-g-primary text-white dark:text-[#202124] shadow-sm shrink-0">
              <Check size={11} className="stroke-[3]" />
            </span>
            <span className="leading-none pt-0.5">Suica Logged! OK!</span>
          </motion.div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="transit-prompt-card"
        initial={{ opacity: 0, y: -24, scale: 0.92, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -18, scale: 0.95, filter: 'blur(2px)' }}
        transition={{ type: "spring", damping: 20, stiffness: 190 }}
        className="relative w-full rounded-[28px] rounded-tl-[8px] overflow-hidden p-5 flex flex-col justify-between shadow-elevation-2 border border-g-outline/20 bg-g-surface space-y-3.5 [will-change:transform,opacity,filter] [transform-style:preserve-3d] [backface-visibility:hidden] transform-gpu"
      >
        {/* Top Header Row */}
        <div className="relative z-10 flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] rounded-tl-[4px] bg-g-primary/10 text-g-primary flex items-center justify-center shrink-0 border border-g-primary/10">
              <Bus size={14} />
            </div>
            <div>
              <h4 className="text-[9px] font-bold text-g-text-variant uppercase tracking-widest leading-none">Commute Resolved</h4>
            </div>
          </div>

          {/* Dynamic Radar Pulse Badge */}
          <div className="flex items-center gap-1 bg-g-primary/15 dark:bg-g-primary/10 px-2 py-0.5 rounded-full border border-g-primary/20 backdrop-blur-md">
            <span className="relative flex h-1 w-1 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-g-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1 w-1 bg-g-primary"></span>
            </span>
            <span className="text-[7px] font-mono font-bold tracking-widest text-g-primary uppercase leading-none">GPS TELEMETRY</span>
          </div>
        </div>

        {/* Route Details Panel */}
        <div className="relative z-10 pt-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="font-display text-xl font-extrabold text-g-text tracking-tight leading-none">{fromName.replace(' Hub', '').replace(' Crossing', '').replace(' Node', '').replace(' Station', '')}</div>

            {/* Custom High-Precision 3-Dot Kinetic Rail Progress - KEPT PERFECTLY */}
            <div className="flex items-center gap-1.5 shrink-0 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-g-primary animate-dot-flow" style={{ animationDelay: '0s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-g-primary animate-dot-flow" style={{ animationDelay: '0.4s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-g-primary animate-dot-flow" style={{ animationDelay: '0.8s' }} />
            </div>

            <div className="font-display text-xl font-extrabold text-g-text tracking-tight leading-none">{toName.replace(' Hub', '').replace(' Crossing', '').replace(' Node', '').replace(' Station', '')}</div>
          </div>
          <p className="text-[11px] font-medium text-g-text-variant mt-2 leading-relaxed">
            Passive transit geofence triggered. Confirm fare to commit Suica logs:
          </p>
        </div>

        {/* Actions & Fare Panel */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-[8.5px] font-bold text-g-text-variant uppercase tracking-widest leading-none">Suggested Fare</span>
            <div className="relative flex items-center shrink-0 w-24">
              <span className="absolute left-3 text-[10px] font-mono font-bold text-g-text-variant">¥</span>
              <input
                type="number"
                value={customFareInput}
                onChange={(e) => setCustomFareInput(e.target.value)}
                className="w-full py-1.5 pl-6 pr-2 bg-g-aluminium/40 dark:bg-g-aluminium/10 border border-g-outline/20 rounded-lg text-xs font-mono font-bold text-g-text outline-none focus:border-g-primary transition-all duration-300 text-center shadow-inner"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { triggerHaptic('light'); setPendingTransitPrompt(null); }}
              className="px-3.5 py-2 rounded-[12px] rounded-br-[4px] bg-g-aluminium/40 dark:bg-g-aluminium/10 hover:bg-g-aluminium/60 text-[8.5px] font-bold uppercase tracking-widest text-g-text transition-all duration-300 ripple shadow-sm cursor-pointer select-none"
            >
              Dismiss
            </button>
            <button
              onClick={handleLogTransit}
              className="px-3.5 py-2 rounded-[12px] rounded-tl-[4px] bg-g-primary hover:bg-g-primary/95 text-[8.5px] font-bold uppercase tracking-widest text-white dark:text-[#202124] shadow-elevation-1 hover:shadow-elevation-2 active:scale-95 transition-all duration-300 ripple flex items-center gap-1.5 cursor-pointer select-none"
            >
              <Check size={11} className="stroke-[3]" />
              Log Suica
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeNode, setActiveNode] = useState(() => {
    return localStorage.getItem('onyx_last_known_node') || 'fujisawa';
  });

  const simulateNodeArrival = (nodeId) => {
    triggerHaptic('medium');
    const node = MISSION_NODES[nodeId];
    if (node) {
      setCurrentLocation({ lat: node.lat, lng: node.lng });
      setActiveNode(nodeId);

      if (lastKnownNode && lastKnownNode !== nodeId) {
        const fare = getRouteFare(lastKnownNode, nodeId);
        if (fare) {
          setPendingTransitPrompt({
            from: lastKnownNode,
            to: nodeId,
            fare: fare,
            type: 'standard'
          });
        } else {
          const routeDist = calculateDistance(
            MISSION_NODES[lastKnownNode].lat,
            MISSION_NODES[lastKnownNode].lng,
            node.lat,
            node.lng
          );
          if (routeDist > 3) {
            setPendingTransitPrompt({
              from: lastKnownNode,
              to: nodeId,
              fare: 200,
              type: 'custom',
              distance: routeDist
            });
          }
        }
        setLastKnownNode(nodeId);
      } else if (!lastKnownNode) {
        setLastKnownNode(nodeId);
      }
    }
  };



  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });

        // Find closest node (Nearest-Neighbor)
        let closestDist = Infinity;
        let closestId = 'fujisawa';

        Object.entries(MISSION_NODES).forEach(([id, node]) => {
          const dist = calculateDistance(latitude, longitude, node.lat, node.lng);
          if (dist < closestDist) {
            closestDist = dist;
            closestId = id;
          }
        });

        // Broad regional threshold: 15km
        if (closestDist < 15) {
          setActiveNode(closestId);

          // Check for transition
          const lkn = lastKnownNodeRef.current;
          if (lkn && lkn !== closestId) {
            const fare = getRouteFare(lkn, closestId);
            if (fare) {
              setPendingTransitPrompt({
                from: lkn,
                to: closestId,
                fare: fare,
                type: 'standard'
              });
            } else {
              const routeDist = calculateDistance(
                MISSION_NODES[lkn].lat,
                MISSION_NODES[lkn].lng,
                MISSION_NODES[closestId].lat,
                MISSION_NODES[closestId].lng
              );
              if (routeDist > 3) {
                setPendingTransitPrompt({
                  from: lkn,
                  to: closestId,
                  fare: 200, // editable fallback JPY
                  type: 'custom',
                  distance: routeDist
                });
              }
            }
            setLastKnownNode(closestId);
          } else if (!lkn) {
            setLastKnownNode(closestId);
          }
        } else {
          setActiveNode(null); // Far out, let current state bridge
        }
      }, (err) => console.warn(err), { enableHighAccuracy: false, maximumAge: 60000, timeout: 15000 });

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const [tempWallet, setTempWallet] = useState(wallet);

  useEffect(() => {
    if (isStealthMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isStealthMode]);

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
    const imgSrc = HIGHLIGHTS[nextIndex]?.img;
    if (imgSrc) {
      const img = new Image();
      img.src = imgSrc;
    }
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
      "h-screen w-screen max-w-md mx-auto overflow-hidden relative selection:bg-g-primary-container flex flex-col transition-colors duration-700 bg-g-bg"
    )}>
      {/* Dynamic Island Spacer */}
      <div className="h-14 w-full shrink-0"></div>

      {/* Header Section (M3 Expressive) */}
      <header className="px-6 pt-3 pb-4 flex justify-between items-end z-20 shrink-0 bg-g-bg/80 backdrop-blur-2xl">
        <div className="flex-1">
          {/* Animated Title with Cinematic Focus Pull */}
          <motion.h1
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.4 }}
            className="text-[44px] leading-[1.05] font-black font-display tracking-tight text-g-text mb-2"
          >
            {activeTab === 'home' ? 'Fujisawa.' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + '.'}
          </motion.h1>

          {/* Subtitle & JST Time */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-3 py-1 bg-g-primary-container text-g-primary rounded-full tracking-wide">
              {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' })} JST
            </span>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-g-text-variant">
              Active • {callsign}
            </span>
          </div>
        </div>

        {/* Asymmetrical Profile Button */}
        <button
          onClick={() => { triggerHaptic('medium'); setIsConfigModalOpen(true); }}
          className="w-14 h-14 rounded-[20px] rounded-bl-[8px] bg-g-aluminium/50 dark:bg-g-aluminium/10 text-g-primary flex items-center justify-center font-display font-black text-sm tracking-widest hover:bg-g-primary-container hover:text-g-primary transition-all duration-300 active:scale-90 ripple shrink-0 mb-1 border border-g-outline/10 shadow-sm"
        >
          {callsign.slice(0, 2).toUpperCase()}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 pt-4 relative z-10">



        <div className="relative">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Geofence Transit Prompt Card */}
              <AnimatePresence mode="popLayout">
                {pendingTransitPrompt && renderTransitPrompt()}
              </AnimatePresence>

              {/* Recommended Section - Highly Expressive Carousel */}
              {!searchQuery && (
                <motion.section layout="position" className="[will-change:transform] [transform-style:preserve-3d] [backface-visibility:hidden] transform-gpu">
                  <div className="label-text mb-3 ml-2">Recommended for you</div>
                  <div className="relative aspect-[4/3] rounded-[36px] rounded-br-[12px] overflow-hidden group shadow-elevation-2 bg-g-aluminium">
                    <AnimatePresence initial={false}>
                      <motion.img
                        key={highlightIndex}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        src={HIGHLIGHTS[highlightIndex].img}
                        alt={HIGHLIGHTS[highlightIndex].title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>

                    {/* Gradient Overlay with taller depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent z-10 pointer-events-none"></div>

                    {/* Highly Expressive Density Glassmorphism Badge */}
                    <div className="absolute top-4 left-4 bg-white/20 dark:bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 dark:border-white/5 shadow-sm flex items-center gap-2 z-25">
                      <MapPin size={14} className="text-white dark:text-g-primary" />
                      <span className="text-[11px] font-bold text-white">Density: {HIGHLIGHTS[highlightIndex].density}</span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`text-${highlightIndex}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                          className="flex justify-between items-end mb-2 px-1"
                        >
                          <div className="text-white">
                            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest mb-2 inline-block border border-white/20">
                              {HIGHLIGHTS[highlightIndex].tag}
                            </span>
                            <h2 className="font-display text-2xl font-bold leading-tight tracking-tight mb-1">{HIGHLIGHTS[highlightIndex].title}</h2>
                            <p className="text-xs font-medium opacity-90">{HIGHLIGHTS[highlightIndex].subtitle}</p>
                          </div>
                          <a
                            href={HIGHLIGHTS[highlightIndex].link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => triggerHaptic('medium')}
                            className="w-14 h-14 rounded-[20px] rounded-tl-[8px] bg-g-primary text-white dark:text-[#202124] flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer shrink-0 ripple"
                          >
                            <ArrowRight size={24} />
                          </a>
                        </motion.div>
                      </AnimatePresence>

                      {/* Pill Pagination Dots */}
                      <div className="flex gap-2 items-center justify-center mt-3">
                        {HIGHLIGHTS.map((_, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              triggerHaptic('light');
                              setHighlightIndex(i);
                            }}
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                              i === highlightIndex ? "w-8 bg-g-primary" : "w-2 bg-white/40"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Digital Wallet Card - Highly Expressive */}
              <motion.div
                layout="position"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('medium');
                  setIsWalletModalOpen(true);
                }}
                className="relative w-full h-[210px] rounded-[40px] rounded-tl-[12px] overflow-hidden p-7 flex flex-col justify-between shadow-elevation-2 bg-g-primary dark:bg-g-primary-container text-white cursor-pointer group select-none transition-colors duration-700 [will-change:transform,opacity] [transform-style:preserve-3d] [backface-visibility:hidden] transform-gpu"
              >
                {/* Brushed Sheen & Blur overlays */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none -skew-x-12 transform translate-x-1/2 opacity-45 transition-transform duration-700 group-hover:translate-x-1/3" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-black/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-[0.03] dark:opacity-[0.06] pointer-events-none" />

                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <div className="font-display font-bold text-2xl tracking-tight flex items-center gap-2">
                      Apple Wallet
                    </div>
                    <div className="text-[10px] font-bold text-white/80 mt-1 uppercase tracking-widest leading-none">Mission Funds & Transit</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    <Wallet size={24} className="text-white" />
                  </div>
                </div>

                <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <div className="text-[9px] font-bold text-white/70 mb-1.5 uppercase tracking-widest leading-none">Liquid Cash</div>
                    <div className="text-3xl font-display font-bold tracking-tight flex items-baseline gap-1">
                      <span className="text-xl text-white/60">¥</span>{wallet.liquid.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-bold text-white/70 mb-1.5 uppercase tracking-widest flex items-center justify-end gap-1 leading-none">
                      Suica <Waves size={12} className="text-white/70" />
                    </div>
                    <div className="text-xl font-display font-bold tracking-tight flex items-baseline gap-1 justify-end">
                      <span className="text-sm text-white/60">¥</span>{wallet.suica.toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Essential Japanese Phrases Console */}
              <motion.section layout="position" className="space-y-3.5 [will-change:transform] [transform-style:preserve-3d] [backface-visibility:hidden] transform-gpu">
                <div className="flex justify-between items-center px-2">
                  <div className="label-text">Essential Japanese HUD</div>

                  {/* Glassmorphic Badge adopting the Highlights Image Tag design */}
                  <span className="px-3 py-1 rounded-full bg-g-primary/15 dark:bg-g-primary/10 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest text-g-primary border border-g-primary/20 shadow-sm flex items-center gap-1.5 select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-g-primary animate-pulse" />
                    Translate Mod
                  </span>
                </div>

                {/* Phrases Cards Shelf (Horizontal Carousel) */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-0.5">
                  {PHRASES.map((phrase) => (
                    <div
                      key={phrase.jp}
                      className="shrink-0 w-[240px] material-card p-4.5 flex flex-col justify-between space-y-4 border border-g-outline/10 shadow-elevation-1 hover:shadow-elevation-2 transition-shadow duration-300 relative overflow-hidden group"
                    >
                      {/* Interactive Corner Accent */}
                      <div className="absolute top-0 right-0 w-8 h-8 bg-g-primary/5 rounded-bl-[16px] pointer-events-none group-hover:bg-g-primary/10 transition-colors" />

                      <div className="space-y-2">
                        {/* Monospace Phonetic Pronunciation Badge */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-mono font-bold tracking-widest text-g-primary uppercase bg-g-primary-container px-2 py-0.5 rounded-md leading-none">
                            {phrase.romaji}
                          </span>
                        </div>

                        {/* Bold Japanese Script */}
                        <div className="font-display text-[17px] font-black text-g-text tracking-tight pt-1 leading-tight select-all">
                          {phrase.jp}
                        </div>

                        {/* Readable English Translation */}
                        <div className="text-xs font-semibold text-g-text-variant leading-relaxed">
                          {phrase.en}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center justify-between border-t border-g-outline/10 pt-2.5 mt-1.5">
                        {/* Copy Action with Inline Feedback */}
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            navigator.clipboard.writeText(phrase.jp);
                            setCopiedIndex(phrase.jp);
                            setTimeout(() => setCopiedIndex(null), 2000);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-g-aluminium/40 dark:bg-g-aluminium/10 hover:bg-g-primary-container hover:text-g-primary text-[9px] font-bold uppercase tracking-wider text-g-text transition-colors duration-200 cursor-pointer select-none"
                        >
                          {copiedIndex === phrase.jp ? (
                            <>
                              <Check size={10} className="text-g-primary stroke-[3]" />
                              <span className="text-g-primary font-extrabold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Download size={10} className="stroke-[2.5]" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {/* Presentation Mode Action */}
                        <button
                          onClick={() => {
                            triggerHaptic('medium');
                            setFullscreenPhrase(phrase);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-g-primary text-white dark:text-[#202124] hover:bg-g-primary/95 text-[9px] font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer select-none"
                        >
                          <Activity size={10} className="stroke-[3]" />
                          <span>Show</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>


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

          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Geofence Transit Prompt Card */}
              <AnimatePresence mode="popLayout">
                {pendingTransitPrompt && renderTransitPrompt()}
              </AnimatePresence>

              {/* Daily Allowance Command Panel */}
              <motion.section layout="position" className="material-card overflow-hidden shadow-elevation-2 relative p-6 space-y-6 [will-change:transform] [transform-style:preserve-3d] [backface-visibility:hidden] transform-gpu">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => { triggerHaptic(); setCurrentDayOffset(Math.max(0, currentDayOffset - 1)); }}
                      className="text-g-text-variant hover:text-g-text w-10 h-10 flex items-center justify-center rounded-full bg-g-aluminium dark:bg-g-aluminium/10 ripple"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="text-center min-w-[100px]">
                      <p className="text-[10px] font-bold text-g-primary uppercase tracking-[0.2em] mb-0.5">Day {currentDayOffset + 1}</p>
                      <p className="text-sm font-bold uppercase tracking-tight text-g-text">{new Date(currentTripDayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <button
                      onClick={() => { triggerHaptic(); setCurrentDayOffset(currentDayOffset + 1); }}
                      className="text-g-text-variant hover:text-g-text w-10 h-10 flex items-center justify-center rounded-full bg-g-aluminium dark:bg-g-aluminium/10 ripple"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <Calendar size={18} className="text-g-text-variant" />
                </div>

                <div className="h-[1px] w-full bg-g-outline/10"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-g-text-variant uppercase tracking-widest block mb-1">Daily Cap</span>
                    <span className="text-2xl font-bold tabular-nums text-g-text">{formatCurrency(todayAllowance)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-g-text-variant uppercase tracking-widest block mb-1">Spent</span>
                    <span className="text-2xl font-bold tabular-nums text-g-text-variant">{formatCurrency(todaySpent)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-2 w-full bg-g-aluminium dark:bg-g-aluminium/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (todaySpent / (todayAllowance || 1)) * 100)}%` }}
                      className={cn("h-full rounded-full transition-all duration-300", todaySpent > todayAllowance ? 'bg-red-500' : 'bg-g-primary')}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-medium text-g-text-variant px-1">
                    <span>{todaySpent > todayAllowance ? 'Over budget' : `${Math.round(Math.max(0, 100 - (todaySpent / (todayAllowance || 1)) * 100))}% safe`}</span>
                    <span>Remaining: {formatCurrency(Math.max(0, todayAllowance - todaySpent))}</span>
                  </div>
                </div>
              </motion.section>

              {/* Net Buffer Telemetry Console */}
              <motion.div layout="position" className="grid grid-cols-2 gap-4 [will-change:transform] [transform-style:preserve-3d] [backface-visibility:hidden] transform-gpu">
                <div className="material-card p-5 flex flex-col justify-between h-28 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-g-text-variant">
                    <TrendingUp size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Net Buffer</span>
                  </div>
                  <div className="mt-2">
                    <span className={cn("text-xl font-bold tracking-tight block whitespace-nowrap", cumulativeBuffer < 0 ? 'text-red-500 dark:text-red-400' : 'text-g-primary')}>
                      {cumulativeBuffer >= 0 ? '+¥' : '-¥'}{Math.abs(cumulativeBuffer).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-medium text-g-text-variant">Cumulative surplus</span>
                  </div>
                </div>

                <div className="material-card p-5 flex flex-col justify-between h-28 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-g-text-variant">
                    <Wallet size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Left</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-bold tracking-tight text-g-text block whitespace-nowrap">
                      ¥{totalRemaining.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-medium text-g-text-variant">of ¥{budgetSettings.totalBudget.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>

              {/* Ledger list */}
              <motion.section layout="position" className="space-y-4 [will-change:transform] [transform-style:preserve-3d] [backface-visibility:hidden] transform-gpu">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-g-text-variant">Daily Ledger</h3>
                  <span className="text-[10px] font-mono text-g-primary bg-g-primary-container px-2 py-0.5 rounded-full font-bold">
                    {expenses.filter(e => e.date === currentTripDayDate).length} entries
                  </span>
                </div>

                <div className="space-y-3">
                  {expenses.filter(e => e.date === currentTripDayDate).length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-g-outline/20 rounded-3xl text-g-text-variant text-xs font-medium uppercase tracking-widest bg-g-surface/50">
                      No transactions recorded
                    </div>
                  ) : (
                    expenses.filter(e => e.date === currentTripDayDate).map((exp, idx) => {
                      const Cat = CATEGORIES[exp.category] || CATEGORIES.Other;
                      const IconComponent = Cat.icon;
                      return (
                        <motion.div
                          key={exp.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="material-card p-4 flex items-center justify-between shadow-elevation-1 hover:shadow-elevation-2 transition-shadow"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", Cat.bg, Cat.color)}>
                              <IconComponent size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-g-text truncate">{exp.note || exp.category}</span>
                                <span className={cn("text-[9px] font-bold uppercase tracking-wider", exp.paymentMethod === 'suica' ? 'text-emerald-600 dark:text-emerald-400' : 'text-g-primary')}>
                                  {exp.paymentMethod === 'suica' ? 'Suica' : 'Cash'}
                                </span>
                              </div>
                              <span className="text-[10px] font-medium text-g-text-variant">{exp.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4 shrink-0">
                            <span className="font-bold text-base tabular-nums text-g-text">¥{exp.amount.toLocaleString()}</span>
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-g-text-variant hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.section>

              {/* Float Trigger for Quick Log */}
              <motion.div layout="position" className="flex justify-center pt-2 [will-change:transform] [transform-style:preserve-3d] [backface-visibility:hidden] transform-gpu">
                <button
                  onClick={() => { triggerHaptic('medium'); setIsAddingExpense(true); }}
                  className="w-full py-4 bg-g-primary-container text-g-primary font-bold rounded-2xl shadow-elevation-2 active:scale-[0.99] transition-transform flex items-center justify-center gap-2 ripple"
                >
                  <Plus size={20} />
                  Log Transaction
                </button>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* System Registry */}
              <div>
                <div className="label-text ml-2 mb-3">System Registry</div>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsStealthMode(!isStealthMode)}
                    className="w-full material-card p-5 flex justify-between items-center ripple"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-g-aluminium dark:bg-g-aluminium/10 flex items-center justify-center text-g-text">
                        {isStealthMode ? <EyeOff size={20} /> : <Eye size={20} />}
                      </div>
                      <div className="text-left">
                        <div className="text-base font-bold text-g-text">Stealth Mode</div>
                        <div className="text-sm font-medium text-g-text-variant">Google Dark Theme</div>
                      </div>
                    </div>
                    <div className={cn("w-12 h-6 rounded-full relative transition-colors border", isStealthMode ? "bg-g-primary border-g-primary" : "bg-g-aluminium border-g-outline")}>
                      <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", isStealthMode ? "right-1" : "left-1 shadow-sm")} />
                    </div>
                  </button>

                  {/* Console Color Themes */}
                  <div className="w-full material-card p-5 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-g-primary-container text-g-primary flex items-center justify-center transition-colors duration-700">
                        <Palette size={20} />
                      </div>
                      <div className="text-left">
                        <div className="text-base font-bold text-g-text">System Theme</div>
                        <div className="text-sm font-medium text-g-text-variant">Select interface profile</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 pt-1.5">
                      <button
                        onClick={() => { triggerHaptic('medium'); setTheme('cobalt'); }}
                        className={cn(
                          "py-2 px-0.5 rounded-xl border flex flex-col items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter transition-all duration-300 ripple",
                          theme === 'cobalt'
                            ? "bg-g-primary-container border-g-primary text-g-primary shadow-sm"
                            : "bg-g-aluminium/20 dark:bg-g-aluminium/5 border-g-outline/10 text-g-text-variant hover:bg-g-aluminium/30"
                        )}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-[#0B57D0]" />
                        Cobalt
                      </button>
                      <button
                        onClick={() => { triggerHaptic('medium'); setTheme('vermilion'); }}
                        className={cn(
                          "py-2 px-0.5 rounded-xl border flex flex-col items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter transition-all duration-300 ripple",
                          theme === 'vermilion'
                            ? "bg-g-primary-container border-g-primary text-g-primary shadow-sm"
                            : "bg-g-aluminium/20 dark:bg-g-aluminium/5 border-g-outline/10 text-g-text-variant hover:bg-g-aluminium/30"
                        )}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-[#C04836]" />
                        Vermilion
                      </button>
                      <button
                        onClick={() => { triggerHaptic('medium'); setTheme('matcha'); }}
                        className={cn(
                          "py-2 px-0.5 rounded-xl border flex flex-col items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter transition-all duration-300 ripple",
                          theme === 'matcha'
                            ? "bg-g-primary-container border-g-primary text-g-primary shadow-sm"
                            : "bg-g-aluminium/20 dark:bg-g-aluminium/5 border-g-outline/10 text-g-text-variant hover:bg-g-aluminium/30"
                        )}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-[#386B40]" />
                        Matcha
                      </button>
                      <button
                        onClick={() => { triggerHaptic('medium'); setTheme('sakura'); }}
                        className={cn(
                          "py-2 px-0.5 rounded-xl border flex flex-col items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter transition-all duration-300 ripple",
                          theme === 'sakura'
                            ? "bg-g-primary-container border-g-primary text-g-primary shadow-sm"
                            : "bg-g-aluminium/20 dark:bg-g-aluminium/5 border-g-outline/10 text-g-text-variant hover:bg-g-aluminium/30"
                        )}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-[#C64E74]" />
                        Sakura
                      </button>
                      <button
                        onClick={() => { triggerHaptic('medium'); setTheme('yuzu'); }}
                        className={cn(
                          "py-2 px-0.5 rounded-xl border flex flex-col items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter transition-all duration-300 ripple",
                          theme === 'yuzu'
                            ? "bg-g-primary-container border-g-primary text-g-primary shadow-sm"
                            : "bg-g-aluminium/20 dark:bg-g-aluminium/5 border-g-outline/10 text-g-text-variant hover:bg-g-aluminium/30"
                        )}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-[#7E5700]" />
                        Yuzu
                      </button>
                    </div>
                  </div>

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
              </div>

              {/* GPS Telemetry Simulator */}
              <div>
                <div className="label-text ml-2 mb-3">GPS Telemetry Simulator</div>
                <section className="material-card p-5 space-y-4">
                  <p className="text-[11px] font-medium text-g-text-variant leading-relaxed">
                    Test your passive geofencing transit auto-logs from anywhere in the world! Tap a location node to simulate your GPS arrival and trigger transit fare telemetry prompts:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(MISSION_NODES).map(([id, node]) => {
                      const isActive = activeNode === id;
                      return (
                        <button
                          key={id}
                          onClick={() => simulateNodeArrival(id)}
                          className={cn(
                            "py-2 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ripple",
                            isActive
                              ? "bg-g-primary text-white border-g-primary shadow-sm"
                              : "bg-g-aluminium/30 dark:bg-g-aluminium/5 border-g-outline/10 text-g-text hover:bg-g-aluminium/50"
                          )}
                        >
                          {node.name.replace(' Hub', '').replace(' Crossing', '').replace(' Node', '').replace(' Station', '')}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* Trip Budget Parameters */}
              <div>
                <div className="label-text ml-2 mb-3">Trip Budget Parameters</div>
                <section className="material-card p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-wider ml-1">Total Trip Budget</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-base font-bold text-g-text-variant">¥</span>
                      <input
                        type="number"
                        value={budgetSettings.totalBudget}
                        onChange={(e) => setBudgetSettings({ ...budgetSettings, totalBudget: Number(e.target.value) })}
                        className="w-full py-3 pl-8 pr-4 bg-g-aluminium/30 dark:bg-g-aluminium/5 border border-g-outline/10 rounded-xl text-base font-bold text-g-text outline-none focus:border-g-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-wider ml-1">Start Date</label>
                      <input
                        type="date"
                        value={budgetSettings.startDate}
                        onChange={(e) => setBudgetSettings({ ...budgetSettings, startDate: e.target.value })}
                        className="w-full max-w-full appearance-none py-3 px-4 bg-g-aluminium/30 dark:bg-g-aluminium/5 border border-g-outline/10 rounded-xl text-xs font-bold text-g-text outline-none focus:border-g-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-wider ml-1">End Date</label>
                      <input
                        type="date"
                        value={budgetSettings.endDate}
                        onChange={(e) => setBudgetSettings({ ...budgetSettings, endDate: e.target.value })}
                        className="w-full max-w-full appearance-none py-3 px-4 bg-g-aluminium/30 dark:bg-g-aluminium/5 border border-g-outline/10 rounded-xl text-xs font-bold text-g-text outline-none focus:border-g-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => { if (confirm('Erase all ledger history? Wallet balances will NOT be reimbursed.')) setExpenses([]); }}
                      className="w-full py-3 text-[10px] font-bold text-red-500 uppercase tracking-widest border border-red-500/20 hover:bg-red-500/5 rounded-xl transition-all"
                    >
                      Clear Budget Ledger
                    </button>
                  </div>
                </section>
              </div>

              {/* Emergency & Safety Protocols */}
              <div>
                <div className="label-text ml-2 mb-3">Emergency & Safety Protocols</div>
                <section className="material-card p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-g-text">Japan Quick Dials</h3>
                      <p className="text-xs text-g-text-variant font-medium">Local emergency hotlines</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="tel:110"
                      onClick={() => triggerHaptic('medium')}
                      className="flex items-center justify-between p-4 bg-g-bg hover:bg-g-aluminium/20 rounded-2xl border border-g-outline/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-red-500" />
                        <span className="text-xs font-bold text-g-text">Police</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-red-500">110</span>
                    </a>

                    <a
                      href="tel:119"
                      onClick={() => triggerHaptic('medium')}
                      className="flex items-center justify-between p-4 bg-g-bg hover:bg-g-aluminium/20 rounded-2xl border border-g-outline/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-red-500" />
                        <span className="text-xs font-bold text-g-text">Fire/Ambu</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-red-500">119</span>
                    </a>
                  </div>

                  {/* Rainy Season Banner */}
                  <div className="flex items-center gap-4 p-4 bg-g-primary-container/40 dark:bg-g-primary-container/10 rounded-2xl border border-g-primary/10">
                    <Waves size={20} className="text-g-primary shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-g-primary">Rainy Season Protocol</h4>
                      <p className="text-[10px] font-medium text-g-primary/80">Status: ACTIVE • Increased prep required.</p>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Material 3 Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full z-40 frosted-nav border-t border-g-outline/10 pt-2 pb-safe px-2 pb-6">
        <nav className="w-full flex justify-around items-center max-w-sm mx-auto">

          <button
            onClick={() => { triggerHaptic('light'); setActiveTab('home'); }}
            className={cn("nav-item flex flex-col items-center gap-1 w-16 group relative", activeTab === 'home' && "nav-active")}
          >
            <div className="nav-icon-container w-16 h-8 rounded-full flex items-center justify-center relative text-g-text-variant group-hover:bg-g-aluminium">
              {activeTab === 'home' && (
                <motion.div
                  layoutId="activeNavPill"
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className="absolute inset-0 bg-g-primary-container rounded-full -z-10"
                />
              )}
              <Activity size={22} className={cn(activeTab === 'home' && "fill-current")} />
            </div>
            <span className="text-[11px] font-medium text-g-text-variant transition-colors duration-200">Home</span>
          </button>

          <button
            onClick={() => { triggerHaptic('light'); setActiveTab('explore'); }}
            className={cn("nav-item flex flex-col items-center gap-1 w-16 group relative", activeTab === 'explore' && "nav-active")}
          >
            <div className="nav-icon-container w-16 h-8 rounded-full flex items-center justify-center relative text-g-text-variant group-hover:bg-g-aluminium">
              {activeTab === 'explore' && (
                <motion.div
                  layoutId="activeNavPill"
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className="absolute inset-0 bg-g-primary-container rounded-full -z-10"
                />
              )}
              <MapPin size={22} className={cn(activeTab === 'explore' && "fill-current")} />
            </div>
            <span className="text-[11px] font-medium text-g-text-variant transition-colors duration-200">Explore</span>
          </button>

          {/* Central FAB aligned with Material Design 3 Expressive squircle and kinetic spring */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92, rotate: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            onClick={() => { triggerHaptic('heavy'); setIsLauncherOpen(true); }}
            className="relative -top-4 w-14 h-14 rounded-[20px] bg-g-primary-container text-g-primary flex items-center justify-center shadow-elevation-3 hover:brightness-110 active:brightness-95 transition-all ripple mx-2"
          >
            <Plus size={28} />
          </motion.button>

          <button
            onClick={() => { triggerHaptic('light'); setActiveTab('budget'); }}
            className={cn("nav-item flex flex-col items-center gap-1 w-16 group relative", activeTab === 'budget' && "nav-active")}
          >
            <div className="nav-icon-container w-16 h-8 rounded-full flex items-center justify-center relative text-g-text-variant group-hover:bg-g-aluminium">
              {activeTab === 'budget' && (
                <motion.div
                  layoutId="activeNavPill"
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className="absolute inset-0 bg-g-primary-container rounded-full -z-10"
                />
              )}
              <Wallet size={22} className={cn(activeTab === 'budget' && "fill-current")} />
            </div>
            <span className="text-[11px] font-medium text-g-text-variant transition-colors duration-200">Budget</span>
          </button>

          <button
            onClick={() => { triggerHaptic('light'); setActiveTab('settings'); }}
            className={cn("nav-item flex flex-col items-center gap-1 w-16 group relative", activeTab === 'settings' && "nav-active")}
          >
            <div className="nav-icon-container w-16 h-8 rounded-full flex items-center justify-center relative text-g-text-variant group-hover:bg-g-aluminium">
              {activeTab === 'settings' && (
                <motion.div
                  layoutId="activeNavPill"
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className="absolute inset-0 bg-g-primary-container rounded-full -z-10"
                />
              )}
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
              className="relative w-full max-w-md bg-g-bg rounded-t-[40px] p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-2xl"
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
                      value={tempWallet.liquid === 0 ? '' : tempWallet.liquid}
                      onChange={(e) => setTempWallet({ ...tempWallet, liquid: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                      placeholder="0"
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
                      value={tempWallet.suica === 0 ? '' : tempWallet.suica}
                      onChange={(e) => setTempWallet({ ...tempWallet, suica: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                      placeholder="0"
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

      {/* Fullscreen Translation Presentation Modal */}
      <AnimatePresence>
        {fullscreenPhrase && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center p-6">
            {/* Soft Translucent Glassmorphic Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFullscreenPhrase(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Tactical Fullscreen Presentation Display Board */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-g-surface border border-g-outline/20 rounded-[40px] rounded-tl-[12px] p-8 md:p-12 shadow-2xl flex flex-col justify-between items-center text-center space-y-8 z-10 overflow-hidden"
            >
              {/* Top Accent Status Header */}
              <div className="w-full flex justify-between items-center border-b border-g-outline/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-g-primary animate-pulse" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-g-text-variant uppercase">Translation Presenter</span>
                </div>
                <button
                  onClick={() => { triggerHaptic('light'); setFullscreenPhrase(null); }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-g-aluminium dark:bg-g-aluminium/10 text-g-text hover:bg-g-primary-container hover:text-g-primary transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Monospace Phonetic Aid */}
              <div className="bg-g-primary-container text-g-primary font-mono text-xs md:text-sm font-bold px-4 py-1.5 rounded-full tracking-wider shadow-inner">
                {fullscreenPhrase.romaji}
              </div>

              {/* GIANT HIGH-CONTRAST JAPANESE GLYPHS - PERFECT FOR SHOWING TO LOCALS */}
              <div className="w-full py-8 px-4 bg-g-aluminium/20 dark:bg-g-aluminium/5 rounded-[32px] border border-g-outline/5 shadow-inner select-all">
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-g-text tracking-tight leading-normal whitespace-normal break-words font-sans">
                  {fullscreenPhrase.jp}
                </h2>
              </div>

              {/* English Subtitle Meaning */}
              <div className="space-y-2">
                <p className="text-sm md:text-base font-bold text-g-text-variant leading-relaxed">
                  "{fullscreenPhrase.en}"
                </p>
                <div className="flex justify-center items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-g-primary mt-1">
                  <Shield size={10} className="stroke-[3]" />
                  <span>Show this screen to transit staff or cashiers</span>
                </div>
              </div>

              {/* Direct Haptic Tap Dismiss */}
              <button
                onClick={() => { triggerHaptic('heavy'); setFullscreenPhrase(null); }}
                className="w-full py-4 bg-g-primary text-white dark:text-[#202124] font-bold uppercase tracking-widest rounded-2xl shadow-elevation-2 active:scale-[0.98] transition-all duration-200 ripple"
              >
                Close Presentation
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
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="fixed bottom-0 left-0 w-full h-[85vh] bg-g-bg z-50 flex flex-col shadow-elevation-3 rounded-t-[40px] overflow-hidden will-change-transform"
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

      {/* Budget Transaction Overlay */}
      <AnimatePresence>
        {isAddingExpense && (
          <div className="fixed inset-0 z-[600] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={() => setIsAddingExpense(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.form
              ref={formRef}
              onSubmit={handleAddExpense}
              initial={{ y: "100vh" }}
              animate={{ y: 0 }}
              exit={{ y: "100vh" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="relative w-full max-w-md bg-g-surface rounded-t-[40px] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-elevation-3 overflow-y-auto max-h-[90vh] transform-gpu [will-change:transform]"
            >
              <div className="w-12 h-1.5 bg-g-outline/30 rounded-full mx-auto mb-6" />

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-g-text">Log Transaction</h3>
                  <p className="text-xs font-medium text-g-text-variant mt-0.5">Record trip expenses in real-time</p>
                </div>
                <button type="button" onClick={() => setIsAddingExpense(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-g-aluminium dark:bg-g-aluminium/15 text-g-text ripple">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Amount input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em] ml-1">Amount</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-0 text-3xl font-medium text-g-outline">¥</span>
                    <input
                      ref={inputRef}
                      inputMode="decimal"
                      type="number"
                      placeholder="0"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-g-outline/20 focus:border-g-primary py-3 pl-8 text-4xl font-bold text-g-text outline-none tabular-nums transition-colors"
                    />
                  </div>
                </div>

                {/* Payment Method Segmented Buttons (Material 3 style) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em] ml-1">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2 bg-g-aluminium/30 dark:bg-g-aluminium/10 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => { triggerHaptic(); setNewExpense({ ...newExpense, paymentMethod: 'cash' }); }}
                      className={cn("py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all", newExpense.paymentMethod === 'cash' ? 'bg-g-primary text-white shadow-elevation-1' : 'text-g-text-variant')}
                    >
                      Cash (¥{wallet.liquid.toLocaleString()})
                    </button>
                    <button
                      type="button"
                      onClick={() => { triggerHaptic(); setNewExpense({ ...newExpense, paymentMethod: 'suica' }); }}
                      className={cn("py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all", newExpense.paymentMethod === 'suica' ? 'bg-g-primary text-white shadow-elevation-1' : 'text-g-text-variant')}
                    >
                      Suica (¥{wallet.suica.toLocaleString()})
                    </button>
                  </div>
                </div>

                {/* Category selectors */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em] ml-1">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(CATEGORIES).map(cat => {
                      const CatInfo = CATEGORIES[cat];
                      const IconComponent = CatInfo.icon;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => { triggerHaptic(); setNewExpense({ ...newExpense, category: cat }); }}
                          className={cn("py-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200", newExpense.category === cat ? 'bg-g-primary-container border-g-primary text-g-primary' : 'bg-g-bg border-g-outline/10 text-g-text-variant')}
                        >
                          <IconComponent size={16} />
                          <span className="text-[9px] font-bold uppercase tracking-wider">{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Note input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em] ml-1">Details</label>
                  <input
                    type="text"
                    placeholder="E.g. Ichiran Ramen, Train ride"
                    value={newExpense.note}
                    onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
                    className="w-full py-4 px-5 bg-g-bg border border-g-outline/20 rounded-xl text-g-text font-medium placeholder:text-g-text-variant focus:outline-none focus:border-g-primary transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-g-primary-container text-g-primary font-bold rounded-2xl shadow-elevation-2 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ripple mt-4"
                >
                  Log Expense
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Configurator Modal */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:p-6">
            {/* Dark Backing Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfigModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Frosted Glass Bottom Sheet Dialog */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg frosted-nav border border-g-outline/15 rounded-t-[40px] rounded-b-[24px] p-6 md:p-8 shadow-2xl flex flex-col space-y-6 z-10 max-h-[85vh] overflow-y-auto no-scrollbar transition-colors duration-700"
            >
              {/* Header status bar */}
              <div className="w-full flex justify-between items-center border-b border-g-outline/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-g-primary animate-pulse" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-g-text-variant uppercase">Profile Setup</span>
                </div>
                <button
                  onClick={() => { triggerHaptic('light'); setIsConfigModalOpen(false); }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-g-aluminium dark:bg-g-aluminium/10 text-g-text hover:bg-g-primary-container hover:text-g-primary transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body Content */}
              <div className="space-y-5">
                {/* Callsign Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em] ml-1">Traveler Name</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-g-primary text-xs font-bold uppercase tracking-wider select-none">
                      Name:
                    </div>
                    <input
                      type="text"
                      maxLength={8}
                      value={callsign}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setCallsign(val || 'JD');
                      }}
                      className="w-full py-4 pl-18 pr-5 bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl text-g-text font-display font-black tracking-widest placeholder:text-g-text-variant focus:outline-none focus:border-g-primary transition-colors"
                    />
                  </div>
                  <span className="text-[9px] font-medium text-g-text-variant ml-1">Maximum 8 alphanumeric characters. Updates header display.</span>
                </div>

                {/* Trip Timeline Configuration */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em] ml-1">
                    <Calendar size={12} className="text-g-primary" />
                    <span>Trip Timeline</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Trip Start Date */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-wider ml-1">Start Date</label>
                      <input
                        type="date"
                        value={budgetSettings.startDate}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          if (newStart) {
                            updateTripTimeline(newStart, totalDays);
                          }
                        }}
                        className="w-full max-w-full appearance-none py-3.5 px-4 bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl text-g-text text-sm font-semibold outline-none focus:border-g-primary transition-colors cursor-pointer"
                      />
                    </div>

                    {/* Trip Duration */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-wider ml-1">Duration (Days)</label>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={durationInput}
                        onChange={(e) => {
                          const valStr = e.target.value;
                          setDurationInput(valStr);
                          const parsed = parseInt(valStr);
                          if (!isNaN(parsed) && parsed > 0) {
                            updateTripTimeline(budgetSettings.startDate, parsed);
                          }
                        }}
                        className="w-full max-w-full appearance-none py-3.5 px-4 bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl text-g-text text-sm font-semibold outline-none focus:border-g-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Info helper block */}
                <div className="p-4 rounded-2xl bg-g-primary-container/15 border border-g-primary/10 flex items-start gap-3 mt-2 text-left">
                  <Info size={16} className="text-g-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-g-text uppercase tracking-wider">Timeline Auto-Calculation</div>
                    <p className="text-[9px] font-medium text-g-text-variant leading-relaxed">
                      Setting your active travel date and length will dynamically calculate budget day metrics and surplus buffers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Confirmation Button */}
              <button
                onClick={() => { triggerHaptic('medium'); setIsConfigModalOpen(false); }}
                className="w-full py-4 bg-g-primary text-white dark:text-[#202124] font-bold rounded-2xl shadow-elevation-2 hover:bg-g-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ripple mt-4"
              >
                <Check size={18} className="stroke-[3]" />
                <span>Save Profile</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
