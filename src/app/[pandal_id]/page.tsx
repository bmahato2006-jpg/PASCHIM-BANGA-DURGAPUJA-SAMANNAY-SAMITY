'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  Palette, 
  Zap, 
  Leaf, 
  CheckCircle2, 
  Flame, 
  QrCode, 
  ShieldCheck, 
  ArrowLeft,
  Loader2
} from 'lucide-react';

// Helper to format raw slug (e.g., "marconi-dakshin-palli" -> "Marconi Dakshin Palli")
function formatPandalName(slug: string): string {
  if (!slug) return 'Puja Pandal';
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
  iconColor: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'best_idol',
    name: 'Best Idol',
    bengali: 'সেরা প্রতিমা',
    icon: <Sparkles className="w-6 h-6" />,
    gradient: 'from-rose-500/10 via-red-500/5 to-transparent',
    borderHover: 'hover:border-rose-400 group-hover:shadow-rose-500/10',
    iconBg: 'bg-rose-100/90 text-rose-600',
    iconColor: 'text-rose-600',
  },
  {
    id: 'best_theme',
    name: 'Best Theme',
    bengali: 'সেরা ভাবনা',
    icon: <Palette className="w-6 h-6" />,
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    borderHover: 'hover:border-amber-400 group-hover:shadow-amber-500/10',
    iconBg: 'bg-amber-100/90 text-amber-600',
    iconColor: 'text-amber-600',
  },
  {
    id: 'best_lighting',
    name: 'Best Lighting',
    bengali: 'সেরা আলোকসজ্জা',
    icon: <Zap className="w-6 h-6" />,
    gradient: 'from-yellow-500/10 via-amber-500/5 to-transparent',
    borderHover: 'hover:border-yellow-400 group-hover:shadow-yellow-500/10',
    iconBg: 'bg-yellow-100/90 text-yellow-600',
    iconColor: 'text-yellow-600',
  },
  {
    id: 'best_eco',
    name: 'Best Eco-Friendly',
    bengali: 'সেরা পরিবেশবান্ধব',
    icon: <Leaf className="w-6 h-6" />,
    gradient: 'from-emerald-500/10 via-green-500/5 to-transparent',
    borderHover: 'hover:border-emerald-400 group-hover:shadow-emerald-500/10',
    iconBg: 'bg-emerald-100/90 text-emerald-600',
    iconColor: 'text-emerald-600',
  },
];

