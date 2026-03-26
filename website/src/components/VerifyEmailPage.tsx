/**
 * Email Verification Page — handles token from /verify-email?token=xxx
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/auth';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    AuthService.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified!');
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err?.response?.data?.detail || 'Verification failed. Link may be expired.');
      });
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/60 p-10 max-w-md">
          {status === 'loading' && (
            <>
              <Loader2 className="w-14 h-14 text-accent-400 animate-spin mx-auto mb-4" />
              <p className="text-white text-lg font-medium">Verifying your email...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-white text-lg font-bold">{message}</p>
              <button
                onClick={() => navigate('/')}
                className="mt-6 px-8 py-3 text-sm font-semibold text-white btn-gradient rounded-xl"
              >
                Go to Dashboard
              </button>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-white text-lg font-bold">Verification Failed</p>
              <p className="text-slate-400 text-sm mt-2">{message}</p>
              <button
                onClick={() => navigate('/')}
                className="mt-6 px-8 py-3 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
              >
                Go Home
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
