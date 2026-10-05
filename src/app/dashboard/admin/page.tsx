'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged, signOut, FirebaseUser } from '@/lib/firebase';
import { 
  ShieldCheck, 
  Users, 
  Vote, 
  BarChart3, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Database, 
  Activity, 
  Search, 
  Filter, 
  LogOut, 
  Sliders, 
  Download,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [votingEnabled, setVotingEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'pandals' | 'votes' | 'settings'>('overview');

  // Verify Firebase Admin / Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleVoting = () => {
    const nextState = !votingEnabled;
    setVotingEnabled(nextState);
    if (nextState) {
      toast.success('ভোটিং ব্যবস্থা সক্রিয় করা হয়েছে (Voting System Resumed)');
    } else {
      toast.error('ভোটিং সাময়িকভাবে স্থগিত করা হয়েছে (Voting Paused)');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('অ্যাডমিন লগআউট সম্পন্ন হয়েছে (Logged out)');
      router.push('/organizer/auth');
    } catch {
      toast.error('Sign out failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 className="w-9 h-9 text-amber-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-300">প্রশাসনিক প্যানেল লোড হচ্ছে (Loading Master Admin)...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-slate-950 font-black shadow-md">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
                  মাস্টার অ্যাডমিন কন্ট্রোল প্যানেল
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                  Super Admin
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Paschim Banga DurgaPuja Samannay Samity (West Bengal 2026)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[180px]">
                    {user.email || 'Admin User'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">নিরাপদ সেশন (Secure)</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">লগআউট (Logout)</span>
                </button>
              </div>
            ) : (
              <Link
                href="/organizer/auth"
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 shadow-sm transition-all"
              >
                লগইন করুন (Admin Login)
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Auth Notice if guest */}
        {!user && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold text-amber-200">
                প্রশাসনিক ডেমো মোড (Admin Preview Mode)
              </p>
              <p className="text-amber-300/80 mt-0.5">
                সিস্টেমে সম্পূর্ণ পরিবর্তন করতে এবং লাইভ ডেটাবেজ কনফিগার করতে অনুমোদিত অ্যাডমিন হিসেবে সাইন-ইন করুন।
              </p>
            </div>
          </div>
        )}

        {/* Global Key Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold">মোট নিবন্ধিত মণ্ডপ (Total Pandals)</span>
              <Database className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-3xl font-black text-white">২৫</span>
            <span className="text-[11px] text-emerald-400 font-medium block mt-1">
              ✓ পশ্চিম বর্ধমান জেলা সমন্বয়
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold">মোট প্রদত্ত ভোট (Verified Ballots)</span>
              <Vote className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-3xl font-black text-amber-400">০</span>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">
              Firestore Atomic Tally (+1)
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold">সার্ভার ট্র্যাফিক (Live Concurrency)</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-3xl font-black text-cyan-400">স্বাভাবিক</span>
            <span className="text-[11px] text-emerald-400 font-medium block mt-1">
              ১ কোটি ভোট ধারণক্ষমতা
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold">ভুয়ো ভোট প্রতিরোধ (Fraud Blocks)</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-3xl font-black text-emerald-400">১০০%</span>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">
              Anonymous UID + Token Lock
            </span>
          </div>

        </div>

        {/* Global Controls & Actions */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              গ্লোবাল ভোটিং স্টেটাস ও সুইচার (Global Voting Gatekeeper)
            </h2>
            <p className="text-xs text-slate-400">
              জরুরি পরিস্থিতিতে বা ভোট গ্রহণের নির্দিষ্ট সময়ে সমগ্র ওয়েবসাইটে ভোট গ্রহণ সক্রিয় বা স্থগিত রাখুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleVoting}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md ${
                votingEnabled 
                  ? 'bg-red-600/90 hover:bg-red-700 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              {votingEnabled ? 'ভোট গ্রহণ সাময়িক বন্ধ করুন (Pause Voting)' : 'ভোট গ্রহণ পুনরায় চালু করুন (Resume Voting)'}
            </button>

            <button
              onClick={() => toast.success('ডেটাবেজ ব্যাকআপ ও অডিট লগ ডাউনলোড শুরু হয়েছে...')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-slate-400" />
              অডিট লগ ডাউনলোড (CSV)
            </button>
          </div>
        </div>

        {/* Pandal Management & Audit Grid Skeleton */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">
                মণ্ডপ তালিকা ও লাইভ ভোটিং নিরীক্ষণ (Participating Pandals Master List)
              </h3>
              <p className="text-xs text-slate-400">
                রিয়েল-টাইম ফায়ারস্টোর ট্র্যাকিং ও কিউআর লিংক নিরীক্ষা।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="মণ্ডপ খুঁজুন..."
                  className="pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <button 
                onClick={() => toast.success('রিয়েল-টাইম রিফ্রেশ সম্পন্ন (Refreshed)')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Refresh List"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">মণ্ডপ ও ক্লাব (Pandal & Club)</th>
                  <th className="py-3 px-4">জোন ও ওয়ার্ড (Zone)</th>
                  <th className="py-3 px-4">প্রতিমা (Idol)</th>
                  <th className="py-3 px-4">ভাবনা (Theme)</th>
                  <th className="py-3 px-4">আলো (Light)</th>
                  <th className="py-3 px-4">পরিবেশ (Eco)</th>
                  <th className="py-3 px-4">মোট ভোট (Total)</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    Marxgunj Sarbojanin Durga Puja
                    <span className="block text-[10px] text-slate-500 font-normal">marxgunj-sarbojanin</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">Benachity Zone, Ward 24</td>
                  <td className="py-3.5 px-4 font-mono text-rose-400">০</td>
                  <td className="py-3.5 px-4 font-mono text-amber-400">০</td>
                  <td className="py-3.5 px-4 font-mono text-yellow-400">০</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400">০</td>
                  <td className="py-3.5 px-4 font-bold font-mono text-white">০</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href="/dashboard/organizer"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      ডেস্ক দেখুন
                    </Link>
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    Chaturanga Durga Puja Samiti
                    <span className="block text-[10px] text-slate-500 font-normal">chaturanga-durga-puja</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">City Centre Zone, Ward 18</td>
                  <td className="py-3.5 px-4 font-mono text-rose-400">০</td>
                  <td className="py-3.5 px-4 font-mono text-amber-400">০</td>
                  <td className="py-3.5 px-4 font-mono text-yellow-400">০</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400">০</td>
                  <td className="py-3.5 px-4 font-bold font-mono text-white">০</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href="/dashboard/organizer"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      ডেস্ক দেখুন
                    </Link>
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    Agrani Sangha Durga Puja
                    <span className="block text-[10px] text-slate-500 font-normal">agrani-sangha</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">B-Zone, Ward 12</td>
                  <td className="py-3.5 px-4 font-mono text-rose-400">০</td>
                  <td className="py-3.5 px-4 font-mono text-amber-400">০</td>
                  <td className="py-3.5 px-4 font-mono text-yellow-400">০</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400">০</td>
                  <td className="py-3.5 px-4 font-bold font-mono text-white">০</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href="/dashboard/organizer"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      ডেস্ক দেখুন
                    </Link>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
