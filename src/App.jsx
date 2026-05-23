import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, MapPin, Calendar, Activity, ShoppingBag, Phone, Waves, Check,
  TrendingUp, Pizza, Bus, Ticket, MoreHorizontal, Trash2, ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import '@material/web/icon/icon.js';
import '@material/web/ripple/ripple.js';
import '@material/web/progress/linear-progress.js';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const triggerHaptic = (type = 'light') => {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(type === 'light' ? 10 : 20);
    }
  } catch {
    // Fallback for browsers without vibration support
  }
};

const APPS = [
  { id: 'itinerary', name: 'Itinerary Command', url: 'https://axsamp.github.io/onyx-itinerary/', version: 'V4.1.5', node: '01' },
  { id: 'stamps', name: 'Stamp Collector', url: 'https://axsamp.github.io/onyx-stamps/', version: 'V1.9.11', node: '02' },
  { id: 'signal', name: 'Onyx Signal', url: 'https://axsamp.github.io/onyx-recorder/', version: 'V1.0.2', node: '03' },
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
    light: {
      primary: '#0B57D0',
      onPrimary: '#FFFFFF',
      primaryContainer: '#D3E3FD',
      onPrimaryContainer: '#041E49',
      bg: '#F8FAFC',
      surface: '#FFFFFF',
      onSurface: '#1F1F1F',
      outline: '#74777F'
    },
    dark: {
      primary: '#A8C7FA',
      onPrimary: '#062E70',
      primaryContainer: '#0842A0',
      onPrimaryContainer: '#D3E3FD',
      bg: '#0F141C',
      surface: '#1F1F1F',
      onSurface: '#E3E2E6',
      outline: '#8C9099'
    }
  },
  vermilion: {
    light: {
      primary: '#A83827',
      onPrimary: '#FFFFFF',
      primaryContainer: '#FFDAD3',
      onPrimaryContainer: '#3E0400',
      secondary: '#775651',
      onSecondary: '#FFFFFF',
      secondaryContainer: '#F7D8D3',
      onSecondaryContainer: '#2C1511',
      tertiary: '#735A2E',
      onTertiary: '#FFFFFF',
      tertiaryContainer: '#FFDE9C',
      onTertiaryContainer: '#271900',
      bg: '#FFF8F6',
      surface: '#FFF8F6',
      onSurface: '#231A18',
      onSurfaceVariant: '#534340',
      outline: '#857370',
      error: '#BA1A1A',
      onError: '#FFFFFF',
      errorContainer: '#FFDAD6',
      onErrorContainer: '#410002'
    },
    dark: {
      primary: '#FFB4A7',
      onPrimary: '#650B02',
      primaryContainer: '#862112',
      onPrimaryContainer: '#FFDAD3',
      secondary: '#E7BDB7',
      onSecondary: '#442925',
      secondaryContainer: '#5D3F3B',
      onSecondaryContainer: '#F7D8D3',
      tertiary: '#E3C28C',
      onTertiary: '#402D04',
      tertiaryContainer: '#594319',
      onTertiaryContainer: '#FFDE9C',
      bg: '#1A1110',
      surface: '#1A1110',
      onSurface: '#F1DFDA',
      onSurfaceVariant: '#D8C2BE',
      outline: '#A08C89',
      error: '#FFB4AB',
      onError: '#690005',
      errorContainer: '#93000A',
      onErrorContainer: '#FFDAD6'
    }
  },
  matcha: {
    light: {
      primary: '#4C662B',
      onPrimary: '#FFFFFF',
      primaryContainer: '#CDEDA3',
      onPrimaryContainer: '#102000',
      bg: '#F8FAF2',
      surface: '#FFFFFF',
      onSurface: '#1A1C16',
      outline: '#74796A'
    },
    dark: {
      primary: '#B2D189',
      onPrimary: '#1F3700',
      primaryContainer: '#354E16',
      onPrimaryContainer: '#CDEDA3',
      bg: '#11140E',
      surface: '#1A1D16',
      onSurface: '#E3E3DA',
      outline: '#8E9285'
    }
  },
  sakura: {
    light: {
      primary: '#5B5891',
      onPrimary: '#FFFFFF',
      primaryContainer: '#E3DFFF',
      onPrimaryContainer: '#434078',
      secondary: '#5E5C71',
      onSecondary: '#FFFFFF',
      secondaryContainer: '#E4E0F9',
      onSecondaryContainer: '#464559',
      tertiary: '#7A5367',
      onTertiary: '#FFFFFF',
      tertiaryContainer: '#FFD8E9',
      onTertiaryContainer: '#603B4F',
      bg: '#FAF8FC',
      surface: '#FFFFFF',
      onSurface: '#1C1A22',
      outline: '#787680'
    },
    dark: {
      primary: '#C4C0FF',
      onPrimary: '#2D2960',
      primaryContainer: '#434078',
      onPrimaryContainer: '#E3DFFF',
      secondary: '#C7C4DC',
      onSecondary: '#302E42',
      secondaryContainer: '#464559',
      onSecondaryContainer: '#E4E0F9',
      tertiary: '#EBB9D0',
      onTertiary: '#472638',
      tertiaryContainer: '#603B4F',
      onTertiaryContainer: '#FFD8E9',
      bg: '#131218',
      surface: '#1C1B22',
      onSurface: '#E6E1E9',
      outline: '#928F99'
    }
  },
  yuzu: {
    light: {
      primary: '#7E5700',
      onPrimary: '#FFFFFF',
      primaryContainer: '#FFE086',
      onPrimaryContainer: '#281900',
      secondary: '#6C5D3F',
      onSecondary: '#FFFFFF',
      secondaryContainer: '#F6E0BB',
      onSecondaryContainer: '#251A04',
      tertiary: '#4A6546',
      onTertiary: '#FFFFFF',
      tertiaryContainer: '#CCEBC4',
      onTertiaryContainer: '#072109',
      bg: '#FFF8EE',
      surface: '#FFF8EE',
      onSurface: '#1E1B13',
      onSurfaceVariant: '#4B4639',
      outline: '#7C7767',
      error: '#BA1A1A',
      onError: '#FFFFFF',
      errorContainer: '#FFDAD6',
      onErrorContainer: '#410002'
    },
    dark: {
      primary: '#FABD00',
      onPrimary: '#422C00',
      primaryContainer: '#5F4100',
      onPrimaryContainer: '#FFE086',
      secondary: '#D9C4A0',
      onSecondary: '#3B2F15',
      secondaryContainer: '#53462A',
      onSecondaryContainer: '#F6E0BB',
      tertiary: '#B0CFAA',
      onTertiary: '#1D361B',
      tertiaryContainer: '#334D30',
      onTertiaryContainer: '#CCEBC4',
      bg: '#16130B',
      surface: '#16130B',
      onSurface: '#E8E2D4',
      onSurfaceVariant: '#CDC6B4',
      outline: '#969080',
      error: '#FFB4AB',
      onError: '#690005',
      errorContainer: '#93000A',
      onErrorContainer: '#FFDAD6'
    }
  },
  titanium: {
    light: {
      primary: '#5A626A',
      onPrimary: '#FFFFFF',
      primaryContainer: '#E2E7EC',
      onPrimaryContainer: '#171D22',
      secondary: '#5C6065',
      onSecondary: '#FFFFFF',
      secondaryContainer: '#E8EBEE',
      onSecondaryContainer: '#1B1E21',
      tertiary: '#4A607A',
      onTertiary: '#FFFFFF',
      tertiaryContainer: '#D5E3F5',
      onTertiaryContainer: '#0A1C2E',
      bg: '#F1F3F5',
      surface: '#F8F9FA',
      onSurface: '#1A1D20',
      onSurfaceVariant: '#43474B',
      outline: '#73777F',
      error: '#BA1A1A',
      onError: '#FFFFFF',
      errorContainer: '#FFDAD6',
      onErrorContainer: '#410002'
    },
    dark: {
      primary: '#CFD4DA',
      onPrimary: '#252B30',
      primaryContainer: '#3E464D',
      onPrimaryContainer: '#E2E7EC',
      secondary: '#C2C7CC',
      onSecondary: '#2C3135',
      secondaryContainer: '#444B50',
      onSecondaryContainer: '#E0E5EA',
      tertiary: '#9FC5E8',
      onTertiary: '#0B314B',
      tertiaryContainer: '#224863',
      onTertiaryContainer: '#D5E3F5',
      bg: '#121517',
      surface: '#1A1D20',
      onSurface: '#E2E7EC',
      onSurfaceVariant: '#C3CAD1',
      outline: '#8C9196',
      error: '#FFB4AB',
      onError: '#690005',
      errorContainer: '#93000A',
      onErrorContainer: '#FFDAD6'
    }
  },
  abyss: {
    light: {
      primary: '#006C5B',
      onPrimary: '#FFFFFF',
      primaryContainer: '#59FCE1',
      onPrimaryContainer: '#00201A',
      secondary: '#4A635F',
      onSecondary: '#FFFFFF',
      secondaryContainer: '#CCE8E2',
      onSecondaryContainer: '#05201C',
      tertiary: '#455E91',
      onTertiary: '#FFFFFF',
      tertiaryContainer: '#D8E2FF',
      onTertiaryContainer: '#001A43',
      bg: '#F4FEFA',
      surface: '#F4FEFA',
      onSurface: '#161D1B',
      onSurfaceVariant: '#3F4947',
      outline: '#6F7977',
      error: '#BA1A1A',
      onError: '#FFFFFF',
      errorContainer: '#FFDAD6',
      onErrorContainer: '#410002'
    },
    dark: {
      primary: '#33DFCA',
      onPrimary: '#00382E',
      primaryContainer: '#005044',
      onPrimaryContainer: '#59FCE1',
      secondary: '#B0CCC6',
      onSecondary: '#1C3531',
      secondaryContainer: '#334B47',
      onSecondaryContainer: '#CCE8E2',
      tertiary: '#B4C5FF',
      onTertiary: '#112F60',
      tertiaryContainer: '#2C4678',
      onTertiaryContainer: '#D8E2FF',
      bg: '#161D1B',
      surface: '#161D1B',
      onSurface: '#E0EFEA',
      onSurfaceVariant: '#BEC9C5',
      outline: '#899390',
      error: '#FFB4AB',
      onError: '#690005',
      errorContainer: '#93000A',
      onErrorContainer: '#FFDAD6'
    }
  }
};

