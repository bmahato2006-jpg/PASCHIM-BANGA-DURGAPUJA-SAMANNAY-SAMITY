'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Home, QrCode, ArrowLeft, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-transparent text-[#22150F] flex flex-col justify-between selection:bg-amber-200 selection:text-amber-950 overflow-x-hidden font-sans">
      
      {/* Top Header / Branding */}
      <header className="sticky top-0 z-30 w-full bg-white/85 backdrop-blur-xl border-b border-amber-200/60 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-700 hover:text-sindoor-600 transition-colors group touch-manipulation active:scale-95 duration-75"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 group-hover:bg-sindoor-100 group-hover:text-sindoor-600 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold tracking-tight">হোমপেজ</span>
              <span className="text-[10px] text-gray-500 font-normal leading-none">(Homepage)</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-right min-w-0">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-xs border border-orange-200">
              <Image
                src="/logo.jpg"
                alt="PBDS Logo"
                width={32}
                height={32}
                priority
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col text-right truncate">
              <span className="text-[11px] sm:text-xs font-black tracking-tight text-gray-900 font-serif truncate">
                পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি
              </span>
              <span className="text-[10px] text-gray-500 truncate">
                Paschim Banga DurgaPuja Samannay Samity
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Frosted Glass 404 Hero Card */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg mx-auto bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl sm:rounded-[2.5rem] border border-white/60 p-6 sm:p-10 text-center space-y-6"
        >
          {/* Decorative Puja Motifs Header */}
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 border-2 border-amber-300 flex items-center justify-center shadow-inner group">
            <span className="text-5xl sm:text-6xl filter drop-shadow-md select-none transform group-hover:scale-110 transition-transform duration-300">
              🪔
            </span>
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-sindoor-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>৪০৪ • মণ্ডপ খুঁজে পাওয়া যায়নি (404 - Not Found)</span>
          </div>

          {/* Main Error Heading & Description */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight leading-snug">
              ৪০৪ - দুঃখিত! মণ্ডপ খুঁজে পাওয়া যায়নি
            </h1>
            <p className="text-base sm:text-lg font-bold text-sindoor-700">
              404 - Oops! Pandal Not Found
            </p>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed pt-1">
              অনুগ্রহ করে নিশ্চিত করুন যে আপনি সঠিক কিউআর কোড স্ক্যান করেছেন অথবা ঠিকানাটি সঠিক রয়েছে।
            </p>
            <p className="text-[11px] sm:text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              (Please ensure you scanned the correct QR code or verify the destination address.)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sindoor-600 to-amber-600 hover:from-sindoor-700 hover:to-amber-700 text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation"
            >
              <Home className="w-4 h-4" />
              <span>মূল পাতায় ফিরে যান (Back to Homepage)</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-amber-50 text-gray-800 text-xs sm:text-sm font-bold border border-amber-200 shadow-xs hover:shadow-md transition-all active:scale-95 touch-manipulation"
            >
              <QrCode className="w-4 h-4 text-sindoor-600" />
              <span>কিউআর স্ক্যানার খুলুন (Scan QR)</span>
            </Link>
          </div>

          {/* Footer Cultural Reassurance */}
          <div className="pt-4 border-t border-amber-200/50 text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • পশ্চিমবঙ্গ</span>
          </div>
        </motion.div>
      </main>

      {/* Clean Bottom Bar */}
      <footer className="w-full border-t border-amber-200/60 bg-white/70 backdrop-blur-md py-4 text-center">
        <p className="text-[11px] text-gray-500">
          © {new Date().getFullYear()} পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি (Paschim Banga DurgaPuja Samannay Samity)
        </p>
      </footer>

    </div>
  );
}
