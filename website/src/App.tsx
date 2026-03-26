import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { BodyIntelligenceProvider } from './contexts/BodyIntelligenceContext';

// Services
import { AuthService } from './services/auth';
import { ApiService } from './services/api';

// Eager loading - Navigation shown on all pages
import { Navigation } from './components/Navigation';
import { AuthLanding } from './components/AuthLanding';
import { CookieConsent } from './components/CookieConsent';
import { OnboardingTutorial } from './components/OnboardingTutorial';

// Lazy loading - Route components loaded on demand
const HomePage = lazy(() => import('./components/HomePage').then(m => ({ default: m.HomePage })));
const FeaturesPage = lazy(() => import('./components/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const PricingPage = lazy(() => import('./components/PricingPage').then(m => ({ default: m.PricingPage })));
const AboutPage = lazy(() => import('./components/AboutPage').then(m => ({ default: m.AboutPage })));
const MeasurementsPage = lazy(() => import('./components/MeasurementsPage').then(m => ({ default: m.MeasurementsPage })));
const MyMeasurementsPage = lazy(() => import('./components/MyMeasurementsPage').then(m => ({ default: m.MyMeasurementsPage })));
const ClothingFitChecker = lazy(() => import('./components/ClothingFitChecker'));
const WardrobeDashboardPage = lazy(() => import('./components/WardrobeDashboardPage').then(m => ({ default: m.WardrobeDashboardPage })));
const BodyTrackerPage = lazy(() => import('./components/BodyTrackerPage').then(m => ({ default: m.BodyTrackerPage })));
const FashionIQPage = lazy(() => import('./components/FashionIQPage').then(m => ({ default: m.FashionIQPage })));
const TrendDashboardPage = lazy(() => import('./components/TrendDashboardPage').then(m => ({ default: m.TrendDashboardPage })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(m => ({ default: m.ProfilePage })));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('./components/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));
const ForgotPasswordPage = lazy(() => import('./components/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./components/ForgotPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('./components/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));

// Eager - always visible (imported at top)

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  </div>
);

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

    // Clean up any corrupted user data in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // If user id is not a valid number, clear the corrupted data
        if (!parsed || typeof parsed.id !== 'number') {
          console.warn('Clearing corrupted user data from localStorage');
          localStorage.removeItem('user');
        }
      } catch {
        localStorage.removeItem('user');
      }
    }

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
      <AuthProvider>
        <SubscriptionProvider>
          <BodyIntelligenceProvider>
            <div className="min-h-screen bg-slate-950 relative">
              {/* Premium Background */}
              <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-violet-950/40 via-purple-950/20 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-fuchsia-950/30 to-transparent rounded-full blur-3xl" />
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
                  ariaProps: {
                    role: 'status',
                    'aria-live': 'polite',
                  },
                }}
              />

              {/* Skip Navigation Link for Keyboard Users */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-500 focus:text-white focus:rounded-lg focus:shadow-lg"
              >
                Skip to main content
              </a>

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

              {/* Main Content with Suspense for lazy loading */}
              <main id="main-content" className="relative z-10 flex-1">
                <Suspense fallback={<PageLoader />}>
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

                    {/* Profile & Settings */}
                    <Route path="/profile" element={<ProfilePage onLogout={handleLogout} />} />

                    {/* Legal Pages */}
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>

              {/* Footer */}
              <footer className="relative z-10 py-12 mt-20 border-t border-slate-700/50">
                <div className="container mx-auto px-6 max-w-7xl">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">✨</span>
                      </div>
                      <div>
                        <p className="font-bold text-white">BodyScan AI</p>
                        <p className="text-xs text-slate-400">AI-Powered Body Intelligence</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-slate-400">
                      <p>© {new Date().getFullYear()} BodyScan AI. Powered by PARE, SMPL-Anthropometry & ML.</p>
                      <div className="flex gap-4">
                        <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                      </div>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
              {/* Cookie Consent */}
              <CookieConsent />
              {/* Onboarding Tutorial (first-time users) */}
              <OnboardingTutorial />
          </BodyIntelligenceProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
