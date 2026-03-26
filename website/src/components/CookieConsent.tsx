/**
 * Cookie Consent Banner — GDPR/DPDPA Compliant
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COOKIE_KEY = 'cookie_consent';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on first load
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/60 p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Icon + Text */}
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Cookie className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    We use cookies and local storage for authentication, preferences, and improving your experience. 
                    By clicking "Accept," you consent to our use of cookies. See our{' '}
                    <button onClick={() => navigate('/privacy')} className="text-accent-400 hover:text-accent-300 underline">
                      Privacy Policy
                    </button>{' '}
                    for details.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto">
                <button
                  onClick={decline}
                  className="flex-1 md:flex-none px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={accept}
                  className="flex-1 md:flex-none px-5 py-2.5 text-sm font-semibold text-white btn-gradient rounded-xl"
                >
                  Accept
                </button>
              </div>

              {/* Close */}
              <button onClick={decline} className="absolute top-3 right-3 md:hidden text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
