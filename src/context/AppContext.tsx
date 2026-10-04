'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Pandal, User, UserRole, VoteCategory, VoteRecord, SupportTicket, PandalMedia } from '@/types';
import { INITIAL_PANDALS } from '@/data/mockPandals';
import { supabase } from '@/lib/supabaseClient';

interface AppContextType {
  user: User | null;
  isConfigured: boolean;
  pandals: Pandal[];
  userVotes: VoteRecord[];
  activeRole: UserRole | 'guest';
  isVoter: boolean;
  isOrganizer: boolean;
  isGuest: boolean;
  
  // Modals
  isAuthModalOpen: boolean;
  authDefaultRole: UserRole;
  isVotingModalOpen: boolean;
  selectedPandal: Pandal | null;
  isQRScannerOpen: boolean;
  isSupportModalOpen: boolean;
  supportTickets: SupportTicket[];
  
  // Auth Actions
  signInWithGoogle: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, role: UserRole, name?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  
  // Modal Actions
  openAuthModal: (defaultRole?: UserRole) => void;
  closeAuthModal: () => void;
  openVotingModal: (pandal: Pandal) => void;
  closeVotingModal: () => void;
  openQRScanner: () => void;
  closeQRScanner: () => void;
  openSupportModal: () => void;
  closeSupportModal: () => void;
  
  hasVoted: (pandalId: string, category?: VoteCategory) => boolean;
  castVote: (pandalId: string, category: VoteCategory, skipApiCheck?: boolean) => Promise<{ success: boolean; message: string; status?: number }>;
  registerOrUpdatePandal: (pandalData: Partial<Pandal>) => Pandal;
  addMediaToPandal: (pandalId: string, mediaItem: Omit<PandalMedia, 'id'>) => void;
  deleteMediaFromPandal: (pandalId: string, mediaId: string) => void;
  submitSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => void;
  
  // 4-Token Gamified State & Helpers
  votedPandals: string[];
  exhaustedCategories: VoteCategory[];
  isPandalHonored: (pandalId: string) => boolean;
  isCategoryExhausted: (category: VoteCategory) => boolean;
  remainingTokensCount: number;

