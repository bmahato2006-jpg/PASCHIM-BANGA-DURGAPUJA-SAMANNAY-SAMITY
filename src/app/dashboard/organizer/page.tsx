'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { auth, onAuthStateChanged, signOut, FirebaseUser } from '@/lib/firebase';
import { 
  QrCode, 
  Vote, 
  Sparkles, 
  Palette, 
  Zap, 
  Leaf, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  LogOut, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [committeeId, setCommitteeId] = useState<string>('marxgunj-sarbojanin');
  const [committeeName, setCommitteeName] = useState<string>('Marxgunj Sarbojanin Durga Puja');
  const [zone, setZone] = useState<string>('Benachity Zone, Ward 24');
  const [copied, setCopied] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>('https://durgapur-puja-voting.vercel.app');

  // Monitor Firebase Auth session state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser?.email) {
        // Derive committee name and id from organizer profile
        const emailSlug = currentUser.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        setCommitteeId(emailSlug || 'committee-desk');
        setCommitteeName(currentUser.displayName || 'Authorized Durga Puja Committee');
      }
    });

    return () => unsubscribe();
  }, []);

  const votingUrl = `${origin}/vote/${committeeId}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(votingUrl);
      setCopied(true);
      toast.success('ভোটের লিঙ্ক কপি হয়েছে (Voting link copied)!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('লগআউট সম্পন্ন হয়েছে (Logged out successfully)');
      router.push('/organizer/auth');
    } catch {
      toast.error('Sign out failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-9 h-9 text-sindoor-600 animate-spin" />
          <p className="text-sm font-semibold text-gray-700">আয়োজক প্যানেল লোড হচ্ছে (Loading Organizer Desk)...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#22150F]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sindoor-600 to-marigold-500 flex items-center justify-center text-white shadow-sm">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-gray-900 leading-none">
                আয়োজক লাইভ ভোটিং ডেস্ক
              </h1>
              <span className="text-[11px] text-gray-600 font-medium">
                Organizer Live Voting & QR Desk (Durga Puja 2026)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-gray-900 truncate max-w-[180px]">
                    {user.displayName || user.email}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3 h-3" /> যাচাইকৃত আয়োজক
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-gray-500" />
                  <span className="hidden sm:inline">লগআউট (Logout)</span>
                </button>
              </>
            ) : (
              <Link
                href="/organizer/auth"
                className="px-3.5 py-1.5 rounded-lg bg-sindoor-600 text-white text-xs font-bold hover:bg-sindoor-700 shadow-sm transition-all"
              >
                লগইন করুন (Organizer Login)
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Unauthenticated Alert Banner */}
        {!user && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold text-amber-900">
                অতিথি মোড (Guest Preview Mode)
              </p>
              <p className="text-amber-700 mt-0.5">
                আপনি বর্তমানে লগইন ছাড়াই আয়োজক ড্যাশবোর্ডটি দেখছেন। সম্পূর্ণ অ্যাক্সেস ও লাইভ ডেটা পেতে আপনার অনুমোদিত আয়োজক অ্যাকাউন্ট দিয়ে লগইন করুন।
              </p>
            </div>
          </div>
        )}

        {/* Committee Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-100/60 border border-amber-200/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200/80 text-amber-900 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-sindoor-600" /> দুর্গাপূজা ২০২৬ নিবন্ধিত মণ্ডপ
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {committeeName}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
              {zone} • কমিটি আইডি: <code className="bg-white/80 px-1.5 py-0.5 rounded text-amber-950 font-mono">{committeeId}</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${committeeId}`}
              className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-gray-800 hover:bg-amber-50 shadow-xs flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
              পাবলিক পেজ দেখুন
            </Link>
          </div>
        </div>

        {/* Top 3 Core Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SECTION 1: Pandal QR Code System */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-amber-200/70 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sindoor-100 flex items-center justify-center text-sindoor-600">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    মণ্ডপ কিউআর কোড (Pandal QR Code)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  সক্রিয় (Active)
                </span>
              </div>

              <p className="text-xs text-gray-600 mb-5">
                দর্শনার্থীরা মণ্ডপে প্রবেশ করে এই কিউআর স্ক্যান করলেই সরাসরি ভোট দিতে পারবেন।
              </p>

              {/* QR Code Container */}
              <div className="p-5 bg-gradient-to-b from-amber-50/50 to-white rounded-xl border border-amber-200/80 flex flex-col items-center justify-center mb-5">
                <div className="p-3 bg-white rounded-xl shadow-md border border-gray-100">
                  <QRCode
                    value={votingUrl}
                    size={180}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    viewBox={`0 0 180 180`}
                  />
                </div>
                <span className="text-[11px] font-mono text-gray-500 mt-3 truncate max-w-full">
                  /vote/{committeeId}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-950 flex items-center justify-center gap-2 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-amber-700" />}
                {copied ? 'কপি সম্পন্ন (Copied)!' : 'ভোটের লিংক কপি করুন (Copy Link)'}
              </button>

              <button
                onClick={() => toast.success('QR কোড কার্ড ডাউনলোড শুরু হয়েছে (Preparing Download)...')}
                className="w-full py-2.5 px-3 rounded-xl bg-sindoor-600 hover:bg-sindoor-700 text-xs font-bold text-white shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                গেট ব্যানার ও QR ডাউনলোড (PNG)
              </button>
            </div>
          </div>

          {/* SECTION 2: Organizer Live Voting Desk Stats */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Real-time Tally Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white border border-amber-200/70 shadow-xs">
                <span className="text-[11px] font-bold text-gray-600 block">মোট ভোট (Total Votes)</span>
                <span className="text-2xl font-black text-sindoor-600 mt-1 block">০</span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> লাইভ আপডেট
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-amber-200/70 shadow-xs">
                <span className="text-[11px] font-bold text-gray-600 block">আজকের ভিজিটর (Visits Today)</span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">০</span>
                <span className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> স্ক্যান ট্র্যাকিং
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-amber-200/70 shadow-xs">
                <span className="text-[11px] font-bold text-gray-600 block">বর্তমান র‍্যাংক (Rank)</span>
                <span className="text-2xl font-black text-gray-900 mt-1 block">--</span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3" /> পশ্চিম বর্ধমান
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-amber-200/70 shadow-xs">
                <span className="text-[11px] font-bold text-gray-600 block">সার্ভার স্ট্যাটাস (Status)</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">সক্রিয়</span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> সুরক্ষিত ট্যালি
                </span>
              </div>
            </div>

            {/* 4 Category Award Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-amber-200/70 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Vote className="w-4 h-4 text-sindoor-600" />
                ৪টি ক্যাটাগরির লাইভ ভোট বিন্যাস (Category Vote Breakdown)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Idol */}
                <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">সেরা প্রতিমা (Best Idol)</h4>
                      <span className="text-[10px] text-gray-600">শিল্প ও দেবীরূপ</span>
                    </div>
                  </div>
                  <span className="text-lg font-black text-rose-600">০</span>
                </div>

                {/* Theme */}
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">সেরা ভাবনা (Best Theme)</h4>
                      <span className="text-[10px] text-gray-600">মণ্ডপ সজ্জা ও বার্তা</span>
                    </div>
                  </div>
                  <span className="text-lg font-black text-amber-600">০</span>
                </div>

                {/* Lighting */}
                <div className="p-4 rounded-xl bg-yellow-50/60 border border-yellow-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">সেরা আলোকসজ্জা (Lighting)</h4>
                      <span className="text-[10px] text-gray-600">চন্দননগর আলো</span>
                    </div>
                  </div>
                  <span className="text-lg font-black text-yellow-700">০</span>
                </div>

                {/* Eco */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">পরিবেশবান্ধব (Eco-Friendly)</h4>
                      <span className="text-[10px] text-gray-600">প্রকৃতি সংরক্ষণ</span>
                    </div>
                  </div>
                  <span className="text-lg font-black text-emerald-600">০</span>
                </div>

              </div>
            </div>

            {/* Live Voting Stream Placeholder */}
            <div className="bg-white rounded-2xl p-6 border border-amber-200/70 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  সাম্প্রতিক ভোটিং স্ট্রিম (Recent Votes Log)
                </h3>
                <span className="text-[10px] font-medium text-gray-500">Firebase Firestore Realtime</span>
              </div>

              <div className="text-center py-8 text-gray-500 text-xs bg-amber-50/30 rounded-xl border border-dashed border-amber-200">
                <Vote className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
                এখনও কোনো নতুন ভোট জমা পড়েনি। কিউআর কোড স্ক্যান করে ভোট শুরু করুন।
                <span className="block text-[10px] text-gray-400 mt-1">
                  (Live ballot entries will appear here in real time)
                </span>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
