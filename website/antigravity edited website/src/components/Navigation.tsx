import React from 'react';
import { motion } from 'framer-motion';
import { Home, BarChart3, Info, Database, LogOut, FolderOpen, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/auth';

interface NavigationProps {
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/features', label: 'Features', icon: BarChart3 },
    { path: '/about', label: 'About', icon: Info },
    { path: '/my-measurements', label: 'My Measurements', icon: FolderOpen },
    { path: '/fit-checker', label: 'Fit Checker', icon: ShoppingBag },
    { path: '/measurements', label: 'New Measurement', icon: Database },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-xl shadow-xl border-b border-white/20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              BodyScan AI
            </span>
          </motion.div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <motion.button
                  key={item.path}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className={`relative px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                    active
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-primary-50 rounded-xl -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Logout</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
};
