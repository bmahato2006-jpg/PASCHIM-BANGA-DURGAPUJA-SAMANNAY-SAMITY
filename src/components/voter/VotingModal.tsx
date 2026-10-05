'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { VOTE_CATEGORIES } from '@/data/mockPandals';
import { VoteCategory } from '@/types';
import { DhakButton } from '@/components/ui/DhakButton';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { getOrSignInAnonymousUser } from '@/lib/firebase';
import { 
  X, 
  Sparkles, 
  Palette, 
  Zap, 
  Leaf, 
  CheckCircle, 
  Flame, 
  MapPin, 
  Vote as VoteIcon,
  AlertCircle,
  ShieldCheck,
  Lock,
  Loader2
} from 'lucide-react';

const CATEGORY_ICONS: Record<VoteCategory, React.ReactNode> = {
  idol: <Sparkles className="w-5 h-5 text-sindoor-500" />,
  theme: <Palette className="w-5 h-5 text-marigold-500" />,
  lighting: <Zap className="w-5 h-5 text-amber-500" />,
  eco: <Leaf className="w-5 h-5 text-emerald-600" />,
};

export const VotingModal: React.FC = () => {
  const { 
    isVotingModalOpen, 
    closeVotingModal, 
    selectedPandal, 
    castVote,
    user,
    votedPandals,
    exhaustedCategories,
    isPandalHonored,
    isCategoryExhausted,
    remainingTokensCount
  } = useApp();

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ category?: VoteCategory; message: string; isError?: boolean } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<VoteCategory>('idol');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isPandalVoted, setIsPandalVoted] = useState<boolean>(false);
  const [votedCategories, setVotedCategories] = useState<Record<string, boolean>>({});
  const [isCheckingVoterStatus, setIsCheckingVoterStatus] = useState<boolean>(false);

  // Mount effect to ensure client hydration parity
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-switch selected category to an available one if current is exhausted
  useEffect(() => {
    const isCurExhausted = isCategoryExhausted(selectedCategory) || exhaustedCategories.includes(selectedCategory);
    if (isCurExhausted) {
      const allCats: VoteCategory[] = ['idol', 'theme', 'lighting', 'eco'];
      const available = allCats.find(c => !isCategoryExhausted(c) && !exhaustedCategories.includes(c));
      if (available) {
        setSelectedCategory(available);
      }
    }
  }, [selectedCategory, exhaustedCategories, isCategoryExhausted]);

  // Layer 3: React 'useEffect' LocalStorage Lock & Voter State Sync (SSR-Safe)
  useEffect(() => {
    if (!selectedPandal) return;

    let isSubscribed = true;
    const pandalId = selectedPandal.id;

    // 1. Read localStorage and context strictly inside useEffect to prevent SSR hydration mismatches
    const localPandalKey = `hasVoted_${pandalId}`;
    const localHasVoted = localStorage.getItem(localPandalKey) === 'true' || isPandalHonored(pandalId) || votedPandals.includes(pandalId);

    const catMap: Record<string, boolean> = {};
    (['idol', 'theme', 'lighting', 'eco'] as VoteCategory[]).forEach((cat) => {
      const catKey = `exhaustedCategory_${cat}`;
      const hasVotedCatKey = `hasVoted_${pandalId}_${cat}`;
      if (
        localStorage.getItem(catKey) === 'true' ||
        localStorage.getItem(hasVotedCatKey) === 'true' ||
        exhaustedCategories.includes(cat) ||
        isCategoryExhausted(cat)
      ) {
        catMap[cat] = true;
      }
    });

    setIsPandalVoted(localHasVoted);
    setVotedCategories(catMap);

    return () => {
      isSubscribed = false;
    };
  }, [selectedPandal, user?.id, isPandalHonored, votedPandals, exhaustedCategories, isCategoryExhausted]);

  if (!isVotingModalOpen || !selectedPandal) return null;

  // Custom Festive Gold Dust & Sindoor Confetti Burst
  const triggerGoldDustConfetti = () => {
    try {
      const colors = ['#D9222A', '#F58220', '#FFD700', '#FFA000', '#FFF8E7', '#C41E24'];

      // Center burst
      confetti({
        particleCount: 75,
        spread: 85,
        startVelocity: 45,
        origin: { y: 0.6 },
        colors: colors,
        shapes: ['circle', 'square'],
        scalar: 1.1,
      });

      // Flanking Gold Sparkles
      setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 55,
          origin: { x: 0.15, y: 0.7 },
          colors: ['#FFD700', '#F58220', '#FFFFFF'],
          scalar: 0.9,
        });
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 55,
          origin: { x: 0.85, y: 0.7 },
          colors: ['#D9222A', '#FFD700', '#FFA000'],
          scalar: 0.9,
        });
      }, 150);
    } catch (e) {}
  };

  const handleVote = async (categoryId: VoteCategory) => {
    if (isPandalVoted || votedCategories[categoryId] || isCategoryExhausted(categoryId) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let voterUid = user?.id;
      if (!voterUid && typeof window !== 'undefined') {
        try {
          const resolvedUid = await getOrSignInAnonymousUser();
          if (resolvedUid) voterUid = resolvedUid;
        } catch {}
      }
      if (!voterUid && typeof window !== 'undefined') {
        voterUid = localStorage.getItem('durgapur_puja_anon_uid') || localStorage.getItem('durgapur_device_id') || '';
      }
      if (!voterUid) voterUid = 'anonymous_voter';

      // 1. Await API response directly from /api/vote
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: voterUid,
          user_uid: voterUid,
          voterUid,
          pandalId: selectedPandal.id,
          pandal_id: selectedPandal.id,
          category: categoryId,
        }),
      });

      const data = await res.json().catch(() => ({}));

      // 2. Status 200: trigger success toast and celebratory confetti
      if (res.status === 200) {
        toast.success('🎉 Vote Recorded Successfully!');
        triggerGoldDustConfetti();
        setIsPandalVoted(true);
        setVotedCategories((prev) => ({
          ...prev,
          [categoryId]: true,
        }));
        setFeedback({
          category: categoryId,
          message: 'Token awarded! Golden blessings of Ma Durga recorded on your device.',
          isError: false,
        });

        // Sync with local context & storage (skip second API call)
        await castVote(selectedPandal.id, categoryId, true);
      } 
      // 3. Status 409: trigger error toast with exact duplicate reason
      else if (res.status === 409) {
        const errorMsg = data.message || 'You have already voted for this pandal or used this category token.';
        toast.error(errorMsg);

        if (data.message?.includes('pandal') || data.message?.includes('honored') || data.message?.includes('already voted')) {
          setIsPandalVoted(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`hasVoted_${selectedPandal.id}`, 'true');
          }
        }
        if (data.message?.includes('category') || data.message?.includes('token') || data.message?.includes('awarded')) {
          setVotedCategories((prev) => ({
            ...prev,
            [categoryId]: true,
          }));
          if (typeof window !== 'undefined') {
            localStorage.setItem(`exhaustedCategory_${categoryId}`, 'true');
          }
        }
        setFeedback({
          category: categoryId,
          message: errorMsg,
          isError: true,
        });
      } 
      // 4. Any other non-200 status
      else {
        const errorMsg = data.message || data.error || 'Failed to submit vote. Please try again.';
        toast.error(errorMsg);
        setFeedback({
          category: categoryId,
          message: errorMsg,
          isError: true,
        });
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Vote failed to cast. Please try again.';
      toast.error(errorMsg);
      setFeedback({
        category: categoryId,
        message: errorMsg,
        isError: true,
      });
    } finally {
      // 5. Always reset isSubmitting = false in finally block
      setIsSubmitting(false);
      setTimeout(() => {
        setFeedback(null);
      }, 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 pb-28 md:pb-6 bg-black/65 backdrop-blur-md overflow-y-auto overflow-x-hidden">
      
      {/* BLOSSOMING LOTUS MODAL ANIMATION */}
      <motion.div
        initial={{ 
          opacity: 0, 
          scale: 0.6, 
          rotate: -4,
          borderRadius: '50px',
        }}
        animate={{ 
          opacity: 1, 
          scale: [0.6, 1.03, 0.98, 1],
          rotate: [-4, 1, -0.5, 0],
          borderRadius: '28px',
        }}
        exit={{ 
          opacity: 0, 
          scale: 0.7, 
          rotate: 3 
        }}
        transition={{ 
          duration: 0.55, 
          ease: [0.16, 1, 0.3, 1] 
        }}
        className="relative w-full max-w-xl md:max-w-4xl lg:max-w-5xl glass-modal rounded-3xl p-5 sm:p-7 pb-28 md:pb-7 overflow-hidden my-auto md:my-6 border-2 border-amber-300 shadow-2xl diya-glow-hover"
      >
        {/* Decorative Lotus Petal SVG Flourishes on Corners */}
        <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-20">
          <svg viewBox="0 0 100 100" fill="none">
            <path d="M100 0 C70 0 50 30 50 60 C50 80 80 100 100 100 Z" fill="url(#lotus-grad)" />
            <defs>
              <linearGradient id="lotus-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D9222A" />
                <stop offset="100%" stopColor="#F58220" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Close Button */}
        <button
          onClick={closeVotingModal}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pandal Header Summary */}
        <div className="flex items-start gap-4 mb-6 pr-8">
          <div className="relative">
            <img
              src={selectedPandal.coverImage}
              alt={selectedPandal.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-marigold-300 shadow-md shrink-0"
            />
            {/* Tiny Diya Flame on thumbnail */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-sindoor-500 ring-2 ring-white animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sindoor-600 bg-sindoor-50 px-2 py-0.5 rounded-full border border-sindoor-200">
                Official Ballot
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {selectedPandal.ward}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-black text-gray-900 mt-1 leading-snug">
              {selectedPandal.name}
            </h2>
            <p className="flex items-center gap-1 text-xs text-amber-800 font-medium mt-0.5">
              <MapPin className="w-3 h-3 text-sindoor-500 shrink-0" />
              <span>{selectedPandal.location}</span>
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -5 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-3 rounded-2xl text-xs sm:text-sm font-semibold mb-4 flex items-center gap-2 ${
                feedback.isError 
                  ? 'bg-amber-50 text-amber-800 border border-amber-300' 
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              }`}
            >
              {feedback.isError ? (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
              )}
              <span>{feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4-Token Gamified Status HUD */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 mb-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-marigold-500/15 text-sindoor-600">
                <Sparkles className="w-4 h-4 text-marigold-600 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900">4-Token Gamified Voting</h3>
                <p className="text-[10px] sm:text-[11px] text-gray-500">1 vote per pandal • Each category globally exclusive</p>
              </div>
            </div>
            <span className="text-[11px] sm:text-xs font-black text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-full border border-amber-300 shrink-0">
              {isMounted ? remainingTokensCount : 4} / 4 Tokens Available
            </span>
          </div>

          {/* 4 Token Status Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
            {VOTE_CATEGORIES.map((cat) => {
              const isExhausted = isMounted && (isCategoryExhausted(cat.id) || Boolean(votedCategories[cat.id]));
              return (
                <div
                  key={cat.id}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-bold flex items-center justify-between border transition ${
                    isExhausted
                      ? 'bg-gray-100/80 border-gray-200 text-gray-400'
                      : 'bg-white border-amber-200/80 text-gray-800 shadow-2xs'
                  }`}
                >
                  <span className="truncate">{cat.title.replace('Best ', '')}</span>
                  {isExhausted ? (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">Used</span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions banner: One Device, One Vote Policy */}
        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 mb-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Strict One Device • One Vote Policy</span>
          </div>
          {isMounted && isPandalVoted ? (
            <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Honored
            </span>
          ) : (
            <span className="font-bold text-sindoor-600 bg-white px-2 py-0.5 rounded-lg shadow-2xs border border-amber-200">
              1 Vote Per Pandal
            </span>
          )}
        </div>

        {/* 4 Voting Category Radio Buttons */}
        <div className="flex flex-col space-y-3 md:flex-row md:space-x-4 md:space-y-0 w-full" role="radiogroup" aria-label="Select Vote Category">
          {VOTE_CATEGORIES.map((cat, index) => {
            const isExhausted = isMounted && (isCategoryExhausted(cat.id) || Boolean(votedCategories[cat.id]));
            const isSelected = selectedCategory === cat.id && !isExhausted;
            const isRowDisabled = (isMounted && (isExhausted || isPandalVoted)) || isSubmitting;
            const currentVotes = selectedPandal.votes[cat.id] || 0;

            return (
              <motion.label
                key={cat.id}
                htmlFor={`category-radio-${cat.id}`}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={!isRowDisabled ? { scale: 1.025 } : {}}
                whileTap={!isRowDisabled ? { scale: 0.94 } : {}}
                transition={{ delay: 0.12 + index * 0.06, duration: 0.28 }}
                onClick={() => {
                  if (!isRowDisabled) {
                    setSelectedCategory(cat.id);
                  }
                }}
                className={`min-h-[48px] p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-row md:flex-col items-start md:items-start justify-between gap-3 select-none flex-1 min-w-0 ${
                  isExhausted
                    ? 'bg-gray-50/80 border-gray-200 opacity-60 cursor-not-allowed'
                    : (isMounted && isPandalVoted)
                    ? 'bg-gray-50/60 border-gray-200 opacity-70 cursor-not-allowed'
                    : isSelected
                    ? 'bg-amber-50/90 border-marigold-500 ring-2 ring-marigold-400/50 shadow-sm cursor-pointer'
                    : 'bg-white/90 border-gray-200 hover:border-marigold-300 hover:shadow-2xs cursor-pointer'
                }`}
              >
                {/* Left on mobile / Top on desktop: Radio Button, Icon & Details */}
                <div className="flex items-start gap-3 min-w-0 flex-1 w-full">
                  {/* Radio Input and Visual Circle */}
                  <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                    <input
                      type="radio"
                      id={`category-radio-${cat.id}`}
                      name="pandal-vote-category"
                      value={cat.id}
                      checked={isSelected}
                      disabled={isRowDisabled}
                      onChange={() => {
                        if (!isRowDisabled) setSelectedCategory(cat.id);
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isExhausted
                          ? 'border-gray-300 bg-gray-100'
                          : isSelected
                          ? 'border-sindoor-600 bg-sindoor-600 shadow-2xs'
                          : 'border-gray-400 bg-white hover:border-marigold-500'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`p-2 rounded-xl shrink-0 ${isExhausted ? 'bg-gray-100 text-gray-400' : 'bg-amber-50 border border-amber-100'}`}>
                    {CATEGORY_ICONS[cat.id]}
                  </div>

                  {/* Category Details with responsive badge wrapping */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className={`font-bold text-sm sm:text-base ${isExhausted ? 'text-gray-500 line-through' : 'text-gray-900'} truncate`}>
                        {cat.title}
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold hidden sm:inline">
                        {cat.bengaliTitle}
                      </span>
                      {isMounted && isExhausted && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs whitespace-nowrap">
                          <CheckCircle className="w-3 h-3 text-amber-700 shrink-0" />
                          Already Awarded
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* Right on mobile / Bottom-end on desktop: Live Vote Count */}
                <div className="shrink-0 flex items-center md:self-end gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 mt-0.5 md:mt-2">
                  <Flame className="w-3.5 h-3.5 text-marigold-500 shrink-0" />
                  <span>{currentVotes.toLocaleString()}</span>
                </div>
              </motion.label>
            );
          })}
        </div>

        {/* Primary Submit Button with Strict "You have already honored this pandal." Lock */}
        <div className="mt-5 pt-4 border-t border-amber-100 flex flex-col gap-3">
          {isMounted && isPandalVoted ? (
            <button
              disabled
              className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-emerald-50 text-emerald-800 border-2 border-emerald-300 shadow-2xs cursor-not-allowed opacity-90 transition"
            >
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>You have already honored this pandal.</span>
            </button>
          ) : isMounted && remainingTokensCount === 0 ? (
            <button
              disabled
              className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-gray-100 text-gray-600 border border-gray-300 shadow-2xs cursor-not-allowed transition"
            >
              <Lock className="w-5 h-5 text-gray-500" />
              <span>All 4 Voting Tokens Exhausted</span>
            </button>
          ) : isMounted && (isCategoryExhausted(selectedCategory) || Boolean(votedCategories[selectedCategory])) ? (
            <button
              disabled
              className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs cursor-not-allowed transition"
            >
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>Selected Category Already Awarded</span>
            </button>
          ) : (
            <DhakButton
              variant="gold"
              disabled={isSubmitting || isCheckingVoterStatus}
              onClick={() => handleVote(selectedCategory)}
              className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-festive"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : isCheckingVoterStatus ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Checking Ballot Security...</span>
                </>
              ) : (
                <>
                  <VoteIcon className="w-5 h-5" />
                  <span>Confirm Vote</span>
                </>
              )}
            </DhakButton>
          )}

          {/* Footer status */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1 font-mono text-[11px] text-gray-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {isMounted && isPandalVoted ? 'Device Ballot Certified' : '1 Device = 1 Certified Vote'}
            </span>
            <button
              onClick={closeVotingModal}
              className="text-sindoor-600 font-bold hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
