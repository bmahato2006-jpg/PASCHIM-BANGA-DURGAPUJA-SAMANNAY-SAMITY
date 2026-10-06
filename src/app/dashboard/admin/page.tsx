'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signOut, 
  collection, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  FirebaseUser 
} from '@/lib/firebase';
import { 
  ShieldCheck, 
  Vote, 
  Lock, 
  Unlock,
  CheckCircle2, 
  Database, 
  Search, 
  LogOut, 
  Sliders, 
  Download,
  Loader2,
  ExternalLink,
  Trophy,
  Award,
  Building2,
  ArrowLeft,
  Phone,
  Clock,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SUPER_ADMIN_EMAIL, isSuperAdmin } from '@/lib/admin';

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
  phone?: string;
  status?: 'pending' | 'approved' | string;
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

export default function MasterAdminDashboardPage() {
  const router = useRouter();

  // Authentication State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Firestore Live State
  const [committees, setCommittees] = useState<CommitteeItem[]>([]);
  const [pandalVotes, setPandalVotes] = useState<Record<string, number>>({});
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Approval In-Progress Tracker
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [votingEnabled, setVotingEnabled] = useState<boolean>(true);

  // 1. Verify Authentication & Enforce Strict Client-Side RBAC Guard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (!currentUser) {
        // Redirection Guard: unauthenticated user forced to login
        router.replace('/organizer/auth');
      } else if (!isSuperAdmin(currentUser.email)) {
        // Strict RBAC Guard: non-Super Admin user rejected and redirected immediately
        toast.error('অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন প্রবেশ করতে পারবেন। (Access Denied: Super Admin only)', {
          id: 'admin-access-denied-toast',
          duration: 4000,
        });
        router.replace('/dashboard/organizer');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 2. Fetch all committees and pandal vote tallies via real-time onSnapshot listeners
  useEffect(() => {
    if (authLoading || !user || !isSuperAdmin(user.email)) return;

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
              ward: data.ward || 'সাধারণ অঞ্চল (General Zone)',
              secretary_name: data.secretary_name || '',
              contact_number: data.contact_number || data.phone || data.contactNumber || '',
              phone: data.phone || data.contact_number || '',
              status: data.status || 'pending',
              email: data.email || '',
              theme: data.theme || 'ঐতিহ্যবাহী দুর্গাপূজা (Traditional Durga Puja)',
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

      // Real-time listener for pandals collection to aggregate vote counts
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
  }, [authLoading, user]);

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
  const approvedCommitteesCount = useMemo(() => {
    return committees.filter((c) => c.status === 'approved').length;
  }, [committees]);
  const pendingCommitteesCount = totalRegisteredCommittees - approvedCommitteesCount;

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
      const phone = (item.contact_number || item.phone || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesQuery =
        !query ||
        name.includes(query) ||
        ward.includes(query) ||
        phone.includes(query) ||
        item.id.includes(query);

      const matchesWard = selectedWard === 'all' || item.ward === selectedWard;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'approved' && item.status === 'approved') ||
        (selectedStatus === 'pending' && item.status !== 'approved');

      return matchesQuery && matchesWard && matchesStatus;
    });
  }, [rankedCommittees, searchQuery, selectedWard, selectedStatus]);

  // Approve Committee: Isolated Firestore update and SMS notification
  const handleApproveCommittee = async (
    committeeId: string, 
    committeeName: string,
    phone?: string
  ) => {
    if (!user?.email || !isSuperAdmin(user.email)) {
      toast.error('অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন কমিটি অনুমোদন করতে পারেন। (Super Admin only)');
      return;
    }

    if (approvingId) return;

    // Show loading state on the button
    setApprovingId(committeeId);

    // Resolve target phone
    let targetPhone = phone || '';
    if (!targetPhone) {
      const found = committees.find((c) => c.id === committeeId);
      targetPhone = found?.phone || found?.contact_number || (found as any)?.contactNumber || (found as any)?.phoneNumber || '';
    }

    const toastId = toast.loading(`"${committeeName}" অনুমোদন করা হচ্ছে... (Approving...)`);

    // 1. Isolate Firestore Update
    try {
      await updateDoc(doc(db, 'committees', committeeId), { 
        status: 'approved' 
      });
    } catch (error: any) {
      console.error('Firestore Database Error:', error);
      toast.error('Database Error: ' + (error?.message || 'Failed to update database'), { id: toastId });
      setApprovingId(null);
      return;
    }

    // 2. Success & Isolate SMS
    // Immediately update UI state to 'approved' and show success toast
    setCommittees((prev) =>
      prev.map((c) => (c.id === committeeId ? { ...c, status: 'approved' } : c))
    );

    toast.success('কমিটি অনুমোদিত হয়েছে! (Committee Approved successfully!)', { id: toastId, duration: 4000 });

    // Separate try-catch block for SMS dispatch
    try {
      if (targetPhone) {
        const smsRes = await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: targetPhone,
            committeeName,
          }),
        });

        const smsData = await smsRes.json().catch(() => ({}));
        if (!smsRes.ok || !smsData.success) {
          const rawErr = 
            (Array.isArray(smsData.result?.message) ? smsData.result.message.join(', ') : smsData.result?.message) ||
            (typeof smsData.result === 'object' ? JSON.stringify(smsData.result) : '') ||
            smsData.error ||
            'Unknown Error';
          toast.error("SMS Failed: " + rawErr, { duration: 8000 });
        }
      } else {
        toast.error("SMS Failed: কোনো ফোন নম্বর নেই (No phone number registered)", { duration: 8000 });
      }
    } catch (smsError: any) {
      console.warn('SMS fetch error:', smsError);
      toast.error("SMS Failed: " + (smsError?.message || 'Network Error'), { duration: 8000 });
    } finally {
      setApprovingId(null);
    }
  };

  // Permanently Delete Committee with Native Confirmation & Instant UI Update
  const handleDeleteCommittee = async (committeeId: string, committeeName: string) => {
    if (!user?.email || !isSuperAdmin(user.email)) {
      toast.error('অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন কমিটি মুছে ফেলতে পারেন। (Super Admin only)');
      return;
    }

    // Native browser confirmation prompt
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this committee? This action cannot be undone.'
    );

    if (!confirmed) return;

    if (deletingId) return;
    setDeletingId(committeeId);

    // Instant UI update: Filter out the committee immediately from local state
    setCommittees((prev) => prev.filter((c) => c.id !== committeeId));

    const toastId = toast.loading(`"${committeeName}" স্থায়ীভাবে মুছে ফেলা হচ্ছে... (Deleting...)`);

    try {
      // Execute direct deleteDoc on Firestore committees collection
      await deleteDoc(doc(db, 'committees', committeeId));

      // Also clean up matching pandal entry if present
      try {
        await deleteDoc(doc(db, 'pandals', committeeId));
      } catch {}

      toast.success(
        `🗑️ "${committeeName}" স্থায়ীভাবে মুছে ফেলা হয়েছে! (Committee permanently deleted!)`,
        { id: toastId, duration: 4000 }
      );

      // Trigger resilient backend API deletion
      fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          committeeId,
          adminEmail: user.email,
        }),
      }).catch((apiErr) => console.warn('Background delete API trigger notice:', apiErr));

    } catch (err: any) {
      console.warn('Direct deleteDoc notice, attempting backend delete API fallback:', err);
      try {
        const res = await fetch('/api/admin/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            committeeId,
            adminEmail: user.email,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          toast.success(
            `🗑️ "${committeeName}" স্থায়ীভাবে মুছে ফেলা হয়েছে! (Committee permanently deleted!)`,
            { id: toastId, duration: 4000 }
          );
        } else {
          toast.error(data.message || 'কমিটি মুছে ফেলতে ব্যর্থ হয়েছে। (Deletion failed)', { id: toastId });
        }
      } catch (fallbackErr: any) {
        toast.error('নেটওয়ার্ক ত্রুটি! কমিটি মুছে ফেলা যায়নি। (Network error during deletion)', { id: toastId });
      }
    } finally {
      setDeletingId(null);
    }
  };

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
      toast.success('অ্যাডমিন লগআউট সম্পন্ন হয়েছে (Admin Logged Out)');
      router.push('/organizer/auth');
    } catch {
      toast.error('লগআউট ব্যর্থ হয়েছে (Sign Out Failed)');
    }
  };

  // Export audit table as CSV
  const handleExportCSV = () => {
    if (rankedCommittees.length === 0) {
      toast.error('রপ্তানি করার মতো কোনো ডেটা নেই (No data to export)');
      return;
    }

    const headers = [
      'Rank',
      'Committee ID',
      'Committee Name',
      'Location / Ward',
      'Status',
      'Contact Number',
      'Theme',
      'Total Votes',
    ];
    const rows = rankedCommittees.map((c, index) => [
      index + 1,
      `"${c.id}"`,
      `"${c.committee_name || ''}"`,
      `"${c.ward || ''}"`,
      `"${c.status || 'pending'}"`,
      `"${c.contact_number || c.phone || ''}"`,
      `"${c.theme || ''}"`,
      c.resolvedVotes || 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `durgapuja_audit_leaderboard_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('অডিট সিএসভি সফলভাবে ডাউনলোড হয়েছে (CSV Exported Successfully)!');
  };

  // -----------------------------------------------------------------
  // ROUTE PROTECTION: AUTH LOADING & UNAUTHENTICATED GUARDS
  // -----------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-md border border-white/60 p-8 rounded-3xl shadow-xl flex flex-col items-center gap-3 text-gray-800 animate-slide-up">
          <Loader2 className="w-10 h-10 text-sindoor-600 animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-gray-900">
              সুপার অ্যাডমিন অধিবেশন যাচাই করা হচ্ছে...
            </p>
            <p className="text-xs text-gray-500">
              (Verifying Super Admin Access Session...)
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Strict Client-Side RBAC Guard: Unauthenticated OR Not Designated Super Admin
  if (!user || !isSuperAdmin(user.email)) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-md border border-rose-200/80 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-gray-900">
              অননুমোদিত প্রবেশাধিকার
            </h2>
            <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">
              (Access Denied: Super Admin Only)
            </p>
            <p className="text-xs text-gray-600 leading-relaxed pt-1">
              সুপার অ্যাডমিন কন্ট্রোল প্যানেল শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন অ্যাকাউন্টের জন্য সংরক্ষিত। আপনাকে আয়োজক ড্যাশবোর্ডে পুনর্নির্দেশ করা হচ্ছে...
            </p>
            <p className="text-[11px] text-gray-500 italic">
              (This panel is strictly restricted. Redirecting to Organizer Dashboard...)
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-gray-700 text-left space-y-1">
            <div className="flex items-center gap-2 text-rose-600 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>RBAC Security Gate: Active</span>
            </div>
            <p className="truncate text-gray-600">Current Session: {user?.email || 'Unauthenticated'}</p>
            <p className="text-gray-500 font-mono text-[10px]">Authorized: VIP Pass Only ({SUPER_ADMIN_EMAIL})</p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard/organizer"
              className="w-full py-3 px-4 rounded-xl bg-sindoor-600 hover:bg-sindoor-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>আয়োজক ড্যাশবোর্ডে ফিরে যান (Return to Organizer Dashboard)</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // MASTER ADMIN DASHBOARD - LIGHT THEME, GLASSMORPHISM & SLIDE-UP
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-transparent text-gray-900 selection:bg-amber-200 selection:text-amber-950 flex flex-col justify-between">
      
      {/* Top Professional Admin Bar */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-amber-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center text-white shadow-md text-lg font-black shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-gray-900 leading-none">
                  মাস্টার অ্যাডমিন ড্যাশবোর্ড
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  VIP Pass
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                (Master Admin Dashboard • Central Command)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Switch to Organizer Live Desk */}
            <Link
              href="/dashboard/organizer"
              className="px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100/90 text-xs font-bold text-amber-900 flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">আয়োজক ডেস্ক (Organizer Desk)</span>
              <span className="sm:hidden">ডেস্ক</span>
            </Link>

            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]">
                {user.email || 'Super Admin'}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                অনুমোদিত সুপার অ্যাডমিন (Authorized)
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

      {/* Main Frosted Glass Bottom Sheet Container with Slide-Up Animation */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-12">
        <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/60 p-5 sm:p-8 space-y-8 animate-slide-up">
          
          {/* Mobile Bottom-Sheet Grab Handle Indicator */}
          <div className="w-12 h-1.5 bg-gray-300/80 rounded-full mx-auto -mt-1 mb-2 sm:hidden" />

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/70 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-1 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-sindoor-600" />
                <span>পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • লাইভ অডিট কনসোল</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-serif">
                সার্বজনীন পর্যবেক্ষণ ও অনুমোদন কেন্দ্র
              </h2>
              <p className="text-xs text-gray-500">
                (Global Real-Time Overview, Verification & SMS Gateway Desk)
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>লাইভ ফায়ারস্টোর সিঙ্ক (Live Sync)</span>
              </span>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* GLOBAL STATISTICS OVERVIEW (4 Light Frosted Glass Cards) */}
          {/* ------------------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

            {/* Stat 1: Total Registered Committees & Approval Split */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md border border-indigo-100/90 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between text-gray-500 mb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">
                    মোট নিবন্ধিত কমিটি
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    (Total Registered Committees)
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight font-sans">
                  {totalRegisteredCommittees.toLocaleString('bn-IN')}
                </span>
                <p className="text-xs text-gray-500 font-medium">
                  {totalRegisteredCommittees} Committees Enrolled
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold">
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>অনুমোদিত: {approvedCommitteesCount}</span>
                </span>
                {pendingCommitteesCount > 0 && (
                  <span className="text-amber-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>অপেক্ষমান: {pendingCommitteesCount}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Stat 2: Total Votes Cast */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md border border-rose-100/90 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between text-gray-500 mb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-900 block">
                    মোট প্রদত্ত ভোট
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    (Total Votes Cast)
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-sindoor-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Vote className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-sindoor-600 tracking-tight font-sans">
                  {totalVotesCast.toLocaleString('bn-IN')}
                </span>
                <p className="text-xs text-gray-500 font-medium">
                  {totalVotesCast} Verified Citizen Ballots
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-gray-600 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Firestore Realtime Atomic Sync</span>
              </div>
            </div>

            {/* Stat 3: Top Leading Committee */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md border border-amber-100/90 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between text-gray-500 mb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                    শীর্ষস্থানীয় মণ্ডপ
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    (Leading Pandal Committee)
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-base sm:text-lg font-bold text-gray-900 line-clamp-1">
                  {rankedCommittees[0]?.committee_name || 'তথ্য সংগৃহীত হচ্ছে...'}
                </span>
                <p className="text-xs text-amber-800 font-medium">
                  ভোট সংখ্যা: <strong className="font-mono text-gray-900">{rankedCommittees[0]?.resolvedVotes || 0}</strong> ভোট (Votes)
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>১ম স্থান অধিকারী কমিটি (Rank 1 Leader)</span>
              </div>
            </div>

            {/* Stat 4: Security & Integrity */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md border border-emerald-100/90 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between text-gray-500 mb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
                    ভোটিং নিরাপত্তা
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    (Voting Integrity & Security)
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight font-sans">
                  ১০০%
                </span>
                <p className="text-xs text-gray-500 font-medium">
                  Device Hash + Anonymous UID Lock
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>এক ডিভাইসে এক ভোট (1 Vote Per Device)</span>
              </div>
            </div>

          </div>

          {/* ------------------------------------------------------------- */}
          {/* GLOBAL CONTROLS & AUDIT ACTIONS */}
          {/* ------------------------------------------------------------- */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md border border-gray-200/80 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                <span>গ্লোবাল ভোটিং ব্যবস্থা পরিচালনা (Voting Gatekeeper)</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                জরুরি পরিস্থিতিতে প্ল্যাটফর্মের ভোট গ্রহণ সক্রিয় বা স্থগিত রাখুন এবং অনুমোদিত কমিটির অডিট লগ ডাউনলোড করুন।
                <span className="block text-[11px] text-gray-500">(Toggle voting availability or export verified audit logs)</span>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                onClick={handleToggleVoting}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 ${
                  votingEnabled 
                    ? 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100' 
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {votingEnabled ? <Lock className="w-4 h-4 text-rose-600" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
                <span>
                  {votingEnabled 
                    ? 'ভোট সাময়িক স্থগিত করুন (Pause Voting)' 
                    : 'ভোট পুনরায় চালু করুন (Resume Voting)'}
                </span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>অডিট লগ ডাউনলোড (Export CSV)</span>
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* GLOBAL LEADERBOARD & COMMITTEE APPROVAL DATA TABLE */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden p-5 sm:p-7 space-y-5">
            
            {/* Table Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight font-serif">
                    গ্লোবাল লিডারবোর্ড ও কমিটি অনুমোদন
                  </h3>
                  <span className="text-xs text-gray-500 font-sans">
                    (Global Leaderboard & Verification Desk)
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  সর্বাধিক ভোটপ্রাপ্তির ক্রমানুসারে লাইভ তালিকা। এক ক্লিকে কমিটি অনুমোদন করুন এবং স্বয়ংক্রিয় এসএমএস পাঠান।
                </p>
              </div>

              {/* Search, Ward Filter, and Status Filter Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search input */}
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="কমিটি, ফোন বা অঞ্চল খুঁজুন..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50/90 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="py-2 px-3 bg-gray-50/90 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-hidden focus:border-amber-500 transition-colors cursor-pointer"
                >
                  <option value="all">সকল স্থিতি (All Statuses)</option>
                  <option value="approved">অনুমোদিত (Approved)</option>
                  <option value="pending">অপেক্ষমান (Pending)</option>
                </select>

                {/* Ward Filter */}
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="py-2 px-3 bg-gray-50/90 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-hidden focus:border-amber-500 transition-colors cursor-pointer"
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
                <Loader2 className="w-8 h-8 text-sindoor-600 animate-spin mb-3" />
                <p className="text-xs text-gray-600 font-medium">ফায়ারস্টোর থেকে লাইভ তালিকা লোড হচ্ছে...</p>
                <p className="text-[11px] text-gray-400">(Loading real-time committees from Firestore...)</p>
              </div>
            ) : filteredLeaderboard.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-xs space-y-2">
                <Database className="w-8 h-8 mx-auto text-gray-400" />
                <p className="font-semibold text-gray-700">কোনো কমিটি খুঁজে পাওয়া যায়নি।</p>
                <p className="text-gray-400">(No registered committees match your query)</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-left text-xs border-collapse">
                  
                  {/* Table Head */}
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-600 bg-gray-50/80">
                      <th className="py-3.5 px-4 w-16 text-center">র‍্যাংক (Rank)</th>
                      <th className="py-3.5 px-4">কমিটির নাম (Committee Name)</th>
                      <th className="py-3.5 px-4">অঞ্চল / ওয়ার্ড (Location / Zone)</th>
                      <th className="py-3.5 px-4">যোগাযোগ (Contact Phone)</th>
                      <th className="py-3.5 px-4 text-right">মোট ভোট (Total Votes)</th>
                      <th className="py-3.5 px-4 text-center">স্থিতি (Status)</th>
                      <th className="py-3.5 px-4 text-center">অ্যাকশন (Actions)</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-gray-100">
                    {filteredLeaderboard.map((committee, index) => {
                      const rank = index + 1;
                      const votes = committee.resolvedVotes || 0;
                      const votePercent = totalVotesCast > 0 ? ((votes / totalVotesCast) * 100).toFixed(1) : '0';
                      const isApproved = committee.status === 'approved';
                      const isCurrentlyApproving = approvingId === committee.id;
                      const displayPhone = committee.contact_number || committee.phone || (committee as any).contactNumber || (committee as any).phoneNumber || '';

                      // Rank Badges
                      let rankBadge = (
                        <span className="font-mono font-bold text-gray-500 text-xs">
                          #{rank}
                        </span>
                      );
                      if (rank === 1) {
                        rankBadge = (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-sm">
                            🥇 1
                          </span>
                        );
                      } else if (rank === 2) {
                        rankBadge = (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-black text-xs shadow-xs">
                            🥈 2
                          </span>
                        );
                      } else if (rank === 3) {
                        rankBadge = (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-900 font-black text-xs shadow-xs">
                            🥉 3
                          </span>
                        );
                      }

                      return (
                        <tr 
                          key={committee.id}
                          className="hover:bg-amber-50/40 transition-colors group"
                        >
                          {/* Rank */}
                          <td className="py-4 px-4 text-center">
                            {rankBadge}
                          </td>

                          {/* Committee Name */}
                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              <span className="font-bold text-sm text-gray-900 group-hover:text-sindoor-600 transition-colors block">
                                {committee.committee_name}
                              </span>
                              <span className="text-[11px] text-gray-400 font-mono block">
                                ID: {committee.id}
                              </span>
                            </div>
                          </td>

                          {/* Location / Zone */}
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              {committee.ward}
                            </span>
                          </td>

                          {/* Contact Phone */}
                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              {displayPhone ? (
                                <span className="font-mono text-gray-800 text-[11px] font-semibold flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{displayPhone}</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">ফোন নেই (No phone)</span>
                              )}
                              {committee.secretary_name && (
                                <span className="text-[10px] text-gray-500 block truncate max-w-[130px]">
                                  {committee.secretary_name}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Total Votes */}
                          <td className="py-4 px-4 text-right">
                            <div className="space-y-0.5 inline-block text-right">
                              <span className="text-base font-black text-sindoor-600 font-mono block">
                                {votes.toLocaleString('bn-IN')}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono block">
                                ({votes} votes • {votePercent}%)
                              </span>
                            </div>
                          </td>

                          {/* Status & Approval Button */}
                          <td className="py-4 px-4 text-center">
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>অনুমোদিত (Approved)</span>
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  handleApproveCommittee(
                                    committee.id,
                                    committee.committee_name || committee.id,
                                    displayPhone
                                  )
                                }
                                disabled={isCurrentlyApproving}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="কমিটি অনুমোদন করুন (Approve Committee)"
                              >
                                {isCurrentlyApproving ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>অনুমোদন হচ্ছে...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>অনুমোদন করুন (Approve)</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>

                          {/* Action Links: Live Voter Ballot & Delete Button */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <Link
                                href={`/vote/${committee.id}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-[11px] font-bold text-gray-700 hover:text-sindoor-600 transition-all border border-gray-200 hover:border-amber-300 shadow-2xs active:scale-95"
                                title="ব্যালট দেখুন (View Ballot)"
                              >
                                <ExternalLink className="w-3 h-3 text-amber-600" />
                                <span>দেখুন</span>
                              </Link>

                              <button
                                onClick={() =>
                                  handleDeleteCommittee(
                                    committee.id,
                                    committee.committee_name || committee.id
                                  )
                                }
                                disabled={deletingId === committee.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold shadow-xs hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="স্থায়ীভাবে মুছে ফেলুন (Permanently Delete)"
                              >
                                {deletingId === committee.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                                <span>ডিলিট (Delete)</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>
            )}

            {/* Table Footer Summary */}
            <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-2">
              <span>
                মোট তালিকাভুক্ত মণ্ডপ: <strong className="text-gray-900 font-mono">{filteredLeaderboard.length}</strong> / {totalRegisteredCommittees}
              </span>
              <span className="font-mono text-[11px] text-gray-400">
                Auto-refreshed via Firebase Firestore Realtime Snapshots
              </span>
            </div>

          </div>

        </div>
      </main>

      {/* Clean Bottom Bar */}
      <footer className="w-full border-t border-amber-200/60 bg-white/70 backdrop-blur-md py-4 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-amber-300">
              <Image
                src="/logo.jpg"
                alt="PBDS Logo"
                width={20}
                height={20}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-serif font-bold text-gray-700">
              পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি (Paschim Banga DurgaPuja Samannay Samity)
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-mono">
            Vercel Edge Network • Central Super Admin Control Desk & SMS Gateway
          </p>
        </div>
      </footer>

    </div>
  );
}