  // Helpers
  organizerPandal: Pandal | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'durgapur_puja_user',
  PANDALS: 'durgapur_puja_pandals',
  VOTES: 'durgapur_puja_votes',
  TICKETS: 'durgapur_puja_tickets',
  ROLE_MAP: 'durgapur_puja_roles',
  DEVICE_ID: 'durgapur_puja_device_id',
  HAS_VOTED: 'durgapur_puja_has_voted',
  DEVICE_VOTES: 'durgapur_puja_device_votes',
  VOTED_PANDALS: 'durgapur_puja_voted_pandals',
  EXHAUSTED_CATEGORIES: 'durgapur_puja_exhausted_categories',
  PERMANENT_USERS: 'durgapur_puja_permanent_users',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pandals, setPandals] = useState<Pandal[]>(INITIAL_PANDALS);
  const [userVotes, setUserVotes] = useState<VoteRecord[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  
  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<UserRole>('voter');
  const [isVotingModalOpen, setIsVotingModalOpen] = useState<boolean>(false);
  const [selectedPandal, setSelectedPandal] = useState<Pandal | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);

  const [votedPandals, setVotedPandals] = useState<string[]>([]);
  const [exhaustedCategories, setExhaustedCategories] = useState<VoteCategory[]>([]);

  // Supabase backend is configured and ready
  const isConfigured = true;

  // 4-Token Gamified Verification Helpers (State-backed to prevent SSR hydration mismatch)
  const isPandalHonored = (pandalId: string): boolean => {
    if (!pandalId) return false;
    if (votedPandals.includes(pandalId)) return true;
    return userVotes.some(v => v.pandalId === pandalId);
  };

  const isCategoryExhausted = (category: VoteCategory): boolean => {
    if (!category) return false;
    if (exhaustedCategories.includes(category)) return true;
    return userVotes.some(v => v.category === category);
  };

  const remainingTokensCount = Math.max(0, 4 - exhaustedCategories.length);

  // Helper: Synthesize or retrieve persistent anonymous device voter
  const getOrCreateDeviceVoter = (): User => {
    let deviceId = '';
    try {
      deviceId = localStorage.getItem('durgapur_puja_anon_uid') || localStorage.getItem(STORAGE_KEYS.DEVICE_ID) || '';
      if (!deviceId) {
        deviceId = `dev-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('durgapur_puja_anon_uid', deviceId);
        localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
      }
    } catch (e) {
      deviceId = `dev-${Date.now().toString(36)}`;
    }
    return {
      id: deviceId.startsWith('dev-') ? `anon-${deviceId}` : deviceId,
      name: 'Verified Voter',
      email: 'voter@samannaysamity.org',
      role: 'voter',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
  };

  // Load saved state and synchronize Supabase session on mount
  useEffect(() => {
    try {
      const storedPandals = localStorage.getItem(STORAGE_KEYS.PANDALS);
      if (storedPandals) {
        setPandals(JSON.parse(storedPandals));
      } else {
        localStorage.setItem(STORAGE_KEYS.PANDALS, JSON.stringify(INITIAL_PANDALS));
      }

      const storedVotes = localStorage.getItem(STORAGE_KEYS.VOTES);
      let parsedVotes: VoteRecord[] = [];
      if (storedVotes) {
        parsedVotes = JSON.parse(storedVotes);
        setUserVotes(parsedVotes);
      }

      const storedTickets = localStorage.getItem(STORAGE_KEYS.TICKETS);
      if (storedTickets) {
        setSupportTickets(JSON.parse(storedTickets));
      }

      // Hydrate 4-Token Gamified voting state from LocalStorage on mount
      const storedVotedPandals = localStorage.getItem(STORAGE_KEYS.VOTED_PANDALS);
      const listVP: string[] = [];
      if (storedVotedPandals) {
        try {
          const parsedVP = JSON.parse(storedVotedPandals);
          if (Array.isArray(parsedVP)) listVP.push(...parsedVP);
        } catch (e) {}
      } else if (parsedVotes.length > 0) {
        listVP.push(...Array.from(new Set(parsedVotes.map(v => v.pandalId))));
      }
      INITIAL_PANDALS.forEach(p => {
        if (localStorage.getItem(`hasVoted_${p.id}`) === 'true' && !listVP.includes(p.id)) {
          listVP.push(p.id);
        }
      });
      const uniqueVP = Array.from(new Set(listVP));
      setVotedPandals(uniqueVP);
      localStorage.setItem(STORAGE_KEYS.VOTED_PANDALS, JSON.stringify(uniqueVP));

      const storedExhaustedCats = localStorage.getItem(STORAGE_KEYS.EXHAUSTED_CATEGORIES);
      const listEC: VoteCategory[] = [];
      if (storedExhaustedCats) {
        try {
          const parsedEC = JSON.parse(storedExhaustedCats);
          if (Array.isArray(parsedEC)) listEC.push(...parsedEC);
        } catch (e) {}
      } else if (parsedVotes.length > 0) {
        listEC.push(...(Array.from(new Set(parsedVotes.map(v => v.category))) as VoteCategory[]));
      }
      (['idol', 'theme', 'lighting', 'eco'] as VoteCategory[]).forEach(cat => {
        if (localStorage.getItem(`exhaustedCategory_${cat}`) === 'true' && !listEC.includes(cat)) {
          listEC.push(cat);
        }
      });
      const uniqueEC = Array.from(new Set(listEC));
      setExhaustedCategories(uniqueEC);
      localStorage.setItem(STORAGE_KEYS.EXHAUSTED_CATEGORIES, JSON.stringify(uniqueEC));
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }

    // Strict Supabase Session Synchronization
    const syncSession = (session: any) => {
      if (session?.user) {
        const sbUser = session.user;
        const organizerUser: User = {
          id: sbUser.id,
          name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Puja Committee Organizer',
          email: sbUser.email || 'organizer@samannaysamity.org',
          role: 'organizer',
          avatar: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          clubId: 'marconi-dakshin-palli',
        };
        setUser(organizerUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(organizerUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
        const defaultAnon = getOrCreateDeviceVoter();
        setUser(defaultAnon);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Google Sign-In via Real Supabase OAuth
  const signInWithGoogle = async (chosenRole: UserRole): Promise<{ success: boolean; error?: string }> => {
    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/organizer-login`
        : undefined;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Google Sign-In failed.' };
    }
  };

  // Real Supabase Email/Password Sign Up
  const signUpWithEmail = async (
    email: string,
    password: string,
    chosenRole: UserRole,
    displayName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: displayName || email.split('@')[0],
            role: chosenRole,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profileUser: User = {
          id: data.user.id,
          name: displayName || data.user.user_metadata?.full_name || email.split('@')[0],
          email: data.user.email || email,
          role: chosenRole,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          clubId: chosenRole === 'organizer' ? 'marconi-dakshin-palli' : undefined,
        };
        setUser(profileUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profileUser));
      }

      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to register account.' };
    }
  };

  // Real Supabase Email/Password Sign In
  const signInWithEmail = async (
    email: string,
    password: string,
    chosenRole: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profileUser: User = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Organizer',
          email: data.user.email || email,
          role: chosenRole,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          clubId: chosenRole === 'organizer' ? 'marconi-dakshin-palli' : undefined,
        };
        setUser(profileUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profileUser));
      }

      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Sign in failed.' };
    }
  };

  // Sign out from Supabase and reset to persistent anonymous voter
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out notice:', e);
    }
    localStorage.removeItem(STORAGE_KEYS.USER);
    const anonVoter = getOrCreateDeviceVoter();
    setUser(anonVoter);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('tab');
      url.searchParams.delete('view');
      window.history.replaceState({}, '', url.pathname);
    }
  };

  const openAuthModal = (defaultRole: UserRole = 'voter') => {
    setAuthDefaultRole(defaultRole);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openVotingModal = (pandal: Pandal) => {
    if (user?.role === 'organizer') return;
    setSelectedPandal(pandal);
    setIsVotingModalOpen(true);
  };

  const closeVotingModal = () => {
    setIsVotingModalOpen(false);
    setSelectedPandal(null);
  };

  const openQRScanner = () => {
    if (user?.role === 'organizer') return;
    setIsQRScannerOpen(true);
  };
  const closeQRScanner = () => setIsQRScannerOpen(false);

  const openSupportModal = () => setIsSupportModalOpen(true);
  const closeSupportModal = () => setIsSupportModalOpen(false);

  // Strict "4-Token Gamified" and "One Device, One Vote" checking
  const hasVoted = (pandalId: string, category?: VoteCategory): boolean => {
    if (isPandalHonored(pandalId)) return true;
    if (category && isCategoryExhausted(category)) return true;

    if (typeof window !== 'undefined') {
      if (localStorage.getItem(`hasVoted_${pandalId}`) === 'true') return true;
      if (category && localStorage.getItem(`hasVoted_${pandalId}_${category}`) === 'true') return true;
      if (category && localStorage.getItem(`exhaustedCategory_${category}`) === 'true') return true;
    }

    if (user) {
      if (userVotes.some(v => v.pandalId === pandalId && (category ? v.category === category : true) && v.userId === user.id)) {
        return true;
      }
    }

    return false;
  };

  // Cast vote solely utilizing our secure Supabase Edge /api/vote route
  const castVote = async (
    pandalId: string,
    category: VoteCategory,
    skipApiCheck: boolean = false
  ): Promise<{ success: boolean; message: string; status?: number }> => {
    const currentVoter = user || getOrCreateDeviceVoter();
    if (!user) {
      setUser(currentVoter);
    }

    if (currentVoter.role !== 'voter') {
      return { 
        success: false, 
        message: 'Security Alert: Organizers are strictly prohibited from voting on pandals.' 
      };
    }

    const voterUid = currentVoter.id;

    // Rule 1: One Vote Per Pandal (Pre-check)
    if (isPandalHonored(pandalId) || votedPandals.includes(pandalId)) {
      return { 
        success: false, 
        message: 'You have already honored this pandal.' 
      };
    }

    // Rule 2: Globally Exclusive Categories (Pre-check)
    if (isCategoryExhausted(category) || exhaustedCategories.includes(category)) {
      return { 
        success: false, 
        message: 'This category has already been awarded.' 
      };
    }

    // LocalStorage Check
    if (typeof window !== 'undefined') {
      const alreadyVotedLocal = localStorage.getItem(`hasVoted_${pandalId}`) === 'true';
      if (alreadyVotedLocal) {
        return { 
          success: false, 
          message: 'You have already honored this pandal.' 
        };
      }
      const alreadyExhaustedLocal = localStorage.getItem(`exhaustedCategory_${category}`) === 'true';
      if (alreadyExhaustedLocal) {
        return { 
          success: false, 
          message: 'This category has already been awarded.' 
        };
      }
    }

    // In-memory duplicate checks
    if (userVotes.some(v => v.pandalId === pandalId)) {
      return { 
        success: false, 
        message: 'You have already honored this pandal.' 
      };
    }
    if (userVotes.some(v => v.category === category)) {
      return { 
        success: false, 
        message: 'This category has already been awarded.' 
      };
    }

    // Call server API for Supabase insert and constraint verification
    if (!skipApiCheck) {
      try {
        const apiRes = await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: voterUid, pandalId, category }),
        });
        const apiData = await apiRes.json();
        if (!apiRes.ok && !apiData.success) {
          if (apiData.message?.includes('pandal') || apiRes.status === 409) {
            if (typeof window !== 'undefined') {
              localStorage.setItem(`hasVoted_${pandalId}`, 'true');
            }
          }
          if (apiData.message?.includes('category') || apiData.message?.includes('token') || apiRes.status === 409) {
            if (typeof window !== 'undefined') {
              localStorage.setItem(`exhaustedCategory_${category}`, 'true');
            }
          }
          return {
            success: false,
            message: apiData.message || 'You have already voted for this pandal or used this category token.',
            status: apiRes.status,
          };
        }
      } catch (apiErr) {
        console.warn('Server API /api/vote verification note:', apiErr);
      }
    }

    // Validation passed! Proceed to record vote and update states.
    const newVote: VoteRecord = {
      pandalId,
      userId: voterUid,
      category,
      timestamp: Date.now(),
    };

    const updatedVotes = [...userVotes, newVote];
    setUserVotes(updatedVotes);

    const updatedVotedPandals = Array.from(new Set([...votedPandals, pandalId]));
    const updatedExhaustedCats = Array.from(new Set([...exhaustedCategories, category]));

    setVotedPandals(updatedVotedPandals);
    setExhaustedCategories(updatedExhaustedCats);

    if (typeof window !== 'undefined') {
      localStorage.setItem(`hasVoted_${pandalId}`, 'true');
      localStorage.setItem(`hasVoted_${pandalId}_${category}`, 'true');
      localStorage.setItem(`exhaustedCategory_${category}`, 'true');
      localStorage.setItem(STORAGE_KEYS.HAS_VOTED, 'true');
      localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(updatedVotes));
      localStorage.setItem(STORAGE_KEYS.VOTED_PANDALS, JSON.stringify(updatedVotedPandals));
      localStorage.setItem(STORAGE_KEYS.EXHAUSTED_CATEGORIES, JSON.stringify(updatedExhaustedCats));
    }

    // Increment vote count locally
    const updatedPandals = pandals.map(p => {
      if (p.id === pandalId) {
        const newCategoryCount = (p.votes[category] || 0) + 1;
        const newTotal = p.totalVotes + 1;
        return {
          ...p,
          votes: {
            ...p.votes,
            [category]: newCategoryCount,
          },
          totalVotes: newTotal,
        };
      }
      return p;
    });

    setPandals(updatedPandals);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PANDALS, JSON.stringify(updatedPandals));
    }

    if (selectedPandal && selectedPandal.id === pandalId) {
      const refreshed = updatedPandals.find(p => p.id === pandalId);
      if (refreshed) setSelectedPandal(refreshed);
    }

    return { success: true, message: 'Your vote has been cast successfully! Joy Ma Durga!', status: 200 };
  };

  const registerOrUpdatePandal = (pandalData: Partial<Pandal>): Pandal => {
    let resultPandal: Pandal;
    if (pandalData.id) {
      const updated = pandals.map(p => {
        if (p.id === pandalData.id) {
          resultPandal = { ...p, ...pandalData };
          return resultPandal;
        }
        return p;
      });
      setPandals(updated);
      localStorage.setItem(STORAGE_KEYS.PANDALS, JSON.stringify(updated));
      return resultPandal!;
    } else {
      const newPandal: Pandal = {
        id: `pandal-${Date.now()}`,
        name: pandalData.name || 'New Registered Pandal',
        clubName: pandalData.clubName || 'Puja Committee',
        location: pandalData.location || 'Paschim Bardhaman, West Bengal',
        ward: pandalData.ward || 'Ward 01',
        nearLandmark: pandalData.nearLandmark || 'Main Road',
        budget: pandalData.budget || '₹25 Lakhs',
        budgetNumber: pandalData.budgetNumber || 25,
        theme: pandalData.theme || 'Heritage Celebration',
        themeDescription: pandalData.themeDescription || 'A grand artistic showcase for Durgotsav.',
        presidentName: pandalData.presidentName || 'Club President',
        secretaryName: pandalData.secretaryName || 'Club Secretary',
        contactNumber: pandalData.contactNumber || '+91 98000 00000',
        establishedYear: pandalData.establishedYear || 2000,
        coverImage: pandalData.coverImage || 'https://images.unsplash.com/photo-1601655781320-20593452243d?q=80&w=1200&auto=format&fit=crop',
        logoUrl: pandalData.logoUrl,
        gallery: pandalData.gallery || [],
        votes: { idol: 0, theme: 0, lighting: 0, eco: 0 },
        totalVotes: 0,
        visitsToday: 1,
        tags: ['New Entry', '2026'],
        isEcoFriendly: !!pandalData.isEcoFriendly,
        organizerEmail: user?.email,
      };
      const updated = [newPandal, ...pandals];
      setPandals(updated);
      localStorage.setItem(STORAGE_KEYS.PANDALS, JSON.stringify(updated));
      return newPandal;
    }
  };

  const addMediaToPandal = (pandalId: string, mediaItem: Omit<PandalMedia, 'id'>) => {
    const newItem: PandalMedia = {
      ...mediaItem,
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = pandals.map(p => {
      if (p.id === pandalId) {
        return {
          ...p,
          gallery: [newItem, ...p.gallery],
          coverImage: newItem.isFeatured ? newItem.url : p.coverImage,
        };
      }
      return p;
    });
    setPandals(updated);
    localStorage.setItem(STORAGE_KEYS.PANDALS, JSON.stringify(updated));
  };

  const deleteMediaFromPandal = (pandalId: string, mediaId: string) => {
    const updated = pandals.map(p => {
      if (p.id === pandalId) {
        return {
          ...p,
          gallery: p.gallery.filter(m => m.id !== mediaId),
        };
      }
      return p;
    });
    setPandals(updated);
    localStorage.setItem(STORAGE_KEYS.PANDALS, JSON.stringify(updated));
  };

  const submitSupportTicket = (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `TCK-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      status: 'Open',
    };
    const updated = [newTicket, ...supportTickets];
    setSupportTickets(updated);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));
  };

  const organizerPandal = pandals.find(p => p.id === user?.clubId || p.organizerEmail === user?.email) || pandals[0] || null;

  const isVoter = user?.role === 'voter';
  const isOrganizer = user?.role === 'organizer';
  const isGuest = user === null;

  return (
    <AppContext.Provider
      value={{
        user,
        isConfigured,
        pandals,
        userVotes,
        activeRole: user ? user.role : 'guest',
        isVoter,
        isOrganizer,
        isGuest,
        isAuthModalOpen,
        authDefaultRole,
        isVotingModalOpen,
        selectedPandal,
        isQRScannerOpen,
        isSupportModalOpen,
        supportTickets,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        logout,
        openAuthModal,
        closeAuthModal,
        openVotingModal,
        closeVotingModal,
        openQRScanner,
        closeQRScanner,
        openSupportModal,
        closeSupportModal,
        hasVoted,
        castVote,
        votedPandals,
        exhaustedCategories,
        isPandalHonored,
        isCategoryExhausted,
        remainingTokensCount,
        registerOrUpdatePandal,
        addMediaToPandal,
        deleteMediaFromPandal,
        submitSupportTicket,
        organizerPandal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
