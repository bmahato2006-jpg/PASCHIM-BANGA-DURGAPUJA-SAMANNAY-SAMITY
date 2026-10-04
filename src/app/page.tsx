'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNavDock } from '@/components/layout/BottomNavDock';
import { Footer } from '@/components/layout/Footer';
import { LiveLeaderboard } from '@/components/voter/LiveLeaderboard';
import { MyVotesView } from '@/components/voter/MyVotesView';
import { OrganizerDashboard } from '@/components/organizer/OrganizerDashboard';
import { DhakButton } from '@/components/ui/DhakButton';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Flame, 
  QrCode, 
  Trophy, 
  ShieldCheck, 
  Sparkles,
  Camera,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function HomePage() {
  const { openQRScanner, openAuthModal, isOrganizer, isVoter } = useApp();

  const [activeTab, setActiveTab] = useState<string>('feed');

  // Route Guard / Tab Sync
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') || params.get('view');

    if (isOrganizer) {
      if (tabParam !== 'organizer') {
        params.set('tab', 'organizer');
        params.delete('view');
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
      }
      setActiveTab('organizer');
    } else if (isVoter) {
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

  const handleTabChange = (requestedTab: string) => {
    if (isOrganizer) {
      setActiveTab('organizer');
      return;
    }

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

  // Demo / Featured Pandal Shortcuts for testing direct URL navigation
  const samplePandals = [
    { id: 'marconi-dakshin-palli', name: 'Marconi Dakshin Palli' },
    { id: 'city-centre-steel-park', name: 'City Centre Steel Park' },
    { id: 'benachity-sarbojanin', name: 'Benachity Sarbojanin' },
    { id: 'bhiringi-sarbajanin', name: 'Bhiringi Sarbajanin' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col z-10 selection:bg-marigold-200 selection:text-amber-950 overflow-x-hidden w-full max-w-full">
      {/* Sticky Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Content Area */}
      <main className="flex-1 pb-28 md:pb-12">
        <AnimatePresence mode="wait">
          
          {/* Organizer Dashboard */}
          {isOrganizer ? (
            <motion.div
              key="organizer-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <OrganizerDashboard />
            </motion.div>
          ) : activeTab === 'my-votes' ? (
            /* Dedicated Voter History ("My Votes") */
            <motion.div
              key="my-votes-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
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
              className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
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
                  Verified real-time tallies recorded directly via on-site pandal QR codes across the region.
                </p>
              </div>

              <LiveLeaderboard limit={10} />
            </motion.div>
          ) : (
            /* ULTRA-MINIMAL QR-FIRST PORTAL (Clean, Classic, Zero bloat) */
            <motion.div
              key="qr-portal-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-12 text-center"
            >
              {/* Region Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-sindoor-50 via-marigold-50 to-amber-50 border border-marigold-300/80 shadow-xs mb-6">
                <Flame className="w-4 h-4 text-sindoor-500 animate-pulse" />
                <span className="text-xs font-black text-amber-950 tracking-wide uppercase">
                  Paschim Banga DurgaPuja Samannay Samity • Official Voting
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-gray-900 leading-[1.15]">
                Scan to Vote at <br />
                <span className="font-extrabold bg-gradient-to-r from-sindoor-600 via-marigold-600 to-gold-600 text-transparent bg-clip-text">
                  Your Local Pandal
                </span>
              </h1>

              {/* Classic Explanatory Text */}
              <p className="text-base sm:text-lg text-gray-700 font-medium max-w-lg mx-auto mt-4 leading-relaxed">
                To guarantee 100% fair, authentic voting, votes can only be cast on-site by scanning the official QR code located at each registered puja pandal.
              </p>

              {/* Primary Action: QR Scanner */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <DhakButton
                  variant="primary"
                  onClick={openQRScanner}
                  className="w-full sm:w-auto min-h-[56px] px-8 py-4 rounded-2xl text-base font-bold shadow-festive flex items-center justify-center gap-3"
                >
                  <Camera className="w-6 h-6 text-white" />
                  <span>Open Camera QR Scanner</span>
                </DhakButton>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTabChange('leaderboard')}
                  className="w-full sm:w-auto min-h-[56px] px-6 py-4 rounded-2xl text-sm font-bold border border-amber-300/90 bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Trophy className="w-5 h-5 text-marigold-500" />
                  <span>View Leaderboard</span>
                </motion.button>
              </div>

              {/* 4 Token System Rules Card */}
              <div className="mt-12 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-amber-200/80 shadow-md text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-sindoor-600" />
                  <h2 className="font-serif font-black text-lg text-gray-900">
                    How On-Site QR Voting Works
                  </h2>
                </div>
                
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>4 Exclusive Tokens:</strong> You get 1 token each for Best Idol, Best Theme, Best Lighting, and Best Eco-Friendly.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>1 Vote Per Pandal:</strong> You can only award one category token to any single pandal.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Scan On-Site:</strong> Point your smartphone camera at the pandal’s QR poster to immediately open its voting ballot.</span>
                  </li>
                </ul>
              </div>

              {/* Direct QR Route Links for Rapid Testing */}
              <div className="mt-8 pt-6 border-t border-amber-200/60">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Direct Pandal QR Route Simulator:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {samplePandals.map((p) => (
                    <Link
                      key={p.id}
                      href={`/${p.id}`}
                      className="p-3.5 rounded-xl bg-white/90 hover:bg-amber-50 border border-amber-200 text-left flex items-center justify-between group transition-all shadow-xs"
                    >
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-sindoor-600 transition-colors">
                          {p.name}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          /{p.id}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-sindoor-600 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Edge Guarantee Notice */}
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Powered by Vercel Edge Network • Ultra-Low Latency Anti-Crash System</span>
              </div>
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
