import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Components
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { FeaturesPage } from './components/FeaturesPage';
import { PricingPage } from './components/PricingPage';
import { AboutPage } from './components/AboutPage';
import { MeasurementsPage } from './components/MeasurementsPage';
import { MyMeasurementsPage } from './components/MyMeasurementsPage';
import { ClothingFitChecker } from './components/ClothingFitChecker';
import { WardrobeDashboardPage } from './components/WardrobeDashboardPage';
import { BodyTrackerPage } from './components/BodyTrackerPage';
import { FashionIQPage } from './components/FashionIQPage';
import { TrendDashboardPage } from './components/TrendDashboardPage';
import { AuthLanding } from './components/AuthLanding';

// Services
import { AuthService } from './services/auth';
import { ApiService } from './services/api';

import toast from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());
  const [apiConnected, setApiConnected] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check API connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await ApiService.testConnection();
        setApiConnected(true);
      } catch (err) {
        setApiConnected(false);
      }
    };

    checkConnection();
    setCheckingAuth(false);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  // Show loading state while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Show auth landing if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 500,
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <AuthLanding onAuthSuccess={handleAuthSuccess} />
      </>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white relative">
        {/* Premium Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-violet-100/40 via-purple-100/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-fuchsia-100/30 to-transparent rounded-full blur-3xl" />
        </div>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 500,
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />

        {/* Navigation */}
        <Navigation onLogout={handleLogout} />

        {/* API Status Alert */}
        {!apiConnected && (
          <div className="container mx-auto px-6 pt-4 max-w-7xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200/60 p-4 rounded-2xl flex gap-4 items-start"
            >
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-red-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Backend Offline</h3>
                <p className="text-sm text-red-700 mt-1">
                  Make sure the FastAPI backend is running on port 8000.
                  <br />
                  <code className="bg-red-100 px-2 py-1 rounded text-xs mt-2 inline-block font-mono">python api/app.py</code>
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Main Content */}
        <main className="relative z-10">
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Core Features */}
            <Route path="/measurements" element={<MeasurementsPage />} />
            <Route path="/my-measurements" element={<MyMeasurementsPage />} />
            <Route path="/fit-checker" element={<ClothingFitChecker />} />

            {/* Analytics & Tracking */}
            <Route path="/wardrobe" element={<WardrobeDashboardPage />} />
            <Route path="/body-tracker" element={<BodyTrackerPage />} />
            <Route path="/fashion-iq" element={<FashionIQPage />} />
            <Route path="/trends" element={<TrendDashboardPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-12 mt-20 border-t border-slate-200/60">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">✨</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900">BodyScan AI</p>
                  <p className="text-xs text-slate-500">AI-Powered Body Intelligence</p>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                © 2024 BodyScan AI. Powered by PARE, SMPL-Anthropometry & Machine Learning.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
