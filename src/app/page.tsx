'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNavDock } from '@/components/layout/BottomNavDock';
import { Footer } from '@/components/layout/Footer';
import { LiveLeaderboard } from '@/components/voter/LiveLeaderboard';
import { MyVotesView } from '@/components/voter/MyVotesView';
import { DhakButton } from '@/components/ui/DhakButton';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Flame, 
  QrCode, 
  Trophy, 
  ShieldCheck, 
  Sparkles,
  Camera,
  CheckCircle2,
  ExternalLink,
  Search,
  Building2,
  Vote,
  MapPin,
  Palette,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { 
    pandals, 
    openQRScanner, 
    openVotingModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('feed');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('all');

  // Strict Tab Synchronization for Voter Portal
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') || params.get('view');

    // If an explicit organizer tab was requested, redirect to standalone organizer page
    if (tabParam === 'organizer') {
      router.replace('/organizer');
      return;
    }

    if (tabParam === 'leaderboard') {
      setActiveTab('leaderboard');
    } else if (tabParam === 'my-votes') {
      setActiveTab('my-votes');
    } else {
      setActiveTab('feed');
    }
  }, [router]);

  const handleTabChange = (requestedTab: string) => {
    if (requestedTab === 'organizer') {
      router.push('/organizer');
      return;
    }

    setActiveTab(requestedTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', requestedTab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Distinct Wards extracted from pandals list
  const availableWards = useMemo(() => {
    const wardSet = new Set<string>();
    pandals.forEach((p) => {
      if (p.ward) wardSet.add(p.ward);
    });
    return Array.from(wardSet);
  }, [pandals]);

  // Filtered voting list for Devotees
  const filteredPandals = useMemo(() => {
    return pandals.filter((p) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.clubName.toLowerCase().includes(query) ||
        p.theme.toLowerCase().includes(query) ||
        (p.ward && p.ward.toLowerCase().includes(query));

      const matchesWard = selectedWard === 'all' || p.ward === selectedWard;

      return matchesQuery && matchesWard;
    });
  }, [pandals, searchQuery, selectedWard]);

  return (
    <div className="relative min-h-screen flex flex-col z-10 selection:bg-marigold-200 selection:text-amber-950 overflow-x-hidden w-full max-w-full">
      {/* Sticky Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Content Area: Always dedicated to the Voter Portal on all screen sizes */}
      <main className="flex-1 pb-28 md:pb-12 w-full max-w-full">
        <AnimatePresence mode="wait">
          
          {activeTab === 'my-votes' ? (
            /* Dedicated Voter History ("My Votes") */
            <motion.div
              key="my-votes-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <MyVotesView onExplore={() => handleTabChange('feed')} />
            </motion.div>
          ) : activeTab === 'leaderboard' ? (
            /* Dedicated Live Leaderboard */
            <motion.div
              key="leaderboard-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
            >
              <div className="text-center max-w-xl mx-auto mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 text-amber-950 text-xs font-black shadow-2xs mb-3">
                  <Trophy className="w-4 h-4 text-marigold-600 animate-pulse" />
                  <span>PASCHIM BANGA DURGAPUJA SAMANNAY SAMITY RANKINGS</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-serif font-black text-gray-900 tracking-tight">
                  Live <span className="festive-gradient-text">Leaderboard</span>
                </h1>
                <p className="text-sm text-gray-600 mt-2">
                  Verified real-time tallies recorded directly via on-site pandal QR codes across Durgapur.
                </p>
              </div>

              <LiveLeaderboard limit={10} />
            </motion.div>
          ) : (
            /* ================================================================= */
            /* DEDICATED VOTER PORTAL & OFFICIAL VOTING LIST                     */
            /* ================================================================= */
            <motion.div
              key="voter-portal-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-16"
            >
              {/* Top Welcoming Hero Section */}
              <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                {/* Official State Emblem Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-sindoor-50 via-marigold-50 to-amber-50 border border-marigold-300/80 shadow-xs mb-5">
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-orange-200 shadow-2xs">
                    <Image
                      src="/logo.jpg"
                      alt="PBDS Logo"
                      width={20}
                      height={20}
                      priority
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="text-xs font-black text-amber-950 tracking-wide uppercase">
                    Paschim Banga DurgaPuja Samannay Samity
                  </span>
                </div>

                {/* Hero Title */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-gray-900 leading-[1.15]">
                  Honor the Art, Celebrate Devotion: <br />
                  <span className="bg-gradient-to-r from-sindoor-600 via-marigold-600 to-amber-600 text-transparent bg-clip-text">
                    Your Voice Matters
                  </span>
                </h1>

                {/* Welcoming Subtitle */}
                <p className="text-sm sm:text-lg text-gray-700 font-medium max-w-2xl mx-auto mt-4 leading-relaxed">
                  Celebrate Bengal&apos;s greatest festival by honoring the artistry, theme, and lighting of your favorite Puja Pandals. Cast your verified vote on-site at each pandal gate.
                </p>

                {/* CTAs */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <DhakButton
                    variant="primary"
                    onClick={openQRScanner}
                    className="w-full sm:w-auto min-h-[52px] px-8 py-3.5 rounded-2xl text-sm sm:text-base font-bold shadow-festive flex items-center justify-center gap-2.5 touch-manipulation active:scale-95"
                  >
                    <Camera className="w-5 h-5 text-white" />
                    <span>Open Camera QR Scanner</span>
                  </DhakButton>

                  <a
                    href="#voting-list"
                    className="w-full sm:w-auto min-h-[52px] px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold border border-amber-300/90 bg-white/90 hover:bg-amber-50 text-gray-800 flex items-center justify-center gap-2 transition shadow-xs touch-manipulation active:scale-95"
                  >
                    <Vote className="w-4 h-4 text-marigold-600" />
                    <span>Explore Voting List</span>
                  </a>

                  <button
                    onClick={() => handleTabChange('leaderboard')}
                    className="w-full sm:w-auto min-h-[52px] px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 text-amber-950 flex items-center justify-center gap-2 transition shadow-xs touch-manipulation active:scale-95"
                  >
                    <Trophy className="w-4 h-4 text-marigold-600" />
                    <span>Live Standings</span>
                  </button>
                </div>

                {/* Prominent One Device • One Vote Security Badge */}
                <div className="mt-7 flex justify-center">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300/90 text-emerald-950 text-xs sm:text-sm font-black tracking-wide shadow-sm shadow-emerald-900/5 hover:border-emerald-400 transition-all duration-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-100/90 flex items-center justify-center shrink-0 border border-emerald-300 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span>One Device • One Vote</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 border-t border-amber-200/60 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Hardware-Bound Ballot</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <Sparkles className="w-4 h-4 text-marigold-600" />
                    <span>4 Award Tokens</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Real-Time Tamper-Proof Tally</span>
                  </div>
                </div>
              </div>

              {/* ============================================================= */}
              {/* VOTING LIST & PARTICIPATING PANDALS DIRECTORY                 */}
              {/* ============================================================= */}
              <section id="voting-list" className="mt-8 scroll-mt-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
                      <Vote className="w-3.5 h-3.5 text-sindoor-600" />
                      <span>Official Voting List</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight">
                      Participating <span className="festive-gradient-text">Puja Pandals</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
                      Browse registered puja committees. Tap any pandal to view its concept or scan on-site to award your category tokens.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="w-full md:w-72 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search pandal or ward..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-amber-200 text-xs sm:text-sm focus:outline-none focus:border-marigold-500 bg-white shadow-2xs"
                    />
                  </div>
                </div>

                {/* Ward Filter Chips */}
                {availableWards.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSelectedWard('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        selectedWard === 'all'
                          ? 'bg-sindoor-600 text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-amber-50'
                      }`}
                    >
                      All Wards ({pandals.length})
                    </button>
                    {availableWards.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSelectedWard(w)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          selectedWard === w
                            ? 'bg-sindoor-600 text-white shadow-xs'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-amber-50'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                )}

                {/* Pandals Grid */}
                {filteredPandals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredPandals.map((pandal) => (
                      <div
                        key={pandal.id}
                        className="glass-panel rounded-2xl overflow-hidden border border-amber-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group"
                      >
                        {/* Cover Image & Ward Badge */}
                        <div className="relative h-44 w-full bg-amber-100 overflow-hidden">
                          {pandal.coverImage ? (
                            <Image
                              src={pandal.coverImage}
                              alt={pandal.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-400">
                              <Building2 className="w-12 h-12 opacity-50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-950 border border-amber-200 flex items-center gap-1 shadow-2xs">
                            <MapPin className="w-3 h-3 text-sindoor-600" />
                            <span>{pandal.ward || 'Durgapur'}</span>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <span className="text-[10px] uppercase font-bold text-marigold-300 tracking-wider">
                              {pandal.clubName}
                            </span>
                            <h3 className="font-serif font-bold text-base text-white leading-tight drop-shadow-sm truncate">
                              {pandal.name}
                            </h3>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            {/* Theme */}
                            <div className="flex items-start gap-1.5 text-xs text-gray-700 font-medium mb-3">
                              <Palette className="w-3.5 h-3.5 text-marigold-600 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">
                                <strong className="text-gray-900">Theme:</strong> {pandal.theme || 'Traditional Sharodotsav'}
                              </span>
                            </div>

                            {/* Votes Count */}
                            <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-amber-50/70 border border-amber-200/60 mb-3 text-amber-950">
                              <span className="font-semibold text-gray-600">Total Devotee Votes:</span>
                              <span className="font-black text-sindoor-600 font-mono">
                                {pandal.totalVotes.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-100">
                            <Link
                              href={`/${pandal.id}`}
                              className="py-2.5 px-3 rounded-xl text-xs font-bold text-center border border-amber-300 bg-white hover:bg-amber-50 text-gray-800 transition shadow-2xs flex items-center justify-center gap-1"
                            >
                              <span>View Pandal</span>
                              <ExternalLink className="w-3 h-3 text-gray-500" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => openVotingModal(pandal)}
                              className="py-2.5 px-3 rounded-xl text-xs font-bold text-center bg-gradient-to-r from-sindoor-600 to-marigold-600 hover:from-sindoor-700 hover:to-marigold-700 text-white shadow-xs flex items-center justify-center gap-1 touch-manipulation active:scale-95"
                            >
                              <Vote className="w-3.5 h-3.5 text-white" />
                              <span>Vote Now</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Empty state for search */
                  <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-amber-300">
                    <Building2 className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                    <h3 className="font-serif font-bold text-lg text-gray-800">
                      No participating pandals found
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Try searching with a different name or select &ldquo;All Wards&rdquo; to view the complete directory.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedWard('all');
                      }}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-sindoor-600 bg-amber-50 border border-amber-200 hover:bg-amber-100"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </section>

              {/* ============================================================= */}
              {/* HOW IT WORKS / 4 TOKEN GAMIFIED EXPLAINER                    */}
              {/* ============================================================= */}
              <section className="mt-14 p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-amber-200/80 shadow-md">
                <div className="max-w-2xl mx-auto text-center mb-8">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-sindoor-600" />
                    <span>Fair Play Guarantee</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight">
                    How On-Site QR Voting Works
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Each devotee receives 4 exclusive category tokens to award during Durga Puja 2026.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                    <div className="w-8 h-8 rounded-xl bg-sindoor-100 text-sindoor-600 flex items-center justify-center font-bold text-sm mb-2.5">
                      1
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 mb-1">Best Idol Token</h4>
                    <p className="text-xs text-gray-600">
                      Award to the most exquisite clay sculpting and traditional Pratima artistry.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                    <div className="w-8 h-8 rounded-xl bg-marigold-100 text-marigold-600 flex items-center justify-center font-bold text-sm mb-2.5">
                      2
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 mb-1">Best Theme Token</h4>
                    <p className="text-xs text-gray-600">
                      Award to the most innovative social message and mandap srijan concept.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                    <div className="w-8 h-8 rounded-xl bg-yellow-100 text-amber-700 flex items-center justify-center font-bold text-sm mb-2.5">
                      3
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 mb-1">Best Lighting Token</h4>
                    <p className="text-xs text-gray-600">
                      Award to Chandannagar-style dynamic illumination and radiant welcome gates.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-2.5">
                      4
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 mb-1">Eco-Friendly Token</h4>
                    <p className="text-xs text-gray-600">
                      Award to 100% biodegradable materials, non-toxic colors, and zero plastic.
                    </p>
                  </div>
                </div>
              </section>

              {/* ============================================================= */}
              {/* ORGANIZER INVITATION BANNER                                   */}
              {/* ============================================================= */}
              <section className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-xl text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Building2 className="w-3.5 h-3.5 text-marigold-400" />
                    <span>For Puja Committee Organizers</span>
                  </div>
                  <h3 className="font-serif font-black text-xl sm:text-2xl text-white tracking-tight">
                    Are You a Puja Committee Organizer?
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
                    Register your Puja Committee with Paschim Banga DurgaPuja Samannay Samity to generate your official universal QR code standee and track live voter analytics.
                  </p>
                </div>

                <Link
                  href="/organizer/auth"
                  className="w-full md:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-marigold-500 to-amber-500 hover:from-marigold-400 hover:to-amber-400 text-gray-950 flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 shrink-0"
                >
                  <Building2 className="w-4 h-4 text-gray-950" />
                  <span>Organizer Login / Register</span>
                  <ArrowRight className="w-4 h-4 text-gray-950 ml-1" />
                </Link>
              </section>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Clean Structured Footer */}
      <Footer onNavigateTab={handleTabChange} />

      {/* Floating Mobile Bottom Navigation Dock */}
      <BottomNavDock activeTab={activeTab} setActiveTab={handleTabChange} />
    </div>
  );
}
