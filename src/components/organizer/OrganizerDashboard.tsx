'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { isSuperAdmin } from '@/lib/admin';
import { auth, onAuthStateChanged, signOut } from '@/lib/firebase';
import { getCommitteeByUser } from '@/lib/committeeService';
import toast from 'react-hot-toast';
import { Pandal, PandalMedia } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { DhakButton } from '@/components/ui/DhakButton';
import { 
  TrendingUp, 
  Upload, 
  FileText, 
  Award, 
  Trash2, 
  CheckCircle, 
  Camera, 
  Sparkles, 
  Palette, 
  Zap, 
  Leaf, 
  Save, 
  QrCode, 
  Download, 
  Image as ImageIcon, 
  Flame, 
  Star, 
  Eye, 
  ShieldCheck,
  Building2,
  Share2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Cell
} from 'recharts';

// Helper to generate clean URL slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Helper to format raw slug into readable title
function formatPandalName(slug: string): string {
  if (!slug) return 'Puja Pandal';
  const decoded = decodeURIComponent(slug).replace(/[-_]+/g, ' ').trim();
  return decoded
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const OrganizerDashboard: React.FC = () => {
  const router = useRouter();
  const { 
    user, 
    organizerPandal, 
    registerOrUpdatePandal, 
    addMediaToPandal, 
    deleteMediaFromPandal,
    pandals
  } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'profile' | 'media-gallery'>('profile');
  const [isMounted, setIsMounted] = useState(false);
  const [qrDownloaded, setQrDownloaded] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [origin, setOrigin] = useState<string>('');

  // Auto-QR & Pandal Profile identification
  const [pandalSlug, setPandalSlug] = useState<string>('');
  const [pandalName, setPandalName] = useState<string>('');
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState<boolean>(false);
  const [isSavingSetup, setIsSavingSetup] = useState<boolean>(false);

  // First-time setup form fields
  const [setupPandalName, setSetupPandalName] = useState<string>('');
  const [setupClubName, setSetupClubName] = useState<string>('');
  const [setupWard, setSetupWard] = useState<string>('Ward 12');
  const [setupTheme, setSetupTheme] = useState<string>('');

  // Strict Route Protection: Check valid Firebase session & fetch Pandal Slug
  useEffect(() => {
    let isSubscribed = true;
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (isSubscribed) {
          setIsAuthenticated(false);
          router.replace('/organizer/auth');
        }
        return;
      }

      try {
        // Strict Check: Must have a verified committee record in database
        const { committee } = await getCommitteeByUser(user.uid);
        if (!committee) {
          if (isSubscribed) {
            setIsAuthenticated(false);
            router.replace('/organizer/setup');
          }
          return;
        }

        if (isSubscribed) {
          setIsAuthenticated(true);
          setPandalSlug(committee.slug);
          setPandalName(committee.committee_name);
          setIsFirstTimeSetup(false);
        }
      } catch (err) {
        if (isSubscribed) {
          setIsAuthenticated(false);
          await signOut(auth);
          router.replace('/organizer/auth');
        }
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [router]);

  const currentPandal = pandals.find(p => p.id === pandalSlug) || organizerPandal || pandals[0];

  // Form State for Pandal Registration / Profile
  const [formData, setFormData] = useState<Partial<Pandal>>({
    name: currentPandal?.name || '',
    clubName: currentPandal?.clubName || '',
    location: currentPandal?.location || '',
    ward: currentPandal?.ward || '',
    nearLandmark: currentPandal?.nearLandmark || '',
    budget: currentPandal?.budget || '₹48 Lakhs',
    budgetNumber: currentPandal?.budgetNumber || 48,
    theme: currentPandal?.theme || '',
    themeDescription: currentPandal?.themeDescription || '',
    presidentName: currentPandal?.presidentName || '',
    secretaryName: currentPandal?.secretaryName || '',
    contactNumber: currentPandal?.contactNumber || '',
    isEcoFriendly: currentPandal?.isEcoFriendly || false,
    logoUrl: currentPandal?.logoUrl || '',
  });

  // Media upload simulation state
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCaption, setNewMediaCaption] = useState('');
  const [newMediaTag, setNewMediaTag] = useState<'Idol' | 'Theme' | 'Lighting' | 'Gate' | 'Crowd' | 'Eco'>('Idol');
  const [isFeaturedMedia, setIsFeaturedMedia] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (currentPandal) {
      setFormData({
        id: currentPandal.id,
        name: pandalName || currentPandal.name,
        clubName: currentPandal.clubName,
        location: currentPandal.location,
        ward: currentPandal.ward,
        nearLandmark: currentPandal.nearLandmark,
        budget: currentPandal.budget,
        budgetNumber: currentPandal.budgetNumber,
        theme: currentPandal.theme,
        themeDescription: currentPandal.themeDescription,
        presidentName: currentPandal.presidentName,
        secretaryName: currentPandal.secretaryName,
        contactNumber: currentPandal.contactNumber,
        isEcoFriendly: currentPandal.isEcoFriendly,
        logoUrl: currentPandal.logoUrl,
      });
    }
  }, [currentPandal, pandalName]);

  // Ranking calculation
  const sortedByVotes = [...pandals].sort((a, b) => b.totalVotes - a.totalVotes);
  const cityRank = sortedByVotes.findIndex((p) => p.id === currentPandal.id) + 1;

  // Chart data
  const categoryVotesData = [
    { name: 'Best Idol', votes: currentPandal.votes.idol, color: '#D9222A' },
    { name: 'Best Theme', votes: currentPandal.votes.theme, color: '#F58220' },
    { name: 'Best Lighting', votes: currentPandal.votes.lighting, color: '#DFB23D' },
    { name: 'Eco-Friendly', votes: currentPandal.votes.eco, color: '#15803D' },
  ];

  const visitTrendData = [
    { day: 'Mahalaya', visits: 4200, votes: 850 },
    { day: 'Panchami', visits: 7800, votes: 1950 },
    { day: 'Sasthi', visits: 12400, votes: 3400 },
    { day: 'Saptami', visits: 18900, votes: 4800 },
    { day: 'Ashtami (Today)', visits: currentPandal.visitsToday || 22100, votes: currentPandal.totalVotes },
  ];

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPandal) {
      const targetSlug = pandalSlug || currentPandal.id;
      registerOrUpdatePandal({
        ...formData,
        id: targetSlug,
      });

      if (formData.name) {
        setPandalName(formData.name);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData((prev) => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Construct official voting URL for universal QR code
  const activeOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://samannaysamity.org');
  const activeSlug = pandalSlug || currentPandal?.id || 'marconi-dakshin-palli';
  const votingUrl = `${activeOrigin}/${activeSlug}`;

  // REAL QR DOWNLOAD FEATURE: Convert canvas to PNG and download
  const handleDownloadPrintReadyQr = () => {
    const canvas = document.getElementById('auto-voting-qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    try {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      const cleanSlug = activeSlug.replace(/[^a-zA-Z0-9_-]/g, '_');
      downloadLink.download = `${cleanSlug}_Official_PBDS_Voting_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setQrDownloaded(true);
      setTimeout(() => setQrDownloaded(false), 3000);
    } catch (err) {
      console.error('QR download error:', err);
    }
  };

  // Copy link handler
  const handleCopyVotingLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(votingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // First-time setup submission handler
  const handleFirstTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupPandalName.trim()) return;

    setIsSavingSetup(true);
    const generatedSlug = slugify(setupPandalName);
    const committeeName = setupClubName.trim() || setupPandalName.trim();
    const wardNumber = setupWard.trim() || 'Ward 12';

    try {
      registerOrUpdatePandal({
        id: generatedSlug,
        name: setupPandalName.trim(),
        clubName: committeeName,
        ward: wardNumber,
        location: `Durgapur, ${wardNumber}`,
        theme: setupTheme.trim() || 'Traditional Durga Puja',
        themeDescription: 'Official puja entry registered with Paschim Banga DurgaPuja Samannay Samity.',
        presidentName: user?.name || 'Club President',
        secretaryName: user?.name || 'Club Secretary',
        contactNumber: '+91 98000 00000',
        budget: '₹35 Lakhs',
        budgetNumber: 35,
        establishedYear: 2026,
        coverImage: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop&q=80',
        totalVotes: 0,
        visitsToday: 1,
        votes: { idol: 0, theme: 0, lighting: 0, eco: 0 },
        isEcoFriendly: true,
      });

      setPandalSlug(generatedSlug);
      setPandalName(setupPandalName.trim());
      setFormData(prev => ({
        ...prev,
        id: generatedSlug,
        name: setupPandalName.trim(),
        clubName: committeeName,
        ward: wardNumber,
        theme: setupTheme.trim() || 'Traditional Durga Puja',
      }));
      setIsFirstTimeSetup(false);
    } catch (err) {
      console.error('Setup error:', err);
    } finally {
      setIsSavingSetup(false);
    }
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl) return;

    addMediaToPandal(currentPandal.id, {
      url: newMediaUrl,
      caption: newMediaCaption || `${newMediaTag} photo of ${currentPandal.name}`,
      tag: newMediaTag,
      type: 'photo',
      isFeatured: isFeaturedMedia,
    });

    setNewMediaUrl('');
    setNewMediaCaption('');
    setIsFeaturedMedia(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-10 h-10 border-3 border-marigold-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-700">Verifying Authorized Organizer Session...</p>
        <p className="text-xs text-gray-500 mt-1">Authenticating with Paschim Banga Samannay Samity</p>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {isFirstTimeSetup ? (
        <div className="max-w-2xl mx-auto glass-panel rounded-3xl p-6 sm:p-10 border-2 border-amber-300 shadow-xl my-6">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Organizer Welcome & Activation</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-1">
              Enter your Pandal Name to generate your Voting QR
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-lg mx-auto">
              Welcome to Paschim Banga DurgaPuja Samannay Samity! Provide your registered Pandal details to instantly generate your official, universally scannable Gate Voting QR Code.
            </p>
          </div>

          <form onSubmit={handleFirstTimeSetup} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Official Pandal Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Bidhan Nagar Sarbojanin Durga Puja"
                value={setupPandalName}
                onChange={(e) => setSetupPandalName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sindoor-500 text-sm bg-white font-medium"
                required
              />
            </div>

            {/* Live QR Slug Preview */}
            {setupPandalName.trim() && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="font-semibold">Auto-Generated QR Route:</span>
                  <span className="font-mono font-bold text-sindoor-600">/{slugify(setupPandalName)}</span>
                </div>
                <div className="text-gray-500 font-mono text-[11px] truncate">
                  Scannable URL: <strong className="text-gray-800">{activeOrigin}/{slugify(setupPandalName)}</strong>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Club / Samiti Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bidhan Nagar Sporting Club"
                  value={setupClubName}
                  onChange={(e) => setSetupClubName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sindoor-500 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Ward / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ward 12, Durgapur"
                  value={setupWard}
                  onChange={(e) => setSetupWard(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sindoor-500 text-sm bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Pandal Theme / Concept (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Bengal Terracotta Art & Heritage"
                value={setupTheme}
                onChange={(e) => setSetupTheme(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sindoor-500 text-sm bg-white"
              />
            </div>

            <div className="pt-2">
              <DhakButton
                type="submit"
                disabled={isSavingSetup || !setupPandalName.trim()}
                className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-festive disabled:opacity-50 touch-manipulation active:scale-95"
              >
                {isSavingSetup ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Configuring Pandal & Generating QR...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    <span>Generate Official Voting QR</span>
                  </>
                )}
              </DhakButton>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Top Banner Card with Committee Logo & Verified Badge */}
          <div className="glass-panel-warm rounded-3xl p-6 sm:p-8 mb-8 border-2 border-marigold-200/80 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              
              <div className="flex items-center gap-4">
                {/* Committee Logo or Cover Image */}
                <div className="relative">
                  <img
                    src={formData.logoUrl || currentPandal.logoUrl || currentPandal.coverImage}
                    alt={pandalName || currentPandal.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-marigold-300 shadow-md bg-white"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full ring-2 ring-white">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-marigold-800 bg-marigold-100 px-2.5 py-0.5 rounded-full border border-marigold-300">
                      Organizer Control Desk
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {formData.ward || currentPandal.ward}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-1">
                    {pandalName || currentPandal.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    Committee: <strong className="text-gray-900">{formData.clubName || currentPandal.clubName}</strong> • President: <strong className="text-gray-900">{formData.presidentName || currentPandal.presidentName}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* VIP Pass: Super Admin Button strictly for designated email */}
                {isSuperAdmin(user?.email) && (
                  <Link
                    href="/dashboard/admin"
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 hover:from-amber-400 hover:to-indigo-500 active:scale-95 transition border border-amber-300/40"
                    title="সুপার অ্যাডমিন কন্ট্রোল প্যানেল (Super Admin Panel)"
                  >
                    <span>👑 Super Admin Panel</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile');
                    setTimeout(() => {
                      const el = document.getElementById('auto-voting-qr-canvas');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sindoor-600 to-marigold-600 text-white text-xs font-black shadow-festive flex items-center gap-1.5 hover:opacity-95 active:scale-95 transition"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gate QR Standee</span>
                </button>
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-100/80 border border-amber-300 text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-marigold-600" />
                  <span>Regional Rank #{cityRank}</span>
                </span>
              </div>

            </div>

        {/* Ambient subtle glow background */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-tr from-sindoor-500/10 to-marigold-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-white/70 backdrop-blur-md p-1.5 rounded-2xl border border-amber-200 shadow-xs mb-8 max-w-xl mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-sindoor-500 to-marigold-500 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Profile & QR Standee</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-sindoor-500 to-marigold-500 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('media-gallery')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'media-gallery'
              ? 'bg-gradient-to-r from-sindoor-500 to-marigold-500 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Media Gallery</span>
        </button>
      </div>

      {/* TAB 1: DEDICATED PROFILE & REAL QR GENERATION / DOWNLOAD */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form Details & Committee Logo */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-glass">
            
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-900">
                Pandal Committee Profile & Branding
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Update your registered club profile, budget disclosure, and upload your official Committee Logo.
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              
              {/* Committee Logo Upload Section */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-sm shrink-0 bg-white flex items-center justify-center">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-amber-500" />
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                    Official Committee Logo
                  </h4>
                  <p className="text-[11px] text-gray-600">
                    Upload your club insignia to display on the public voter card and dashboard header.
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs flex items-center gap-1.5 transition">
                      <ImageIcon className="w-3.5 h-3.5 text-sindoor-500" />
                      <span>Upload Logo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      placeholder="Or paste Logo URL"
                      value={formData.logoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-sindoor-400 bg-white flex-1 min-w-[180px]"
                    />
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Pandal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sindoor-400 text-sm bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Club / Samiti Name *
                  </label>
                  <input
                    type="text"
                    value={formData.clubName || ''}
                    onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sindoor-400 text-sm bg-white"
                    required
                  />
                </div>
              </div>

              {/* Location & Ward */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Location (City / Area / Ward) *
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sindoor-400 text-sm bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Municipal Ward *
                  </label>
                  <input
                    type="text"
                    value={formData.ward || ''}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sindoor-400 text-sm bg-white"
                    required
                  />
                </div>
              </div>

              {/* Budget & Theme Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Estimated Budget *
                  </label>
                  <input
                    type="text"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sindoor-400 text-sm bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    2026 Puja Theme Title *
                  </label>
                  <input
                    type="text"
                    value={formData.theme || ''}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sindoor-400 text-sm bg-white"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Theme Concept Description & Artisan Details *
                </label>
                <textarea
                  rows={3}
                  value={formData.themeDescription || ''}
                  onChange={(e) => setFormData({ ...formData, themeDescription: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sindoor-400 text-sm bg-white"
                  required
                />
              </div>

              {/* Leadership Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    President Name *
                  </label>
                  <input
                    type="text"
                    value={formData.presidentName || ''}
                    onChange={(e) => setFormData({ ...formData, presidentName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sindoor-400 text-sm bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Secretary Name *
                  </label>
                  <input
                    type="text"
                    value={formData.secretaryName || ''}
                    onChange={(e) => setFormData({ ...formData, secretaryName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sindoor-400 text-sm bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    value={formData.contactNumber || ''}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sindoor-400 text-sm bg-white"
                    required
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {saveSuccess ? (
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Profile & Logo updated successfully!
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Updates reflect live immediately across the public feed.</span>
                )}

                <DhakButton
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </DhakButton>
              </div>

            </form>
          </div>

          {/* Right Column: Auto-Generated Print-Ready QR Standee */}
          <div className="space-y-6">
            
            <div className="glass-panel rounded-3xl p-6 sm:p-7 border-2 border-amber-300 shadow-glass text-center relative overflow-hidden bg-gradient-to-b from-white via-amber-50/20 to-amber-100/20">
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sindoor-50 border border-sindoor-200 text-sindoor-600 text-[11px] font-black uppercase tracking-wider mb-3">
                <QrCode className="w-3.5 h-3.5 text-sindoor-500" />
                <span>Official Gate Voting QR Standee</span>
              </div>

              <h3 className="font-serif font-black text-xl text-gray-900 leading-tight">
                {pandalName || currentPandal.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                {currentPandal.ward || 'Registered Puja Pandal'} • Scannable by any phone camera
              </p>

              {/* Real Auto-Generated QR Canvas using qrcode.react */}
              <div className="inline-flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white border-2 border-amber-300 shadow-md max-w-full">
                <div className="max-w-full overflow-hidden flex items-center justify-center">
                  <QRCodeCanvas
                    id="auto-voting-qr-canvas"
                    value={votingUrl}
                    size={300}
                    level="H"
                    includeMargin={true}
                    className="max-w-full h-auto"
                    imageSettings={{
                      src: '/logo.jpg',
                      height: 50,
                      width: 50,
                      excavate: true,
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
                  <Sparkles className="w-3 h-3 text-marigold-500" />
                  <span>Paschim Banga DurgaPuja Samannay Samity</span>
                </div>
              </div>

              {/* Scannable Absolute URL Display + Copy Button */}
              <div className="mt-4 p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-2 text-left">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">
                    Official Voter Destination URL
                  </span>
                  <p className="text-xs font-mono font-bold text-gray-800 truncate">
                    {votingUrl}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyVotingLink}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-300 text-xs font-bold text-gray-700 shrink-0 flex items-center gap-1 transition shadow-2xs touch-manipulation active:scale-95"
                  title="Copy link to clipboard"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons: Download Print-Ready PNG & Test Link */}
              <div className="mt-4 space-y-2">
                <DhakButton
                  variant="gold"
                  onClick={handleDownloadPrintReadyQr}
                  className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-gold-glow touch-manipulation active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Print-Ready QR (PNG)</span>
                </DhakButton>

                {qrDownloaded && (
                  <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Print-Ready 300px QR downloaded successfully!</span>
                  </p>
                )}

                <a
                  href={votingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl border border-gray-200 hover:border-marigold-300 bg-white/80 hover:bg-white text-xs font-bold text-gray-700 hover:text-sindoor-600 flex items-center justify-center gap-1.5 transition shadow-2xs touch-manipulation active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Live Voter Ballot in Browser</span>
                </a>
              </div>

              {/* Universal Compatibility Guidance */}
              <div className="mt-4 pt-4 border-t border-amber-200/60 text-left space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Universal Mobile Compatibility:</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-snug">
                  • Universally scannable by default iOS Camera, Samsung Camera, Google Lens, and generic barcode readers without installing an app.
                </p>
                <p className="text-[11px] text-gray-600 leading-snug">
                  • Level H error correction with central PBDS insignia allows high contrast outdoor reading even under sunlight or at angled perspectives.
                </p>
              </div>

            </div>

            {/* Quick Stats Card */}
            <div className="glass-panel rounded-2xl p-4 border border-amber-200/60 text-xs space-y-2">
              <span className="font-bold text-gray-700 block">Gate Footfall Status</span>
              <div className="flex justify-between text-gray-600">
                <span>Total On-Ground Scans:</span>
                <span className="font-bold text-gray-900">8,940</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Verified Ballot Conversion:</span>
                <span className="font-bold text-emerald-600">92.4%</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: ANALYTICS DASHBOARD */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel rounded-3xl p-5 border border-amber-200/60 shadow-glass">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Votes</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-1">
                {currentPandal.totalVotes.toLocaleString()}
              </h3>
              <p className="text-xs text-green-600 font-semibold mt-1">↑ 14.8% surge</p>
            </div>

            <div className="glass-panel rounded-3xl p-5 border border-amber-200/60 shadow-glass">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Regional Rank</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-1">
                #{cityRank} <span className="text-xs font-normal text-gray-500">in Region</span>
              </h3>
              <p className="text-xs text-amber-700 font-semibold mt-1">🔥 Top 5 Finalist</p>
            </div>

            <div className="glass-panel rounded-3xl p-5 border border-amber-200/60 shadow-glass">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Profile Footfall</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-1">
                {currentPandal.visitsToday.toLocaleString()}
              </h3>
              <p className="text-xs text-green-600 font-semibold mt-1">↑ 28.4% Puja surge</p>
            </div>

            <div className="glass-panel rounded-3xl p-5 border border-amber-200/60 shadow-glass">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Gate QR Scans</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-1">
                8,940
              </h3>
              <p className="text-xs text-emerald-700 font-semibold mt-1">Verified On-Ground Voters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-amber-200/60 shadow-glass">
              <h3 className="font-serif font-black text-lg text-gray-900 mb-4">
                Category Vote Breakdown
              </h3>
              {isMounted && (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryVotesData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                        {categoryVotesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-amber-200/60 shadow-glass">
              <h3 className="font-serif font-black text-lg text-gray-900 mb-4">
                Daily Footfall & Voting Velocity
              </h3>
              {isMounted && (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={visitTrendData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="visits" stroke="#F58220" fill="#F58220" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="votes" stroke="#D9222A" fill="#D9222A" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: MEDIA GALLERY */}
      {activeTab === 'media-gallery' && (
        <div className="space-y-8">
          
          <div className="glass-panel rounded-3xl p-6 border border-amber-200/60 shadow-glass">
            <h3 className="font-serif font-black text-lg text-gray-900 mb-1 flex items-center gap-2">
              <Camera className="w-5 h-5 text-sindoor-500" />
              Upload & Publish HD Media
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-5">
              Add photographs or video links of your Pratima, illumination, and mandap architecture.
            </p>

            <form onSubmit={handleAddMedia} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Image / Media URL *
                  </label>
                  <input
                    type="url"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-sindoor-400 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Category Tag *
                  </label>
                  <select
                    value={newMediaTag}
                    onChange={(e) => setNewMediaTag(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-sindoor-400 bg-white font-semibold"
                  >
                    <option value="Idol">Idol (প্রতিমা)</option>
                    <option value="Theme">Theme (ভাবনা)</option>
                    <option value="Lighting">Lighting (আলোকসজ্জা)</option>
                    <option value="Gate">Pandal Gate</option>
                    <option value="Crowd">Crowd / Dhunuchi</option>
                    <option value="Eco">Eco Elements</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Caption
                </label>
                <input
                  type="text"
                  value={newMediaCaption}
                  onChange={(e) => setNewMediaCaption(e.target.value)}
                  placeholder="e.g. Grand illumination arch along Benachity avenue"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-sindoor-400 bg-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeaturedMedia}
                    onChange={(e) => setIsFeaturedMedia(e.target.checked)}
                    className="w-4 h-4 rounded text-sindoor-600 focus:ring-sindoor-500"
                  />
                  <span>Set this image as Primary Cover Photo</span>
                </label>

                <DhakButton
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold"
                >
                  <Upload className="w-4 h-4" />
                  <span>Publish to Gallery</span>
                </DhakButton>
              </div>
            </form>
          </div>

          {/* Current Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPandal.gallery?.map((media) => (
              <div
                key={media.id}
                className="glass-panel rounded-2xl overflow-hidden border border-amber-200/60 shadow-sm flex flex-col group relative"
              >
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={media.url}
                    alt={media.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                      {media.tag}
                    </span>
                    {media.isFeatured && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sindoor-600 text-white flex items-center gap-1 shadow-md">
                        <Star className="w-2.5 h-2.5 fill-white" /> Cover
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteMediaFromPandal(currentPandal.id, media.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 text-xs flex-1 flex flex-col justify-between">
                  <p className="font-semibold text-gray-800 line-clamp-1">{media.caption}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
        </>
      )}

    </div>
  );
};
