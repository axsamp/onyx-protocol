import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCcw, Wallet, MapPin, ArrowRight, Download, Calendar, X, Activity, Terminal, ShoppingBag, Search, Plus, Shield, Settings, User, ChevronDown, Phone, Waves, Eye, EyeOff, Check,
  ChevronLeft, ChevronRight, TrendingUp, Pizza, Bus, Ticket, MoreHorizontal, Trash2, Info
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

const PHRASES = [
  { jp: 'すみません', en: 'Excuse me' },
  { jp: 'ありがとうございます', en: 'Thank you' },
  { jp: '美味しい', en: 'Delicious' },
  { jp: 'これ、お願いします', en: 'This please' },
  { jp: 'トイレはどこですか？', en: 'Where is the toilet?' },
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
    img: 'https://images.unsplash.com/photo-1490806862337-875726298d24?q=80&w=1000&auto=format&fit=crop',
    link: 'https://www.google.com/maps/search/Shizuoka+Prefecture'
  },
  {
    title: 'Nagoya Castle',
    subtitle: "1.5h Shinkansen • Historic castle & legacy museum",
    tag: 'Priority',
    density: 'Medium',
    img: 'https://images.unsplash.com/photo-1590253407275-14374ef57a9f?q=80&w=1000&auto=format&fit=crop',
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
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
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

  const [pendingTransitPrompt, setPendingTransitPrompt] = useState(() => {
    const saved = localStorage.getItem('onyx_pending_transit_prompt');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (lastKnownNode) {
      localStorage.setItem('onyx_last_known_node', lastKnownNode);
    }
  }, [lastKnownNode]);

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

  const totalDays = useMemo(() => {
    const start = new Date(budgetSettings.startDate);
    const end = new Date(budgetSettings.endDate);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
  }, [budgetSettings.startDate, budgetSettings.endDate]);

  const targetDailyBudget = useMemo(() => budgetSettings.totalBudget / totalDays, [budgetSettings.totalBudget, totalDays]);
  const currentTripDayDate = useMemo(() => formatDateSafely(budgetSettings.startDate, currentDayOffset), [budgetSettings.startDate, currentDayOffset]);
  const getDayTotal = useCallback((dateStr) => expenses.filter(e => e.date === dateStr).reduce((sum, exp) => sum + Number(exp.amount), 0), [expenses]);

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
    triggerHaptic('medium');
    
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
    
    // Clear prompt
    setPendingTransitPrompt(null);
  };

  const renderTransitPrompt = () => {
    if (!pendingTransitPrompt) return null;
    const fromName = MISSION_NODES[pendingTransitPrompt.from]?.name || pendingTransitPrompt.from;
    const toName = MISSION_NODES[pendingTransitPrompt.to]?.name || pendingTransitPrompt.to;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="relative w-full rounded-[24px] overflow-hidden p-5 flex flex-col justify-between shadow-elevation-1 border border-g-outline/15 bg-g-surface dark:bg-g-aluminium/5 backdrop-blur-md space-y-4"
      >
        {/* Subtle Brushed Metal Texture overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-[0.02] dark:opacity-[0.05] pointer-events-none" />

        {/* Top Header Row */}
        <div className="relative z-10 flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-g-primary/10 text-g-primary flex items-center justify-center shrink-0">
              <Bus size={14} />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-g-text-variant uppercase tracking-widest leading-none">Active Commute Resolved</h4>
            </div>
          </div>

          {/* Dynamic Radar Pulse Badge */}
          <div className="flex items-center gap-1.5 bg-g-primary/10 px-2 py-0.5 rounded-full">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-g-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-g-primary"></span>
            </span>
            <span className="text-[7.5px] font-bold font-mono tracking-widest text-g-primary uppercase leading-none">GPS Telemetry</span>
          </div>
        </div>

        {/* Route Details Panel */}
        <div className="relative z-10 pt-0.5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-base font-bold text-g-text tracking-tight">{fromName.replace(' Hub', '').replace(' Crossing', '').replace(' Node', '').replace(' Station', '')}</div>
            
            {/* Custom High-Precision 3-Dot Kinetic Rail Progress */}
            <div className="flex items-center gap-1.5 shrink-0 px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-g-primary animate-dot-flow" style={{ animationDelay: '0s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-g-primary animate-dot-flow" style={{ animationDelay: '0.4s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-g-primary animate-dot-flow" style={{ animationDelay: '0.8s' }} />
            </div>

            <div className="text-base font-bold text-g-text tracking-tight">{toName.replace(' Hub', '').replace(' Crossing', '').replace(' Node', '').replace(' Station', '')}</div>
          </div>
          <p className="text-[9.5px] font-medium text-g-text-variant mt-1 leading-relaxed">
            Passive transit change registered. Confirm details below to log fare:
          </p>
        </div>

        {/* Actions & Fare Panel */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3 border-t border-g-outline/10">
          <div className="flex items-center gap-2">
            <span className="text-[8.5px] font-bold text-g-text-variant uppercase tracking-wider">Suggested Fare</span>
            <div className="relative flex items-center shrink-0 w-24">
              <span className="absolute left-2.5 text-xs font-bold text-g-text-variant">¥</span>
              <input
                type="number"
                value={customFareInput}
                onChange={(e) => setCustomFareInput(e.target.value)}
                className="w-full py-1 bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/20 rounded-lg text-xs font-mono font-bold text-g-text outline-none focus:border-g-primary transition-colors text-center shadow-inner"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { triggerHaptic('light'); setPendingTransitPrompt(null); }}
              className="px-4 py-2 rounded-xl bg-g-aluminium/30 dark:bg-g-aluminium/5 hover:bg-g-aluminium/50 text-[8.5px] font-bold uppercase tracking-wider text-g-text transition-all ripple shadow-sm"
            >
              Dismiss
            </button>
            <button
              onClick={handleLogTransit}
              className="px-4 py-2 rounded-xl bg-g-primary hover:bg-g-primary-hover text-[8.5px] font-bold uppercase tracking-wider text-white shadow-elevation-1 transition-all ripple flex items-center gap-1.5"
            >
              <Check size={11} />
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

  // Haversine formula to calculate distance in KM
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
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
          if (lastKnownNode && lastKnownNode !== closestId) {
            const fare = getRouteFare(lastKnownNode, closestId);
            if (fare) {
              setPendingTransitPrompt({
                from: lastKnownNode,
                to: closestId,
                fare: fare,
                type: 'standard'
              });
            } else {
              const routeDist = calculateDistance(
                MISSION_NODES[lastKnownNode].lat,
                MISSION_NODES[lastKnownNode].lng,
                MISSION_NODES[closestId].lat,
                MISSION_NODES[closestId].lng
              );
              if (routeDist > 3) {
                setPendingTransitPrompt({
                  from: lastKnownNode,
                  to: closestId,
                  fare: 200, // editable fallback JPY
                  type: 'custom',
                  distance: routeDist
                });
              }
            }
            setLastKnownNode(closestId);
          } else if (!lastKnownNode) {
            setLastKnownNode(closestId);
          }
        } else {
          setActiveNode(null); // Far out, let current state bridge
        }
      }, (err) => console.warn(err), { enableHighAccuracy: false, maximumAge: 60000, timeout: 15000 });

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [lastKnownNode]);

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
    if (HIGHLIGHTS[nextIndex].img.startsWith('http')) {
      const img = new Image();
      img.src = HIGHLIGHTS[nextIndex].img;
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

      {/* Header Section */}
      <header className="px-6 py-4 flex justify-between items-center z-20 shrink-0 bg-g-bg/90 backdrop-blur-xl">
        <div>
          <div className="mb-0.5">
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



        <div className="relative">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Geofence Transit Prompt Card */}
              {pendingTransitPrompt && renderTransitPrompt()}

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

                    <div className="absolute top-4 left-4 bg-g-surface/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 z-20">
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
                            <span className="px-2 py-0.5 rounded text-g-primary bg-g-surface/90 text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">{HIGHLIGHTS[highlightIndex].tag}</span>
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
                            className={cn("h-1.5 rounded-full transition-all cursor-pointer", i === highlightIndex ? "w-4 bg-g-primary" : "w-1.5 bg-g-text/20")}
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
                {/* Brushed Sheen Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none -skew-x-12 transform translate-x-1/2 opacity-50" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-[0.03] pointer-events-none" />
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <div className="text-g-text font-bold text-2xl tracking-tight flex items-center gap-2">
                      <Wallet size={24} className="text-g-text-variant" />
                      Apple Wallet
                    </div>
                    <div className="text-xs font-medium text-g-text-variant mt-1">Mission Funds & Transit</div>
                  </div>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-g-text-variant"><path d="M8.5 21.3c-2.3-2.6-3.5-5.8-3.5-9.3s1.2-6.7 3.5-9.3M12 18.5c-1.6-1.8-2.5-4-2.5-6.5s.9-4.7 2.5-6.5M15.5 15.7c-.8-1-1.3-2.3-1.3-3.7s.5-2.7 1.3-3.7M19 13.4c-.3-.4-.5-.9-.5-1.4s.2-1 .5-1.4" /></svg>
                </div>

                <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <div className="text-xs font-bold text-g-text-variant mb-1 uppercase tracking-wider">Liquid Cash</div>
                    <div className="text-3xl font-bold tracking-tight text-g-text font-sans flex items-baseline gap-1">
                      <span className="text-xl text-g-text-variant">¥</span>{wallet.liquid.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-g-text-variant mb-1 uppercase tracking-wider flex items-center justify-end gap-1">
                      Suica <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-g-text-variant"><path d="M4 14.899A7 7 0 1 1 15.69 8.13c-1.28.819-2.77 1.275-4.5 1.275a8.84 8.84 0 0 1-5.089-1.528A7 7 0 0 0 4 14.899Z" /><path d="M17.857 5.703a6 6 0 0 0-8.967 8.967 6 6 0 0 0 8.967-8.967Z" /></svg>
                    </div>
                    <div className="text-xl font-bold tracking-tight text-g-text font-sans flex items-baseline gap-1 justify-end">
                      <span className="text-sm text-g-text-variant">¥</span>{wallet.suica.toLocaleString()}
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
                <div className="mb-4 px-2">
                  <h3 className="text-lg font-bold text-g-text">Mission Timeline</h3>
                </div>

                <div className="space-y-3">
                  {/* Fujisawa Node */}
                  <div className={cn("material-card p-4 flex items-center gap-4 transition-all duration-500 ripple", activeNode === 'fujisawa' ? "bg-g-primary-container border-none" : "bg-g-surface")}>
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors", activeNode === 'fujisawa' ? "bg-g-primary text-white" : "bg-g-aluminium text-g-text-variant")}>
                      <Activity size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className={cn("font-bold text-base", activeNode === 'fujisawa' ? "text-g-primary" : "text-g-text")}>Fujisawa Hub</h4>
                        <span className={cn("text-xs font-bold uppercase tracking-wider", activeNode === 'fujisawa' ? "text-g-primary" : "text-g-outline")}>{activeNode === 'fujisawa' ? 'Active' : 'Standby'}</span>
                      </div>
                      <p className={cn("text-sm font-medium", activeNode === 'fujisawa' ? "text-g-primary/80" : "text-g-text-variant")}>Almont Inn Deployment</p>
                    </div>
                  </div>

                  {/* Tokyo Node */}
                  <div className={cn("material-card p-4 flex items-center gap-4 transition-all duration-500 ripple", activeNode === 'tokyo' ? "bg-g-primary-container border-none" : "bg-g-surface")}>
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors", activeNode === 'tokyo' ? "bg-g-primary text-white" : "bg-g-aluminium text-g-text-variant")}>
                      <ShoppingBag size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className={cn("font-bold text-base", activeNode === 'tokyo' ? "text-g-primary" : "text-g-text")}>Tokyo Ops</h4>
                        <span className={cn("text-xs font-bold uppercase tracking-wider", activeNode === 'tokyo' ? "text-g-primary" : "text-g-outline")}>{activeNode === 'tokyo' ? 'Active' : 'Pending'}</span>
                      </div>
                      <p className={cn("text-sm font-medium", activeNode === 'tokyo' ? "text-g-primary/80" : "text-g-text-variant")}>Onitsuka Tigers • Shinjuku</p>
                    </div>
                  </div>

                  {/* Shibuya Node */}
                  <div className={cn("material-card p-4 flex items-center gap-4 transition-all duration-500 ripple", activeNode === 'shibuya' ? "bg-g-primary-container border-none" : "bg-g-surface")}>
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors", activeNode === 'shibuya' ? "bg-g-primary text-white" : "bg-g-aluminium text-g-text-variant")}>
                      <MapPin size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className={cn("font-bold text-base", activeNode === 'shibuya' ? "text-g-primary" : "text-g-text")}>Shibuya Point</h4>
                        <span className={cn("text-xs font-bold uppercase tracking-wider", activeNode === 'shibuya' ? "text-g-primary" : "text-g-outline")}>{activeNode === 'shibuya' ? 'Active' : 'Scheduled'}</span>
                      </div>
                      <p className={cn("text-sm font-medium", activeNode === 'shibuya' ? "text-g-primary/80" : "text-g-text-variant")}>Crossing Intelligence</p>
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

          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Geofence Transit Prompt Card */}
              {pendingTransitPrompt && renderTransitPrompt()}

              {/* Daily Allowance Command Panel */}
              <section className="material-card overflow-hidden shadow-elevation-2 relative p-6 space-y-6">
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
              </section>

              {/* Net Buffer Telemetry Console */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {/* Ledger list */}
              <section className="space-y-4">
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
              </section>

              {/* Float Trigger for Quick Log */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => { triggerHaptic('medium'); setIsAddingExpense(true); }}
                  className="w-full py-4 bg-g-primary text-white font-bold rounded-2xl shadow-elevation-2 active:scale-[0.99] transition-transform flex items-center justify-center gap-2 ripple"
                >
                  <Plus size={20} />
                  Log Transaction
                </button>
              </div>
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
                        onChange={(e) => setBudgetSettings({...budgetSettings, totalBudget: Number(e.target.value)})} 
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
                        onChange={(e) => setBudgetSettings({...budgetSettings, startDate: e.target.value})} 
                        className="w-full max-w-full appearance-none py-3 px-4 bg-g-aluminium/30 dark:bg-g-aluminium/5 border border-g-outline/10 rounded-xl text-xs font-bold text-g-text outline-none focus:border-g-primary transition-colors" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-wider ml-1">End Date</label>
                      <input 
                        type="date" 
                        value={budgetSettings.endDate} 
                        onChange={(e) => setBudgetSettings({...budgetSettings, endDate: e.target.value})} 
                        className="w-full max-w-full appearance-none py-3 px-4 bg-g-aluminium/30 dark:bg-g-aluminium/5 border border-g-outline/10 rounded-xl text-xs font-bold text-g-text outline-none focus:border-g-primary transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => { if(confirm('Erase all ledger history? Wallet balances will NOT be reimbursed.')) setExpenses([]); }} 
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
            onClick={() => { triggerHaptic('light'); setActiveTab('budget'); }}
            className={cn("nav-item flex flex-col items-center gap-1 w-16 group", activeTab === 'budget' && "nav-active")}
          >
            <div className="nav-icon-container w-16 h-8 rounded-full flex items-center justify-center transition-colors duration-200 text-g-text-variant group-hover:bg-g-aluminium">
              <Wallet size={22} className={cn(activeTab === 'budget' && "fill-current")} />
            </div>
            <span className="text-[11px] font-medium text-g-text-variant transition-colors duration-200">Budget</span>
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
              className="relative w-full max-w-md bg-g-bg rounded-t-[32px] p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-2xl"
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
              className="fixed bottom-0 left-0 w-full h-[85vh] bg-g-bg z-50 flex flex-col shadow-elevation-3 rounded-t-[32px] overflow-hidden will-change-transform"
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingExpense(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.form 
              ref={formRef}
              onSubmit={handleAddExpense}
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-g-surface rounded-t-[32px] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-elevation-3 overflow-y-auto max-h-[90vh]"
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
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} 
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
                      onClick={() => { triggerHaptic(); setNewExpense({...newExpense, paymentMethod: 'cash'}); }}
                      className={cn("py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all", newExpense.paymentMethod === 'cash' ? 'bg-g-primary text-white shadow-elevation-1' : 'text-g-text-variant')}
                    >
                      Cash (¥{wallet.liquid.toLocaleString()})
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { triggerHaptic(); setNewExpense({...newExpense, paymentMethod: 'suica'}); }}
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
                          onClick={() => { triggerHaptic(); setNewExpense({...newExpense, category: cat}); }} 
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
                    onChange={(e) => setNewExpense({...newExpense, note: e.target.value})} 
                    className="w-full py-4 px-5 bg-g-bg border border-g-outline/20 rounded-xl text-g-text font-medium placeholder:text-g-text-variant focus:outline-none focus:border-g-primary transition-colors" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-g-primary text-white font-bold rounded-2xl shadow-elevation-2 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ripple mt-4"
                >
                  Log Expense
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