// eslint-disable-next-line no-unused-vars
const getRouteFare = (fromId, toId) => {
  if (!fromId || !toId || fromId === toId) return null;
  const key1 = `${fromId}-${toId}`;
  const key2 = `${toId}-${fromId}`;
  return FARE_MATRIX[key1] || FARE_MATRIX[key2] || null;
};

const formatCurrency = (amount) => {
  const val = Number(amount);
  if (isNaN(val)) return '¥0';
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(Math.round(val));
};

const formatDateSafely = (dateString, offset = 0) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '2026-01-01';
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  } catch {
    // Default fallback date on parse failure
    return '2026-01-01';
  }
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
  { name: 'Kamakura Great Buddha', type: 'National Treasure', distance: '15m • 7.2km', img: import.meta.env.BASE_URL + 'kamakura.png' },
  { name: 'Meiji Jingu', type: 'Shrine', distance: '53m • 51km', img: import.meta.env.BASE_URL + 'meiji_jingu.jpg' },
  { name: 'Akihabara', type: 'Tech District', distance: '59m • 53km', img: import.meta.env.BASE_URL + 'akihabara.jpg' },
  { name: 'Shinjuku Gyoen', type: 'Garden', distance: '1h 4m • 54km', img: import.meta.env.BASE_URL + 'shinjuku_gyoen.jpg' },
  { name: 'Chiba Station', type: 'Urban Center', distance: '1h 29m • 89.2km', img: import.meta.env.BASE_URL + 'chiba.png' },
];

