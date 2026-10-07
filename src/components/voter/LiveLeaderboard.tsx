'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Pandal, VoteCategory } from '@/types';
import { db, collection, query, orderBy, limit as fbLimit, onSnapshot } from '@/lib/firebase';
import { DhakButton } from '@/components/ui/DhakButton';
import { 
  Trophy, 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Palette, 
  Zap, 
  Leaf, 
  Vote, 
  Medal, 
  Crown,
  Play,
  Pause,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LiveLeaderboard: React.FC<{ limit?: number }> = ({ limit = 5 }) => {
  const { pandals, openVotingModal, castVote, isOrganizer } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'overall' | VoteCategory>('overall');
  const [isSimulatingLiveVotes, setIsSimulatingLiveVotes] = useState(false);
  const [firestorePandals, setFirestorePandals] = useState<Pandal[]>([]);

  // Direct Firestore Leaderboard Query (Top 50 ordered by total_votes desc)
  useEffect(() => {
    try {
      const q = query(
        collection(db, 'pandals'),
        orderBy('total_votes', 'desc'),
        fbLimit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: Pandal[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const basePandal = pandals.find((p) => p.id === docSnap.id);
            const totalVotes = typeof data.total_votes === 'number' ? data.total_votes : (data.totalVotes || 0);

            const defaultPandal: Pandal = {
              id: docSnap.id,
              name: data.name || docSnap.id,
              clubName: data.clubName || data.name || 'Puja Committee',
              location: typeof data.location === 'string' ? data.location : 'Paschim Bardhaman, West Bengal',
              ward: data.ward || 'Ward 01',
              nearLandmark: data.nearLandmark || 'City Centre',
              budget: data.budget || '₹25 Lakhs',
              budgetNumber: data.budgetNumber || 25,
              theme: data.theme || 'Traditional Durga Puja',
              themeDescription: data.themeDescription || 'A grand artistic showcase for Durga Puja.',
              presidentName: data.presidentName || 'Club President',
              secretaryName: data.secretaryName || 'Club Secretary',
              contactNumber: data.contactNumber || '+91 98000 00000',
              establishedYear: data.establishedYear || 1985,
              coverImage: data.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
              gallery: data.gallery || [],
              votes: { idol: 0, theme: 0, lighting: 0, eco: 0 },
              totalVotes: 0,
              tags: data.tags || ['2026'],
              isEcoFriendly: !!data.isEcoFriendly,
              visitsToday: data.visitsToday || 1,
            };

            list.push({
              ...(basePandal || defaultPandal),
              totalVotes,
              votes: data.votes ? { ...(basePandal?.votes || { idol: 0, theme: 0, lighting: 0, eco: 0 }), ...data.votes } : (basePandal?.votes || { idol: 0, theme: 0, lighting: 0, eco: 0 }),
            });
          });
          setFirestorePandals(list);
        } else {
          setFirestorePandals([]);
        }
      }, (err) => {
        console.warn('Firestore live leaderboard listener notice:', err);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore live leaderboard error:', err);
    }
  }, [pandals]);

  const activeSourcePandals = firestorePandals.length > 0 ? firestorePandals : pandals;

  // AUTOMATED LIVE CROWD VOTE SIMULATOR (Demonstrating fluid layout gliding)
  useEffect(() => {
    if (!isSimulatingLiveVotes) return;

    const interval = setInterval(() => {
      // Pick a random pandal and category to simulate an incoming vote
      if (activeSourcePandals.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(activeSourcePandals.length, 5));
        const targetPandal = activeSourcePandals[randomIndex];
        const categories: VoteCategory[] = ['idol', 'theme', 'lighting', 'eco'];
        const randomCat = categories[Math.floor(Math.random() * categories.length)];

        // Increment count directly in state to trigger fluid layout shuffle
        targetPandal.votes[randomCat] += Math.floor(Math.random() * 8) + 1;
        targetPandal.totalVotes += Math.floor(Math.random() * 8) + 1;
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulatingLiveVotes, activeSourcePandals]);

  // Sort pandals based on active filter
  const sortedPandals = [...activeSourcePandals].sort((a, b) => {
    if (selectedFilter === 'overall') {
      return b.totalVotes - a.totalVotes;
    }
    return (b.votes[selectedFilter] || 0) - (a.votes[selectedFilter] || 0);
  });

  const topPandals = sortedPandals.slice(0, limit);
  const maxVotes = sortedPandals[0] 
    ? (selectedFilter === 'overall' ? sortedPandals[0].totalVotes : sortedPandals[0].votes[selectedFilter])
    : 1;

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-yellow-950 font-black flex items-center justify-center text-base shadow-md ring-2 ring-yellow-300 animate-pulse-subtle">
            🥇
          </div>
        );
      case 1:
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-gray-300 to-gray-100 text-gray-800 font-black flex items-center justify-center text-sm shadow-sm ring-2 ring-gray-300">
            🥈
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-amber-950 font-black flex items-center justify-center text-sm shadow-sm ring-2 ring-amber-500">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs">
            #{index + 1}
          </div>
        );
    }
  };

  return (
    <section className="relative my-8 sm:my-14">
      <div className="glass-panel-warm rounded-3xl p-5 sm:p-8 border-2 border-amber-300/60 shadow-xl overflow-hidden relative">
        
        {/* Ambient golden aura background */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-gradient-to-bl from-marigold-300/25 to-sindoor-300/15 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-marigold-500 to-amber-400 text-white flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-900 tracking-tight">
                  Paschim Banga Live Leaderboard
                </h2>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-sindoor-600 bg-sindoor-50 px-2.5 py-0.5 rounded-full border border-sindoor-200">
                  <span className="w-2 h-2 rounded-full bg-sindoor-500 animate-ping" />
                  Live Ballot Tally
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Dynamic rankings powered by fluid physics. Watch pandals shuffle as votes pour in!
              </p>
            </div>
          </div>

          {/* Right Action Bar (Simulation Toggle & Category Pills) */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Live Crowd Simulation Toggle */}
            <button
              onClick={() => setIsSimulatingLiveVotes(!isSimulatingLiveVotes)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                isSimulatingLiveVotes 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
              title="Toggle automatic live crowd voting simulation to watch leaderboard cards glide"
            >
              {isSimulatingLiveVotes ? (
                <>
                  <Radio className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
                  <span>Live Shuffle On</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Live Shuffle</span>
                </>
              )}
            </button>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSelectedFilter('overall')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedFilter === 'overall'
                    ? 'btn-festive-primary shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Overall
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSelectedFilter('idol')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                  selectedFilter === 'idol'
                    ? 'bg-sindoor-500 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Sparkles className="w-3 h-3 text-sindoor-400" />
                <span>Idol</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSelectedFilter('theme')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                  selectedFilter === 'theme'
                    ? 'bg-marigold-500 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Palette className="w-3 h-3 text-marigold-400" />
                <span>Theme</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSelectedFilter('lighting')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                  selectedFilter === 'lighting'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-300" />
                <span>Lighting</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSelectedFilter('eco')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                  selectedFilter === 'eco'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Leaf className="w-3 h-3 text-emerald-300" />
                <span>Eco</span>
              </motion.button>
            </div>

          </div>
        </div>

        {/* FLUID GLIDING LEADERBOARD LIST OR CLEAN EMPTY STATE */}
        {topPandals.length === 0 ? (
          <div className="p-10 sm:p-12 text-center bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-dashed border-amber-300 space-y-2 relative z-10">
            <Trophy className="w-10 h-10 text-amber-300 mx-auto mb-2" />
            <h3 className="font-serif font-bold text-base sm:text-lg text-gray-800">
              এখনও কোনো মণ্ডপ তালিকাভুক্ত হয়নি
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              লাইভ লিডারবোর্ডে এখনও কোনো মণ্ডপ ভোট পায়নি। ভোট গ্রহণ শুরু হলে ফলাফল এখানে রিয়েল-টাইমে প্রকাশিত হবে।
            </p>
            <p className="text-[11px] text-gray-400">
              (No pandals registered in the live leaderboard yet. Standings will appear once votes are recorded.)
            </p>
          </div>
        ) : (
          <motion.div
            layout
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            className="space-y-3 relative z-10"
          >
            <AnimatePresence mode="popLayout">
              {topPandals.map((pandal, index) => {
                const votesForCategory = selectedFilter === 'overall' 
                  ? pandal.totalVotes 
                  : (pandal.votes[selectedFilter] || 0);

                const votePercent = Math.min(100, Math.round((votesForCategory / (maxVotes || 1)) * 100));
                const isRankOne = index === 0;

                return (
                  <motion.div
                    key={pandal.id}
                    layout="position"
                    variants={{
                      hidden: { opacity: 0, y: 24, scale: 0.96 },
                      visible: { 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: {
                          type: 'spring',
                          stiffness: 350,
                          damping: 28,
                        }
                      },
                    }}
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`rounded-2xl p-3.5 sm:p-4.5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group relative overflow-hidden ${
                      isRankOne
                        ? 'bg-gradient-to-r from-amber-50/95 via-white/95 to-amber-50/90 border-2 border-amber-400 radiating-aura-gold'
                        : 'bg-white/85 backdrop-blur-md border-amber-200/60 shadow-xs hover:shadow-md diya-glow-hover'
                    }`}
                  >
                    {/* Radiating subtle golden sweep for Rank #1 */}
                    {isRankOne && (
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent pointer-events-none"
                      />
                    )}

                    {/* Left: Rank, Image, Title & Progress */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="shrink-0 relative">
                        {getRankBadge(index)}
                        {isRankOne && (
                          <div className="absolute -top-3 -right-1 text-amber-500 animate-bounce">
                            <Crown className="w-4 h-4 fill-amber-400" />
                          </div>
                        )}
                      </div>

                      <img
                        src={pandal.coverImage}
                        alt={pandal.name}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 ${
                          isRankOne ? 'ring-2 ring-amber-400 shadow-md' : 'ring-1 ring-amber-300'
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate group-hover:text-sindoor-600 transition-colors">
                            {pandal.name}
                          </h3>
                          {isRankOne && (
                            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-200 to-yellow-300 text-amber-950 border border-amber-400 shadow-2xs">
                              👑 Regional Champion
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {pandal.location} • <span className="text-amber-800 font-medium">Theme: {pandal.theme}</span>
                        </p>

                        {/* Smooth Spring Progress Bar */}
                        <div className="mt-2 w-full max-w-md bg-amber-100/60 h-2 rounded-full overflow-hidden">
                          <motion.div
                            layout
                            initial={{ width: 0 }}
                            animate={{ width: `${votePercent}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            className={`h-full rounded-full ${
                              isRankOne 
                                ? 'bg-gradient-to-r from-sindoor-500 via-marigold-500 to-amber-400' 
                                : 'bg-gradient-to-r from-sindoor-500 to-marigold-500'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Vote Count & Dhak Beat Vote Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 relative z-10">
                      <div className="text-left sm:text-right">
                        <motion.span
                          key={votesForCategory}
                          initial={{ scale: 1.15, color: '#D9222A' }}
                          animate={{ scale: 1, color: '#111827' }}
                          transition={{ duration: 0.3 }}
                          className="font-serif font-black text-base sm:text-lg block leading-tight"
                        >
                          {votesForCategory.toLocaleString()}
                        </motion.span>
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                          {selectedFilter === 'overall' ? 'Total Ballots' : `${selectedFilter} Count`}
                        </span>
                      </div>

                      {!isOrganizer && (
                        <DhakButton
                          variant={isRankOne ? 'gold' : 'primary'}
                          onClick={() => openVotingModal(pandal)}
                          className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <Vote className="w-3.5 h-3.5" />
                          <span>Vote</span>
                        </DhakButton>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Footnote */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 pt-3 border-t border-amber-200/50 gap-2 relative z-10">
          <span className="flex items-center gap-1 font-medium">
            <TrendingUp className="w-4 h-4 text-marigold-600" />
            Cards automatically glide into new ranks upon incoming ballots
          </span>
          <span className="font-semibold text-amber-900">
            Paschim Banga DurgaPuja Samannay Samity Board 2026
          </span>
        </div>
      </div>
    </section>
  );
};
