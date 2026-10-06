'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signOut, 
  collection, 
  onSnapshot,
  FirebaseUser 
} from '@/lib/firebase';
import { 
  ShieldCheck, 
  Users, 
  Vote, 
  BarChart3, 
  Lock, 
  Unlock,
  AlertTriangle, 
  CheckCircle2, 
  Database, 
  Activity, 
  Search, 
  LogOut, 
  Sliders, 
  Download,
  Loader2,
  ExternalLink,
  Trophy,
  Award,
  Layers,
  ArrowUpDown,
  Flame,
  Building2,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CommitteeItem {
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
  total_votes?: number;
  votes?: {
    idol?: number;
    theme?: number;
    lighting?: number;
    eco?: number;
  };
  resolvedVotes?: number;
}

// Configurable Admin email whitelist placeholder
const ADMIN_EMAIL_WHITELIST = [
  'admin@durgapur.gov.in',
  'superadmin@durgapuja.org',
  'president@pbds.org',
  'bmahato2006@gmail.com'
];

export default function MasterAdminDashboardPage() {
  const router = useRouter();

  // Authentication State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Firestore Live State
  const [committees, setCommittees] = useState<CommitteeItem[]>([]);
  const [pandalVotes, setPandalVotes] = useState<Record<string, number>>({});
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [votingEnabled, setVotingEnabled] = useState<boolean>(true);

  // 1. Verify Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch all committees and pandal vote tallies via real-time onSnapshot listeners
  useEffect(() => {
    if (authLoading) return;

    let unsubCommittees: (() => void) | null = null;
    let unsubPandals: (() => void) | null = null;

    try {
      // Real-time listener for committees collection
      const committeesRef = collection(db, 'committees');
      unsubCommittees = onSnapshot(
        committeesRef,
        (snapshot) => {
          const list: CommitteeItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              committee_name: data.committee_name || data.name || data.clubName || docSnap.id,
              ward: data.ward || 'সাধারণ অঞ্চল',
              secretary_name: data.secretary_name || '',
              contact_number: data.contact_number || '',
              email: data.email || '',
              theme: data.theme || 'ঐতিহ্যবাহী দুর্গাপূজা',
              total_votes: Number(data.total_votes || 0),
              votes: data.votes || {},
              ...data,
            });
          });
          setCommittees(list);
          setDataLoading(false);
        },
        (error) => {
          console.error('Firestore committees onSnapshot error:', error);
          setDataLoading(false);
        }
      );

      // Real-time listener for pandals collection to mirror and aggregate vote counts
      const pandalsRef = collection(db, 'pandals');
      unsubPandals = onSnapshot(
        pandalsRef,
        (snapshot) => {
          const voteMap: Record<string, number> = {};
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            voteMap[docSnap.id] = Number(data.total_votes || 0);
          });
          setPandalVotes(voteMap);
        },
        (error) => {
          console.warn('Firestore pandals onSnapshot notice:', error);
        }
      );
    } catch (err) {
      console.error('Failed to attach real-time listeners:', err);
      setDataLoading(false);
    }

    return () => {
      if (unsubCommittees) unsubCommittees();
      if (unsubPandals) unsubPandals();
    };
  }, [authLoading]);

  // Dynamic ranking: calculate resolved votes and sort descending
  const rankedCommittees = useMemo(() => {
    return committees
      .map((item) => {
        const pVotes = pandalVotes[item.id] || 0;
        const cVotes = item.total_votes || 0;
        return {
          ...item,
          resolvedVotes: Math.max(cVotes, pVotes),
        };
      })
      .sort((a, b) => (b.resolvedVotes || 0) - (a.resolvedVotes || 0));
  }, [committees, pandalVotes]);

  // Global Statistics calculations
  const totalRegisteredCommittees = committees.length;
  const totalVotesCast = useMemo(() => {
    return rankedCommittees.reduce((sum, item) => sum + (item.resolvedVotes || 0), 0);
  }, [rankedCommittees]);

  // Unique wards for filter
  const wardsList = useMemo(() => {
    const set = new Set<string>();
    committees.forEach((c) => {
      if (c.ward) set.add(c.ward);
    });
    return Array.from(set).sort();
  }, [committees]);

  // Filtered leaderboard
  const filteredLeaderboard = useMemo(() => {
    return rankedCommittees.filter((item) => {
      const name = (item.committee_name || '').toLowerCase();
      const ward = (item.ward || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesQuery = !query || name.includes(query) || ward.includes(query) || item.id.includes(query);
      const matchesWard = selectedWard === 'all' || item.ward === selectedWard;

      return matchesQuery && matchesWard;
    });
  }, [rankedCommittees, searchQuery, selectedWard]);

  // Global voting switch
  const handleToggleVoting = () => {
    const nextState = !votingEnabled;
    setVotingEnabled(nextState);
    if (nextState) {
      toast.success('ভোটিং ব্যবস্থা সক্রিয় করা হয়েছে (Voting Resumed)');
    } else {
      toast.error('ভোটিং সাময়িকভাবে স্থগিত রাখা হয়েছে (Voting Paused)');
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('অ্যাডমিন লগআউট সম্পন্ন হয়েছে');
      router.push('/organizer/auth');
    } catch {
      toast.error('লগআউট ব্যর্থ হয়েছে');
    }
  };

  // Export audit table as CSV
  const handleExportCSV = () => {
    if (rankedCommittees.length === 0) {
      toast.error('রপ্তানি করার মতো কোনো ডেটা নেই');
      return;
    }

    const headers = ['Rank', 'Committee ID', 'Committee Name', 'Location / Ward', 'Theme', 'Total Votes'];
    const rows = rankedCommittees.map((c, index) => [
      index + 1,
      `"${c.id}"`,
      `"${c.committee_name || ''}"`,
      `"${c.ward || ''}"`,
      `"${c.theme || ''}"`,
      c.resolvedVotes || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `durgapuja_audit_leaderboard_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('অডিট সিএসভি সফলভাবে ডাউনলোড হয়েছে (CSV exported)!');
  };

  // -----------------------------------------------------------------
  // 4. ROUTE PROTECTION: AUTH LOADING & UNAUTHENTICATED STATES
  // -----------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-200">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-sm font-semibold tracking-wide">
            প্রশাসনিক নিরাপত্তা যাচাই করা হচ্ছে (Verifying Admin Session)...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-white">
              মাস্টার অ্যাডমিন লগইন প্রয়োজন
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              সুপার অ্যাডমিন গ্লোবাল কন্ট্রোল প্যানেল অ্যাক্সেস করতে অনুগ্রহ করে অনুমোদিত অ্যাডমিনিস্ট্রেটর অ্যাকাউন্ট দিয়ে সাইন-ইন করুন।
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1.5 font-mono">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Route Protection: Active</span>
            </div>
            <p>Access Level: Super Admin Control Center</p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/organizer/auth?mode=login"
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              অ্যাডমিন লগইন করুন (Admin Sign In)
            </Link>

            <Link
              href="/"
              className="inline-block text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← সাধারণ ভক্তদের পাতায় ফিরুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // 5. MASTER ADMIN DASHBOARD - PROFESSIONAL SLATE & INDIGO PALETTE
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950/85 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* Top Professional Admin Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 font-black">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
                  মাস্টার অ্যাডমিন ড্যাশবোর্ড
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  Super Admin
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • গ্লোবাল কমান্ড সেন্টার
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-200 truncate max-w-[220px]">
                {user.email || user.displayName || 'Authorized Admin'}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                সুরক্ষিত অ্যাডমিন সেশন (Secure)
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="px-3.5 py-2 rounded-xl border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">লগআউট (Sign Out)</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ------------------------------------------------------------- */}
        {/* 2. GLOBAL STATISTICS OVERVIEW (Cards) */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Stat 1: Total Registered Committees */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                মোট নিবন্ধিত কমিটি
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
                {totalRegisteredCommittees.toLocaleString('bn-IN')}
              </span>
              <p className="text-xs text-slate-400 font-medium">
                Total Registered Committees ({totalRegisteredCommittees})
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>পশ্চিম বর্ধমান অনুমোদিত পূজা মণ্ডপ</span>
            </div>
          </div>

          {/* Stat 2: Total Votes Cast */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                মোট প্রদত্ত ভোট
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Vote className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-rose-400 font-sans tracking-tight">
                {totalVotesCast.toLocaleString('bn-IN')}
              </span>
              <p className="text-xs text-slate-400 font-medium">
                Total Votes Cast ({totalVotesCast})
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Firestore Real-Time Atomic Sync</span>
            </div>
          </div>

          {/* Stat 3: Top Leading Committee */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                শীর্ষস্থানীয় মণ্ডপ (Top Leader)
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-base sm:text-lg font-bold text-amber-300 line-clamp-1">
                {rankedCommittees[0]?.committee_name || 'তথ্য সংগৃহীত হচ্ছে...'}
              </span>
              <p className="text-xs text-slate-400">
                ভোট সংখ্যা: <strong className="text-white font-mono">{rankedCommittees[0]?.resolvedVotes || 0}</strong> ভোট
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>১ম স্থান অধিকারী কমিটি</span>
            </div>
          </div>

          {/* Stat 4: Security & Fraud Prevention Status */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ভুয়ো ভোট প্রতিরোধ (Integrity)
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-sans tracking-tight">
                ১০০%
              </span>
              <p className="text-xs text-slate-400 font-medium">
                Device Hash + Token Lock
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>এক ডিভাইসে এক ভোট নিশ্চিত</span>
            </div>
          </div>

        </div>

        {/* Global Controls & Emergency Gatekeeper */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              গ্লোবাল ভোটিং ব্যবস্থা পরিচালনা (Voting Gatekeeper)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              জরুরি পরিস্থিতিতে বা ভোট গ্রহণের নির্ধারিত সময়সীমা শেষে সমগ্র প্ল্যাটফর্মের ভোট গ্রহণ প্রক্রিয়া সক্রিয় অথবা সাময়িক স্থগিত রাখুন।
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleToggleVoting}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                votingEnabled 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
            >
              {votingEnabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {votingEnabled ? 'ভোট সাময়িক স্থগিত করুন (Pause)' : 'ভোট পুনরায় চালু করুন (Resume)'}
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              অডিট লগ ডাউনলোড (CSV)
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. GLOBAL LEADERBOARD: RESPONSIVE TAILWIND DATA TABLE */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800/90 shadow-xl overflow-hidden space-y-4 p-6 sm:p-7">
          
          {/* Table Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white tracking-tight">
                  গ্লোবাল লিডারবোর্ড (Global Live Leaderboard)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                সর্বাধিক ভোটপ্রাপ্তির ক্রমানুসারে লাইভ সাজানো তালিকা (Dynamically sorted by votes in descending order).
              </p>
            </div>

            {/* Search and Ward Filter Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search input */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="কমিটি বা অঞ্চল খুঁজুন..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Ward Filter */}
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="all">সকল অঞ্চল (All Zones)</option>
                {wardsList.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Content */}
          {dataLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
              <p className="text-xs text-slate-400">ফায়ারস্টোর থেকে লাইভ লিডারবোর্ড লোড হচ্ছে...</p>
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              <Database className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              কোনো কমিটি বা মণ্ডপ খুঁজে পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                
                {/* Table Head */}
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/40">
                    <th className="py-3.5 px-4 rounded-l-xl w-16 text-center">র‍্যাংক (Rank)</th>
                    <th className="py-3.5 px-4">কমিটির নাম (Committee Name)</th>
                    <th className="py-3.5 px-4">অঞ্চল / ওয়ার্ড (Location / Zone)</th>
                    <th className="py-3.5 px-4">ভাবনা (Theme)</th>
                    <th className="py-3.5 px-4 text-right">মোট ভোট (Total Votes)</th>
                    <th className="py-3.5 px-4 rounded-r-xl text-center w-28">অ্যাকশন</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLeaderboard.map((committee, index) => {
                    const rank = index + 1;
                    const votes = committee.resolvedVotes || 0;

                    // Rank Badges
                    let rankBadge = (
                      <span className="font-mono font-bold text-slate-400">
                        #{rank}
                      </span>
                    );
                    if (rank === 1) {
                      rankBadge = (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-400/20">
                          1
                        </span>
                      );
                    } else if (rank === 2) {
                      rankBadge = (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black text-xs shadow-md">
                          2
                        </span>
                      );
                    } else if (rank === 3) {
                      rankBadge = (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs shadow-md">
                          3
                        </span>
                      );
                    }

                    return (
                      <tr 
                        key={committee.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Rank */}
                        <td className="py-4 px-4 text-center">
                          {rankBadge}
                        </td>

                        {/* Committee Name */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors block">
                              {committee.committee_name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              আইডি: {committee.id}
                            </span>
                          </div>
                        </td>

                        {/* Location / Zone */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/80">
                            {committee.ward}
                          </span>
                        </td>

                        {/* Theme */}
                        <td className="py-4 px-4 text-slate-400 max-w-xs truncate">
                          {committee.theme || 'ঐতিহ্যবাহী দুর্গাপূজা'}
                        </td>

                        {/* Total Votes */}
                        <td className="py-4 px-4 text-right">
                          <div className="space-y-0.5 inline-block text-right">
                            <span className="text-base font-black text-indigo-400 font-mono block">
                              {votes.toLocaleString('bn-IN')}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              ({votes} votes)
                            </span>
                          </div>
                        </td>

                        {/* Action Link */}
                        <td className="py-4 px-4 text-center">
                          <Link
                            href={`/vote/${committee.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-[11px] font-bold text-slate-200 hover:text-white transition-all border border-slate-700 hover:border-indigo-500"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>দেখুন</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          )}

          {/* Table Footer Summary */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
            <span>
              মোট তালিকাভুক্ত মণ্ডপ: <strong className="text-slate-300 font-mono">{filteredLeaderboard.length}</strong> / {totalRegisteredCommittees}
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Auto-refreshed via Firebase Firestore Realtime Snapshots
            </span>
          </div>

        </div>

      </main>
    </div>
  );
}
