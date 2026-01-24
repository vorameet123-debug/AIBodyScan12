import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { MeasurementForm } from './components/MeasurementForm';
import { MeasurementsDisplay } from './components/MeasurementsDisplay';
import { SizeRecommendations } from './components/SizeRecommendations';
import { Model3DViewerSMPL } from './components/Model3DViewerSMPL';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ApiService, MeasurementResponse } from './services/api';
import { AuthService } from './services/auth';
import { AlertCircle, RotateCcw, CheckCircle, LogOut, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

function App() {
  const [result, setResult] = useState<MeasurementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Check API connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await ApiService.testConnection();
        setApiConnected(true);
      } catch (err) {
        setApiConnected(false);
        toast.error('Unable to connect to backend API');
      }
    };

    checkConnection();
  }, []);

  const handleSuccess = (data: MeasurementResponse) => {
    setResult(data);
    setError(null);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '10px',
          },
        }}
      />

      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Auth Button in top right */}
        <div className="flex justify-end mb-4">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              <UserIcon size={18} />
              Sign In
            </button>
          )}
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="relative">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
              >
                ✕
              </button>
              {authView === 'login' ? (
                <LoginForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToRegister={() => setAuthView('register')}
                />
              ) : (
                <RegisterForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={() => setAuthView('login')}
                />
              )}
            </div>
          </div>
        )}

        {/* API Status Alert */}
        {!apiConnected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8 flex gap-3 items-start"
          >
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="font-semibold text-red-900">Backend Offline</h3>
              <p className="text-sm text-red-700 mt-1">
                Make sure the FastAPI backend is running on port 8000.
                <br />
                Run: <code className="bg-red-100 px-2 py-1 rounded mt-2 inline-block">python api/app.py</code>
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Main Form View */}
          {!result && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 shadow-xl"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Get Your Body Measurements
                </h2>
                <p className="text-gray-600">
                  Upload your photos and enter your height to receive personalized body measurements using AI.
                </p>
              </motion.div>

              <MeasurementForm
                onSuccess={handleSuccess}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </motion.div>
          )}

          {/* Results View */}
          {result && result.success && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Success Banner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-400 to-emerald-500 p-6 rounded-2xl text-white shadow-lg flex items-center gap-4"
              >
                <CheckCircle size={32} />
                <div>
                  <h3 className="text-xl font-bold">Measurements Extracted Successfully!</h3>
                  <p className="text-green-50 text-sm mt-1">
                    {Object.keys(result.measurements).length} measurements extracted
                  </p>
                </div>
              </motion.div>

              {/* 3D Body Model Viewer */}
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <Model3DViewerSMPL 
                  model3D={result.model_3d} 
                  measurements={result.measurements} 
                  gender={result.metadata?.gender}
                  selectedMeasurement={selectedMeasurement}
                />
              </div>

              {/* Measurements Display */}
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <MeasurementsDisplay 
                  measurements={result.measurements}
                  selectedMeasurement={selectedMeasurement}
                  onMeasurementClick={setSelectedMeasurement}
                />
              </div>

              {/* Size Recommendations */}
              {result.size_recommendations && (
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                  <SizeRecommendations recommendations={result.size_recommendations} />
                </div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4 justify-center"
              >
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition transform hover:scale-105"
                >
                  <RotateCcw size={20} />
                  Measure Another Person
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg transition transform hover:scale-105"
                >
                  Print Results
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 shadow-xl"
            >
              <div className="flex gap-4 items-start">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={32} />
                <div>
                  <h3 className="text-xl font-bold text-red-600">Error</h3>
                  <p className="text-gray-700 mt-2">{error}</p>
                  <button
                    onClick={handleReset}
                    className="mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center text-gray-600 text-sm"
        >
          <p>BodyScan AI © 2026 | Advanced 3D Body Measurement System</p>
          <p className="mt-2 text-xs">Powered by PARE, SMPL-Anthropometry, and Machine Learning</p>
        </motion.footer>
      </main>
    </div>
  );
}

export default App;

