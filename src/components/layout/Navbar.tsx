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
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0 min-w-0 max-w-[70%] sm:max-w-none touch-manipulation active:scale-95 transition-transform duration-75"
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

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm sm:text-base md:text-lg text-gray-900 group-hover:text-sindoor-600 transition-colors leading-tight">
                    পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-marigold-100 text-marigold-800 border border-marigold-300 shrink-0">
                    2026
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] tracking-widest text-gray-500 uppercase truncate">
                  Paschim Banga DurgaPuja Samannay Samity
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2.5">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleNavClick('feed')}
                className={`flex items-center gap-2 px-3 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all ${
                  activeTab === 'feed'
                    ? 'bg-sindoor-50 text-sindoor-600 border border-sindoor-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <Compass className="w-4 h-4 text-sindoor-500 shrink-0" />
                <div className="flex flex-col items-center leading-tight">
                  <span>মণ্ডপ দেখুন</span>
                  <span className="text-[10px] opacity-75 block text-center">Explore Pandals</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleNavClick('leaderboard')}
                className={`flex items-center gap-2 px-3 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all ${
                  activeTab === 'leaderboard'
                    ? 'bg-sindoor-50 text-sindoor-600 border border-sindoor-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <Trophy className="w-4 h-4 text-marigold-500 shrink-0" />
                <div className="flex flex-col items-center leading-tight">
                  <span>লাইভ লিডারবোর্ড</span>
                  <span className="text-[10px] opacity-75 block text-center">Live Leaderboard</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleNavClick('my-votes')}
                className={`flex items-center gap-2 px-3 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all ${
                  activeTab === 'my-votes'
                    ? 'bg-sindoor-50 text-sindoor-600 border border-sindoor-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <Vote className="w-4 h-4 text-sindoor-500 shrink-0" />
                <div className="flex flex-col items-center leading-tight">
                  <div className="flex items-center gap-1">
                    <span>আমার ভোট</span>
                    {user && userVotes.filter(v => v.userId === user.id).length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-sindoor-600 text-white">
                        {userVotes.filter(v => v.userId === user.id).length}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] opacity-75 block text-center">My Votes</span>
                </div>
              </motion.button>

              {/* If Organizer: Link to Organizer Dashboard */}
              {isOrganizer && (
                <Link
                  href="/organizer"
                  className={`flex items-center gap-1.5 px-3 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all ${
                    activeTab === 'organizer'
                      ? 'bg-marigold-50 text-marigold-700 border border-marigold-300 shadow-sm'
                      : 'text-gray-600 hover:text-marigold-700 hover:bg-marigold-50/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-marigold-600 shrink-0" />
                  <div className="flex flex-col items-center leading-tight">
                    <span>ড্যাশবোর্ড</span>
                    <span className="text-[10px] opacity-75 block text-center">Dashboard</span>
                  </div>
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
                <div className="hidden md:flex items-center gap-2.5 lg:gap-3">
                  {/* Distinct Organizer Login / Register Button (Desktop) */}
                  <Link
                    href="/organizer/auth"
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 lg:py-2 rounded-xl text-xs sm:text-sm font-bold text-amber-950 bg-gradient-to-r from-amber-50 via-white to-amber-50 hover:from-amber-100 hover:to-amber-50 border border-amber-300/90 hover:border-marigold-500 shadow-xs hover:shadow-md backdrop-blur-md transition-all duration-200 touch-manipulation active:scale-95 group"
                    title="Puja Committee Organizer Portal: Login or Register"
                  >
                    <div className="w-5 h-5 rounded-lg bg-amber-100/90 flex items-center justify-center text-marigold-700 group-hover:bg-amber-200 transition-colors shrink-0">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col items-center leading-tight">
                      <span>আয়োজক লগইন</span>
                      <span className="text-[10px] opacity-75 block text-center">Organizer Login</span>
                    </div>
                  </Link>

                  {/* Primary CTA: Scan & Vote (Desktop) */}
                  <DhakButton
                    variant="primary"
                    onClick={openQRScanner}
                    className="px-3.5 sm:px-4 py-1.5 lg:py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4 text-white shrink-0" />
                    <div className="flex flex-col items-center leading-tight">
                      <span>স্ক্যান ও ভোট</span>
                      <span className="text-[10px] opacity-75 block text-center">Scan & Vote</span>
                    </div>
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
                  <div className="flex flex-col items-start leading-none">
                    <span>{isOrganizer ? 'ড্যাশবোর্ড' : 'আয়োজক লগইন'}</span>
                    <span className="text-[8px] opacity-75 block">{isOrganizer ? 'Dashboard' : 'Organizer Login'}</span>
                  </div>
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
                  <Building2 className="w-4 h-4 text-marigold-600 shrink-0" />
                  <div className="flex flex-col items-start leading-tight">
                    <span>{isOrganizer ? 'আয়োজক ড্যাশবোর্ড' : 'আয়োজক লগইন'}</span>
                    <span className="text-[10px] opacity-75 block">{isOrganizer ? 'Organizer Dashboard' : 'Organizer Login'}</span>
                  </div>
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
                <Compass className="w-4 h-4 text-sindoor-500 shrink-0" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold">মণ্ডপ দেখুন</span>
                  <span className="text-[10px] opacity-75 block text-center">Explore Pandals</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('leaderboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm touch-manipulation active:scale-[0.98] ${
                  activeTab === 'leaderboard' ? 'bg-sindoor-50 text-sindoor-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Trophy className="w-4 h-4 text-marigold-500 shrink-0" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold">লাইভ লিডারবোর্ড</span>
                  <span className="text-[10px] opacity-75 block text-center">Live Leaderboard</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('my-votes')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm touch-manipulation active:scale-[0.98] ${
                  activeTab === 'my-votes' ? 'bg-sindoor-50 text-sindoor-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Vote className="w-4 h-4 text-sindoor-500 shrink-0" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold">আমার ভোট</span>
                  <span className="text-[10px] opacity-75 block text-center">My Votes</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openQRScanner();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-gray-700 hover:bg-gray-50 touch-manipulation active:scale-[0.98]"
              >
                <QrCode className="w-4 h-4 text-marigold-600 shrink-0" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold">স্ক্যান ও ভোট</span>
                  <span className="text-[10px] opacity-75 block text-center">Scan & Vote</span>
                </div>
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
