'use client';

import React, { useState, useEffect } from 'react';
import { Pandal } from '@/types';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Sparkles, 
  Palette, 
  Zap, 
  Leaf, 
  Vote, 
  Check, 
  Calendar, 
  Phone, 
  User, 
  IndianRupee, 
  Flame, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const PandalDetailModal: React.FC<{
  pandal: Pandal | null;
  onClose: () => void;
}> = ({ pandal, onClose }) => {
  const { openVotingModal, isOrganizer, isPandalHonored, votedPandals } = useApp();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isPandalVoted, setIsPandalVoted] = useState(false);

  // Layer 3: SSR-safe client-side check with isMounted pattern
  useEffect(() => {
    setIsMounted(true);
    if (pandal) {
      const isHonored = 
        localStorage.getItem(`hasVoted_${pandal.id}`) === 'true' || 
        isPandalHonored(pandal.id) || 
        votedPandals.includes(pandal.id);
      setIsPandalVoted(isHonored);
    }
  }, [pandal, isPandalHonored, votedPandals]);

  if (!pandal) return null;

  const gallery = pandal.gallery?.length > 0 
    ? pandal.gallery 
    : [{ id: 'cov', url: pandal.coverImage, caption: pandal.theme, type: 'photo' as const, tag: 'Theme' as const }];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative w-full max-w-3xl glass-modal rounded-3xl overflow-hidden my-6 border-2 border-amber-300 shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Sticky Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between bg-white/90 border-b border-amber-100/70 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sindoor-600 bg-sindoor-50 px-2.5 py-1 rounded-full border border-sindoor-200">
              {pandal.ward}
            </span>
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">
              Est. {pandal.establishedYear}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          
          {/* Main Title & Landmark */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight leading-tight">
              {pandal.name}
            </h2>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs sm:text-sm text-gray-600">
              <span className="flex items-center gap-1 text-amber-900 font-medium">
                <MapPin className="w-4 h-4 text-sindoor-500 shrink-0" />
                {pandal.location}
              </span>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <span className="text-gray-600">
                Landmark: {pandal.nearLandmark}
              </span>
            </div>
          </div>

          {/* Interactive Photo Carousel */}
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-900 shadow-lg">
            <img
              src={gallery[selectedPhotoIndex]?.url || pandal.coverImage}
              alt={gallery[selectedPhotoIndex]?.caption || pandal.name}
              className="w-full h-full object-cover"
            />

            {/* Photo Caption Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sindoor-500 text-white">
                  {gallery[selectedPhotoIndex]?.tag || 'Photo'}
                </span>
                <span className="text-xs text-amber-200">
                  {selectedPhotoIndex + 1} of {gallery.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium drop-shadow">
                {gallery[selectedPhotoIndex]?.caption || pandal.theme}
              </p>
            </div>

            {/* Navigation Arrows */}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 backdrop-blur-sm transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedPhotoIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 backdrop-blur-sm transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails strip */}
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {gallery.map((media, idx) => (
                <button
                  key={media.id}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                    selectedPhotoIndex === idx ? 'border-sindoor-500 scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={media.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Theme & Concept Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-marigold-600" />
              Puja Concept & Artistic Philosophy
            </h4>
            <h3 className="text-base sm:text-lg font-serif font-black text-gray-900">
              {pandal.theme}
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {pandal.themeDescription}
            </p>
          </div>

          {/* 4 Category Votes Breakdown Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Official Category Votes Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                <Sparkles className="w-5 h-5 text-sindoor-500 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-gray-600 block">Best Idol</span>
                <span className="text-lg font-black text-sindoor-700">{pandal.votes.idol.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-center">
                <Palette className="w-5 h-5 text-marigold-500 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-gray-600 block">Best Theme</span>
                <span className="text-lg font-black text-marigold-700">{pandal.votes.theme.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-gray-600 block">Best Lighting</span>
                <span className="text-lg font-black text-amber-700">{pandal.votes.lighting.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <Leaf className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-gray-600 block">Best Eco</span>
                <span className="text-lg font-black text-emerald-700">{pandal.votes.eco.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Club Committee & Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white border border-gray-200 text-xs">
              <span className="text-gray-400 block font-medium">President</span>
              <span className="font-bold text-gray-900 mt-0.5 block">{pandal.presidentName}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-gray-200 text-xs">
              <span className="text-gray-400 block font-medium">Secretary</span>
              <span className="font-bold text-gray-900 mt-0.5 block">{pandal.secretaryName}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-gray-200 text-xs">
              <span className="text-gray-400 block font-medium">Emergency Contact</span>
              <span className="font-bold text-gray-900 mt-0.5 block">{pandal.contactNumber}</span>
            </div>
          </div>

        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 bg-white/90 border-t border-amber-100 flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-xs text-gray-500 block">Total Live Votes</span>
            <span className="text-lg font-black text-gray-900">{pandal.totalVotes.toLocaleString()}</span>
          </div>

          {!isOrganizer && (() => {
            const isHonored = isMounted && isPandalVoted;
            return (
              <button
                disabled={isHonored}
                onClick={() => {
                  if (!isHonored) {
                    onClose();
                    openVotingModal(pandal);
                  }
                }}
                className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
                  isHonored
                    ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300 shadow-2xs cursor-not-allowed opacity-90'
                    : 'btn-festive-primary shadow-festive'
                }`}
              >
                {isHonored ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>You have already honored this pandal.</span>
                  </>
                ) : (
                  <>
                    <Vote className="w-4 h-4" />
                    <span>Vote for this Pandal</span>
                  </>
                )}
              </button>
            );
          })()}
        </div>
      </motion.div>
    </div>
  );
};
