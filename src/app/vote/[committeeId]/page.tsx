'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  getOrSignInAnonymousUser, 
  db, 
  doc, 
  getDoc 
} from '@/lib/firebase';
import { 
  Sparkles, 
  Palette, 
  Zap, 
  Leaf, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  ArrowLeft,
  Loader2,
  Building2,
  MapPin,
  Sparkle
} from 'lucide-react';

// Helper to format raw slug (e.g., "marconi-dakshin-palli" -> "Marconi Dakshin Palli")
function formatPandalName(slug: string): string {
  if (!slug) return 'দুর্গাপূজা মণ্ডপ (Durga Puja Pandal)';
  const decoded = decodeURIComponent(slug).replace(/[-_]+/g, ' ').trim();
  return decoded
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

interface CategoryOption {
  id: string;
  name: string;
  bengali: string;
  icon: React.ReactNode;
  gradient: string;
  borderHover: string;
  iconBg: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'best_idol',
    name: 'Best Idol',
    bengali: 'সেরা প্রতিমা',
    icon: <Sparkles className="w-6 h-6" />,
    gradient: 'from-rose-500/10 via-red-500/5 to-transparent',
    borderHover: 'hover:border-rose-400 group-hover:shadow-rose-500/10',
    iconBg: 'bg-rose-100 text-rose-600',
  },
  {
    id: 'best_theme',
    name: 'Best Theme',
    bengali: 'সেরা ভাবনা',
    icon: <Palette className="w-6 h-6" />,
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    borderHover: 'hover:border-amber-400 group-hover:shadow-amber-500/10',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'best_lighting',
    name: 'Best Lighting',
    bengali: 'সেরা আলোকসজ্জা',
    icon: <Zap className="w-6 h-6" />,
    gradient: 'from-yellow-500/10 via-amber-500/5 to-transparent',
    borderHover: 'hover:border-yellow-400 group-hover:shadow-yellow-500/10',
    iconBg: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 'best_eco',
    name: 'Best Eco-Friendly',
    bengali: 'সেরা পরিবেশবান্ধব',
    icon: <Leaf className="w-6 h-6" />,
    gradient: 'from-emerald-500/10 via-green-500/5 to-transparent',
    borderHover: 'hover:border-emerald-400 group-hover:shadow-emerald-500/10',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
];

interface CommitteeDetails {
  name: string;
  ward?: string;
  theme?: string;
}

export default function VoterPanelPage() {
  const params = useParams();
  const rawId = ((params?.committeeId || params?.pandal_id || '') as string).trim();
  const fallbackName = formatPandalName(rawId);

  // Safe SSR mounting state
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Real Committee info from Firestore
  const [committeeDetails, setCommitteeDetails] = useState<CommitteeDetails | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [committeeNotFound, setCommitteeNotFound] = useState(false);

  // Local device state for instant feedback
  const [hasVotedThisPandal, setHasVotedThisPandal] = useState(false);
  const [exhaustedTokens, setExhaustedTokens] = useState<string[]>([]);
  const [votedCategoryName, setVotedCategoryName] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Pre-authenticate anonymous voter silently
    getOrSignInAnonymousUser().catch(() => {});

    if (typeof window !== 'undefined' && rawId) {
      // Check if this committee has already been voted for (via localStorage or persistent cookie)
      let isPandalVoted = localStorage.getItem(`hasVoted_${rawId}`) === 'true';
      if (!isPandalVoted && document.cookie) {
        isPandalVoted = document.cookie
          .split(';')
          .some((c) => c.trim().startsWith(`hasVoted_${rawId}=true`));
      }
      setHasVotedThisPandal(isPandalVoted);

      // Check exhausted category tokens
      const exhausted: string[] = [];
      CATEGORIES.forEach((cat) => {
        if (
          localStorage.getItem(`exhaustedCategory_${cat.id}`) === 'true' ||
          localStorage.getItem(`exhaustedCategory_${cat.id.replace('best_', '')}`) === 'true'
        ) {
          exhausted.push(cat.id);
        }
      });
      setExhaustedTokens(exhausted);

      // Check specific category awarded to this pandal if stored
      const recordedCat = localStorage.getItem(`votedCategory_${rawId}`);
      if (recordedCat) {
        setVotedCategoryName(recordedCat);
      }

      // Fetch official committee document if exists
      const fetchCommitteeInfo = async () => {
        setIsLoadingInfo(true);
        try {
          // Check committees collection
          const commSnap = await getDoc(doc(db, 'committees', rawId));
          if (commSnap.exists()) {
            const data = commSnap.data();
            setCommitteeDetails({
              name: data.committee_name || data.name || data.clubName || fallbackName,
              ward: data.ward,
              theme: data.theme,
            });
            setCommitteeNotFound(false);
            setIsLoadingInfo(false);
            return;
          }

          // Check pandals collection
          const pandalSnap = await getDoc(doc(db, 'pandals', rawId));
          if (pandalSnap.exists()) {
            const pData = pandalSnap.data();
            setCommitteeDetails({
              name: pData.name || fallbackName,
              ward: pData.ward || pData.zone,
              theme: pData.theme,
            });
            setCommitteeNotFound(false);
            setIsLoadingInfo(false);
            return;
          }

          // If neither exists, mark as not found
          setCommitteeNotFound(true);
          setIsLoadingInfo(false);
        } catch (e) {
          console.warn('Could not fetch committee doc:', e);
          setIsLoadingInfo(false);
        }
      };

      fetchCommitteeInfo();
    } else {
      setIsLoadingInfo(false);
      setCommitteeNotFound(true);
    }
  }, [rawId, fallbackName]);

  // Helper to obtain persistent device ID
  const getDeviceId = (): string => {
    try {
      let id = localStorage.getItem('durgapur_puja_anon_uid') || localStorage.getItem('durgapur_puja_device_id') || '';
      if (!id) {
        id = `dev-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('durgapur_puja_anon_uid', id);
        localStorage.setItem('durgapur_puja_device_id', id);
      }
      return id;
    } catch {
      return `dev-${Date.now().toString(36)}`;
    }
  };

  const displayName = committeeDetails?.name || fallbackName;

  // Submit vote to the Edge API
  const handleVote = async (category: CategoryOption) => {
    if (isSubmitting) return;

    if (hasVotedThisPandal) {
      toast.error('আপনি ইতোমধ্যে এই পূজাকে ভোট প্রদান করেছেন! (You have already voted for this pandal)');
      return;
    }

    if (exhaustedTokens.includes(category.id)) {
      toast.error(`"${category.bengali} (${category.name})" টোকেনটি ইতোমধ্যে ব্যবহৃত হয়েছে! (Token already used)`);
      return;
    }

    setIsSubmitting(true);
    setActiveCategory(category.id);

    try {
      const anonUid = await getOrSignInAnonymousUser();
      const deviceId = anonUid || getDeviceId();
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          user_uid: deviceId,
          voterUid: deviceId,
          pandalId: rawId,
          pandal_id: rawId,
          category: category.id,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 200 && data.success) {
        toast.success(`🎉 আপনার ভোট সফলভাবে গৃহীত হয়েছে! আপনি ${displayName}-কে "${category.bengali}" বিভাগে ভোট দিয়েছেন। (Vote Recorded Successfully!)`, {
          duration: 5000,
        });
        setHasVotedThisPandal(true);
        setVotedCategoryName(`${category.bengali} (${category.name})`);
        setExhaustedTokens((prev) => [...prev, category.id]);

        try {
          localStorage.setItem(`hasVoted_${rawId}`, 'true');
          localStorage.setItem(`exhaustedCategory_${category.id}`, 'true');
          localStorage.setItem(`votedCategory_${rawId}`, `${category.bengali} (${category.name})`);
          document.cookie = `hasVoted_${rawId}=true; path=/; max-age=31536000; SameSite=Lax`;
        } catch {}
      } else if (res.status === 409) {
        toast.error(data.message || 'আপনি ইতোমধ্যে এই পূজাকে ভোট প্রদান করেছেন বা এই টোকেনটি ব্যবহার করেছেন। (Already voted or token used)');
        setHasVotedThisPandal(true);
        try {
          localStorage.setItem(`hasVoted_${rawId}`, 'true');
          document.cookie = `hasVoted_${rawId}=true; path=/; max-age=31536000; SameSite=Lax`;
        } catch {}
      } else {
        toast.error(data.message || 'ভোট জমা দিতে ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন। (Unable to record vote)');
      }
    } catch (err: any) {
      console.error('Vote submission error:', err);
      toast.error(err?.message || 'ইন্টারনেট সংযোগ সমস্যা। অনুগ্রহ করে পুনরায় চেষ্টা করুন। (Network error)');
    } finally {
      setIsSubmitting(false);
      setActiveCategory(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#22150F] flex flex-col justify-between selection:bg-amber-200 selection:text-amber-950 overflow-x-hidden font-sans">
      
      {/* Top Header / Branding */}
      <header className="sticky top-0 z-30 w-full bg-white/85 backdrop-blur-xl border-b border-amber-200/60 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-700 hover:text-sindoor-600 transition-colors group touch-manipulation active:scale-95 duration-75"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 group-hover:bg-sindoor-100 group-hover:text-sindoor-600 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold tracking-tight">কিউআর স্ক্যানার</span>
              <span className="text-[10px] text-gray-500 font-normal leading-none">(QR Scanner)</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-right min-w-0">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-xs border border-orange-200">
              <Image
                src="/logo.jpg"
                alt="PBDS Logo"
                width={32}
                height={32}
                priority
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col text-right truncate">
              <span className="text-[11px] sm:text-xs font-black tracking-tight text-gray-900 font-serif truncate">
                পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি
              </span>
              <span className="text-[10px] text-gray-500 truncate">
                Paschim Banga DurgaPuja Samannay Samity
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Ballot Card Wrapped in Frosted Glass with Slide-Up Entrance */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-lg mx-auto bg-white/90 backdrop-blur-md shadow-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/60 p-6 sm:p-9 space-y-6 animate-slide-up">
          
          {/* Mobile Bottom-Sheet Grab Handle Indicator */}
          <div className="w-12 h-1.5 bg-gray-300/80 rounded-full mx-auto -mt-2 mb-3 sm:hidden" />

          {/* Pandal Identification Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 text-amber-900 text-xs font-black tracking-wider uppercase shadow-2xs">
              <QrCode className="w-3.5 h-3.5 text-sindoor-600" />
              <span>অফিসিয়াল ডিজিটাল ব্যালট (Official Ballot)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-gray-900 tracking-tight leading-snug">
              {committeeNotFound ? 'মণ্ডপ খুঁজে পাওয়া যায়নি (Pandal Not Found)' : displayName}
            </h1>

            {/* Ward / Zone and Theme Badges if available */}
            {!committeeNotFound && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                {committeeDetails?.ward && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-900">
                    <MapPin className="w-3 h-3 text-amber-600" />
                    <span>{committeeDetails.ward}</span>
                  </span>
                )}
                {committeeDetails?.theme && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 border border-orange-200 text-orange-900">
                    <Sparkle className="w-3 h-3 text-orange-600" />
                    <span>ভাবনা: {committeeDetails.theme}</span>
                  </span>
                )}
              </div>
            )}

            {/* Loading / Pandal Not Found / Already Voted State vs Voting Cards */}
            {isLoadingInfo ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 text-sindoor-600 animate-spin" />
                <p className="text-xs sm:text-sm font-bold text-gray-700">মণ্ডপের বিবরণ যাচাই করা হচ্ছে...</p>
                <p className="text-[11px] text-gray-400 font-medium">(Verifying pandal details from registry...)</p>
              </div>
            ) : committeeNotFound ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="py-8 px-6 sm:px-8 rounded-3xl bg-gradient-to-b from-amber-50/90 via-white to-orange-50/40 border border-amber-300/80 shadow-sm text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto text-amber-700 shadow-2xs">
                  <Building2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg sm:text-xl font-serif font-black text-gray-900 tracking-tight leading-snug">
                    এই মণ্ডপটি এখনও নিবন্ধিত হয়নি
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-amber-900">
                    This pandal is not registered yet
                  </p>
                  <p className="text-xs text-gray-600 max-w-sm mx-auto pt-1 leading-relaxed">
                    পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির অফিসিয়াল তালিকায় এই মণ্ডপটি এখনও তালিকাভুক্ত হয়নি বা অনুমোদন অপেক্ষমান রয়েছে।
                  </p>
                  <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                    (This pandal is not yet registered or is awaiting administrative approval in the official directory.)
                  </p>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <Link
                    href="/"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sindoor-600 hover:bg-sindoor-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 touch-manipulation"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>মূল পাতায় ফিরে যান (Back to Homepage)</span>
                  </Link>
                </div>

                <div className="pt-2 text-[11px] text-gray-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>অফিসিয়াল যাচাইকরণ সক্রিয় • অননুমোদিত ভোটিং প্রতিহত</span>
                </div>
              </motion.div>
            ) : hasVotedThisPandal && isMounted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="py-8 px-6 sm:px-8 rounded-3xl bg-gradient-to-b from-emerald-50/90 via-white to-amber-50/40 border border-emerald-200/90 shadow-sm text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg sm:text-xl font-serif font-black text-gray-900 tracking-tight leading-snug">
                    ধন্যবাদ! আপনি ইতোমধ্যে এই কমিটিকে ভোট প্রদান করেছেন।
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-emerald-800">
                    Thank you! You have already voted for this committee.
                  </p>
                  {votedCategoryName && (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-900 border border-emerald-300/80">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        <span>প্রদত্ত ভোট: {votedCategoryName}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <Link
                    href="/"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sindoor-600 hover:bg-sindoor-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 touch-manipulation"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>অন্যান্য মণ্ডপ স্ক্যান করুন (Scan Other Pandals)</span>
                  </Link>
                </div>

                <div className="pt-2 text-[11px] text-gray-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ডিভাইস নিরাপত্তা যাচাইকৃত • ১ ডিভাইসে ১ ভোট নিয়ম কার্যকর</span>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="space-y-0.5 pt-1">
                  <p className="text-xs sm:text-sm font-bold text-gray-800">
                    এই পূজাকে সম্মানিত করতে নিচের ১টি বিভাগ বেছে নিন:
                  </p>
                  <p className="text-[11px] text-gray-500">
                    (Select 1 category token below to cast your verified ballot)
                  </p>
                </div>

                {/* The 4 Gamified Category Voting Cards */}
                <div className="space-y-3 pt-3">
                  {CATEGORIES.map((cat) => {
                    const isExhausted = isMounted && exhaustedTokens.includes(cat.id);
                    const isCurrentSubmitting = isSubmitting && activeCategory === cat.id;
                    const isDisabled = isSubmitting || (isMounted && isExhausted);

                    return (
                      <motion.button
                        key={cat.id}
                        whileHover={!isDisabled ? { scale: 1.015 } : {}}
                        whileTap={!isDisabled ? { scale: 0.96 } : {}}
                        onClick={() => handleVote(cat)}
                        disabled={isDisabled}
                        className={`w-full min-h-[72px] sm:min-h-[78px] px-4 sm:px-5 py-3.5 rounded-2xl border transition-all text-left flex items-center justify-between group relative overflow-hidden touch-manipulation ${
                          isDisabled
                            ? 'bg-gray-100/70 border-gray-200 opacity-60 cursor-not-allowed'
                            : `bg-white/85 backdrop-blur-md border-amber-200/80 shadow-xs hover:shadow-lg active:scale-95 duration-75 ${cat.borderHover}`
                        }`}
                      >
                        {/* Subtle Gradient Accent */}
                        {!isDisabled && (
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                          />
                        )}

                        {/* Left: Icon & Category Titles */}
                        <div className="flex items-center gap-3.5 relative z-10">
                          <div
                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${
                              isDisabled ? 'bg-gray-200 text-gray-400' : cat.iconBg
                            }`}
                          >
                            {isCurrentSubmitting ? (
                              <Loader2 className="w-5 h-5 animate-spin text-sindoor-600" />
                            ) : (
                              cat.icon
                            )}
                          </div>

                          <div>
                            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight leading-snug">
                              {cat.bengali}
                            </h2>
                            <p className="text-xs text-amber-800 font-medium">
                              {cat.name}
                            </p>
                          </div>
                        </div>

                        {/* Right: State / Badge */}
                        <div className="relative z-10 text-right shrink-0">
                          {isCurrentSubmitting ? (
                            <span className="text-xs font-bold text-sindoor-600 bg-sindoor-50 px-3 py-1 rounded-full border border-sindoor-200 flex items-center gap-1.5 shadow-2xs">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>জমা হচ্ছে...</span>
                            </span>
                          ) : isExhausted ? (
                            <div className="flex flex-col items-end">
                              <span className="text-[11px] font-bold text-gray-600 bg-gray-200/80 px-2.5 py-0.5 rounded-full">
                                ব্যবহৃত
                              </span>
                              <span className="text-[9px] text-gray-400">(Used)</span>
                            </div>
                          ) : (
                            <span className="text-xs font-black text-sindoor-600 group-hover:text-sindoor-700 bg-sindoor-50/80 group-hover:bg-sindoor-100/90 px-3 py-1.5 rounded-xl border border-sindoor-200/70 transition-all flex items-center gap-1 shadow-2xs">
                              <span>ভোট দিন</span>
                              <span className="text-[10px] font-normal opacity-80">(Vote)</span>
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Security & Token Rule Note */}
          <div className="pt-2 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-gray-600 font-medium bg-amber-50/80 px-3 py-1.5 rounded-full border border-amber-200/70">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>নিরাপদ ভোট • ১ ডিভাইসে ১ ভোট (1 Vote Per Device)</span>
            </div>
            
            <p className="text-[11px] text-gray-400">
              পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • পশ্চিম বর্ধমান অঞ্চল
            </p>
          </div>

        </div>
      </main>

      {/* Clean Bottom Bar with Return Link */}
      <footer className="w-full border-t border-amber-200/60 bg-white/70 backdrop-blur-md py-4 text-center">
        <Link
          href="/"
          className="text-xs font-bold text-gray-700 hover:text-sindoor-600 transition-colors inline-flex items-center gap-1.5 touch-manipulation active:scale-95 duration-75"
        >
          <QrCode className="w-3.5 h-3.5 text-sindoor-600 shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 leading-tight">
            <span>অন্য মণ্ডপ স্ক্যান করতে চান? কিউআর স্ক্যানারে ফিরে যান</span>
            <span className="text-[10px] opacity-75 font-normal text-gray-500">(Return to QR Scanner to scan another pandal)</span>
          </div>
        </Link>
      </footer>

    </div>
  );
}
