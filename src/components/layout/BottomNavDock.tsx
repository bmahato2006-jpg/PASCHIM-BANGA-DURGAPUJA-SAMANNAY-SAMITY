'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Trophy, 
  QrCode, 
  Vote, 
  User as UserIcon, 
  LayoutDashboard, 
  Building2, 
  HeartHandshake,
  LogOut,
  Flame
} from 'lucide-react';

interface BottomNavDockProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNavDock: React.FC<BottomNavDockProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { 
    user, 
    isOrganizer, 
    isVoter, 
    userVotes, 
    openQRScanner, 
    openAuthModal, 
    openSupportModal,
    logout 
  } = useApp();

  const userVotesCount = user ? userVotes.filter(v => v.userId === user.id).length : 0;

  // Touch handler with subtle haptic tap
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <aside 
      aria-label="Mobile Navigation Dock" 
      className="md:hidden fixed bottom-4 left-3 right-3 z-50 pointer-events-none"
    >
      <div className="max-w-md mx-auto pointer-events-auto">
        <nav 
          aria-label="Mobile Bottom Navigation" 
          className="relative rounded-full px-2 py-1.5 glass-dock-premium flex items-center justify-around ring-1 ring-amber-300/40"
        >
          
          {/* VOTER & GUEST NAVIGATION DOCK */}
          {!isOrganizer ? (
            <>
              {/* 1. Explore / Home */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleTabClick('feed')}
                aria-label="Explore Pandals"
                className={`relative min-h-[48px] min-w-[50px] flex-1 flex flex-col items-center justify-center py-1 rounded-full transition-colors touch-manipulation active:scale-90 duration-75 ${
                  activeTab === 'feed' ? 'text-sindoor-600 font-bold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {activeTab === 'feed' && (
                  <motion.div
                    layoutId="dock-active-pill"
                    className="absolute inset-0 bg-sindoor-50/95 rounded-full -z-10 border border-sindoor-300/70 shadow-xs"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  />
                )}
                <Compass className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">Explore</span>
              </motion.button>

              {/* 2. Live Leaderboard / Ranking */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleTabClick('leaderboard')}
                aria-label="Live Leaderboard"
                className={`relative min-h-[48px] min-w-[50px] flex-1 flex flex-col items-center justify-center py-1 rounded-full transition-colors touch-manipulation active:scale-90 duration-75 ${
                  activeTab === 'leaderboard' ? 'text-marigold-600 font-bold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {activeTab === 'leaderboard' && (
                  <motion.div
                    layoutId="dock-active-pill"
                    className="absolute inset-0 bg-marigold-50/95 rounded-full -z-10 border border-marigold-300/70 shadow-xs"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  />
                )}
                <Trophy className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">Ranks</span>
              </motion.button>

              {/* 3. Center Elevated Hardware QR Scanner Button */}
              <div className="relative -mt-6 mx-1 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={openQRScanner}
                  aria-label="Scan Pandal QR Code to Vote"
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-sindoor-500 via-marigold-500 to-amber-400 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(217,34,42,0.45)] border-2 border-white ring-4 ring-amber-300/60 relative group touch-manipulation active:scale-90 duration-75"
                >
                  <QrCode className="w-7 h-7 text-white animate-pulse-subtle" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-sindoor-500 rounded-full animate-ping" />
                  </span>
                </motion.button>
              </div>

              {/* 4. My Votes History (Voter Ledger) */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleTabClick('my-votes')}
                aria-label="My Cast Votes"
                className={`relative min-h-[48px] min-w-[50px] flex-1 flex flex-col items-center justify-center py-1 rounded-full transition-colors touch-manipulation active:scale-90 duration-75 ${
                  activeTab === 'my-votes' ? 'text-sindoor-600 font-bold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {activeTab === 'my-votes' && (
                  <motion.div
                    layoutId="dock-active-pill"
                    className="absolute inset-0 bg-sindoor-50/95 rounded-full -z-10 border border-sindoor-300/70 shadow-xs"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  />
                )}
                <div className="relative">
                  <Vote className="w-5 h-5 mb-0.5" />
                  {userVotesCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[15px] h-[15px] rounded-full bg-sindoor-600 text-[9px] font-black text-white flex items-center justify-center shadow-xs">
                      {userVotesCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight">My Votes</span>
              </motion.button>

              {/* 5. Helpdesk & Civic Support */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                onClick={openSupportModal}
                aria-label="Helpdesk & Support"
                className="relative min-h-[48px] min-w-[50px] flex-1 flex flex-col items-center justify-center py-1 rounded-full text-gray-500 hover:text-gray-900 touch-manipulation active:scale-90 duration-75"
              >
                <HeartHandshake className="w-5 h-5 mb-0.5 text-rose-500" />
                <span className="text-[10px] tracking-tight">Helpdesk</span>
              </motion.button>
            </>
          ) : (
            /* ORGANIZER NAVIGATION DOCK */
            <>
              {/* 1. Dashboard View */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleTabClick('organizer')}
                aria-label="Organizer Dashboard"
                className={`relative min-h-[48px] min-w-[65px] flex-1 flex flex-col items-center justify-center py-1 rounded-full transition-colors touch-manipulation active:scale-90 duration-75 ${
                  activeTab === 'organizer' ? 'text-marigold-700 font-bold' : 'text-gray-500'
                }`}
              >
                {activeTab === 'organizer' && (
                  <motion.div
                    layoutId="dock-active-pill"
                    className="absolute inset-0 bg-marigold-50/90 rounded-full -z-10 border border-marigold-300 shadow-xs"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  />
                )}
                <LayoutDashboard className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">Dashboard</span>
              </motion.button>

              {/* 2. Club Profile & Standee */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleTabClick('organizer')}
                aria-label="Club Profile & QR Standee"
                className="relative min-h-[48px] min-w-[65px] flex-1 flex flex-col items-center justify-center py-1 rounded-full text-gray-500 hover:text-marigold-700 touch-manipulation active:scale-90 duration-75"
              >
                <Building2 className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">Profile & QR</span>
              </motion.button>

              {/* 3. Support Helpdesk */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                onClick={openSupportModal}
                aria-label="Helpdesk & Support"
                className="relative min-h-[48px] min-w-[65px] flex-1 flex flex-col items-center justify-center py-1 rounded-full text-gray-500 hover:text-sindoor-600 touch-manipulation active:scale-90 duration-75"
              >
                <HeartHandshake className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">Helpdesk</span>
              </motion.button>

              {/* 4. Sign Out */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                onClick={logout}
                aria-label="Sign Out"
                className="relative min-h-[48px] min-w-[65px] flex-1 flex flex-col items-center justify-center py-1 rounded-full text-rose-500 touch-manipulation active:scale-90 duration-75"
              >
                <LogOut className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">Log Out</span>
              </motion.button>
            </>
          )}

        </nav>
      </div>
    </aside>
  );
};
