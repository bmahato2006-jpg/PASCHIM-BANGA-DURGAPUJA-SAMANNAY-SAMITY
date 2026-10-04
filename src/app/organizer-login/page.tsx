'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { DhakButton } from '@/components/ui/DhakButton';
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Flame, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function OrganizerLoginPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [clubName, setClubName] = useState('');
  const [secretaryName, setSecretaryName] = useState('');
  const [ward, setWard] = useState('Ward 12');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if session already active; if so, redirect immediately
  useEffect(() => {
    const checkActiveSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/?tab=organizer');
      }
    };
    checkActiveSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/?tab=organizer');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    const res = await signInWithGoogle('organizer');
    if (!res.success) {
      setError(res.error || 'Google Sign-In failed.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    if (mode === 'signup') {
      const res = await signUpWithEmail(email, password, 'organizer', secretaryName || clubName || 'Organizer');
      setIsLoading(false);
      if (res.success) {
        router.push('/?tab=organizer');
      } else {
        setError(res.error || 'Failed to register committee organizer account.');
      }
    } else {
      const res = await signInWithEmail(email, password, 'organizer');
      setIsLoading(false);
      if (res.success) {
        router.push('/?tab=organizer');
      } else {
        setError(res.error || 'Sign in failed. Verify your email and password.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#22150F] flex flex-col justify-center items-center px-4 py-8 relative selection:bg-marigold-200 selection:text-amber-950">
      
      {/* Background Radial Glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full blur-[130px] opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245, 130, 32, 0.45) 0%, rgba(217, 34, 42, 0.25) 50%, transparent 75%)',
        }}
      />

      {/* Return link */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-sindoor-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Devotee Voting Feed</span>
        </button>
        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Authorized Desk Only</span>
        </div>
      </div>

      {/* Main Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-amber-200/70 shadow-[0_15px_45px_rgba(217,34,42,0.12)] relative z-10"
      >
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-marigold-500 to-sindoor-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Building2 className="w-7 h-7 text-marigold-600" />
            </div>
          </div>
          <span className="inline-block text-[10px] font-black tracking-wider uppercase text-amber-900 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-full mb-1.5">
            Paschim Banga DurgaPuja Samannay Samity Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight">
            Organizer <span className="festive-gradient-text">Portal</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xs mx-auto">
            Manage your pandal showcase, inspect scan metrics, and download the Official 300 DPI QR Standee.
          </p>
        </div>

        {/* Google Sign-In for Organizers */}
        <div className="mb-4">
          <DhakButton
            variant="secondary"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-3 border border-amber-300/80 bg-white hover:bg-amber-50/70 shadow-xs"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google as Organizer'}</span>
          </DhakButton>
        </div>

        <div className="relative flex items-center justify-center mb-4">
          <div className="border-t border-amber-200/80 w-full" />
          <span className="bg-[#FFFDF9] px-3 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
            Or with Committee Email
          </span>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex rounded-2xl bg-amber-50/80 p-1 border border-amber-200/70 mb-5">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signin'
                ? 'bg-white text-gray-900 shadow-xs border border-amber-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign In to Existing Club
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-white text-gray-900 shadow-xs border border-amber-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Register New Committee
          </button>
        </div>

        {/* Error Feedback */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-2xl bg-red-50 text-red-800 text-xs font-semibold mb-4 border border-red-200 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Puja Committee / Club Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder="e.g. Marxgunj Sarbojanin Durgotsav"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Secretary Name
                  </label>
                  <input
                    type="text"
                    required
                    value={secretaryName}
                    onChange={(e) => setSecretaryName(e.target.value)}
                    placeholder="e.g. Subir Ghosh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    DMC Ward
                  </label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="Ward 12"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 bg-white"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Registered Organizer Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="committee.secretary@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <DhakButton
              variant="primary"
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-festive"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Building2 className="w-4 h-4 text-white" />
                  <span>{mode === 'signup' ? 'Create Organizer Account' : 'Sign In as Organizer'}</span>
                </>
              )}
            </DhakButton>
          </div>
        </form>

      </motion.div>
    </div>
  );
}
