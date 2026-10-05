'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signOut, 
  collection, 
  doc, 
  query, 
  where, 
  onSnapshot,
  FirebaseUser 
} from '@/lib/firebase';
import { 
  QrCode, 
  Vote, 
  Sparkles, 
  Palette, 
  Zap, 
  Leaf, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  LogOut, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertCircle,
  Building2,
  Loader2,
  Award,
  Radio
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CommitteeData {
  id: string;
  user_id?: string;
  committee_name?: string;
  name?: string;
  clubName?: string;
  slug?: string;
  ward?: string;
  secretary_name?: string;
  contact_number?: string;
  email?: string;
  theme?: string;
  budget?: string;
  total_votes?: number;
  votes?: {
    idol?: number;
    theme?: number;
    lighting?: number;
    eco?: number;
  };
}

export default function OrganizerDashboardPage() {
  const router = useRouter();

  // Authentication State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Firestore Committee State
  const [committee, setCommittee] = useState<CommitteeData | null>(null);
  const [pandalVotesData, setPandalVotesData] = useState<any>(null);
  const [committeeLoading, setCommitteeLoading] = useState<boolean>(true);

  // UI Interactive States
  const [copied, setCopied] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>('https://durgapur-puja-voting.vercel.app');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Fetch organizer's committee document in real-time using onSnapshot
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setCommittee(null);
      setCommitteeLoading(false);
      return;
    }

    setCommitteeLoading(true);

    let unsubCommitteeQuery: (() => void) | null = null;
    let unsubDirectDoc: (() => void) | null = null;
    let unsubPandalDoc: (() => void) | null = null;

    try {
      // Primary query: committees collection where user_id matches logged-in UID
      const committeesRef = collection(db, 'committees');
      const q = query(committeesRef, where('user_id', '==', user.uid));

      unsubCommitteeQuery = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const firstDoc = snapshot.docs[0];
            const data = firstDoc.data() as Partial<CommitteeData>;
            const resolvedId = firstDoc.id || data.slug || data.id || 'committee';

            const resolvedCommittee: CommitteeData = {
              id: resolvedId,
              ...data,
            };

            setCommittee(resolvedCommittee);
            setCommitteeLoading(false);

            // Listen to corresponding pandals document for mirrored vote increments
            if (resolvedId && !unsubPandalDoc) {
              const pandalDocRef = doc(db, 'pandals', resolvedId);
              unsubPandalDoc = onSnapshot(
                pandalDocRef,
                (pSnap) => {
                  if (pSnap.exists()) {
                    setPandalVotesData(pSnap.data());
                  }
                },
                (err) => {
                  console.warn('Pandal live listener notice:', err);
                }
              );
            }
          } else {
            // Secondary fallback: Direct document lookup by UID
            const directRef = doc(db, 'committees', user.uid);
            unsubDirectDoc = onSnapshot(
              directRef,
              (directSnap) => {
                if (directSnap.exists()) {
                  const directData = directSnap.data() as Partial<CommitteeData>;
                  const resolvedId = directSnap.id || directData.slug || directData.id || user.uid;

                  setCommittee({
                    id: resolvedId,
                    ...directData,
                  });
                  setCommitteeLoading(false);
                } else if (user.email) {
                  // Tertiary fallback: query by email
                  const emailQ = query(collection(db, 'committees'), where('email', '==', user.email));
                  onSnapshot(
                    emailQ,
                    (emailSnap) => {
                      if (!emailSnap.empty) {
                        const eDoc = emailSnap.docs[0];
                        const eData = eDoc.data() as Partial<CommitteeData>;
                        const resolvedId = eDoc.id || eData.slug || eData.id || 'committee';
                        setCommittee({
                          id: resolvedId,
                          ...eData,
                        });
                      } else {
                        setCommittee(null);
                      }
                      setCommitteeLoading(false);
                    },
                    () => {
                      setCommittee(null);
                      setCommitteeLoading(false);
                    }
                  );
                } else {
                  setCommittee(null);
                  setCommitteeLoading(false);
                }
              },
              () => {
                setCommittee(null);
                setCommitteeLoading(false);
              }
            );
          }
        },
        (error) => {
          console.error('Firestore onSnapshot committee error:', error);
          setCommitteeLoading(false);
        }
      );
    } catch (err) {
      console.error('Failed to initialize onSnapshot listener:', err);
      setCommitteeLoading(false);
    }

    return () => {
      if (unsubCommitteeQuery) unsubCommitteeQuery();
      if (unsubDirectDoc) unsubDirectDoc();
      if (unsubPandalDoc) unsubPandalDoc();
    };
  }, [user, authLoading]);

  // Extract resolved committee details & dynamic voting URL
  const committeeId = committee?.id || committee?.slug || '';
  const committeeName = committee?.committee_name || committee?.name || committee?.clubName || 'দুর্গাপূজা কমিটি';
  const ward = committee?.ward || 'পশ্চিম বর্ধমান';
  const theme = committee?.theme || 'শারদীয় ঐতিহ্যবাহী দুর্গাপূজা';
  const secretaryName = committee?.secretary_name || user?.displayName || 'আয়োজক সম্পাদক';

  // Dynamic voting URL pointing directly to the pandal's voting page
  const votingUrl = `${origin}/vote/${committeeId}`;

  // Live vote tallies synchronized between committees and pandals documents
  const liveTotalVotes = Math.max(
    Number(committee?.total_votes || 0),
    Number(pandalVotesData?.total_votes || 0)
  );

  const idolVotes = Number(pandalVotesData?.votes?.idol || committee?.votes?.idol || 0);
  const themeVotes = Number(pandalVotesData?.votes?.theme || committee?.votes?.theme || 0);
  const lightingVotes = Number(pandalVotesData?.votes?.lighting || committee?.votes?.lighting || 0);
  const ecoVotes = Number(pandalVotesData?.votes?.eco || committee?.votes?.eco || 0);

  // Copy voting URL with instant toast feedback
  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(votingUrl);
      setCopied(true);
      toast.success('ভোটের লিঙ্ক কপি হয়েছে (Voting link copied)!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('লগআউট সম্পন্ন হয়েছে (Logged out successfully)');
      router.push('/organizer/auth');
    } catch {
      toast.error('লগআউট ব্যর্থ হয়েছে (Sign out failed)');
    }
  };

  // Browser Print trigger for Gate Poster
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Download high-resolution QR Code PNG
  const handleDownloadQR = () => {
    try {
      setIsDownloading(true);
      const svg = document.getElementById('pandal-voting-qr-code');
      if (!svg) {
        toast.error('QR কোড লোড করা যায়নি');
        setIsDownloading(false);
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 1200;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, canvas.width, canvas.height);
          // Draw QR in center with crisp padding
          context.drawImage(image, 150, 150, 900, 900);

          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = `${committeeId || 'durgapuja'}-voting-qr.png`;
          downloadLink.href = pngUrl;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          toast.success('QR কোড সফলভাবে ডাউনলোড হয়েছে (QR Code downloaded)!');
        }
        setIsDownloading(false);
        URL.revokeObjectURL(blobURL);
      };
      image.onerror = () => {
        setIsDownloading(false);
        URL.revokeObjectURL(blobURL);
        toast.error('QR কোড প্রসেস করতে সমস্যা হয়েছে');
      };
      image.src = blobURL;
    } catch (err) {
      console.error('QR download error:', err);
      setIsDownloading(false);
      toast.error('ডাউনলোড ব্যর্থ হয়েছে');
    }
  };

  // -------------------------------------------------------------
  // LOADING STATE
  // -------------------------------------------------------------
  if (authLoading || (user && committeeLoading)) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-sindoor-600 shadow-inner">
              <Vote className="w-8 h-8 animate-pulse text-sindoor-600" />
            </div>
            <Loader2 className="w-7 h-7 text-sindoor-600 animate-spin absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              আয়োজক লাইভ ডেস্ক লোড হচ্ছে...
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              {authLoading 
                ? 'প্রমাণীকরণ যাচাই করা হচ্ছে (Verifying Organizer Authentication)...' 
                : 'ফায়ারস্টোর থেকে কমিটির লাইভ ডেটা আনা হচ্ছে (Connecting Live Firestore)...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // UNAUTHENTICATED STATE
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-amber-200 shadow-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto mb-4">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            আয়োজক লগইন প্রয়োজন
          </h2>
          <p className="text-xs text-gray-600 mt-2 mb-6 leading-relaxed">
            আপনার দুর্গাপূজা কমিটির লাইভ ভোটিং ডেস্ক ও অফিশিয়াল মণ্ডপ কিউআর কোড পরিচালনা করতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।
          </p>

          <Link
            href="/organizer/auth"
            className="w-full py-3 px-4 rounded-xl bg-sindoor-600 hover:bg-sindoor-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            আয়োজক লগইন করুন (Organizer Login)
          </Link>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              href="/"
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              ← মূল পাতায় ফিরে যান (Back to Home)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // NO REGISTERED COMMITTEE FOUND STATE
  // -------------------------------------------------------------
  if (!committee) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] text-[#22150F] flex flex-col">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sindoor-600 to-marigold-500 flex items-center justify-center text-white shadow-sm">
                <Vote className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm sm:text-base text-gray-900">
                লাইভ ভোটিং ডেস্ক (Live Voting Desk)
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-500" />
              লগআউট
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-amber-200 shadow-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              কোনো নিবন্ধিত দুর্গাপূজা কমিটি পাওয়া যায়নি
            </h2>
            <p className="text-xs text-gray-600 mt-2 mb-1">
              লগইন করা অ্যাকাউন্ট: <strong className="text-gray-900">{user.email}</strong>
            </p>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              আপনার অ্যাকাউন্টের অধীনে এখনও কোনো দুর্গাপূজা কমিটি নিবন্ধিত হয়নি। অনুগ্রহ করে আপনার মণ্ডপ ও কমিটি নিবন্ধন সম্পন্ন করুন।
            </p>

            <div className="space-y-3">
              <Link
                href="/organizer/setup"
                className="w-full py-3 px-4 rounded-xl bg-sindoor-600 hover:bg-sindoor-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                কমিটি নিবন্ধন করুন (Register Committee)
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-gray-500" />
                অন্য অ্যাকাউন্ট দিয়ে লগইন করুন
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // FULL ACTIVE ORGANIZER DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#22150F]">
      
      {/* ------------------------------------------------------- */}
      {/* PRINT-ONLY OFFICIAL GATE POSTER (Visible on print only) */}
      {/* ------------------------------------------------------- */}
      <div className="hidden print:block p-8 bg-white text-black min-h-screen">
        <div className="max-w-2xl mx-auto border-4 border-amber-700 p-8 rounded-3xl text-center space-y-6">
          <div className="border-b-2 border-amber-600 pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
              পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • দুর্গাপূজা ২০২৬
            </span>
            <h1 className="text-3xl font-black text-gray-900 mt-1">
              {committeeName}
            </h1>
            <p className="text-sm font-semibold text-amber-900 mt-1">
              {ward} {theme ? `• ${theme}` : ''}
            </p>
          </div>

          <div className="py-4 flex flex-col items-center justify-center">
            <div className="p-4 bg-white border-4 border-amber-500 rounded-2xl shadow-none">
              <QRCode
                id="print-qr-code"
                value={votingUrl}
                size={280}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                viewBox="0 0 280 280"
              />
            </div>
            <p className="text-xs font-mono text-gray-700 mt-3">
              {votingUrl}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl text-left space-y-2">
            <h3 className="text-sm font-bold text-amber-950 text-center mb-2">
              ভোট দিতে QR কোড স্ক্যান করুন (Scan QR to Vote)
            </h3>
            <ol className="text-xs text-gray-800 list-decimal list-inside space-y-1 font-medium">
              <li>আপনার স্মার্টফোনের ক্যামেরা বা গুগল লেন্স খুলুন।</li>
              <li>উপরের কিউআর কোডটি স্ক্যান করে অফিশিয়াল পেজে যান।</li>
              <li>সেরা প্রতিমা, সেরা ভাবনা, আলোকসজ্জা ও পরিবেশবান্ধব বিভাগে আপনার মূল্যবান ভোট দিন।</li>
            </ol>
          </div>

          <div className="pt-4 border-t border-gray-300 flex justify-between items-center text-[11px] text-gray-500">
            <span>আইডি: {committeeId}</span>
            <span>সম্পাদনা: {secretaryName}</span>
            <span>যাচাইকৃত দুর্গাপূজা মণ্ডপ</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- */}
      {/* SCREEN UI HEADER */}
      {/* ------------------------------------------------------- */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-amber-200/70 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sindoor-600 to-marigold-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-gray-900 leading-none">
                  লাইভ ভোটিং ডেস্ক (Live Voting Desk)
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  লাইভ সিঙ্ক সক্রিয়
                </span>
              </div>
              <span className="text-[11px] text-gray-600 font-medium">
                পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি (Durga Puja 2026)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]">
                {secretaryName}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3" /> যাচাইকৃত আয়োজক
              </span>
            </div>

            <button
              onClick={handlePrint}
              className="hidden sm:flex px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-amber-700" />
              গেট পোস্টার প্রিন্ট
            </button>

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-500" />
              লগআউট
            </button>
          </div>

        </div>
      </header>

      {/* ------------------------------------------------------- */}
      {/* SCREEN UI MAIN CONTENT */}
      {/* ------------------------------------------------------- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:hidden">

        {/* Committee Hero Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-100/70 border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-200/80 text-amber-900">
                <ShieldCheck className="w-3.5 h-3.5 text-sindoor-600" /> দুর্গাপূজা ২০২৬ নিবন্ধিত মণ্ডপ
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white text-gray-700 border border-amber-200">
                {ward}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {committeeName}
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              ভাবনা: <strong className="text-gray-800">{theme}</strong> • কমিটি কোড:{' '}
              <code className="bg-white/90 px-2 py-0.5 rounded text-amber-950 font-mono font-bold text-xs border border-amber-200">
                {committeeId}
              </code>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link
              href={`/vote/${committeeId}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-gray-800 hover:bg-amber-50 shadow-xs flex items-center gap-2 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
              ভোটিং পেজ খুলুন
            </Link>

            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-xs font-bold text-amber-950 shadow-xs flex items-center gap-2 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-800" />}
              {copied ? 'কপি হয়েছে!' : 'লিঙ্ক কপি করুন'}
            </button>
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* --------------------------------------------------- */}
          {/* LEFT COLUMN: PANDAL DYNAMIC QR CODE SYSTEM (5 cols) */}
          {/* --------------------------------------------------- */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-amber-200/80 shadow-xs flex flex-col justify-between">
            <div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sindoor-100 flex items-center justify-center text-sindoor-600">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      মণ্ডপ কিউআর কোড
                    </h3>
                    <span className="text-[11px] text-gray-500 font-medium">
                      Pandal Gate Voting QR
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                  সক্রিয় (Active)
                </span>
              </div>

              <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                দর্শনার্থীরা মণ্ডপে প্রবেশ করে এই কিউআর স্ক্যান করলেই সরাসরি ভোট প্রদান করতে পারবেন।
              </p>

              {/* Dynamic QR Code Card with Devotional Frame */}
              <div className="p-6 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/40 rounded-2xl border-2 border-amber-300/80 shadow-xs flex flex-col items-center justify-center mb-6 text-center">
                
                <span className="text-[11px] font-bold text-amber-900 mb-3 tracking-wide">
                  ভোট দিতে QR কোড স্ক্যান করুন (Scan QR to Vote)
                </span>

                <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-100">
                  <QRCode
                    id="pandal-voting-qr-code"
                    value={votingUrl}
                    size={210}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    viewBox="0 0 210 210"
                  />
                </div>

                <div className="mt-4 px-3 py-1 rounded-lg bg-amber-100/70 border border-amber-200 text-gray-700 font-mono text-[11px] max-w-full truncate">
                  {votingUrl}
                </div>
              </div>

            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadQR}
                  disabled={isDownloading}
                  className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-950 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-amber-800" />
                  {isDownloading ? 'ডাউনলোড হচ্ছে...' : 'QR কোড ডাউনলোড করুন'}
                </button>

                <button
                  onClick={handlePrint}
                  className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-950 flex items-center justify-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4 text-amber-800" />
                  পোস্টার প্রিন্ট
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 rounded-xl bg-sindoor-600 hover:bg-sindoor-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                {copied ? 'ভোটের লিংক কপি সম্পন্ন (Copied)!' : 'ভোটের লিঙ্ক কপি করুন (Copy Link)'}
              </button>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-[11px] text-gray-600 space-y-1">
                <p className="font-semibold text-amber-900 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-sindoor-600" /> আয়োজকদের জন্য টিপস:
                </p>
                <p>
                  পোস্টারটি প্রিন্ট করে মণ্ডপের প্রধান তোরণ বা প্রবেশদ্বারে বড় করে প্রদর্শন করুন যাতে দর্শনার্থীরা সহজে ভোট দিতে পারেন।
                </p>
              </div>
            </div>

          </div>

          {/* --------------------------------------------------- */}
          {/* RIGHT COLUMN: REAL-TIME VOTE COUNTER & STATS (7 cols) */}
          {/* --------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-6">

            {/* GIANT REAL-TIME VOTE COUNTER HERO CARD */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-amber-200/80 shadow-xs relative overflow-hidden">
              
              {/* Decorative Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-100/50 via-rose-50/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      ফায়ারস্টোর লাইভ কাউন্টার (Real-time Firestore)
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    মোট ভোট (Total Votes)
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  তাৎক্ষণিক আপডেট
                </div>
              </div>

              {/* Large Vote Display */}
              <div className="py-6 sm:py-8 flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-6">
                <span className="text-6xl sm:text-7xl font-black tracking-tight text-sindoor-600 font-sans">
                  {liveTotalVotes.toLocaleString('bn-IN')}
                </span>
                <div className="space-y-1">
                  <span className="text-xl font-bold text-gray-700 block">
                    মোট ভোট (Total Votes)
                  </span>
                  <span className="text-xs text-gray-500">
                    ইংরেজি সংখ্যা (English digits): <strong className="font-mono text-gray-800">{liveTotalVotes}</strong>
                  </span>
                </div>
              </div>

              {/* Security Guarantee Note */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-center gap-3 text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  প্রতিটি ভোট ডিভাইসের নির্ভরযোগ্য ফায়ারস্টোর ট্রানজ্যাকশন দ্বারা সুরক্ষিত এবং দ্বৈত ভোট প্রতিরোধ ব্যবস্থার সাথে যুক্ত।
                </span>
              </div>

            </div>

            {/* 4 CATEGORY AWARD BREAKDOWN */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-amber-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    বিভাগভিত্তিক লাইভ ফলাফল (Category Breakdown)
                  </h3>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">
                  ৪টি অফিশিয়াল বিভাগ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Best Idol */}
                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">সেরা প্রতিমা</h4>
                      <span className="text-[10px] text-gray-600 block">Best Idol</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-rose-600 font-mono">
                      {idolVotes}
                    </span>
                    <span className="text-[10px] text-gray-500 block">ভোট</span>
                  </div>
                </div>

                {/* Best Theme */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">সেরা ভাবনা</h4>
                      <span className="text-[10px] text-gray-600 block">Best Theme</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-amber-700 font-mono">
                      {themeVotes}
                    </span>
                    <span className="text-[10px] text-gray-500 block">ভোট</span>
                  </div>
                </div>

                {/* Best Lighting */}
                <div className="p-4 rounded-xl bg-yellow-50/70 border border-yellow-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-700 shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">সেরা আলোকসজ্জা</h4>
                      <span className="text-[10px] text-gray-600 block">Best Lighting</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-yellow-800 font-mono">
                      {lightingVotes}
                    </span>
                    <span className="text-[10px] text-gray-500 block">ভোট</span>
                  </div>
                </div>

                {/* Eco-Friendly */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">পরিবেশবান্ধব</h4>
                      <span className="text-[10px] text-gray-600 block">Eco-Friendly</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-600 font-mono">
                      {ecoVotes}
                    </span>
                    <span className="text-[10px] text-gray-500 block">ভোট</span>
                  </div>
                </div>

              </div>
            </div>

            {/* LIVE FEED REASSURANCE CARD */}
            <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-sindoor-600" />
                  <h4 className="text-sm font-bold text-gray-900">
                    সক্রিয় ভোট সুরক্ষা ও তদারকি (Live Vote Audit)
                  </h4>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  নিরাপদ ট্রানজ্যাকশন
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span>ভোটার পরিচয় যাচাই:</span>
                  <span className="font-semibold text-gray-800">ফায়ারবেস অ্যানোনিমাস অ্যাথ ও ডিভাইস আইডি</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span>দ্বৈত ভোট প্রতিরোধ (Anti-Duplicate):</span>
                  <span className="font-semibold text-emerald-600">১০০% সক্রিয় (One Vote per Pandal)</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span>মণ্ডপ ভোটিং পেজ লিঙ্ক:</span>
                  <span className="font-mono text-[11px] text-amber-900">/vote/{committeeId}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
