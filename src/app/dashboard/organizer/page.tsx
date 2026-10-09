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
  getDoc,
  getDocs,
  query, 
  where, 
  onSnapshot,
  FirebaseUser 
} from '@/lib/firebase';
import { isSuperAdmin } from '@/lib/admin';
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
  userId?: string;
  uid?: string;
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
  status?: 'pending' | 'approved' | string;
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

  // 1. Listen to Firebase Auth state & Redirection Guard if unauthenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        // Redirection Guard: unauthenticated user forced to login
        router.replace('/organizer/auth');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  // 2. Fetch organizer's committee document strictly filtered by logged-in user's UID
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/organizer/auth');
      return;
    }

    setCommitteeLoading(true);

    let unsubCommitteeQuery: (() => void) | null = null;
    let unsubPandalDoc: (() => void) | null = null;
    let isCancelled = false;

    try {
      // Strict Querying: Query committees collection strictly where user_id matches logged-in UID
      const committeesRef = collection(db, 'committees');
      const q = query(committeesRef, where('user_id', '==', user.uid));

      unsubCommitteeQuery = onSnapshot(
        q,
        async (snapshot) => {
          if (isCancelled) return;

          if (!snapshot.empty) {
            const firstDoc = snapshot.docs[0];
            const data = firstDoc.data() as Partial<CommitteeData>;
            const resolvedId = firstDoc.id || data.slug || data.id || '';

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
            // Secondary check: query by userId == user.uid or uid == user.uid or docId == user.uid
            try {
              const qUserId = query(committeesRef, where('userId', '==', user.uid));
              const snapUserId = await getDocs(qUserId);
              if (!snapUserId.empty) {
                const firstDoc = snapUserId.docs[0];
                const data = firstDoc.data() as Partial<CommitteeData>;
                const resolvedId = firstDoc.id || data.slug || data.id || '';
                setCommittee({ id: resolvedId, ...data });
                setCommitteeLoading(false);
                return;
              }

              const qUid = query(committeesRef, where('uid', '==', user.uid));
              const snapUid = await getDocs(qUid);
              if (!snapUid.empty) {
                const firstDoc = snapUid.docs[0];
                const data = firstDoc.data() as Partial<CommitteeData>;
                const resolvedId = firstDoc.id || data.slug || data.id || '';
                setCommittee({ id: resolvedId, ...data });
                setCommitteeLoading(false);
                return;
              }

              const directDoc = await getDoc(doc(db, 'committees', user.uid));
              if (directDoc.exists()) {
                const data = directDoc.data() as Partial<CommitteeData>;
                if (!data.user_id || data.user_id === user.uid || data.userId === user.uid || data.uid === user.uid) {
                  const resolvedId = directDoc.id || data.slug || data.id || '';
                  setCommittee({ id: resolvedId, ...data });
                  setCommitteeLoading(false);
                  return;
                }
              }

              // Redirection Guard: Authenticated user has NO associated committee document
              if (!isCancelled) {
                if (isSuperAdmin(user.email)) {
                  // Super Admin VIP pass: do not force redirect to setup
                  setCommittee(null);
                  setCommitteeLoading(false);
                  return;
                }
                toast.error('আপনার অ্যাকাউন্টে কোনো নিবন্ধিত দুর্গাপূজা কমিটি পাওয়া যায়নি। অনুগ্রহ করে নিবন্ধন সম্পন্ন করুন। (No registered committee found. Redirecting to registration...)', {
                  id: 'no-committee-redirect-toast',
                  duration: 4000,
                });
                setCommittee(null);
                setCommitteeLoading(false);
                router.replace('/organizer/setup');
              }
            } catch (err) {
              console.error('Strict committee query error:', err);
              if (!isCancelled) {
                if (isSuperAdmin(user.email)) {
                  setCommittee(null);
                  setCommitteeLoading(false);
                  return;
                }
                setCommittee(null);
                setCommitteeLoading(false);
                router.replace('/organizer/setup');
              }
            }
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
      isCancelled = true;
      if (unsubCommitteeQuery) unsubCommitteeQuery();
      if (unsubPandalDoc) unsubPandalDoc();
    };
  }, [user, authLoading, router]);

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
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-sindoor-600 shadow-inner">
              <Vote className="w-8 h-8 animate-pulse text-sindoor-600" />
            </div>
            <Loader2 className="w-7 h-7 text-sindoor-600 animate-spin absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              আয়োজক লাইভ ডেস্ক লোড হচ্ছে (Loading Organizer Live Desk)...
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
  // UNAUTHENTICATED STATE (REDIRECTION GUARD)
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-amber-200 shadow-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto mb-4">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            আয়োজক লগইন প্রয়োজন (Organizer Sign In Required)
          </h2>
          <p className="text-xs text-gray-600 mt-2 mb-4 leading-relaxed">
            আপনার দুর্গাপূজা কমিটির লাইভ ভোটিং ডেস্ক পরিচালনা করতে লগইন করুন। লগইন পেজে পুনর্নির্দেশ করা হচ্ছে...
            <span className="block text-[11px] text-gray-500 mt-1">
              (Please sign in to manage your Durga Puja Live Voting Desk. Redirecting to login...)
            </span>
          </p>

          <div className="flex justify-center mb-6">
            <Loader2 className="w-6 h-6 text-sindoor-600 animate-spin" />
          </div>

          <Link
            href="/organizer/auth"
            className="w-full py-3 px-4 rounded-xl bg-sindoor-600 hover:bg-sindoor-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            আয়োজক লগইন করুন (Go to Organizer Login)
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
  // NO REGISTERED COMMITTEE FOUND STATE (REDIRECTION GUARD)
  // -------------------------------------------------------------
  if (!committee) {
    if (isSuperAdmin(user.email)) {
      return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-amber-300 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-indigo-100 border border-amber-300 flex items-center justify-center text-3xl mx-auto shadow-sm">
              👑
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-xs mb-2">
                <span>VIP PASS ACTIVE</span>
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                সুপার অ্যাডমিন অধিবেশন (Super Admin Session)
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                লগইন করা অ্যাকাউন্ট: <strong className="text-gray-900">{user.email}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                আপনার কাছে সমগ্র পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির মাস্টার কন্ট্রোল অ্যাক্সেস রয়েছে। আপনি সরাসরি সুপার অ্যাডমিন প্যানেল পরিচালনা করতে পারেন।
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/dashboard/admin"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-700 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 border border-amber-300/40"
              >
                <span>👑 Super Admin Panel</span>
                <span className="text-xs font-medium opacity-90">(মাস্টার অ্যাডমিন কন্ট্রোল)</span>
              </Link>

              <Link
                href="/organizer/setup"
                className="w-full py-2.5 px-4 rounded-xl border border-amber-300 text-amber-950 font-semibold text-xs hover:bg-amber-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-700" />
                একটি টেস্ট মণ্ডপ কমিটি নিবন্ধন করুন (Register Test Committee)
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full py-2 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-gray-500" />
                লগআউট (Sign Out)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-amber-200 shadow-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-sindoor-600" />
          </div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">
            কমিটি নিবন্ধন প্রয়োজন (Committee Registration Required)
          </h2>
          <p className="text-xs text-gray-600 mt-2 mb-1">
            লগইন করা অ্যাকাউন্ট (Logged in as): <strong className="text-gray-900">{user.email || user.uid}</strong>
          </p>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            আপনার অ্যাকাউন্টের অধীনে কোনো অনুমোদিত দুর্গাপূজা কমিটি পাওয়া যায়নি। নিবন্ধন পেজে পুনর্নির্দেশ করা হচ্ছে...
            <span className="block text-[11px] text-gray-400 mt-1">
              (No registered committee found for this UID. Forcefully redirecting to registration...)
            </span>
          </p>

          <div className="flex justify-center mb-6">
            <Loader2 className="w-6 h-6 text-sindoor-600 animate-spin" />
          </div>

          <div className="space-y-3">
            <Link
              href="/organizer/setup"
              className="w-full py-3 px-4 rounded-xl bg-sindoor-600 hover:bg-sindoor-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              কমিটি নিবন্ধন সম্পন্ন করুন (Complete Registration)
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-500" />
              অন্য অ্যাকাউন্ট দিয়ে লগইন করুন (Switch Account)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PENDING ADMIN APPROVAL STATE (FROSTED GLASS UI)
  // If status === 'pending' (or not 'approved'), completely hide QR Code & Live Desk!
  // (Super Admin bypasses this check)
  // -------------------------------------------------------------
  const isApproved = committee.status === 'approved' || isSuperAdmin(user.email);

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-transparent text-[#22150F] flex flex-col justify-between selection:bg-amber-200 selection:text-amber-950 font-sans">
        
        {/* Top Header / Branding */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-amber-200/60 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 text-lg font-black">
                <Vote className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-gray-900 leading-none">
                  {committeeName}
                </h1>
                <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                  {ward} • পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-gray-800 truncate max-w-[200px]">
                  {user.email || user.displayName || 'Organizer'}
                </span>
                <span className="text-[10px] text-amber-600 font-semibold flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  যাচাইকরণ প্রক্রিয়াধীন (Verification Pending)
                </span>
              </div>

              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white/80 hover:bg-white flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden sm:inline">লগআউট (Sign Out)</span>
              </button>
            </div>
          </div>
        </header>

        {/* Pending Approval Message with Frosted Glass UI & Slide-Up Entrance */}
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="max-w-lg w-full bg-white/90 backdrop-blur-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-7 sm:p-9 border border-white/60 shadow-2xl text-center space-y-6 animate-slide-up">
            
            {/* Mobile Grab Handle */}
            <div className="w-12 h-1.5 bg-gray-300/80 rounded-full mx-auto -mt-2 mb-2 sm:hidden" />

            {/* Glowing Clock / Pending Icon */}
            <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200/90 flex items-center justify-center text-amber-600 mx-auto shadow-inner">
              <Clock className="w-10 h-10 animate-pulse text-amber-600" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>অ্যাডমিন অনুমোদনের অপেক্ষায় • Pending Admin Approval</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-serif text-gray-900 tracking-tight leading-snug">
                {committeeName}
              </h2>

              <p className="text-xs sm:text-sm font-semibold text-amber-800">
                আপনার দুর্গাপূজা কমিটি সেন্ট্রাল সুপার অ্যাডমিন দ্বারা যাচাই ও অনুমোদনের অপেক্ষায় রয়েছে।
              </p>
              <p className="text-[11px] text-gray-500 font-medium">
                (Your Durga Puja Committee registration is awaiting verification by the Super Admin).
              </p>
            </div>

            {/* Explanatory Notice Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-left space-y-2.5 text-xs text-gray-700">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>নিরাপত্তা ও যাচাইকরণ নীতি (Security & Verification Notice)</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                অনুমোদিত কমিটির জন্য অফিসিয়াল ভোটিং কিউআর কোড (QR Code) এবং লাইভ ডেস্ক সংরক্ষিত রাখা হয়েছে। সুপার অ্যাডমিন দ্বারা অনুমোদিত হলে আপনি আপনার নিবন্ধিত নম্বরে একটি নিশ্চিতকরণ এসএমএস (SMS) পাবেন এবং এই পাতাটি স্বয়ংক্রিয়ভাবে লাইভ ডেস্কে রূপান্তরিত হবে।
              </p>
              <p className="text-[11px] text-gray-500 italic">
                (The Official Voting QR Code and Live Desk remain locked until approved. Upon Super Admin verification, you will receive an SMS and this page will unlock in real time).
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleSignOut}
                className="w-full py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <LogOut className="w-4 h-4 text-gray-500" />
                <span>লগআউট করুন (Sign Out)</span>
              </button>
              <Link
                href="/"
                className="w-full py-3 px-4 rounded-xl bg-sindoor-600 hover:bg-sindoor-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>মূল পাতায় ফিরে যান (Back to Home)</span>
              </Link>
            </div>

          </div>
        </main>

        {/* Clean Footer */}
        <footer className="w-full border-t border-amber-200/60 bg-white/70 backdrop-blur-md py-4 text-center">
          <p className="text-xs text-gray-500">
            পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি (Paschim Banga DurgaPuja Samannay Samity) • পশ্চিম বর্ধমান
          </p>
        </footer>

      </div>
    );
  }

  // -------------------------------------------------------------
  // FULL ACTIVE ORGANIZER DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-transparent text-[#22150F]">
      
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
              <li>উপরের কিউআর কোডটি স্ক্যান করে অফিসিয়াল পেজে যান।</li>
              <li>সেরা প্রতিমা, সেরা ভাবনা, আলোকসজ্জা ও পরিবেশবান্ধব বিভাগে আপনার মূল্যবান ভোট দিন।</li>
            </ol>
          </div>

          <div className="pt-4 border-t border-gray-300 flex justify-between items-center text-[11px] text-gray-500">
            <span>আইডি (ID): {committeeId}</span>
            <span>সম্পাদনা (Secretary): {secretaryName}</span>
            <span>যাচাইকৃত দুর্গাপূজা মণ্ডপ (Verified Puja Pandal)</span>
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
                  লাইভ সিঙ্ক সক্রিয় (Live Sync Active)
                </span>
              </div>
              <span className="text-[11px] text-gray-600 font-medium">
                পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি (Paschim Banga DurgaPuja Samannay Samity)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* VIP Pass: Super Admin Button strictly for designated email */}
            {isSuperAdmin(user?.email) && (
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-700 hover:from-amber-400 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all border border-amber-300/40 group shrink-0 active:scale-95"
                title="সুপার অ্যাডমিন কন্ট্রোল প্যানেল (Super Admin Panel)"
              >
                <span className="text-sm sm:text-base group-hover:scale-110 transition-transform">👑</span>
                <span>Super Admin Panel</span>
              </Link>
            )}

            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]">
                {secretaryName}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3" /> যাচাইকৃত আয়োজক (Verified Organizer)
              </span>
            </div>

            <button
              onClick={handlePrint}
              className="hidden sm:flex px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-amber-700" />
              গেট পোস্টার প্রিন্ট (Print Gate Poster)
            </button>

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-500" />
              লগআউট (Sign Out)
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
                <ShieldCheck className="w-3.5 h-3.5 text-sindoor-600" /> দুর্গাপূজা ২০২৬ নিবন্ধিত মণ্ডপ (Registered Durga Puja 2026)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white text-gray-700 border border-amber-200">
                {ward}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {committeeName}
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              ভাবনা (Theme): <strong className="text-gray-800">{theme}</strong> • কমিটি কোড (Code):{' '}
              <code className="bg-white/90 px-2 py-0.5 rounded text-amber-950 font-mono font-bold text-xs border border-amber-200">
                {committeeId}
              </code>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* VIP Pass: Super Admin Button in Hero Banner strictly for designated email */}
            {isSuperAdmin(user?.email) && (
              <Link
                href="/dashboard/admin"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-700 hover:from-amber-400 hover:to-indigo-500 text-white border border-amber-300/40 text-xs font-black shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                <span>👑</span>
                <span>Super Admin Panel</span>
              </Link>
            )}

            <Link
              href={`/vote/${committeeId}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-gray-800 hover:bg-amber-50 shadow-xs flex items-center gap-2 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
              ভোটিং পেজ খুলুন (View Voting Page)
            </Link>

            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-xs font-bold text-amber-950 shadow-xs flex items-center gap-2 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-800" />}
              {copied ? 'কপি সম্পন্ন (Copied)!' : 'লিঙ্ক কপি করুন (Copy Link)'}
            </button>
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* --------------------------------------------------- */}
          {/* LEFT COLUMN: PANDAL DYNAMIC QR CODE SYSTEM (5 cols) */}
          {/* --------------------------------------------------- */}
          <div className="lg:col-span-5 bg-white/85 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-amber-200/80 shadow-xs flex flex-col justify-between">
            <div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sindoor-100 flex items-center justify-center text-sindoor-600">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      মণ্ডপ কিউআর কোড (Pandal Gate QR Code)
                    </h3>
                    <span className="text-[11px] text-gray-500 font-medium">
                      অফিসিয়াল মণ্ডপ ভোটিং কিউআর (Official Gate Voting QR)
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
                <span className="block text-[11px] text-gray-500 mt-0.5">
                  (Devotees can scan this QR code directly at the pandal gate to cast their vote).
                </span>
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
                  {isDownloading ? 'ডাউনলোড হচ্ছে... (Downloading...)' : 'QR কোড ডাউনলোড করুন (Download QR Code)'}
                </button>

                <button
                  onClick={handlePrint}
                  className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-950 flex items-center justify-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4 text-amber-800" />
                  পোস্টার প্রিন্ট (Print Poster)
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 rounded-xl bg-sindoor-600 hover:bg-sindoor-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                {copied ? 'ভোটের লিংক কপি সম্পন্ন (Copied)!' : 'ভোটের লিঙ্ক কপি করুন (Copy Voting Link)'}
              </button>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-[11px] text-gray-600 space-y-1">
                <p className="font-semibold text-amber-900 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-sindoor-600" /> আয়োজকদের জন্য নির্দেশিকা (Organizer Tips):
                </p>
                <p>
                  পোস্টারটি প্রিন্ট করে মণ্ডপের প্রধান তোরণ বা প্রবেশদ্বারে বড় করে প্রদর্শন করুন যাতে দর্শনার্থীরা সহজে ভোট দিতে পারেন।
                  <span className="block text-[10px] text-gray-500 mt-0.5">
                    (Print and display this poster prominently at the main entrance gate for visitors).
                  </span>
                </p>
              </div>
            </div>

          </div>

          {/* --------------------------------------------------- */}
          {/* RIGHT COLUMN: REAL-TIME VOTE COUNTER & STATS (7 cols) */}
          {/* --------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-6">

            {/* GIANT REAL-TIME VOTE COUNTER HERO CARD */}
            <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-amber-200/80 shadow-xs relative overflow-hidden">
              
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
                  তাৎক্ষণিক আপডেট (Instant Update)
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
                <div>
                  <span>
                    প্রতিটি ভোট ডিভাইসের নির্ভরযোগ্য ফায়ারস্টোর ট্রানজ্যাকশন দ্বারা সুরক্ষিত এবং দ্বৈত ভোট প্রতিরোধ ব্যবস্থার সাথে যুক্ত।
                  </span>
                  <span className="block text-[10px] text-amber-800/80 mt-0.5">
                    (Each vote is secured via Firestore transactions with anti-duplicate device locks).
                  </span>
                </div>
              </div>

            </div>

            {/* 4 CATEGORY AWARD BREAKDOWN */}
            <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-amber-200/80 shadow-xs">
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
                  ৪টি অফিসিয়াল বিভাগ (4 Official Categories)
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
                    <span className="text-[10px] text-gray-500 block">ভোট (Votes)</span>
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
                    <span className="text-[10px] text-gray-500 block">ভোট (Votes)</span>
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
                    <span className="text-[10px] text-gray-500 block">ভোট (Votes)</span>
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
                    <span className="text-[10px] text-gray-500 block">ভোট (Votes)</span>
                  </div>
                </div>

              </div>
            </div>

            {/* LIVE FEED REASSURANCE CARD */}
            <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 border border-amber-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-sindoor-600" />
                  <h4 className="text-sm font-bold text-gray-900">
                    সক্রিয় ভোট সুরক্ষা ও তদারকি (Live Vote Audit)
                  </h4>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  নিরাপদ ট্রানজ্যাকশন (Secure Transactions)
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span>ভোটার পরিচয় যাচাই (Voter Verification):</span>
                  <span className="font-semibold text-gray-800">ফায়ারবেস অথ ও ডিভাইস আইডি (Firebase Auth & Device ID)</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span>দ্বৈত ভোট প্রতিরোধ (Anti-Duplicate):</span>
                  <span className="font-semibold text-emerald-600">১০০% সক্রিয় (100% Active - One Vote per Pandal)</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span>মণ্ডপ ভোটিং পেজ লিঙ্ক (Pandal Voting URL):</span>
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
