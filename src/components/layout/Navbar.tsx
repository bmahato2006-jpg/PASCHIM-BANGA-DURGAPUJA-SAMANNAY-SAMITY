'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { DhakButton } from '@/components/ui/DhakButton';
import { 
  Flame, 
  QrCode, 
  Trophy, 
  User as UserIcon, 
  LogOut, 
  Compass, 
  LayoutDashboard, 
  ShieldCheck, 
  Menu, 
  X,
  HeartHandshake,
  Building2,
  Lock,
  Vote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC<{ 
  activeTab?: string; 
  setActiveTab?: (tab: string) => void;
}> = ({
  activeTab = 'feed',
  setActiveTab,
}) => {
  const { 
    user, 
    userVotes,
    logout, 
    openAuthModal, 
    openQRScanner, 
    openSupportModal, 
    isVoter,
    isOrganizer,
    isGuest
  } = useApp();

  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    if (tab === 'organizer') {
      router.push('/organizer');
      setIsMobileMenuOpen(false);
      return;
    }
    if (setActiveTab) {
      setActiveTab(tab);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[64px] sm:h-20 py-1.5 sm:py-0">
            
            {/* Logo & Brand (Always routes to Voter Portal Feed) */}
            <div 
              onClick={() => handleNavClick('feed')}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink min-w-0 max-w-[68%] xs:max-w-[72%] sm:max-w-none touch-manipulation active:scale-95 transition-transform duration-75"
            >
              <div className="shrink-0 relative">
                <Image
                  src="/logo.jpg"
                  alt="PBDS Logo"
                  width={44}
                  height={44}
                  priority
                  className="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full object-cover shadow-xs border border-orange-200 group-hover:border-marigold-400 group-hover:shadow-md transition-all duration-300"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-serif font-black text-xs xs:text-sm sm:text-base md:text-xl lg:text-2xl tracking-tight text-gray-900 group-hover:text-sindoor-600 transition-colors leading-tight truncate">
                    <span className="font-extrabold text-gray-900">
                      Paschim Banga <span className="text-sindoor-600">DurgaPuja </span>
                    </span>
                    <span className="hidden xs:inline text-gray-900 group-hover:text-amber-800">
                      Samannay Samity
                    </span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-marigold-100 text-marigold-800 border border-marigold-300 shrink-0">
                    2026
                  </span>
                </div>
                <p className="text-[9px] sm:text-xs text-amber-800 font-medium tracking-wide truncate mt-0.5">
                  The Official Voting Platform
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleNavClick('feed')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'feed'
                    ? 'bg-sindoor-50 text-sindoor-600 border border-sindoor-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <Compass className="w-4 h-4 text-sindoor-500" />
                <span>Explore Pandals</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleNavClick('leaderboard')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'leaderboard'
                    ? 'bg-sindoor-50 text-sindoor-600 border border-sindoor-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <Trophy className="w-4 h-4 text-marigold-500" />
                <span>Live Leaderboard</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleNavClick('my-votes')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'my-votes'
                    ? 'bg-sindoor-50 text-sindoor-600 border border-sindoor-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <Vote className="w-4 h-4 text-sindoor-500" />
                <span>My Votes</span>
                {user && userVotes.filter(v => v.userId === user.id).length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-sindoor-600 text-white">
                    {userVotes.filter(v => v.userId === user.id).length}
                  </span>
                )}
              </motion.button>

              {/* Scan QR Button */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.92 }}
                onClick={openQRScanner}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-sindoor-600 hover:bg-sindoor-50/50 transition-all border border-dashed border-marigold-300"
              >
                <QrCode className="w-4 h-4 text-marigold-600" />
                <span>Scan Pandal QR</span>
              </motion.button>

              {/* If Organizer: Link to Organizer Dashboard */}
              {isOrganizer && (
                <Link
                  href="/organizer"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'organizer'
                      ? 'bg-marigold-50 text-marigold-700 border border-marigold-300 shadow-sm'
                      : 'text-gray-600 hover:text-marigold-700 hover:bg-marigold-50/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-marigold-600" />
                  <span>Dashboard</span>
                </Link>
              )}
            </nav>

            {/* Right Action Area */}
            <div className="flex items-center gap-2">
              
              {/* Desktop Only Actions: Hidden on Mobile */}
              {isOrganizer && user ? (
                <div className="hidden md:flex items-center gap-2">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-bold text-gray-900 leading-tight">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                      Pandal Organizer
                    </span>
                  </div>

                  <Image
                    src={user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full ring-2 ring-marigold-400 object-cover"
                  />

                  <button
                    onClick={logout}
                    title="Sign Out to Voter Mode"
                    className="p-2 rounded-xl text-gray-400 hover:text-sindoor-600 hover:bg-sindoor-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Desktop Voter CTAs: Strictly hidden on mobile screens */
                <div className="hidden md:flex items-center gap-2">
                  <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>One Device • One Vote</span>
                  </div>

                  {/* Distinct Organizer Login / Register Button (Desktop) */}
                  <Link
                    href="/organizer/auth"
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-amber-950 bg-gradient-to-r from-amber-50 via-white to-amber-50 hover:from-amber-100 hover:to-amber-50 border border-amber-300/90 hover:border-marigold-500 shadow-xs hover:shadow-md backdrop-blur-md transition-all duration-200 touch-manipulation active:scale-95 group"
                    title="Puja Committee Organizer Portal: Login or Register"
                  >
                    <div className="w-5 h-5 rounded-lg bg-amber-100/90 flex items-center justify-center text-marigold-700 group-hover:bg-amber-200 transition-colors">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Organizer Login / Register</span>
                  </Link>

                  {/* Primary CTA: Scan & Vote (Desktop) */}
                  <DhakButton
                    variant="primary"
                    onClick={openQRScanner}
                    className="px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4 text-white" />
                    <span>Scan & Vote</span>
                  </DhakButton>
                </div>
              )}

              {/* Mobile Right Controls: Compact Organizer Button & Hamburger Menu */}
              <div className="flex md:hidden items-center gap-1 sm:gap-1.5 shrink-0">
                <Link
                  href={isOrganizer ? "/organizer" : "/organizer/auth"}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold text-amber-950 bg-amber-50/90 hover:bg-amber-100 border border-amber-300/90 shadow-2xs touch-manipulation active:scale-95 whitespace-nowrap shrink-0"
                  title="Organizer Portal"
                >
                  <Building2 className="w-3 h-3 text-marigold-600 shrink-0" />
                  <span>{isOrganizer ? 'Dashboard' : 'Organizer'}</span>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-1.5 rounded-lg text-gray-700 hover:bg-amber-50 focus:outline-none shrink-0 touch-manipulation active:scale-90 transition-transform duration-75"
                  aria-label="Toggle Menu"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-amber-100 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2"
            >
              {/* Distinct Organizer Portal Entry in Mobile Drawer */}
              <Link
                href={isOrganizer ? "/organizer" : "/organizer/auth"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-amber-950 bg-gradient-to-r from-amber-50/90 via-marigold-50/70 to-amber-50/90 border border-amber-300/80 hover:bg-amber-100/80 transition-all shadow-xs touch-manipulation active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-marigold-600" />
                  <span>{isOrganizer ? 'Go to Organizer Dashboard' : 'Organizer Login / Register'}</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-marigold-100 text-marigold-800 border border-marigold-300">
                  {isOrganizer ? 'Active' : 'Club Desk'}
                </span>
              </Link>

              <button
                onClick={() => handleNavClick('feed')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm touch-manipulation active:scale-[0.98] ${
                  activeTab === 'feed' ? 'bg-sindoor-50 text-sindoor-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Compass className="w-4 h-4 text-sindoor-500" />
                <span>Explore Pandals Feed</span>
              </button>

              <button
                onClick={() => handleNavClick('leaderboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm touch-manipulation active:scale-[0.98] ${
                  activeTab === 'leaderboard' ? 'bg-sindoor-50 text-sindoor-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Trophy className="w-4 h-4 text-marigold-500" />
                <span>Live Leaderboard</span>
              </button>

              <button
                onClick={() => handleNavClick('my-votes')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm touch-manipulation active:scale-[0.98] ${
                  activeTab === 'my-votes' ? 'bg-sindoor-50 text-sindoor-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Vote className="w-4 h-4 text-sindoor-500" />
                <span>My Votes History</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openQRScanner();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-gray-700 hover:bg-gray-50 touch-manipulation active:scale-[0.98]"
              >
                <QrCode className="w-4 h-4 text-marigold-600" />
                <span>Scan Pandal QR to Vote</span>
              </button>

              {isOrganizer && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-red-600 hover:bg-red-50 touch-manipulation active:scale-[0.98]"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out (Organizer Mode)</span>
                </button>
              )}



              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openSupportModal();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100 pt-3"
              >
                <HeartHandshake className="w-5 h-5 text-rose-500" />
                <span>Helpdesk & Support</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
