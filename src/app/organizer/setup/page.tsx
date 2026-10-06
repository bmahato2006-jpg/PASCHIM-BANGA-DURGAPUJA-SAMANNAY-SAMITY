'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { auth, onAuthStateChanged, signOut, FirebaseUser } from '@/lib/firebase';
import { 
  checkCommitteeExists, 
  registerCommittee, 
  slugifyCommitteeName, 
  getCommitteeByUser 
} from '@/lib/committeeService';
import { isSuperAdmin } from '@/lib/admin';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { DhakButton } from '@/components/ui/DhakButton';
import toast from 'react-hot-toast';
import { 
  Building2, 
  MapPin, 
  User, 
  Phone, 
  Palette, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  QrCode, 
  ArrowRight,
  LogOut
} from 'lucide-react';

export default function OrganizerSetupPage() {
  const router = useRouter();
  const { registerOrUpdatePandal } = useApp();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Form Fields
  const [committeeName, setCommitteeName] = useState('');
  const [secretaryName, setSecretaryName] = useState('');
  const [ward, setWard] = useState('Ward 12');
  const [contactNumber, setContactNumber] = useState('');
  const [theme, setTheme] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentSlug = slugifyCommitteeName(committeeName);

  // Check auth and ensure committee doesn't already exist
  useEffect(() => {
    let isSubscribed = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (isSubscribed) {
          router.replace('/organizer/auth');
        }
        return;
      }

      if (isSubscribed) {
        setCurrentUser(user);
        if (user.displayName) {
          setSecretaryName(user.displayName);
        }
      }

      // 1. Super Admin VIP Bypass: Redirect directly to /dashboard/admin
      if (isSuperAdmin(user.email)) {
        if (isSubscribed) {
          toast.success('সুপার অ্যাডমিন অধিবেশন সক্রিয় (Bypassing setup to Admin Panel...)', {
            id: 'super-admin-setup-bypass',
            duration: 3000,
          });
          router.replace('/dashboard/admin');
        }
        return;
      }

      // 2. Normal User: Check if committee is already registered in Firestore strictly by UID
      const { committee } = await getCommitteeByUser(user.uid);
      if (committee) {
        if (isSubscribed) {
          toast('Account already registered. Redirecting to your dashboard...', {
            id: 'already-registered',
            icon: 'ℹ️',
          });
          router.replace('/dashboard/organizer');
        }
        return;
      }

      if (isSubscribed) {
        setIsVerifying(false);
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!committeeName.trim()) {
      setError('Please enter your official Puja Committee / Pandal Name.');
      return;
    }

    if (!secretaryName.trim()) {
      setError('Please provide Secretary or General Representative Name.');
      return;
    }

    if (!contactNumber.trim()) {
      setError('Please provide an official contact phone number.');
      return;
    }

    if (!currentUser) {
      toast.error('Session expired. Please sign in again.');
      router.replace('/organizer/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Strict Uniqueness Check before submission
      const { exists, conflictingName } = await checkCommitteeExists(committeeName, currentSlug);

      if (exists) {
        setIsSubmitting(false);
        const errMsg = 'This Committee is already registered by another account.';
        setError(errMsg);
        toast.error(errMsg, {
          id: 'duplicate-committee-error',
          duration: 5000,
        });
        return;
      }

      // 2. Insert into Firestore committees collection
      const regRes = await registerCommittee({
        userId: currentUser.uid,
        committeeName: committeeName.trim(),
        slug: currentSlug,
        ward: ward.trim() || 'Ward 12',
        secretaryName: secretaryName.trim(),
        contactNumber: contactNumber.trim(),
        email: currentUser.email || '',
        theme: theme.trim() || 'Traditional Durga Puja',
      });

      if (!regRes.success) {
        setIsSubmitting(false);
        const failMsg = regRes.error || 'Failed to complete committee registration.';
        setError(failMsg);
        toast.error(failMsg, {
          id: 'reg-fail-toast',
        });
        return;
      }

      // 3. Update AppContext
      registerOrUpdatePandal({
        id: currentSlug,
        name: committeeName.trim(),
        clubName: committeeName.trim(),
        ward: ward.trim() || 'Ward 12',
        location: `Durgapur, ${ward.trim() || 'Ward 12'}`,
        secretaryName: secretaryName.trim(),
        contactNumber: contactNumber.trim(),
        theme: theme.trim() || 'Traditional Durga Puja',
        themeDescription: 'Official puja entry registered with Paschim Banga DurgaPuja Samannay Samity.',
        totalVotes: 0,
        votes: { idol: 0, theme: 0, lighting: 0, eco: 0 },
      });

      toast.success('Committee registered successfully! Welcome to your Organizer Dashboard.', {
        id: 'reg-success-toast',
        duration: 4000,
      });

      router.replace('/dashboard/organizer');
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Unexpected registration error.');
      toast.error(err?.message || 'Unexpected registration error.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/organizer/auth');
  };

  if (isVerifying || (currentUser && isSuperAdmin(currentUser.email))) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-marigold-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-800">
          {currentUser && isSuperAdmin(currentUser.email)
            ? 'সুপার অ্যাডমিন অধিবেশন পুনর্নির্দেশ করা হচ্ছে (Redirecting Super Admin...)'
            : 'Verifying Account Status...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#22150F] flex flex-col justify-center items-center px-4 py-8 relative selection:bg-marigold-200 selection:text-amber-950">
      {/* Background Radial Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full blur-[130px] opacity-25 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(245, 130, 32, 0.45) 0%, rgba(217, 34, 42, 0.25) 50%, transparent 75%)',
        }}
      />

      {/* Top Header Controls */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Google Connected: <strong className="text-gray-900">{currentUser?.email}</strong></span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-600 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch Account</span>
        </button>
      </div>

      {/* Main Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-amber-200/70 shadow-[0_15px_45px_rgba(217,34,42,0.12)] relative z-10"
      >
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden shadow-sm border border-orange-200 flex items-center justify-center">
            <Image
              src="/logo.jpg"
              alt="PBDS Logo"
              width={64}
              height={64}
              priority
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="inline-block text-[10px] font-black tracking-wider uppercase text-amber-900 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-full mb-1.5">
            Step 2: Onboarding Setup
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight">
            Register <span className="festive-gradient-text">Puja Committee</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-sm mx-auto">
            Enter your official Committee & Pandal details to generate your universal Gate QR Standee.
          </p>
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

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Committee Name with Live Uniqueness Slug Preview */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Puja Committee / Pandal Name *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={committeeName}
                onChange={(e) => setCommitteeName(e.target.value)}
                placeholder="e.g. Bidhan Nagar Sarbojanin Durgotsav"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 bg-white font-medium select-text"
              />
            </div>
            {committeeName.trim() && (
              <div className="mt-1.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                <span>Unique Voting Slug:</span>
                <span className="font-mono font-bold text-sindoor-600">/{currentSlug}</span>
              </div>
            )}
          </div>

          {/* Secretary & Ward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Secretary / Representative *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={secretaryName}
                  onChange={(e) => setSecretaryName(e.target.value)}
                  placeholder="e.g. Subir Ghosh"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 bg-white select-text"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                DMC Ward *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="Ward 12"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 bg-white select-text"
                />
              </div>
            </div>
          </div>

          {/* Contact Phone & Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Official Contact Phone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 bg-white select-text"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Pandal Theme / Concept
              </label>
              <div className="relative">
                <Palette className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. Bengal Terracotta"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 bg-white select-text"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3">
            <DhakButton
              variant="primary"
              type="submit"
              disabled={isSubmitting || !committeeName.trim()}
              className="w-full min-h-[50px] py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-festive touch-manipulation active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Building2 className="w-4 h-4 text-white" />
                  <span>Save Committee & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-white ml-1" />
                </>
              )}
            </DhakButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
