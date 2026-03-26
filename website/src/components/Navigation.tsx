import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Sparkles, LogOut, TrendingUp, Package, Ruler,
  Command, Search, X, Menu, ChevronDown, Zap, Brain,
  Crown, ShoppingBag, BarChart3, Target, ArrowRight, LucideIcon, Star, User
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentService, SubscriptionStatus } from '../services/paymentService';

// ============================================
// TYPES
// ============================================
interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
}

interface NavigationProps {
  onLogout: () => void;
}

// ============================================
// MAIN COMPONENT
// ============================================
export const Navigation: React.FC<NavigationProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);

  // ========== EFFECTS ==========
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const status = await paymentService.getSubscriptionStatus();
        setSubscription(status);
      } catch (error) {
        // Silently fail - user might not be logged in
      }
    };
    fetchSubscription();
  }, []);

  // ========== NAV ITEMS ==========
  const mainNavItems: NavItem[] = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/pricing', label: 'Pricing', icon: Crown },
  ];

  const productItems: NavItem[] = [
    {
      path: '/measurements',
      label: 'Body Scan',
      icon: Target,
      description: 'AI-powered body measurements',
      badge: 'Core'
    },
    {
      path: '/fit-checker',
      label: 'FitChecker AI',
      icon: ShoppingBag,
      description: 'Analyze clothes before you buy',
      badge: 'Popular'
    },
    {
      path: '/my-measurements',
      label: 'My Measurements',
      icon: Ruler,
      description: 'View saved body data'
    },
    {
      path: '/wardrobe',
      label: 'Wardrobe & Trend Analytics',
      icon: Package,
      description: 'Smart wardrobe insights'
    },
    {
      path: '/body-tracker',
      label: 'Body Tracker',
      icon: TrendingUp,
      description: 'Track body changes over time'
    },
    {
      path: '/fashion-iq',
      label: 'Fashion IQ',
      icon: Brain,
      description: 'Your fashion intelligence score',
      badge: 'New'
    },
  ];

  const allNavItems = [...mainNavItems, ...productItems];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const filteredItems = allNavItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ========== RENDER ==========
  return (
    <nav aria-label="Main navigation">
      <motion.header>
        {/* Premium Dark Navbar */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50'
          : 'bg-transparent'
          }`}>
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex items-center justify-between h-16 lg:h-20">

              {/* Logo */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-400 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="relative w-11 h-11 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10">
                    <Sparkles className="text-accent-400 w-5 h-5" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight text-white leading-tight">
                    BodyScan
                  </span>
                  <span className="text-[10px] font-semibold text-accent-400 tracking-widest uppercase">
                    AI Platform
                  </span>
                </div>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {/* Home */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/')}
                  className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${isActive('/') && location.pathname === '/'
                    ? 'text-accent-300 bg-accent-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                >
                  Home
                </motion.button>

                {/* Products Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowProductsDropdown(true)}
                  onMouseLeave={() => setShowProductsDropdown(false)}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
                  >
                    Products
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showProductsDropdown ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {showProductsDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-80 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/60 overflow-hidden"
                      >
                        <div className="p-2">
                          {productItems.map((item) => (
                            <motion.button
                              key={item.path}
                              whileHover={{ x: 4 }}
                              onClick={() => {
                                navigate(item.path);
                                setShowProductsDropdown(false);
                              }}
                              className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive(item.path)
                                ? 'bg-accent-500/20 text-accent-400'
                                : 'bg-slate-800 text-slate-400 group-hover:bg-accent-500/10 group-hover:text-accent-400'
                                }`}>
                                <item.icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`font-semibold text-sm ${isActive(item.path) ? 'text-accent-300' : 'text-white'}`}>
                                    {item.label}
                                  </span>
                                  {item.badge && (
                                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${item.badge === 'New' ? 'bg-emerald-500/20 text-emerald-400' :
                                      item.badge === 'Popular' ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-accent-500/20 text-accent-400'
                                      }`}>
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                        <div className="p-3 bg-gradient-to-r from-accent-500/10 to-purple-500/10 border-t border-slate-700/60">
                          <button
                            onClick={() => navigate('/features')}
                            className="flex items-center gap-2 text-sm font-semibold text-accent-400 hover:text-accent-300 transition-colors"
                          >
                            <Zap className="w-4 h-4" />
                            Explore all features
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Pricing */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/pricing')}
                  className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${isActive('/pricing')
                    ? 'text-accent-300 bg-accent-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                >
                  Pricing
                </motion.button>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2 lg:gap-3">
                {/* Subscription Status / Upgrade Button */}
                {(subscription?.plan_type === 'premium' || subscription?.plan_type === 'pro') && subscription?.is_active ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl border border-amber-500/30"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-amber-400">PRO</span>
                    {subscription.days_remaining && subscription.days_remaining <= 7 && (
                      <span className="text-[10px] text-amber-300/70">{subscription.days_remaining}d left</span>
                    )}
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/pricing')}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl text-white text-xs font-bold transition-all"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    Upgrade
                  </motion.button>
                )}

                {/* Command Palette Trigger */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCommandPalette(true)}
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </motion.button>

                {/* New Scan CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/measurements')}
                  className="hidden sm:flex btn-gradient items-center gap-2 px-5 py-2.5 text-sm"
                >
                  <Zap className="w-4 h-4" />
                  <span>New Scan</span>
                </motion.button>

                {/* Profile Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/profile')}
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${isActive('/profile')
                      ? 'bg-accent-500/20 text-accent-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                    }`}
                  title="Profile & Settings"
                >
                  <User className="w-4 h-4" />
                </motion.button>

                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogout}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>

                {/* Mobile Menu Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </nav>

        {/* Spacer for fixed navbar */}
        <div className="h-16 lg:h-20" />

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-80 bg-slate-900 z-50 lg:hidden shadow-2xl border-l border-slate-800"
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <span className="font-bold text-white">Menu</span>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  {/* Navigation Items */}
                  <div className="flex-1 overflow-y-auto py-4">
                    <div className="px-3 space-y-1">
                      <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Navigation</p>
                      <button
                        onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${location.pathname === '/' ? 'bg-accent-500/10 text-accent-300' : 'hover:bg-slate-800 text-slate-300'
                          }`}
                      >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">Home</span>
                      </button>
                      <button
                        onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${isActive('/pricing') ? 'bg-accent-500/10 text-accent-300' : 'hover:bg-slate-800 text-slate-300'
                          }`}
                      >
                        <Crown className="w-5 h-5" />
                        <span className="font-medium">Pricing</span>
                      </button>
                      <button
                        onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${isActive('/profile') ? 'bg-accent-500/10 text-accent-300' : 'hover:bg-slate-800 text-slate-300'
                          }`}
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                      </button>
                    </div>

                    <div className="px-3 mt-6 space-y-1">
                      <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Products</p>
                      {productItems.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${isActive(item.path) ? 'bg-accent-500/10 text-accent-300' : 'hover:bg-slate-800 text-slate-300'
                            }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.label}</span>
                              {item.badge && (
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${item.badge === 'New' ? 'bg-emerald-500/20 text-emerald-400' :
                                  item.badge === 'Popular' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-accent-500/20 text-accent-400'
                                  }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="p-4 border-t border-slate-800">
                    <button
                      onClick={() => { navigate('/measurements'); setMobileMenuOpen(false); }}
                      className="btn-gradient w-full py-3 font-semibold"
                    >
                      <Zap className="w-4 h-4 inline mr-2" />
                      Start Body Scan
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Command Palette Modal */}
        <AnimatePresence>
          {showCommandPalette && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCommandPalette(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
              >
                <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/60 overflow-hidden">
                  {/* Search Input */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
                    <Search className="w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search BodyScan AI..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 text-base outline-none bg-transparent placeholder:text-slate-500 text-white"
                      autoFocus
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-700">
                      ESC
                    </kbd>
                  </div>

                  {/* Results */}
                  <div className="max-h-96 overflow-y-auto py-2">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setShowCommandPalette(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-4 px-5 py-3 hover:bg-slate-800/80 transition-colors text-left group"
                        >
                          <div className="w-10 h-10 bg-slate-800 group-hover:bg-accent-500/20 rounded-xl flex items-center justify-center transition-colors">
                            <item.icon className="w-5 h-5 text-slate-400 group-hover:text-accent-400 transition-colors" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white group-hover:text-accent-300 transition-colors">{item.label}</div>
                            {item.description && <div className="text-xs text-slate-500">{item.description}</div>}
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-500">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 bg-slate-800/50 border-t border-slate-700/60 text-xs text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-semibold text-slate-400">↵</kbd>
                      to select
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Command className="w-3 h-3" />
                      <span>K to open</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>
    </nav>
  );
};

export default Navigation;
