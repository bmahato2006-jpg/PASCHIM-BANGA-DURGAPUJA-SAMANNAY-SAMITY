'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNavDock } from '@/components/layout/BottomNavDock';
import { Footer } from '@/components/layout/Footer';
import { PandalCard } from '@/components/voter/PandalCard';
import { LiveLeaderboard } from '@/components/voter/LiveLeaderboard';
import { MyVotesView } from '@/components/voter/MyVotesView';
import { CategoryCarousel } from '@/components/voter/CategoryCarousel';
import { PandalDetailModal } from '@/components/voter/PandalDetailModal';
import { OrganizerDashboard } from '@/components/organizer/OrganizerDashboard';
import { DhakButton } from '@/components/ui/DhakButton';
import { Pandal } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  QrCode, 
  Trophy, 
  Search, 
  Leaf, 
  Zap, 
  Award, 
  Compass, 
  MapPin, 
  ShieldCheck,
  Building2,
  Info,
  Vote
} from 'lucide-react';

export default function HomePage() {
  const { pandals, activeRole, openQRScanner, openAuthModal, isOrganizer, isVoter, isConfigured } = useApp();

  const [activeTab, setActiveTab] = useState<string>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPandalForDetails, setSelectedPandalForDetails] = useState<Pandal | null>(null);

  // STRICT ROUTE GUARD: Monitor role changes and URL parameters for route enforcement
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') || params.get('view');

    if (isOrganizer) {
      // Organizers are strictly locked to the Organizer Dashboard
      if (tabParam !== 'organizer') {
        params.set('tab', 'organizer');
        params.delete('view');
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
      }
      setActiveTab('organizer');
    } else if (isVoter) {
      // Voters attempting to access organizer dashboard are immediately redirected to feed
      if (tabParam === 'organizer') {
        params.set('tab', 'feed');
        params.delete('view');
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
        setActiveTab('feed');
      } else if (tabParam === 'leaderboard') {
        setActiveTab('leaderboard');
      } else if (tabParam === 'my-votes') {
        setActiveTab('my-votes');
      } else {
        setActiveTab('feed');
      }
    } else {
      // Guest / Voter users
      if (tabParam === 'organizer') {
        openAuthModal('organizer');
        setActiveTab('feed');
      } else if (tabParam === 'leaderboard') {
        setActiveTab('leaderboard');
      } else if (tabParam === 'my-votes') {
        setActiveTab('my-votes');
      } else {
        setActiveTab('feed');
      }
    }
  }, [isOrganizer, isVoter, openAuthModal]);

  // Tab change handler with RBAC route security & URL query synchronization
  const handleTabChange = (requestedTab: string) => {
    if (isOrganizer) {
      // Prevent organizers from navigating to voter views
      setActiveTab('organizer');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', 'organizer');
        window.history.replaceState({}, '', url.toString());
      }
      return;
    }

    if (isVoter) {
      // Prevent voters from accessing organizer portal
      if (requestedTab === 'organizer') {
        setActiveTab('feed');
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('tab', 'feed');
          window.history.replaceState({}, '', url.toString());
        }
        return;
      }
      setActiveTab(requestedTab);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', requestedTab);
        window.history.replaceState({}, '', url.toString());
      }
      return;
    }

    // Guest / Anonymous Voter:
    if (requestedTab === 'organizer') {
      openAuthModal('organizer');
      return;
    }
    setActiveTab(requestedTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', requestedTab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Filter pandals based on search & category
  const filteredPandals = pandals.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ward.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'idol') return p.votes.idol > 3000;
    if (selectedCategory === 'theme') return p.votes.theme > 3000;
    if (selectedCategory === 'lighting') return p.votes.lighting > 3500;
    if (selectedCategory === 'eco') return p.isEcoFriendly;
    if (selectedCategory === 'budget') return p.budgetNumber >= 45;
    return true;
  });

  const categoryCounts = {
    all: pandals.length,
    idol: pandals.filter(p => p.votes.idol > 3000).length,
    theme: pandals.filter(p => p.votes.theme > 3000).length,
    lighting: pandals.filter(p => p.votes.lighting > 3500).length,
    eco: pandals.filter(p => p.isEcoFriendly).length,
    budget: pandals.filter(p => p.budgetNumber >= 45).length,
  };

  const totalVotesAcrossCity = pandals.reduce((sum, p) => sum + p.totalVotes, 0);

  return (
    <div className="relative min-h-screen flex flex-col z-10 selection:bg-marigold-200 selection:text-amber-950 overflow-x-hidden w-full max-w-full">
      
      {/* Sticky Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Content Area with Smooth Page Transitions */}
      <main className="flex-1 pb-28 md:pb-0">
        <AnimatePresence mode="wait">
          
          {/* 1. ORGANIZER PORTAL VIEW (Strict RBAC: Exclusively rendered for organizers) */}
          {isOrganizer ? (
            <motion.div
              key="organizer-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <OrganizerDashboard />
            </motion.div>
          ) : activeTab === 'my-votes' ? (
            /* 2. DEDICATED VOTER HISTORY TAB ("My Votes") */
            <motion.div
              key="my-votes-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <MyVotesView
                onExplore={() => handleTabChange('feed')}
                onViewPandalDetails={(p) => setSelectedPandalForDetails(p)}
              />
            </motion.div>
          ) : activeTab === 'leaderboard' ? (
            /* 3. DEDICATED LIVE LEADERBOARD TAB */
            <motion.div
              key="leaderboard-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
            >
              <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 text-amber-950 text-xs font-black shadow-2xs mb-3">
                  <Trophy className="w-4 h-4 text-marigold-600 animate-pulse" />
                  <span>DURGAPUR GRAND RANKINGS 2026</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-serif font-black text-gray-900 tracking-tight">
                  Live <span className="festive-gradient-text">Leaderboard</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-lg mx-auto">
                  Watch top puja hubs dynamically shuffle ranks as verified votes pour in from across the Steel City!
                </p>
              </div>

              <LiveLeaderboard limit={10} />
            </motion.div>
          ) : (
            /* 4. DEFAULT VOTER FEED TAB (Explore Pandals) */
            <motion.div
              key="feed-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              {/* Hero Section with Maa Durga Watermark Texture */}
              <section className="pt-6 sm:pt-12 pb-6 sm:pb-10 text-center relative overflow-hidden">
                {/* Seamless Feathered Maa Durga Watermark Art */}
                <div 
                  className="absolute inset-0 -top-4 sm:-top-8 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
                  aria-hidden="true"
                >
                  <div 
                    className="relative w-[380px] h-[380px] sm:w-[560px] sm:h-[560px] md:w-[700px] md:h-[700px] max-w-full transform -translate-y-4 sm:-translate-y-6"
                    style={{
                      WebkitMaskImage: 'radial-gradient(ellipse 46% 46% at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.2) 42%, rgba(0,0,0,0) 46%), linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
                      maskImage: 'radial-gradient(ellipse 46% 46% at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.2) 42%, rgba(0,0,0,0) 46%), linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
                      WebkitMaskComposite: 'destination-in, destination-in',
                      maskComposite: 'intersect',
                    }}
                  >
                    <img
                      src="https://t3.ftcdn.net/jpg/09/57/05/00/360_F_957050042_0t9ZUmcAEUZHwlX91koFI8ihmeYQOThn.jpg"
                      alt="Maa Durga Watermark Motif"
                      className="w-full h-full object-cover opacity-50 mix-blend-multiply filter contrast-125 brightness-95 pointer-events-none"
                      style={{
                        WebkitMaskImage: 'radial-gradient(ellipse 46% 46% at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.2) 42%, rgba(0,0,0,0) 46%), linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
                        maskImage: 'radial-gradient(ellipse 46% 46% at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.2) 42%, rgba(0,0,0,0) 46%), linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
                        WebkitMaskComposite: 'destination-in, destination-in',
                        maskComposite: 'intersect',
                      }}
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-3xl mx-auto space-y-4 relative z-10"
                >
                  {/* Festive Pill Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-sindoor-50/90 via-marigold-50/90 to-amber-50/90 border border-marigold-300/70 shadow-xs diya-glow-hover">
                    <Flame className="w-4 h-4 text-sindoor-500 animate-pulse" />
                    <span className="text-xs font-black text-amber-900 tracking-wide">
                      DURGAPUR DURGA PUJA 2026 • OFFICIAL VOTING PLATFORM
                    </span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-gray-900 leading-[1.15] [text-shadow:_0_1px_10px_rgba(255,255,255,0.95),_0_2px_18px_rgba(255,255,255,0.85),_0_0_26px_rgba(255,255,255,0.75)] drop-shadow-sm">
                    Honor the Grandest Pandals of the <span className="font-extrabold bg-gradient-to-r from-orange-600 to-red-600 text-transparent bg-clip-text [text-shadow:none]">Durgapur City</span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-lg text-gray-800 font-semibold max-w-2xl mx-auto leading-relaxed [text-shadow:_0_1px_8px_rgba(255,255,255,0.95),_0_0_14px_rgba(255,255,255,0.85)]">
                    Celebrate Bengal’s beloved Durga Puja. Cast your verified vote across 
                    <strong className="text-gray-950 font-black"> Best Idol</strong>, 
                    <strong className="text-gray-950 font-black"> Best Theme</strong>, 
                    <strong className="text-gray-950 font-black"> Best Lighting</strong>, and 
                    <strong className="text-gray-950 font-black"> Best Eco-friendly</strong> categories.
                  </p>

                  {/* Action Buttons */}
                  <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                    <DhakButton
                      variant="primary"
                      onClick={openQRScanner}
                      className="min-h-[48px] px-6 py-3.5 rounded-2xl text-sm font-bold shadow-festive"
                    >
                      <QrCode className="w-5 h-5 text-white" />
                      <span>Scan & Vote</span>
                    </DhakButton>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleTabChange('leaderboard')}
                      className="min-h-[48px] px-6 py-3.5 rounded-2xl text-sm font-bold border border-amber-300/80 bg-white/90 hover:bg-white text-gray-800 flex items-center gap-2 transition shadow-2xs"
                    >
                      <Trophy className="w-5 h-5 text-marigold-500" />
                      <span>View Rankings</span>
                    </motion.button>
                  </div>
                </motion.div>

                {/* City-Wide Live Metrics Bar */}
                <div className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-panel-warm p-3.5 sm:p-4 rounded-2xl border border-amber-200/70 text-center diya-glow-hover cursor-default"
                  >
                    <span className="text-xs text-gray-500 font-semibold block">Total Ballots Cast</span>
                    <span className="text-xl sm:text-2xl font-serif font-black text-sindoor-600 mt-0.5 block">
                      {totalVotesAcrossCity.toLocaleString()}
                    </span>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-panel-warm p-3.5 sm:p-4 rounded-2xl border border-amber-200/70 text-center diya-glow-hover cursor-default"
                  >
                    <span className="text-xs text-gray-500 font-semibold block">Registered Puja Hubs</span>
                    <span className="text-xl sm:text-2xl font-serif font-black text-marigold-600 mt-0.5 block">
                      {pandals.length} Mega Pandals
                    </span>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-panel-warm p-3.5 sm:p-4 rounded-2xl border border-amber-200/70 text-center diya-glow-hover cursor-default"
                  >
                    <span className="text-xs text-gray-500 font-semibold block">Judging Criteria</span>
                    <span className="text-xl sm:text-2xl font-serif font-black text-amber-700 mt-0.5 block">
                      4 Categories
                    </span>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-panel-warm p-3.5 sm:p-4 rounded-2xl border border-amber-200/70 text-center diya-glow-hover cursor-default"
                  >
                    <span className="text-xs text-gray-500 font-semibold block">Civic Jurisdiction</span>
                    <span className="text-xl sm:text-2xl font-serif font-black text-green-700 mt-0.5 block">
                      DMC Ward 01 - 43
                    </span>
                  </motion.div>
                </div>
              </section>

              {/* Dynamic Fluid Gliding Leaderboard Preview (Top 5) */}
              <LiveLeaderboard limit={5} />

              {/* EXPLORE FEED & CAROUSEL */}
              <section id="explore-feed" className="py-8 sm:py-12">
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-sindoor-600 bg-sindoor-50 px-2.5 py-0.5 rounded-full border border-sindoor-200">
                        Voter Exploration Feed
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {filteredPandals.length} Pandals Available
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-1">
                      Explore Durgapur Pandals
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                      Touch or swipe to filter categories, preview themes, and cast verified ballots.
                    </p>
                  </div>

                  {/* Search Bar with min 48px thumb target */}
                  <div className="w-full md:w-80 relative">
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search Benachity, City Centre, theme..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full min-h-[48px] pl-10 pr-4 py-2.5 rounded-2xl border border-amber-200/80 focus:outline-none focus:ring-2 focus:ring-sindoor-400 bg-white/95 text-sm shadow-xs diya-glow-hover"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-3.5 text-xs text-gray-400 hover:text-gray-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Horizontal Swipe Category Carousel */}
                <CategoryCarousel
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  counts={categoryCounts}
                />

                {/* Feed Grid with Staggered Entrance */}
                {filteredPandals.length > 0 ? (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.08 },
                      },
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-6"
                  >
                    {filteredPandals.map((pandal) => (
                      <PandalCard
                        key={pandal.id}
                        pandal={pandal}
                        onViewDetails={(p) => setSelectedPandalForDetails(p)}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <div className="py-16 text-center glass-panel rounded-3xl p-8 border border-amber-200">
                    <p className="text-gray-600 text-sm font-medium">
                      No pandals found matching &quot;{searchQuery}&quot;.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="mt-4 min-h-[48px] px-6 py-2.5 rounded-2xl text-xs font-bold text-sindoor-600 bg-sindoor-50 border border-sindoor-200 hover:bg-sindoor-100 transition shadow-2xs"
                    >
                      Reset All Filters
                    </motion.button>
                  </div>
                )}

              </section>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Pandal Full Detail Lightbox Modal */}
      <PandalDetailModal
        pandal={selectedPandalForDetails}
        onClose={() => setSelectedPandalForDetails(null)}
      />

      {/* Redesigned Structured Minimalist Footer */}
      <Footer onNavigateTab={handleTabChange} />

      {/* Apple-Style Floating Mobile Bottom Navigation Dock */}
      <BottomNavDock activeTab={activeTab} setActiveTab={handleTabChange} />

    </div>
  );
}