const HIGHLIGHTS = [
  {
    title: 'Shibuya Crossing',
    subtitle: "3.2km away • World's busiest intersection",
    tag: 'Trending',
    density: 'High',
    img: import.meta.env.BASE_URL + 'shibuya.jpg',
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
    img: import.meta.env.BASE_URL + 'kyoto.jpg',
    link: 'https://www.google.com/maps/search/Kyoto'
  }
];

const AppLauncher = ({ app, delay, currentTheme, isStealthMode }) => {
  const launchUrl = useMemo(() => {
    try {
      const url = new URL(app.url);
      url.searchParams.set('theme', currentTheme || 'cobalt');
      url.searchParams.set('stealth', isStealthMode ? 'true' : 'false');
      return url.toString();
    } catch {
      // Fallback construction if app.url is relative or invalid URL format
      return `${app.url}?theme=${currentTheme || 'cobalt'}&stealth=${isStealthMode ? 'true' : 'false'}`;
    }
  }, [app.url, currentTheme, isStealthMode]);

  const renderIcon = () => {
    if (app.id === 'itinerary') {
      return <MapPin size={22} className="text-g-primary" />;
    }
    if (app.id === 'stamps') {
      return <Ticket size={22} className="text-g-secondary" />;
    }
    return <Waves size={22} className="text-g-tertiary" />;
  };

  const appDescription = {
    itinerary: 'Plan and navigate your routes around Japan',
    stamps: 'Collect and log traditional Eki stamp seals',
    signal: 'Record and analyze surrounding ambient audio'
  }[app.id] || 'Launch connected utility';

  const iconBgClass = {
    itinerary: 'bg-g-primary-container/40',
    stamps: 'bg-g-secondary-container/40',
    signal: 'bg-g-tertiary-container/40'
  }[app.id] || 'bg-g-primary-container/40';

  return (
    <motion.a
      href={launchUrl}
      onPointerDown={() => triggerHaptic('medium')}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, delay: delay, ease: "easeOut" }}
      className="group flex items-center gap-4 py-4 px-5 hover:bg-g-primary-container/10 transition-all duration-200 relative rounded-[24px] mx-1 bg-g-surface border border-g-outline/10 hover:border-g-primary/20 shadow-sm mb-3.5 will-change-[transform,opacity] select-none"
    >
      {/* Material You Colored Icon Container */}
      <div className={`w-12 h-12 rounded-full ${iconBgClass} flex items-center justify-center relative shrink-0 transition-transform duration-200 group-hover:scale-105`}>
        {renderIcon()}
      </div>

      {/* Card Info Details */}
      <div className="flex-1 flex flex-col min-w-0">
        <span className="font-display text-[16px] font-bold text-g-text tracking-tight group-hover:text-g-primary transition-colors leading-none">{app.name}</span>
        <span className="text-[11px] font-medium text-g-text-variant mt-1.5 leading-none">{appDescription}</span>
      </div>

      {/* Arrow Launch Terminal */}
      <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-g-aluminium/20 dark:bg-g-aluminium/5 group-hover:bg-g-primary group-hover:text-white transition-all duration-200 text-g-text-variant">
        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </motion.a>
  );
};

