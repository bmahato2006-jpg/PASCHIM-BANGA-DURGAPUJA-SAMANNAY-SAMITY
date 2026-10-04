'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Pandal } from '@/types';
import { useApp } from '@/context/AppContext';
import { DhakButton } from '@/components/ui/DhakButton';
import confetti from 'canvas-confetti';
import { 
  MapPin, 
  Sparkles, 
  Palette, 
  Zap, 
  Leaf, 
  Share2, 
  Vote, 
  Check, 
  Flame, 
  ShieldCheck,
  Eye,
  SunMedium,
  Building2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const PandalCard: React.FC<{ 
  pandal: Pandal; 
  onViewDetails?: (pandal: Pandal) => void;
}> = ({ pandal, onViewDetails }) => {
  const { openVotingModal, userVotes, isOrganizer, isPandalHonored, votedPandals } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [hasVotedLocally, setHasVotedLocally] = useState<boolean>(false);

  // Layer 3: SSR-safe client-side check with isMounted pattern
  useEffect(() => {
    setIsMounted(true);
    const isVoted = 
      localStorage.getItem(`hasVoted_${pandal.id}`) === 'true' || 
      isPandalHonored(pandal.id) || 
      votedPandals.includes(pandal.id);
    setHasVotedLocally(isVoted);
  }, [pandal.id, userVotes, isPandalHonored, votedPandals]);

  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  // 3D Tilt Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 280, damping: 26 });
  const mouseYSpring = useSpring(y, { stiffness: 280, damping: 26 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
    setGlarePos({ x: (mouseX / rect.width) * 100, y: (mouseY / rect.height) * 100 });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const userVotesForThis = userVotes.filter((v) => v.pandalId === pandal.id);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/#${pandal.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const triggerVoteTapConfetti = (e: React.MouseEvent) => {
    try {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const xOrigin = (rect.left + rect.width / 2) / window.innerWidth;
      const yOrigin = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 28,
        spread: 60,
        origin: { x: xOrigin, y: yOrigin },
        colors: ['#D9222A', '#F58220', '#FFD700', '#FFFFFF'],
        scalar: 0.8,
        ticks: 50,
      });
    } catch (err) {}
    openVotingModal(pandal);
  };

  const images = pandal.gallery?.length > 0 
    ? pandal.gallery.map((g) => g.url) 
    : [pandal.coverImage];

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card-premium rounded-3xl overflow-hidden border border-amber-200/80 flex flex-col justify-between group relative h-full transition-shadow duration-300"
      >
        {/* Dynamic Aceternity Spotlight Cursor Follower */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl z-20 transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${glarePos.x}% ${glarePos.y}%, rgba(245, 130, 32, 0.12), transparent 70%)`,
            }}
          />
        )}

        {/* Ambient Subtle Border Glow */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-sindoor-500/0 via-marigold-500/25 to-amber-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-sm" />

        {/* Top Pandal Header */}
        <div className="p-4 flex items-center justify-between bg-white/75 backdrop-blur-md border-b border-amber-100/60 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              {pandal.logoUrl ? (
                <img
                  src={pandal.logoUrl}
                  alt={pandal.clubName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-marigold-400 shadow-xs bg-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sindoor-500 to-marigold-500 p-0.5 shadow-xs">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <Flame className="w-5 h-5 text-sindoor-500 animate-pulse-subtle" />
                  </div>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 rounded-full ring-2 ring-white">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-serif font-black text-base sm:text-lg text-gray-900 leading-snug truncate group-hover:text-sindoor-600 transition-colors">
                {pandal.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-sindoor-500 shrink-0" />
                <span className="truncate">{pandal.location}</span>
                <span className="text-gray-300">•</span>
                <span className="text-amber-800 font-semibold shrink-0">{pandal.ward}</span>
              </div>
            </div>
          </div>

          {/* Quick Share Button */}
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="p-2.5 rounded-2xl hover:bg-amber-100/60 text-gray-400 hover:text-sindoor-600 transition shrink-0"
            title="Copy Direct Link to Pandal"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Media Photo Showcase */}
        <div 
          onClick={() => onViewDetails && onViewDetails(pandal)}
          className="relative h-56 sm:h-64 w-full bg-gray-100 overflow-hidden cursor-pointer"
        >
          <img
            src={images[activeImageIndex]}
            alt={pandal.theme}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          {/* Eco-Friendly Ribbon Badge */}
          {pandal.isEcoFriendly && (
            <div className="absolute top-3 left-3 z-10">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-600/90 text-white backdrop-blur-md border border-emerald-400/40 shadow-sm">
                <Leaf className="w-3 h-3 text-emerald-200" />
                <span>100% Eco-Friendly</span>
              </div>
            </div>
          )}

          {/* Live Total Vote Badge */}
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-black/60 text-amber-300 backdrop-blur-md border border-amber-300/40 shadow-lg">
              <Flame className="w-3.5 h-3.5 text-sindoor-400 animate-pulse" />
              <span>{pandal.totalVotes.toLocaleString()} Votes</span>
            </div>
          </div>

          {/* Puja Theme Caption */}
          <div className="absolute bottom-3 left-3 right-3 text-white z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <SunMedium className="w-3 h-3 text-amber-400" />
              2026 Puja Theme
            </span>
            <h4 className="text-base sm:text-lg font-serif font-black leading-tight drop-shadow-md line-clamp-1">
              {pandal.theme}
            </h4>
          </div>

          {/* Photo Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-1 right-3 flex gap-1 z-10">
              {images.slice(0, 4).map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    activeImageIndex === idx ? 'w-4 bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card Body & 4 Judging Categories */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-4 relative z-10">
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {pandal.themeDescription}
          </p>

          {/* 4 Distinct Category Vote Counters */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/70 border border-rose-100">
              <div className="flex items-center gap-1.5 text-sindoor-700 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-sindoor-500" />
                <span>Idol</span>
              </div>
              <span className="font-bold text-gray-900">{pandal.votes.idol.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-orange-50/70 border border-orange-100">
              <div className="flex items-center gap-1.5 text-marigold-700 font-medium">
                <Palette className="w-3.5 h-3.5 text-marigold-500" />
                <span>Theme</span>
              </div>
              <span className="font-bold text-gray-900">{pandal.votes.theme.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-100">
              <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Lighting</span>
              </div>
              <span className="font-bold text-gray-900">{pandal.votes.lighting.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>Eco</span>
              </div>
              <span className="font-bold text-gray-900">{pandal.votes.eco.toLocaleString()}</span>
            </div>
          </div>

          {/* Actions with 48px Thumb-Friendly Touch Targets & Confetti Burst */}
          <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onViewDetails && onViewDetails(pandal)}
              className="min-h-[48px] px-4 py-2.5 rounded-2xl text-xs font-bold border border-amber-200/80 bg-white/90 hover:bg-white text-gray-700 flex items-center gap-1.5 transition shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-gray-500" />
              <span>Details</span>
            </motion.button>

            {/* If Voter or Guest: Show active Vote Now button (Organizers NEVER see any vote button) */}
            {!isOrganizer && (() => {
              const isHonored = isMounted && (hasVotedLocally || userVotesForThis.length > 0 || isPandalHonored(pandal.id));
              return (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={triggerVoteTapConfetti}
                  className={`flex-1 min-h-[48px] py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                    isHonored
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs'
                      : 'btn-festive-primary shadow-festive'
                  }`}
                >
                  {isHonored ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Already Honored</span>
                    </>
                  ) : (
                    <>
                      <Vote className="w-4 h-4 text-white" />
                      <span>Award Token</span>
                    </>
                  )}
                </motion.button>
              );
            })()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
