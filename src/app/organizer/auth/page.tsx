'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth, GoogleAuthProvider, signInWithPopup } from '@/lib/firebase';
import { getCommitteeByUser } from '@/lib/committeeService';
import { DhakButton } from '@/components/ui/DhakButton';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  Sparkles,
  Lock,
  Building2,
} from 'lucide-react';

function OrganizerAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode');

  // Default view MUST be "Registration" (isFlipped = false)
  // If ?mode=login is explicitly passed, start flipped (isFlipped = true)
  const [isFlipped, setIsFlipped] = useState(initialMode === 'login');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialMode === 'login') {
      setIsFlipped(true);
    } else if (initialMode === 'register') {
      setIsFlipped(false);
    }
  }, [initialMode]);

  const handleOAuth = async (action: 'register' | 'login') => {
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Strict 1-to-1 data check by user.uid
      const { committee } = await getCommitteeByUser(user.uid);
      if (committee) {
        toast.success(`Welcome back, ${committee.committee_name}!`);
        router.replace('/dashboard/organizer');
      } else {
        toast.success('Account authenticated. Complete your committee setup.');
        router.replace('/organizer/setup');
      }
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err?.message || `${action === 'register' ? 'Registration' : 'Login'} failed.`);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#22150F] flex flex-col justify-center items-center px-4 py-8 relative selection:bg-marigold-200 selection:text-amber-950 overflow-x-hidden">
      {/* Background Radial Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[550px] rounded-full blur-[130px] opacity-25 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(245, 130, 32, 0.45) 0%, rgba(217, 34, 42, 0.25) 50%, transparent 75%)',
        }}
      />

      {/* Navigation Return & Mode Indicator */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-sindoor-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>মূল পাতায় ফিরে যান (Back to Feed)</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200/80 transition-all shadow-xs"
        >
          <RotateCw className="w-3 h-3 text-amber-700 transition-transform duration-500 hover:rotate-180" />
          <span>{isFlipped ? 'কমিটি নিবন্ধন (Register)' : 'অর্গানাইজার লগইন (Login)'}</span>
        </button>
      </div>

      {/* 3D Flip Card Container */}
      <div className="w-full max-w-md [perspective:1000px] relative z-10">
        <div
          className={`relative w-full [transform-style:preserve-3d] transition-transform duration-700 ease-in-out ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* ============================================================ */}
          {/* FRONT FACE: REGISTRATION (DEFAULT)                           */}
          {/* ============================================================ */}
          <div
            className={`w-full glass-panel p-6 sm:p-8 rounded-3xl border border-amber-200/70 shadow-[0_15px_45px_rgba(217,34,42,0.12)] [backface-visibility:hidden] ${
              isFlipped ? 'pointer-events-none select-none invisible sm:visible' : 'relative z-10'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Header Branding */}
            <div className="text-center mb-5">
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
                অফিশিয়াল পিবিডিএস রেজিস্ট্রি (Official PBDS Registry)
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight">
                <span className="block text-xl sm:text-2xl font-sans font-bold text-gray-900 mb-0.5">কমিটি নিবন্ধন</span>
                <span className="text-sm sm:text-base font-serif font-black text-amber-900">(Register Committee)</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
                আপনার পূজা কমিটির কিউআর কোড তৈরি করতে Google দিয়ে নিবন্ধন করুন। 
                <span className="block text-[11px] text-gray-500 mt-0.5">(Connect Google account to register and generate voting QR).</span>
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-2 mb-5 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/70">
              <div className="flex items-center gap-2 text-xs text-amber-950 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>তাত্ক্ষণিক গেট ভোটিং কিউআর কোড (Gate Voting QR)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-950 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>লাইভ ভোটিং ও অ্যানালিটিক্স ডেস্ক (Live Voting Desk)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-950 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>দুর্গাপুর পূজা সম্মাননা ২০২৬ এর মনোনয়ন (Awards 2026)</span>
              </div>
            </div>

            {/* Front Action: Register with Google */}
            <div className="py-1">
              <DhakButton
                variant="primary"
                type="button"
                onClick={() => handleOAuth('register')}
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-3 shadow-festive touch-manipulation active:scale-95 transition-all"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#ffffff"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#ffffff"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#ffffff"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#ffffff"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>{isLoading ? 'Google এর সাথে যুক্ত হচ্ছে... (Connecting...)' : 'Google দিয়ে লগইন করুন (Login with Google)'}</span>
              </DhakButton>
            </div>

            {/* Flip Link to Login Face */}
            <div className="mt-5 pt-4 border-t border-amber-200/70 text-center">
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sindoor-600 hover:text-sindoor-700 transition group cursor-pointer"
              >
                <span>ইতোমধ্যে নিবন্ধিত? এখানে লগইন করুন (Already registered? Login here)</span>
                <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* BACK FACE: LOGIN (180deg ROTATED)                            */}
          {/* ============================================================ */}
          <div
            className={`absolute inset-0 w-full h-full glass-panel p-6 sm:p-8 rounded-3xl border border-amber-200/70 shadow-[0_15px_45px_rgba(217,34,42,0.12)] flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] ${
              !isFlipped ? 'pointer-events-none select-none invisible sm:visible' : 'z-10'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div>
              {/* Header Branding */}
              <div className="text-center mb-5">
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
                  পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি (Paschim Banga DurgaPuja Samannay Samity)
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight">
                  <span className="block text-xl sm:text-2xl font-sans font-bold text-gray-900 mb-0.5">অর্গানাইজার লগইন</span>
                  <span className="text-sm sm:text-base font-serif font-black text-amber-900">(Organizer Sign In)</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  নিবন্ধিত পূজা কমিটির অনুমোদিত পোর্টাল। আপনার গেট কিউআর কোড ও লাইভ ভোটিং ডেস্ক পেতে লগইন করুন। 
                  <span className="block text-[11px] text-gray-500 mt-0.5">(Sign in for Gate QR & Live Voting Desk).</span>
                </p>
              </div>

              {/* Security Notice */}
              <div className="mb-5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-center">
                <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                  🔒 শুধুমাত্র অনুমোদিত পূজা কমিটি সাইন ইন করতে পারবেন। নতুন কমিটি হলে অনুগ্রহ করে নিবন্ধন সম্পন্ন করুন।
                  <span className="block text-[10px] text-amber-800/80 mt-0.5">
                    (Only authorized committees can sign in. Unregistered committees will be redirected to registration).
                  </span>
                </p>
              </div>

              {/* Back Action: Login with Google */}
              <div className="py-1">
                <DhakButton
                  variant="secondary"
                  type="button"
                  onClick={() => handleOAuth('login')}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-3 border border-amber-300 bg-white hover:bg-amber-50 shadow-md touch-manipulation active:scale-95 transition-all"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
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
                  )}
                  <span>{isLoading ? 'Google এর সাথে যুক্ত হচ্ছে... (Connecting...)' : 'Google দিয়ে লগইন করুন (Login with Google)'}</span>
                </DhakButton>
              </div>
            </div>

            {/* Flip Link to Register Face */}
            <div className="mt-5 pt-4 border-t border-amber-200/70 text-center">
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sindoor-600 hover:text-sindoor-700 transition group cursor-pointer"
              >
                <span>নতুন কমিটি? এখানে নিবন্ধন করুন (New committee? Register here)</span>
                <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrganizerAuthContent />
    </Suspense>
  );
}
