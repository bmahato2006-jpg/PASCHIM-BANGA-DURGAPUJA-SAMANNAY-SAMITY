'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { isFirebaseConfigured } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { DhakButton } from '@/components/ui/DhakButton';
import { 
  X, 
  Mail, 
  Lock, 
  Building2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    signInWithGoogle, 
    signUpWithEmail, 
    signInWithEmail, 
    loginWithDemo,
    isConfigured
  } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  // Organizer Google Sign-In
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    if (!isConfigured) {
      setTimeout(() => {
        loginWithDemo('organizer', name || 'Marxgunj Club Secretary', 'marxgunj.puja@gmail.com');
        setIsLoading(false);
      }, 500);
      return;
    }

    const res = await signInWithGoogle('organizer');
    setIsLoading(false);
    if (!res.success) {
      setError(res.error || 'Organizer Google Sign-In failed.');
    }
  };

  // Organizer Email/Password Auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both official email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    if (!isConfigured) {
      setTimeout(() => {
        loginWithDemo('organizer', name || email.split('@')[0], email);
        setIsLoading(false);
      }, 600);
      return;
    }

    if (mode === 'signup') {
      const res = await signUpWithEmail(email.trim(), password, 'organizer', name.trim());
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'Organizer registration failed.');
      }
    } else {
      const res = await signInWithEmail(email.trim(), password, 'organizer');
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'Organizer sign in failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        className="relative w-full max-w-lg glass-modal rounded-3xl p-6 sm:p-8 overflow-hidden my-8 border-2 border-amber-300 shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-sindoor-500 to-marigold-500 text-white shadow-festive mb-3">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-black text-gray-900 tracking-tight">
            {mode === 'signup' ? 'Pandal Committee Registration' : 'Pandal Organizer Portal'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Authorized puja committee management desk. Voters vote frictionlessly without login.
          </p>
        </div>

        {/* Security Notice: Strict Role Isolation */}
        <div className="mb-5 p-3 rounded-2xl bg-amber-50/90 border border-amber-300/80 text-xs text-amber-900 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Official Club Portal:</strong> For pandal committees to manage galleries and generate QR codes. Organizers cannot vote on pandals.
          </span>
        </div>

        {/* Google Sign-In for Organizers */}
        <div className="mb-5">
          <DhakButton
            variant="secondary"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 border border-gray-200 bg-white shadow-sm hover:border-marigold-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isLoading ? 'Connecting...' : 'Continue with Google as Organizer'}</span>
          </DhakButton>
        </div>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-xs text-gray-500 font-semibold absolute">
            Or with Committee Email
          </span>
        </div>

        {/* Tab Toggle for Sign In vs Sign Up */}
        <div className="flex bg-gray-100/90 p-1 rounded-2xl mb-5 border border-amber-200/50">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Organizer Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Register Pandal
          </button>
        </div>

        {/* Error Feedback */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -5 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-2xl bg-sindoor-50 border border-sindoor-200 text-sindoor-700 text-xs font-semibold mb-4 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Inputs */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Puja Committee / Club Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marxgunj Sarbojanin Durgotsav"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-marigold-400 focus:bg-white pl-10"
                />
                <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Official Committee Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="committee@durgapurpuja.org"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-marigold-400 focus:bg-white pl-10"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-marigold-400 focus:bg-white pl-10 pr-10"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <DhakButton
            variant="primary"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-festive mt-2"
          >
            <span>{isLoading ? 'Authenticating...' : (mode === 'signup' ? 'Complete Committee Registration' : 'Sign In to Organizer Desk')}</span>
            <ArrowRight className="w-4 h-4" />
          </DhakButton>
        </form>

        {/* Demo Organizer Portal Quick Login */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => loginWithDemo('organizer', 'Marxgunj Club Secretary', 'marxgunj.puja@gmail.com')}
            className="w-full py-2.5 rounded-xl border border-amber-300/80 bg-amber-50/60 hover:bg-amber-100/70 text-xs font-bold text-amber-900 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-marigold-600" />
            <span>Fast Demo Login as Organizer (Marxgunj Club)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