export default function PandalVotingPage() {
  const params = useParams();
  const rawPandalId = (params?.pandal_id as string) || '';
  const formattedName = formatPandalName(rawPandalId);

  // Safe SSR mounting state to eliminate hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Local device state for instant visual feedback
  const [hasVotedThisPandal, setHasVotedThisPandal] = useState(false);
  const [exhaustedTokens, setExhaustedTokens] = useState<string[]>([]);
  const [votedCategoryName, setVotedCategoryName] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined' && rawPandalId) {
      // Check if this pandal has already been voted for
      const isPandalVoted = localStorage.getItem(`hasVoted_${rawPandalId}`) === 'true';
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
      const recordedCat = localStorage.getItem(`votedCategory_${rawPandalId}`);
      if (recordedCat) {
        setVotedCategoryName(recordedCat);
      }
    }
  }, [rawPandalId]);

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

  // Submit vote to the Edge API
  const handleVote = async (category: CategoryOption) => {
    if (isSubmitting) return;

    if (hasVotedThisPandal) {
      toast.error('You have already honored this pandal with a vote!');
      return;
    }

    if (exhaustedTokens.includes(category.id)) {
      toast.error(`The "${category.name}" token has already been awarded to another pandal!`);
      return;
    }

    setIsSubmitting(true);
    setActiveCategory(category.id);

    try {
      const deviceId = getDeviceId();
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          pandalId: rawPandalId,
          category: category.id,
        }),
      });

      const data = await res.json();

      if (res.status === 200 && data.success) {
        toast.success(`🎉 Vote Recorded! You awarded "${category.name}" to ${formattedName}!`, {
          duration: 5000,
        });
        setHasVotedThisPandal(true);
        setVotedCategoryName(category.name);
        setExhaustedTokens((prev) => [...prev, category.id]);

        try {
          localStorage.setItem(`hasVoted_${rawPandalId}`, 'true');
          localStorage.setItem(`exhaustedCategory_${category.id}`, 'true');
          localStorage.setItem(`votedCategory_${rawPandalId}`, category.name);
        } catch {}
      } else if (res.status === 409) {
        toast.error(data.message || 'You have already voted for this pandal or used this category token.');
        setHasVotedThisPandal(true);
      } else {
        toast.error(data.message || 'Unable to record your vote. Please try again.');
      }
    } catch (err) {
      console.error('Vote submission error:', err);
      toast.error('Network connection issue. Please try again.');
    } finally {
      setIsSubmitting(false);
      setActiveCategory(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#22150F] flex flex-col justify-between selection:bg-marigold-200 selection:text-amber-950 overflow-x-hidden">
      
      {/* Top Header / Branding */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl border-b border-amber-200/60 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-700 hover:text-sindoor-600 transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 group-hover:bg-sindoor-100 group-hover:text-sindoor-600 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-tight">QR Scanner</span>
          </Link>

          <div className="flex items-center gap-1.5 text-right">
            <Flame className="w-4 h-4 text-sindoor-500 animate-pulse" />
            <span className="text-xs font-black tracking-tight text-gray-900 font-serif">
              Paschim Bardhaman
            </span>
          </div>
        </div>
      </header>

      {/* Main Ballot Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-14">
        <div className="w-full max-w-lg mx-auto space-y-6">
          
          {/* Pandal Identification Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 text-amber-900 text-xs font-black tracking-wider uppercase shadow-2xs">
              <QrCode className="w-3.5 h-3.5 text-sindoor-500" />
              <span>Official QR Ballot</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-gray-900 tracking-tight leading-tight">
              {formattedName}
            </h1>

            <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
              {hasVotedThisPandal && isMounted ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Honored with {votedCategoryName || 'your vote'}!
                </span>
              ) : (
                'Select 1 exclusive category token to award this pandal:'
              )}
            </p>
          </div>

          {/* The 4 Classic, Large, Premium Buttons */}
          <div className="space-y-3.5 pt-2">
            {CATEGORIES.map((cat) => {
              const isExhausted = isMounted && exhaustedTokens.includes(cat.id);
              const isCurrentSubmitting = isSubmitting && activeCategory === cat.id;
              const isDisabled = isSubmitting || (isMounted && (hasVotedThisPandal || isExhausted));

              return (
                <motion.button
                  key={cat.id}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.95 } : {}}
                  onClick={() => handleVote(cat)}
                  disabled={isDisabled}
                  className={`w-full min-h-[72px] sm:min-h-[82px] px-5 py-4 rounded-2xl border transition-all text-left flex items-center justify-between group relative overflow-hidden ${
                    isDisabled
                      ? 'bg-gray-100/70 border-gray-200 opacity-60 cursor-not-allowed'
                      : `bg-white/85 backdrop-blur-xl border-amber-200/90 shadow-sm hover:shadow-xl ${cat.borderHover}`
                  }`}
                >
                  {/* Subtle Gradient Accent */}
                  {!isDisabled && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                    />
                  )}

                  {/* Left: Icon & Category Titles */}
                  <div className="flex items-center gap-4 relative z-10">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                        isDisabled ? 'bg-gray-200 text-gray-400' : cat.iconBg
                      }`}
                    >
                      {isCurrentSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin text-sindoor-600" />
                      ) : (
                        cat.icon
                      )}
                    </div>

                    <div>
                      <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight leading-snug">
                        {cat.name}
                      </h2>
                      <p className="text-xs text-amber-800 font-medium">
                        {cat.bengali}
                      </p>
                    </div>
                  </div>

                  {/* Right: State / Badge / Chevron */}
                  <div className="relative z-10 text-right shrink-0">
                    {isCurrentSubmitting ? (
                      <span className="text-xs font-bold text-sindoor-600 bg-sindoor-50 px-3 py-1 rounded-full border border-sindoor-200">
                        Submitting...
                      </span>
                    ) : isExhausted ? (
                      <span className="text-[11px] font-bold text-gray-500 bg-gray-200/80 px-2.5 py-1 rounded-full">
                        Already Used
                      </span>
                    ) : hasVotedThisPandal && isMounted ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Voted
                      </span>
                    ) : (
                      <span className="text-xs font-black text-sindoor-600 group-hover:text-sindoor-700 bg-sindoor-50/80 group-hover:bg-sindoor-100/90 px-3 py-1.5 rounded-xl border border-sindoor-200/70 transition-all flex items-center gap-1 shadow-2xs">
                        Vote
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Minimal Security Footer Note */}
          <div className="pt-4 text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-[11px] text-gray-500 font-medium bg-amber-50/60 px-3 py-1.5 rounded-full border border-amber-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Vercel Edge Network Protected • 1 Vote Per Pandal</span>
            </div>
            
            <p className="text-[11px] text-gray-400">
              Paschim Banga DurgaPuja Samannay Samity • Paschim Bardhaman Region
            </p>
          </div>

        </div>
      </main>

      {/* Clean Bottom Bar */}
      <footer className="w-full border-t border-amber-100 bg-white/70 backdrop-blur-md py-4 text-center">
        <Link
          href="/"
          className="text-xs font-bold text-gray-600 hover:text-sindoor-600 transition-colors inline-flex items-center gap-1.5"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Need to scan another pandal? Return to QR Scanner</span>
        </Link>
      </footer>

    </div>
  );
}