export default function App() {
  const [callsign, setCallsign] = useState(() => {
    return localStorage.getItem('onyx_callsign') || 'JD';
  });

  useEffect(() => {
    localStorage.setItem('onyx_callsign', callsign);
  }, [callsign]);

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const [time, setTime] = useState(new Date());
  const searchQuery = '';
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(() => {
    return localStorage.getItem('onyx_stealth_mode') === 'true';
  });
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
    } catch {
      return def;
    }
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('onyx_budget_expenses');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
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

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('onyx_theme');
    return (saved && THEME_PALETTES[saved]) ? saved : 'cobalt';
  });

  useEffect(() => {
    localStorage.setItem('onyx_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (lastKnownNode) {
      localStorage.setItem('onyx_last_known_node', lastKnownNode);
    }
  }, [lastKnownNode]);

  useEffect(() => {
    const safeTheme = THEME_PALETTES[theme] ? theme : 'cobalt';
    const colors = THEME_PALETTES[safeTheme][isStealthMode ? 'dark' : 'light'];
    const root = document.documentElement;
    root.style.setProperty('--theme-g-primary', colors.primary);
    root.style.setProperty('--theme-g-on-primary', colors.onPrimary);
    root.style.setProperty('--theme-g-primary-container', colors.primaryContainer);
    root.style.setProperty('--theme-g-on-primary-container', colors.onPrimaryContainer);
    root.style.setProperty('--theme-g-secondary', colors.secondary || colors.primary);
    root.style.setProperty('--theme-g-on-secondary', colors.onSecondary || colors.onPrimary);
    root.style.setProperty('--theme-g-secondary-container', colors.secondaryContainer || colors.primaryContainer);
    root.style.setProperty('--theme-g-on-secondary-container', colors.onSecondaryContainer || colors.onPrimaryContainer);
    root.style.setProperty('--theme-g-tertiary', colors.tertiary || colors.primary);
    root.style.setProperty('--theme-g-on-tertiary', colors.onTertiary || colors.onPrimary);
    root.style.setProperty('--theme-g-tertiary-container', colors.tertiaryContainer || colors.primaryContainer);
    root.style.setProperty('--theme-g-on-tertiary-container', colors.onTertiaryContainer || colors.onPrimaryContainer);
    root.style.setProperty('--theme-g-bg', colors.bg);
    root.style.setProperty('--theme-g-surface', colors.surface);
    root.style.setProperty('--theme-g-on-surface', colors.onSurface);
    root.style.setProperty('--theme-g-outline', colors.outline);
    root.style.setProperty('--theme-g-text', colors.onSurface || (isStealthMode ? '#E8EAED' : '#1F1F1F'));
    root.style.setProperty('--theme-g-text-variant', colors.onSurfaceVariant || (isStealthMode ? '#9AA0A6' : '#444746'));
    root.style.setProperty('--theme-g-error', colors.error || (isStealthMode ? '#FFB4AB' : '#BA1A1A'));
    root.style.setProperty('--theme-g-on-error', colors.onError || (isStealthMode ? '#690005' : '#FFFFFF'));
    root.style.setProperty('--theme-g-error-container', colors.errorContainer || (isStealthMode ? '#93000A' : '#FFDAD6'));
    root.style.setProperty('--theme-g-on-error-container', colors.onErrorContainer || (isStealthMode ? '#FFDAD6' : '#410002'));
  }, [theme, isStealthMode]);

  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: '', category: 'Food', note: '', paymentMethod: 'suica' });

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
    if (isNaN(start.getTime())) return;
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
      setTimeout(() => {
        setDurationInput(totalDays.toString());
      }, 0);
    }
  }, [isConfigModalOpen, totalDays]);

  // Safety check: Clamp day offset to the active timeline range if the timeline is shortened
  useEffect(() => {
    if (currentDayOffset >= totalDays) {
      setTimeout(() => {
        setCurrentDayOffset(Math.max(0, totalDays - 1));
      }, 0);
    }
  }, [totalDays, currentDayOffset]);

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

    setNewExpense({ amount: '', category: 'Food', note: '', paymentMethod: 'suica' });
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

  // Suica Apple Shortcut Sync listener (100% Offline Sync via URL Query Parameters)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amountParam = params.get('suica_amount');
    const merchantParam = params.get('suica_merchant');

    if (amountParam) {
      const amount = parseInt(amountParam, 10);
      if (!isNaN(amount) && amount > 0) {
        triggerHaptic('heavy');

        // 1. Deduct from wallet suica balance
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWallet(prev => {
          const next = { ...prev };
          next.suica = Math.max(0, next.suica - amount);
          return next;
        });

        // 2. Add to ledger expenses under 'Transit'
        const merchantName = merchantParam ? decodeURIComponent(merchantParam).replace(/_/g, ' ') : 'Suica Contactless';
        const expense = {
          id: Date.now(),
          date: currentTripDayDate,
          amount: amount,
          category: 'Transit',
          note: `Suica: ${merchantName}`,
          paymentMethod: 'suica'
        };

        setExpenses(prev => [expense, ...prev]);

        // 3. Silently clear query parameters from the address bar to prevent double charges on refresh
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);

        // 4. Trigger the ultra-satisfying success HUD animation
        setIsTransitLogged(true);
        setTimeout(() => {
          setIsTransitLogged(false);
        }, 2200);
      }
    }
  }, [currentTripDayDate]);

  const renderTransitPrompt = () => {
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
              <md-icon style={{ fontSize: '11px', '--md-icon-weight': '700' }}>check</md-icon>
            </span>
            <span className="leading-none pt-0.5">Suica Logged! OK!</span>
          </motion.div>
        </motion.div>
      );
    }
    return null;
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition((pos) => {
        const { latitude, longitude } = pos.coords;

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
          // Check for transition
          const lkn = lastKnownNodeRef.current;
          if (lkn && lkn !== closestId) {
            setLastKnownNode(closestId);
          } else if (!lkn) {
            setLastKnownNode(closestId);
          }
        }
      }, (err) => console.warn(err), { enableHighAccuracy: false, maximumAge: 60000, timeout: 15000 });

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const [tempWallet, setTempWallet] = useState(wallet);

  useEffect(() => {
    localStorage.setItem('onyx_stealth_mode', isStealthMode);
    if (isStealthMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isStealthMode]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'onyx_wallet' && e.newValue) {
        try {
          setWallet(JSON.parse(e.newValue));
        } catch {
          // Suppress parsing errors for safety
        }
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
    }, 30000); // Optimized 30s interval to prevent idle render cycle battery drain
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
        } catch {
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
            <span className="text-[11px] font-bold px-3 py-1 bg-g-secondary-container text-g-on-secondary-container rounded-full tracking-wide transition-colors duration-700">
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
                {renderTransitPrompt()}
              </AnimatePresence>

              {/* Recommended Section - Highly Expressive Carousel */}
              {!searchQuery && (
                <motion.section layout="position" className="[will-change:transform] [transform-style:preserve-3d] [backface-visibility:hidden] transform-gpu">
                  <div className="label-text mb-3 ml-2">Recommended for you</div>
                  <div className="relative aspect-[4/3] rounded-[36px] rounded-br-[12px] overflow-hidden group shadow-elevation-2 bg-g-bg transform-gpu isolate">
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
                            <ArrowRight size={24} className="shrink-0" />
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
                  setTempWallet(wallet);
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
                    <Wallet size={24} className="text-white shrink-0" />
                  </div>
                </div>

                <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <div className="text-[9px] font-bold text-white/70 mb-1.5 uppercase tracking-widest flex items-center gap-1 leading-none">
                      Suica Balance <Waves size={12} className="text-white/70" />
                    </div>
                    <div className="text-3xl font-display font-bold tracking-tight flex items-baseline gap-1">
                      <span className="text-xl text-white/60">¥</span>{wallet.suica.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="text-[9px] font-bold text-white/70 mb-2 uppercase tracking-widest leading-none">Telemetry</div>
                    <div className="text-[9px] font-bold tracking-widest text-white/80 bg-white/10 px-2.5 py-1 rounded-md border border-white/10 select-none leading-none">
                      NFC ENABLED
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Essential Japanese Phrases Console */}
              <motion.section layout="position" className="space-y-3.5 [will-change:transform] [transform-style:preserve-3d] [backface-visibility:hidden] transform-gpu">
                <div className="flex justify-between items-center px-2">
                  <div className="label-text">Essential Japanese HUD</div>

                  {/* Glassmorphic Badge adopting the Highlights Image Tag design */}
                  <span className="px-3 py-1 rounded-full bg-g-tertiary/15 dark:bg-g-tertiary/10 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest text-g-tertiary border border-g-tertiary/20 shadow-sm flex items-center gap-1.5 select-none transition-colors duration-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-g-tertiary animate-pulse" />
                    Translate Mod
                  </span>
                </div>

                {/* Phrases Cards Shelf (Horizontal Carousel) */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-0.5">
                  {PHRASES.map((phrase) => (
                    <div
                      key={phrase.jp}
                      className="shrink-0 w-[240px] material-card material-card-outlined p-4.5 flex flex-col justify-between space-y-4 relative overflow-hidden group"
                    >
                      {/* Interactive Corner Accent */}
                      <div className="absolute top-0 right-0 w-8 h-8 bg-g-primary/5 rounded-bl-[16px] pointer-events-none group-hover:bg-g-primary/10 transition-colors" />

                      <div className="space-y-2">
                        {/* Monospace Phonetic Pronunciation Badge */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-mono font-bold tracking-widest text-g-on-secondary-container uppercase bg-g-secondary-container px-2 py-0.5 rounded-md leading-none transition-colors duration-700">
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
                          onClick={() => copyToClipboard(phrase.jp, phrase.jp)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-g-aluminium/40 dark:bg-g-aluminium/10 hover:bg-g-primary-container hover:text-g-primary text-[9px] font-bold uppercase tracking-wider text-g-text transition-colors duration-200 cursor-pointer select-none"
                        >
                          {copiedIndex === phrase.jp ? (
                            <>
                              <Check size={10} className="text-g-primary stroke-[3]" />
                              <span className="text-g-primary font-extrabold">Copied</span>
                            </>
                          ) : (
                            <>
                              <md-icon style={{ fontSize: '10px' }}>content_copy</md-icon>
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
                  <div key={spot.name} className="material-card material-card-outlined overflow-hidden ripple cursor-pointer group pb-4">
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
                        className="w-12 h-12 rounded-full bg-g-primary-container text-g-primary flex items-center justify-center group-hover:bg-g-primary group-hover:text-white transition-colors ripple"
                      >
                        <md-icon style={{ fontSize: '18px' }}>arrow_forward</md-icon>
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
                {renderTransitPrompt()}
              </AnimatePresence>

              {/* Daily Allowance Command Panel */}
              <motion.section layout="position" className="material-card material-card-elevated overflow-hidden relative p-6 space-y-6 [will-change:transform] [transform-style:preserve-3d] [backface-visibility:hidden] transform-gpu">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => { triggerHaptic(); setCurrentDayOffset(Math.max(0, currentDayOffset - 1)); }}
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-g-aluminium dark:bg-g-aluminium/30 hover:bg-g-primary-container text-g-text-variant hover:text-g-primary transition-all duration-200 ripple animate-[fade-in_0.3s_ease]"
                    >
                      <md-icon style={{ fontSize: '20px' }} className="transition-colors duration-200">chevron_left</md-icon>
                    </button>
                    <div className="text-center min-w-[100px]">
                      <p className="text-[10px] font-bold text-g-primary uppercase tracking-[0.2em] mb-0.5">Day {currentDayOffset + 1}</p>
                      <p className="text-sm font-bold uppercase tracking-tight text-g-text">{new Date(currentTripDayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <button
                      onClick={() => { triggerHaptic(); setCurrentDayOffset(currentDayOffset + 1); }}
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-g-aluminium dark:bg-g-aluminium/30 hover:bg-g-primary-container text-g-text-variant hover:text-g-primary transition-all duration-200 ripple animate-[fade-in_0.3s_ease]"
                    >
                      <md-icon style={{ fontSize: '20px' }} className="transition-colors duration-200">chevron_right</md-icon>
                    </button>
                  </div>
                  <md-icon style={{ fontSize: '18px' }} className="text-g-text-variant">calendar_today</md-icon>
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
                  <md-linear-progress
                    value={Math.min(1, todaySpent / (todayAllowance || 1))}
                    style={{
                      width: '100%',
                      '--md-linear-progress-active-indicator-color': todaySpent > todayAllowance ? '#EF4444' : 'var(--theme-g-primary)',
                      '--md-linear-progress-track-color': 'var(--theme-g-aluminium)',
                      '--md-linear-progress-track-height': '8px',
                      '--md-linear-progress-active-indicator-height': '8px',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}
                  />
                  <div className="flex justify-between items-center text-[10px] font-medium text-g-text-variant px-1">
                    <span>{todaySpent > todayAllowance ? 'Over budget' : `${Math.round(Math.max(0, 100 - (todaySpent / (todayAllowance || 1)) * 100))}% safe`}</span>
                    <span>Remaining: {formatCurrency(Math.max(0, todayAllowance - todaySpent))}</span>
                  </div>
                </div>
              </motion.section>

              {/* Net Buffer Telemetry Console */}
              <motion.div layout="position" className="grid grid-cols-2 gap-4 [will-change:transform] [transform-style:preserve-3d] [backface-visibility:hidden] transform-gpu">
                <div className="material-card material-card-outlined p-5 flex flex-col justify-between h-28 relative overflow-hidden">
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

                <div className="material-card material-card-outlined p-5 flex flex-col justify-between h-28 relative overflow-hidden">
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
                          className="material-card material-card-outlined p-4 flex items-center justify-between transition-all"
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
                              className="w-12 h-12 rounded-full flex items-center justify-center text-g-text-variant hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
                  <md-icon style={{ fontSize: '20px' }}>add</md-icon>
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
                    className="w-full material-card material-card-outlined p-5 flex justify-between items-center ripple"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-g-aluminium dark:bg-g-aluminium/10 flex items-center justify-center text-g-text">
                        {isStealthMode ? <md-icon style={{ fontSize: '20px' }}>visibility_off</md-icon> : <md-icon style={{ fontSize: '20px' }}>visibility</md-icon>}
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
                  <div className="w-full material-card material-card-outlined p-5 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-g-primary-container text-g-primary flex items-center justify-center transition-colors duration-700">
                        <md-icon style={{ fontSize: '20px' }}>palette</md-icon>
                      </div>
                      <div className="text-left">
                        <div className="text-base font-bold text-g-text">System Theme</div>
                        <div className="text-sm font-medium text-g-text-variant">Select interface profile</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 pt-1.5">
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
                        <div className="w-3.5 h-3.5 rounded-full bg-[#4C662B]" />
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
                        <div className="w-3.5 h-3.5 rounded-full bg-[#7A5367]" />
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
                      <button
                        onClick={() => { triggerHaptic('medium'); setTheme('titanium'); }}
                        className={cn(
                          "py-2 px-0.5 rounded-xl border flex flex-col items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter transition-all duration-300 ripple",
                          theme === 'titanium'
                            ? "bg-g-primary-container border-g-primary text-g-primary shadow-sm"
                            : "bg-g-aluminium/20 dark:bg-g-aluminium/5 border-g-outline/10 text-g-text-variant hover:bg-g-aluminium/30"
                        )}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-[#5A626A]" />
                        Titanium
                      </button>
                      <button
                        onClick={() => { triggerHaptic('medium'); setTheme('abyss'); }}
                        className={cn(
                          "py-2 px-0.5 rounded-xl border flex flex-col items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter transition-all duration-300 ripple",
                          theme === 'abyss'
                            ? "bg-g-primary-container border-g-primary text-g-primary shadow-sm"
                            : "bg-g-aluminium/20 dark:bg-g-aluminium/5 border-g-outline/10 text-g-text-variant hover:bg-g-aluminium/30"
                        )}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-[#00FFAA]" />
                        Abyss
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={exportMissionData}
                    className="w-full material-card material-card-outlined p-5 flex justify-between items-center ripple"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-g-primary-container text-g-primary flex items-center justify-center">
                        <md-icon style={{ fontSize: '20px' }}>download</md-icon>
                      </div>
                      <div className="text-left">
                        <div className="text-base font-bold text-g-text">Export Intel</div>
                        <div className="text-sm font-medium text-g-text-variant">Backup data to JSON</div>
                      </div>
                    </div>
                    <md-icon style={{ fontSize: '20px' }} className="text-g-text-variant">arrow_forward</md-icon>
                  </button>

                  <button
                    onClick={forceRefresh}
                    className="w-full material-card material-card-outlined p-5 flex justify-between items-center ripple"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-g-primary-container text-g-primary flex items-center justify-center">
                        <md-icon style={{ fontSize: '20px' }}>sync</md-icon>
                      </div>
                      <div className="text-left">
                        <div className="text-base font-bold text-g-text">Force Sync</div>
                        <div className="text-sm font-medium text-g-text-variant">Clear cache</div>
                      </div>
                    </div>
                    <md-icon style={{ fontSize: '20px' }} className="text-g-text-variant">arrow_forward</md-icon>
                  </button>
                </div>
              </div>


              {/* Trip Budget Parameters */}
              <div>
                <div className="label-text ml-2 mb-3">Trip Budget Parameters</div>
                <section className="material-card material-card-outlined p-5 space-y-4">
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
                <section className="material-card material-card-outlined p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                      <md-icon style={{ fontSize: '20px' }}>shield</md-icon>
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

      {/* Floating Pill Bottom Nav (iOS / M3 Hybrid Style) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.25rem)] z-40 bg-white/70 dark:bg-g-surface/70 backdrop-blur-xl border border-g-outline/10 py-2.5 px-3 rounded-[32px] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.12),0_4px_16px_-4px_rgba(0,0,0,0.06)] transition-all duration-500">
        <nav className="w-full flex justify-around items-center">

          <button
            onClick={() => { triggerHaptic('light'); setActiveTab('home'); }}
            className={cn("nav-item flex flex-col items-center gap-1 w-16 group relative", activeTab === 'home' && "nav-active")}
          >
            <div className="nav-icon-container w-16 h-8 rounded-full flex items-center justify-center relative text-g-text-variant group-hover:bg-g-aluminium overflow-hidden">
              <md-ripple></md-ripple>
              {activeTab === 'home' && (
                <motion.div
                  layoutId="activeNavPill"
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className="absolute inset-0 bg-g-primary-container rounded-full -z-10"
                />
              )}
              <md-icon>monitoring</md-icon>
            </div>
            <span className="text-[11px] font-medium text-g-text-variant transition-colors duration-200">Home</span>
          </button>

          <button
            onClick={() => { triggerHaptic('light'); setActiveTab('explore'); }}
            className={cn("nav-item flex flex-col items-center gap-1 w-16 group relative", activeTab === 'explore' && "nav-active")}
          >
            <div className="nav-icon-container w-16 h-8 rounded-full flex items-center justify-center relative text-g-text-variant group-hover:bg-g-aluminium overflow-hidden">
              <md-ripple></md-ripple>
              {activeTab === 'explore' && (
                <motion.div
                  layoutId="activeNavPill"
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className="absolute inset-0 bg-g-primary-container rounded-full -z-10"
                />
              )}
              <md-icon>explore</md-icon>
            </div>
            <span className="text-[11px] font-medium text-g-text-variant transition-colors duration-200">Explore</span>
          </button>

          {/* Central FAB aligned with Material Design 3 Expressive squircle and kinetic spring */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92, rotate: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            onClick={() => { triggerHaptic('heavy'); setIsLauncherOpen(true); }}
            className="relative -top-4 w-14 h-14 rounded-[20px] bg-g-primary-container text-g-primary flex items-center justify-center shadow-elevation-3 hover:brightness-110 active:brightness-95 transition-all mx-2 overflow-hidden"
          >
            <md-ripple></md-ripple>
            <md-icon style={{ fontSize: '28px', '--md-icon-weight': '400' }}>add</md-icon>
          </motion.button>

          <button
            onClick={() => { triggerHaptic('light'); setActiveTab('budget'); }}
            className={cn("nav-item flex flex-col items-center gap-1 w-16 group relative", activeTab === 'budget' && "nav-active")}
          >
            <div className="nav-icon-container w-16 h-8 rounded-full flex items-center justify-center relative text-g-text-variant group-hover:bg-g-aluminium overflow-hidden">
              <md-ripple></md-ripple>
              {activeTab === 'budget' && (
                <motion.div
                  layoutId="activeNavPill"
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className="absolute inset-0 bg-g-primary-container rounded-full -z-10"
                />
              )}
              <md-icon>wallet</md-icon>
            </div>
            <span className="text-[11px] font-medium text-g-text-variant transition-colors duration-200">Budget</span>
          </button>

          <button
            onClick={() => { triggerHaptic('light'); setActiveTab('settings'); }}
            className={cn("nav-item flex flex-col items-center gap-1 w-16 group relative", activeTab === 'settings' && "nav-active")}
          >
            <div className="nav-icon-container w-16 h-8 rounded-full flex items-center justify-center relative text-g-text-variant group-hover:bg-g-aluminium overflow-hidden">
              <md-ripple></md-ripple>
              {activeTab === 'settings' && (
                <motion.div
                  layoutId="activeNavPill"
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className="absolute inset-0 bg-g-primary-container rounded-full -z-10"
                />
              )}
              <md-icon>settings</md-icon>
            </div>
            <span className="text-[11px] font-medium text-g-text-variant transition-colors duration-200">Setup</span>
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {isWalletModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={() => setIsWalletModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100vh" }}
              animate={{ y: 0 }}
              exit={{ y: "100vh" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="relative w-full max-w-md bg-g-bg rounded-t-[28px] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-elevation-3 transform-gpu [will-change:transform]"
            >
              <div className="w-8 h-1 bg-g-outline/40 rounded-full mx-auto mb-5" />
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-g-text tracking-tight">Wallet Funds</h3>
                  <p className="text-xs font-medium text-g-text-variant mt-1">Please input funds to sync</p>
                </div>
                <button onClick={() => setIsWalletModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-g-aluminium text-g-text ripple animate-[fade-in_0.3s_ease]"><md-icon style={{ fontSize: '20px' }}>close</md-icon></button>
              </div>

              <div className="space-y-10">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em]">Suica Balance</label>
                    <span className="text-[10px] font-mono text-g-tertiary transition-colors duration-700">SUICA NFC</span>
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
                className="w-full h-12 bg-g-primary text-white dark:text-[#202124] font-bold uppercase tracking-wider text-xs rounded-full shadow-elevation-1 mt-8 active:scale-[0.98] transition-transform relative overflow-hidden"
              >
                <md-ripple></md-ripple>
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
              className="relative w-full max-w-lg bg-g-surface border border-g-outline/20 rounded-[28px] p-6 md:p-8 shadow-2xl flex flex-col justify-between items-center text-center space-y-6 z-10 overflow-hidden"
            >
              {/* Top Accent Status Header */}
              <div className="w-full flex justify-between items-center border-b border-g-outline/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-g-primary animate-pulse" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-g-text-variant uppercase">Translation Presenter</span>
                </div>
                <button
                  onClick={() => { triggerHaptic('light'); setFullscreenPhrase(null); }}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-g-aluminium dark:bg-g-aluminium/10 text-g-text hover:bg-g-primary-container hover:text-g-primary transition-colors cursor-pointer animate-[fade-in_0.3s_ease]"
                >
                  <md-icon style={{ fontSize: '20px' }}>close</md-icon>
                </button>
              </div>

              {/* Monospace Phonetic Aid */}
              <div className="bg-g-primary-container text-g-primary font-mono text-xs md:text-sm font-bold px-4 py-1.5 rounded-full tracking-wider shadow-inner">
                {fullscreenPhrase.romaji}
              </div>

              {/* GIANT HIGH-CONTRAST JAPANESE GLYPHS - PERFECT FOR SHOWING TO LOCALS */}
              <div className="w-full py-6 px-4 bg-g-aluminium/20 dark:bg-g-aluminium/5 rounded-[16px] border border-g-outline/5 shadow-inner select-all">
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
                  <md-icon style={{ fontSize: '10px', '--md-icon-weight': '700' }} className="text-g-primary">shield</md-icon>
                  <span>Show this screen to transit staff or cashiers</span>
                </div>
              </div>

              {/* Direct Haptic Tap Dismiss */}
              <button
                onClick={() => { triggerHaptic('heavy'); setFullscreenPhrase(null); }}
                className="w-full h-12 bg-g-primary text-white dark:text-[#202124] font-bold uppercase tracking-wider text-xs rounded-full shadow-elevation-1 active:scale-[0.98] transition-all duration-200 ripple"
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={() => setIsLauncherOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100vh" }}
              animate={{ y: 0 }}
              exit={{ y: "100vh" }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="fixed bottom-0 left-0 w-full h-[85vh] bg-g-bg z-50 flex flex-col shadow-elevation-3 rounded-t-[28px] overflow-hidden transform-gpu [will-change:transform]"
            >
              {/* Material Drag Handle */}
              <div className="w-full flex justify-center pt-3 pb-1 bg-g-bg">
                <div className="w-8 h-1 rounded-full bg-g-outline/40"></div>
              </div>

              <div className="px-6 py-4 flex justify-between items-center bg-g-bg mb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-g-text tracking-tight">App Drawer</h2>
                  <p className="text-sm font-medium text-g-text-variant mt-0.5">Quick launch your connected utilities</p>
                </div>
                <button
                  onClick={() => setIsLauncherOpen(false)}
                  className="w-12 h-12 rounded-full bg-g-aluminium flex items-center justify-center text-g-text hover:bg-g-outline/30 transition-colors ripple animate-[fade-in_0.3s_ease]"
                >
                  <md-icon style={{ fontSize: '20px' }}>close</md-icon>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col px-4 pb-24 pt-2 no-scrollbar">
                {filteredApps.length > 0 ? (
                  filteredApps.map((app, i) => <AppLauncher key={app.id} app={app} delay={i * 0.04} currentTheme={theme} isStealthMode={isStealthMode} />)
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
              className="relative w-full max-w-md bg-g-surface rounded-t-[28px] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-elevation-3 overflow-y-auto max-h-[90vh] transform-gpu [will-change:transform]"
            >
              <div className="w-8 h-1 bg-g-outline/40 rounded-full mx-auto mb-5" />

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-g-text">Log Transaction</h3>
                  <p className="text-xs font-medium text-g-text-variant mt-0.5">Record trip expenses in real-time</p>
                </div>
                <button type="button" onClick={() => setIsAddingExpense(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-g-aluminium dark:bg-g-aluminium/15 text-g-text ripple animate-[fade-in_0.3s_ease]"><md-icon style={{ fontSize: '20px' }}>close</md-icon></button>
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
                  <div className="flex items-center gap-3 bg-g-tertiary/10 border border-g-tertiary/20 p-3.5 rounded-xl text-g-tertiary select-none">
                    <Waves size={16} className="text-g-tertiary animate-pulse shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider">Suica Balance (¥{wallet.suica.toLocaleString()})</span>
                      <span className="text-[9px] text-g-text-variant leading-none mt-1">Automated NFC Shortcut Sync Enabled</span>
                    </div>
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
                  className="w-full h-12 bg-g-primary text-white dark:text-[#202124] font-bold uppercase tracking-wider text-xs rounded-full shadow-elevation-1 active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden mt-6 animate-[fade-in_0.3s_ease]"
                >
                  <md-ripple></md-ripple>
                  Log Expense
                  <md-icon style={{ fontSize: '18px' }}>arrow_forward</md-icon>
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
              className="relative w-full max-w-lg bg-white/70 dark:bg-g-surface/70 backdrop-blur-xl border border-g-outline/15 rounded-[28px] p-6 md:p-8 shadow-2xl flex flex-col space-y-6 z-10 max-h-[85vh] overflow-y-auto no-scrollbar transition-colors duration-700"
            >
              {/* Header status bar */}
              <div className="w-full flex justify-between items-center border-b border-g-outline/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-g-primary animate-pulse" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-g-text-variant uppercase">Profile Setup</span>
                </div>
                <button
                  onClick={() => { triggerHaptic('light'); setIsConfigModalOpen(false); }}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-g-aluminium dark:bg-g-aluminium/10 text-g-text hover:bg-g-primary-container hover:text-g-primary transition-colors cursor-pointer animate-[fade-in_0.3s_ease]"
                >
                  <md-icon style={{ fontSize: '20px' }}>close</md-icon>
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
                  <md-icon style={{ fontSize: '16px' }} className="text-g-primary shrink-0 mt-0.5">info</md-icon>
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
                className="w-full h-12 bg-g-primary text-white dark:text-[#202124] font-bold uppercase tracking-wider text-xs rounded-full shadow-elevation-1 active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden mt-6 animate-[fade-in_0.3s_ease]"
              >
                <md-ripple></md-ripple>
                <md-icon style={{ fontSize: '18px', '--md-icon-weight': '700' }}>check</md-icon>
                <span>Save Profile</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
