'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { VoteCategory, Pandal } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { DhakButton } from '@/components/ui/DhakButton';
import { 
  Vote, 
  Sparkles, 
  Palette, 
  Zap, 
  Leaf, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Building2, 
  Flame, 
  ArrowRight,
  ShieldCheck,
  Eye,
  Award
} from 'lucide-react';

interface MyVotesViewProps {
  onExplore?: () => void;
  onViewPandalDetails?: (pandal: Pandal) => void;
}

const CATEGORY_META: Record<VoteCategory, { label: string; bengali: string; icon: React.ReactNode; color: string; badgeBg: string }> = {
  idol: {
    label: 'Best Idol',
    bengali: 'সেরা প্রতিমা',
    icon: <Sparkles className="w-3.5 h-3.5 text-rose-500" />,
    color: 'text-rose-700',
    badgeBg: 'bg-rose-50 border-rose-200',
  },
  theme: {
    label: 'Best Theme',
    bengali: 'সেরা ভাবনা',
    icon: <Palette className="w-3.5 h-3.5 text-orange-500" />,
    color: 'text-orange-700',
    badgeBg: 'bg-orange-50 border-orange-200',
  },
  lighting: {
    label: 'Best Lighting',
    bengali: 'সেরা আলোকসজ্জা',
    icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
    color: 'text-amber-700',
    badgeBg: 'bg-amber-50 border-amber-200',
  },
  eco: {
    label: 'Best Eco-Friendly',
    bengali: 'সেরা পরিবেশ',
    icon: <Leaf className="w-3.5 h-3.5 text-emerald-600" />,
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 border-emerald-200',
  },
};

export const MyVotesView: React.FC<MyVotesViewProps> = ({ 
  onExplore, 
  onViewPandalDetails 
}) => {
  const { user, userVotes, pandals, openQRScanner } = useApp();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter votes belonging to current device / voter (SSR-safe: neutral empty state while !isMounted)
  const currentVotes = isMounted
    ? (user ? userVotes.filter(v => v.userId === user.id || !v.userId) : userVotes)
    : [];

  // Group votes by Pandal ID
  const groupedVotesByPandal: Record<string, { pandal: Pandal; votes: typeof currentVotes }> = {};

  currentVotes.forEach(v => {
    const p = pandals.find(item => item.id === v.pandalId);
    if (p) {
      if (!groupedVotesByPandal[p.id]) {
        groupedVotesByPandal[p.id] = { pandal: p, votes: [] };
      }
      groupedVotesByPandal[p.id].votes.push(v);
    }
  });

  const uniquePandalsCount = Object.keys(groupedVotesByPandal).length;
  const uniqueCategoriesVoted = new Set(currentVotes.map(v => v.category)).size;

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sindoor-50 via-marigold-50 to-amber-50 border border-marigold-300 text-amber-900 text-xs font-bold mb-3 shadow-2xs">
          <Flame className="w-4 h-4 text-sindoor-500 animate-pulse" />
          <span>VOTER HALL OF DEVOTION • আমার ভোট ইতিহাস</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-gray-900 tracking-tight">
          My Voting Ballot & <span className="festive-gradient-text">Honored Pandals</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-xl mx-auto">
          Here is your permanent voting ledger for Paschim Banga DurgaPuja Samannay Samity 2026.
        </p>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          <div className="glass-panel p-4 rounded-2xl border border-amber-200/80 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Total Ballots Cast</span>
            <span className="text-2xl font-black text-sindoor-600 mt-0.5 block">{currentVotes.length}</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-amber-200/80 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Pandals Honored</span>
            <span className="text-2xl font-black text-marigold-600 mt-0.5 block">{uniquePandalsCount}</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-amber-200/80 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Categories Voted</span>
            <span className="text-2xl font-black text-amber-700 mt-0.5 block">{uniqueCategoriesVoted} / 4</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-amber-200/80 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Voter Status</span>
            <span className="text-xs font-black text-green-700 mt-2 inline-flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      {currentVotes.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel-warm rounded-3xl p-8 sm:p-14 text-center max-w-xl mx-auto border-2 border-amber-300 shadow-xl my-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-amber-100/80 border border-amber-300 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Flame className="w-10 h-10 text-sindoor-500 animate-pulse-subtle" />
          </div>
          <h3 className="text-2xl font-serif font-black text-gray-900">
            No Votes Recorded Yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
            You haven’t cast your ballot for any pandal yet. Scan official QR codes across the region’s grandest puja pavilions and vote across Idol, Theme, Lighting, and Eco-friendly criteria!
          </p>
          <div className="mt-8 flex justify-center">
            <DhakButton
              variant="primary"
              onClick={onExplore}
              className="px-6 py-3.5 rounded-2xl text-sm font-bold shadow-festive"
            >
              <span>Explore Pandals & Vote Now</span>
              <ArrowRight className="w-4 h-4" />
            </DhakButton>
          </div>
        </motion.div>
      ) : (
        /* Voted Pandals List */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {Object.values(groupedVotesByPandal).map(({ pandal, votes }) => (
            <motion.div
              key={pandal.id}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card-premium rounded-3xl overflow-hidden border border-amber-200/80 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Pandal Cover & Badges */}
                <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                  <img
                    src={pandal.coverImage}
                    alt={pandal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-gray-900 backdrop-blur-md flex items-center gap-1 shadow-sm">
                      <MapPin className="w-3 h-3 text-sindoor-500" />
                      <span>{pandal.location}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-sindoor-500 to-marigold-500 text-white shadow-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{votes.length} Category {votes.length === 1 ? 'Vote' : 'Votes'}</span>
                    </span>
                  </div>

                  {/* Pandal Title */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                      {pandal.clubName}
                    </span>
                    <h3 className="font-serif font-black text-lg leading-tight truncate drop-shadow-md">
                      {pandal.name}
                    </h3>
                  </div>
                </div>

                {/* Categories Voted List */}
                <div className="p-4 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                    Your Cast Ballots for this Pandal:
                  </span>

                  <div className="space-y-2">
                    {votes.map((vote) => {
                      const meta = CATEGORY_META[vote.category];
                      const dateStr = new Date(vote.timestamp).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={vote.category}
                          className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 ${meta.badgeBg}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-xl bg-white shadow-2xs">
                              {meta.icon}
                            </div>
                            <div>
                              <span className={`text-xs font-bold block leading-tight ${meta.color}`}>
                                Voted for {meta.label}
                              </span>
                              <span className="text-[10px] text-gray-500 block">
                                {meta.bengali}
                              </span>
                            </div>
                          </div>
                          
                          <span className="text-[10px] text-gray-500 font-medium shrink-0">
                            {dateStr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-4 pt-0">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => onViewPandalDetails && onViewPandalDetails(pandal)}
                  className="w-full py-2.5 px-4 rounded-xl border border-amber-200/80 bg-white/90 hover:bg-white text-xs font-bold text-gray-700 hover:text-sindoor-600 flex items-center justify-center gap-1.5 transition shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Pandal Showcase</span>
                </motion.button>
              </div>

            </motion.div>
          ))}
        </motion.div>
      )}

    </div>
  );
};
