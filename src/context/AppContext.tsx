'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Pandal, User, UserRole, VoteCategory, VoteRecord, SupportTicket, PandalMedia } from '@/types';
import { INITIAL_PANDALS } from '@/data/mockPandals';
import { auth, db, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where, updateDoc, arrayUnion, runTransaction, increment } from 'firebase/firestore';

interface AppContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
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
  loginWithDemo: (role: UserRole, name?: string, email?: string) => void;
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
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
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

  const isConfigured = isFirebaseConfigured();

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
      email: 'voter@durgapurpuja.org',
      role: 'voter',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
  };

  // Load saved state on mount and initialize Firebase Anonymous Auth for voters
  useEffect(() => {
    let storedUserRole: UserRole | null = null;
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

      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        storedUserRole = parsed.role;
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
      // Also collect any standalone hasVoted_${pandalId} keys
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

    // If no organizer is logged in, ensure anonymous voter session immediately
    if (storedUserRole !== 'organizer') {
      const defaultAnon = getOrCreateDeviceVoter();
      setUser((prev) => (prev && prev.role === 'organizer' ? prev : defaultAnon));
    }

    // Real Firebase Auth state listener with automatic Anonymous sign-in for voters
    let unsubscribe = () => {};
    if (auth) {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);

        if (!fbUser) {
          // If not logged in as organizer, auto sign in anonymously
          const currentUserStr = localStorage.getItem(STORAGE_KEYS.USER);
          const currentParsed = currentUserStr ? JSON.parse(currentUserStr) : null;
          if (currentParsed?.role !== 'organizer') {
            try {
              // Layer 1: Force persistent anonymous auth
              await setPersistence(auth, browserLocalPersistence);
              await signInAnonymously(auth);
            } catch (err) {
              console.warn('Firebase Anonymous sign-in note:', err);
              const fallbackAnon = getOrCreateDeviceVoter();
              setUser(fallbackAnon);
            }
          }
          return;
        }

        if (fbUser.isAnonymous) {
          // Anonymous Voter Flow: frictionless, automatic, no login screen
          localStorage.setItem('durgapur_puja_anon_uid', fbUser.uid);
          localStorage.setItem(STORAGE_KEYS.DEVICE_ID, fbUser.uid);

          const anonUser: User = {
            id: fbUser.uid,
            name: 'Verified Voter',
            email: 'voter@durgapurpuja.org',
            role: 'voter',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          };
          setUser(anonUser);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(anonUser));

          // Ensure Firestore user document exists and sync 4-Token state for this anonymous voter
          if (db) {
            try {
              const userRef = doc(db, 'users', fbUser.uid);
              const userDocSnap = await getDoc(userRef);
              if (userDocSnap.exists()) {
                const uData = userDocSnap.data();
                if (Array.isArray(uData?.votedPandals) && uData.votedPandals.length > 0) {
                  setVotedPandals(prev => {
                    const merged = Array.from(new Set([...prev, ...uData.votedPandals]));
                    localStorage.setItem(STORAGE_KEYS.VOTED_PANDALS, JSON.stringify(merged));
                    uData.votedPandals.forEach((pId: string) => {
                      localStorage.setItem(`hasVoted_${pId}`, 'true');
                    });
                    return merged;
                  });
                }
                if (Array.isArray(uData?.exhaustedCategories) && uData.exhaustedCategories.length > 0) {
                  setExhaustedCategories(prev => {
                    const merged = Array.from(new Set([...prev, ...uData.exhaustedCategories])) as VoteCategory[];
                    localStorage.setItem(STORAGE_KEYS.EXHAUSTED_CATEGORIES, JSON.stringify(merged));
                    uData.exhaustedCategories.forEach((cat: string) => {
                      localStorage.setItem(`exhaustedCategory_${cat}`, 'true');
                    });
                    return merged;
                  });
                }
              } else {
                setDoc(userRef, {
                  uid: fbUser.uid,
                  role: 'voter',
                  isAnonymous: true,
                  deviceId: fbUser.uid,
                  votedPandals: [],
                  exhaustedCategories: [],
                  createdAt: serverTimestamp(),
                }, { merge: true }).catch(() => {});
              }
            } catch (err) {
              console.warn('Firestore anonymous user init note:', err);
            }
          }

          // Sync user votes from Firestore for this anonymous voter
          if (db) {
            try {
              const votesSnap = await getDocs(collection(db, 'users', fbUser.uid, 'votes'));
              if (!votesSnap.empty) {
                const remoteVotes: VoteRecord[] = [];
                votesSnap.forEach(d => {
                  const data = d.data();
                  remoteVotes.push({
                    pandalId: data.pandalId,
                    userId: data.userId || fbUser.uid,
                    category: data.category,
                    timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now(),
                  });
                });
                if (remoteVotes.length > 0) {
                  setUserVotes(prev => {
                    const merged = [...prev];
                    remoteVotes.forEach(rv => {
                      if (!merged.some(v => v.pandalId === rv.pandalId && v.category === rv.category && v.userId === rv.userId)) {
                        merged.push(rv);
                      }
                    });
                    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(merged));
                    return merged;
                  });
                }
              }
            } catch (err) {
              console.warn('Firestore votes sync note:', err);
            }
          }
        } else {
          // Registered Account Flow (e.g. Organizer via /organizer-login)
          let existingRole: UserRole = 'organizer';

          if (db) {
            try {
              const userRef = doc(db, 'users', fbUser.uid);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists() && userSnap.data()?.role) {
                existingRole = userSnap.data().role as UserRole;
                setPermanentLocalRole(fbUser.email || fbUser.uid, existingRole);
              } else {
                const localRole = getPermanentLocalRole(fbUser.email || fbUser.uid);
                if (localRole) existingRole = localRole;
              }
            } catch (err) {
              const localRole = getPermanentLocalRole(fbUser.email || fbUser.uid);
              if (localRole) existingRole = localRole;
            }
          } else {
            const localRole = getPermanentLocalRole(fbUser.email || fbUser.uid);
            if (localRole) existingRole = localRole;
          }

          const profileUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Organizer',
            email: fbUser.email || 'organizer@durgapurpuja.org',
            role: existingRole,
            avatar: fbUser.photoURL || (existingRole === 'organizer'
              ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
            clubId: existingRole === 'organizer' ? 'pandal-marxgunj' : undefined,
          };
          setUser(profileUser);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profileUser));
        }
      });
    }

    return () => unsubscribe();
  }, []);

  // Permanent local registry for fallback / caching
  const getPermanentLocalRole = (identifier?: string): UserRole | null => {
    if (!identifier) return null;
    try {
      const regStr = localStorage.getItem('durgapur_puja_permanent_users');
      if (regStr) {
        const reg = JSON.parse(regStr);
        if (reg[identifier]?.role) return reg[identifier].role;
      }
    } catch (e) {}
    return null;
  };

  const setPermanentLocalRole = (identifier: string, role: UserRole, details?: Partial<User>) => {
    try {
      const regStr = localStorage.getItem('durgapur_puja_permanent_users');
      const reg = regStr ? JSON.parse(regStr) : {};
      if (!reg[identifier]) {
        reg[identifier] = { role, ...details, lockedAt: Date.now() };
        localStorage.setItem('durgapur_puja_permanent_users', JSON.stringify(reg));
      }
    } catch (e) {}
  };

  // Canonical role verifier & permanent role locker via Firestore
  const verifyAndLockUserRole = async (
    uid: string, 
    chosenRole: UserRole, 
    userInfo?: { name?: string; email?: string; photoURL?: string }
  ): Promise<{ success: boolean; role: UserRole; error?: string }> => {
    const rawEmail = userInfo?.email?.trim().toLowerCase();
    const identifier = rawEmail || uid;

    // 1. Fast check local persistent storage
    const localRole = getPermanentLocalRole(identifier) || (rawEmail ? getPermanentLocalRole(rawEmail) : null);
    if (localRole && localRole !== chosenRole) {
      return {
        success: false,
        role: localRole,
        error: localRole === 'voter'
          ? `Strict Role Lock: This account (${rawEmail || 'user'}) is permanently registered as a Voter. It cannot access or register for the Organizer Portal.`
          : `Strict Role Lock: This account (${rawEmail || 'user'}) is permanently registered as a Pandal Organizer and is strictly prohibited from voter registration.`
      };
    }

    // 2. Check Firestore
    if (db) {
      try {
        // A. Check by UID
        const userDocRef = doc(db, 'users', uid);
        const snap = await getDoc(userDocRef);

        if (snap.exists()) {
          const docData = snap.data();
          const existingRole = docData?.role as UserRole;
          if (existingRole && existingRole !== chosenRole) {
            setPermanentLocalRole(identifier, existingRole);
            return {
              success: false,
              role: existingRole,
              error: existingRole === 'voter'
                ? `Strict Role Lock: This account (${rawEmail || 'user'}) is permanently registered as a Voter in the civic database. It cannot access the Organizer Portal.`
                : `Strict Role Lock: This account (${rawEmail || 'user'}) is permanently registered as a Pandal Organizer and cannot switch to a Voter.`
            };
          }

          if (existingRole === chosenRole) {
            setPermanentLocalRole(identifier, existingRole);
            return { success: true, role: existingRole };
          }
        }

        // B. Check by email across users collection if email is available
        if (rawEmail) {
          try {
            const emailQuery = query(collection(db, 'users'), where('email', '==', rawEmail));
            const querySnap = await getDocs(emailQuery);
            if (!querySnap.empty) {
              const matchingDoc = querySnap.docs[0].data();
              const existingRole = matchingDoc?.role as UserRole;
              if (existingRole && existingRole !== chosenRole) {
                setPermanentLocalRole(identifier, existingRole);
                return {
                  success: false,
                  role: existingRole,
                  error: existingRole === 'voter'
                    ? `Strict Role Lock: The email '${rawEmail}' is permanently registered as a Voter. It cannot be used to register or log into the Organizer Portal.`
                    : `Strict Role Lock: The email '${rawEmail}' is permanently registered as a Pandal Organizer and cannot be used for voter access.`
                };
              }
            }
          } catch (qErr) {
            console.warn('Firestore email query note:', qErr);
          }
        }

        // C. Brand New Registration: Lock role permanently in Firestore
        await setDoc(userDocRef, {
          uid,
          name: userInfo?.name || (rawEmail ? rawEmail.split('@')[0] : 'User'),
          email: rawEmail || '',
          role: chosenRole,
          roleLocked: true,
          photoURL: userInfo?.photoURL || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });

        setPermanentLocalRole(identifier, chosenRole, {
          name: userInfo?.name,
          email: rawEmail,
        });

        return { success: true, role: chosenRole };
      } catch (err) {
        console.warn('Firestore role verification note:', err);
        if (localRole && localRole !== chosenRole) {
          return {
            success: false,
            role: localRole,
            error: `Strict Role Lock: Account is permanently registered as a ${localRole}.`
          };
        }
        setPermanentLocalRole(identifier, chosenRole, { name: userInfo?.name, email: rawEmail });
        return { success: true, role: chosenRole };
      }
    }

    // Demo / offline fallback
    if (localRole && localRole !== chosenRole) {
      return {
        success: false,
        role: localRole,
        error: `Strict Role Lock: This account is permanently registered as a ${localRole}. Role switching is prohibited.`
      };
    }

    setPermanentLocalRole(identifier, chosenRole, { name: userInfo?.name, email: rawEmail });
    return { success: true, role: chosenRole };
  };

  // Real Google Sign-in with Permanent Firestore Role Locking & Rejection on Conflict
  const signInWithGoogle = async (chosenRole: UserRole): Promise<{ success: boolean; error?: string }> => {
    if (!auth) {
      return { success: false, error: 'Firebase Auth is not initialized. Please check firebase-config.js.' };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const verification = await verifyAndLockUserRole(fbUser.uid, chosenRole, {
        name: fbUser.displayName || undefined,
        email: fbUser.email || undefined,
        photoURL: fbUser.photoURL || undefined,
      });

      if (!verification.success) {
        // Role mismatch: immediately sign out from Firebase
        await signOut(auth);
        // Restore anonymous voter state so devotee voting is not broken
        const fallbackAnon = getOrCreateDeviceVoter();
        setUser(fallbackAnon);
        try {
          await signInAnonymously(auth);
        } catch (e) {}
        return { success: false, error: verification.error };
      }

      const lockedRole = verification.role;
      const updatedUser: User = {
        id: fbUser.uid,
        name: fbUser.displayName || (lockedRole === 'organizer' ? 'Pandal Organizer' : 'Devotee'),
        email: fbUser.email || (lockedRole === 'organizer' ? 'organizer@durgapurpuja.org' : 'user@durgapurpuja.org'),
        role: lockedRole,
        avatar: fbUser.photoURL || (lockedRole === 'organizer'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
        clubId: lockedRole === 'organizer' ? 'pandal-marxgunj' : undefined,
      };

      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setIsAuthModalOpen(false);

      if (lockedRole === 'organizer' && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', 'organizer');
        window.history.replaceState({}, '', url.toString());
      }

      return { success: true };
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      return { success: false, error: error.message || 'Google Sign-In failed. Please try again.' };
    }
  };

  // Real Email/Password Sign Up with Strict Role Conflict Pre-checks
  const signUpWithEmail = async (
    email: string, 
    password: string, 
    chosenRole: UserRole, 
    displayName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!auth) {
      return { success: false, error: 'Firebase Auth is not initialized. Please check firebase-config.js.' };
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Pre-check before creating user: does this email already have a locked role in local registry?
    const existingLocal = getPermanentLocalRole(normalizedEmail);
    if (existingLocal && existingLocal !== chosenRole) {
      return {
        success: false,
        error: existingLocal === 'voter'
          ? `Strict Role Lock: '${normalizedEmail}' is permanently registered as a Voter. It cannot register for the Organizer Portal.`
          : `Strict Role Lock: '${normalizedEmail}' is permanently registered as an Organizer and cannot register as a Voter.`
      };
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const fbUser = credential.user;
      
      if (displayName) {
        await updateProfile(fbUser, { displayName }).catch(() => {});
      }

      const verification = await verifyAndLockUserRole(fbUser.uid, chosenRole, {
        name: displayName || normalizedEmail.split('@')[0],
        email: normalizedEmail,
      });

      if (!verification.success) {
        await signOut(auth);
        const fallbackAnon = getOrCreateDeviceVoter();
        setUser(fallbackAnon);
        try {
          await signInAnonymously(auth);
        } catch (e) {}
        return { success: false, error: verification.error };
      }

      const lockedRole = verification.role;
      const profileUser: User = {
        id: fbUser.uid,
        name: displayName || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: lockedRole,
        avatar: lockedRole === 'organizer'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        clubId: lockedRole === 'organizer' ? 'pandal-marxgunj' : undefined,
      };

      setUser(profileUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profileUser));
      setIsAuthModalOpen(false);

      if (lockedRole === 'organizer' && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', 'organizer');
        window.history.replaceState({}, '', url.toString());
      }

      return { success: true };
    } catch (error: any) {
      console.error('Email Sign-Up Error:', error);
      let msg = error.message || 'Failed to sign up.';
      if (error.code === 'auth/email-already-in-use') msg = 'This email is already registered. Please sign in instead.';
      if (error.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
      if (error.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      return { success: false, error: msg };
    }
  };

  // Real Email/Password Sign In with Strict Role Verification & Immediate Redirection
  const signInWithEmail = async (
    email: string, 
    password: string, 
    chosenRole: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    if (!auth) {
      return { success: false, error: 'Firebase Auth is not initialized. Please check firebase-config.js.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    try {
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const fbUser = credential.user;
      
      const verification = await verifyAndLockUserRole(fbUser.uid, chosenRole, {
        name: fbUser.displayName || normalizedEmail.split('@')[0],
        email: normalizedEmail,
      });

      if (!verification.success) {
        await signOut(auth);
        const fallbackAnon = getOrCreateDeviceVoter();
        setUser(fallbackAnon);
        try {
          await signInAnonymously(auth);
        } catch (e) {}
        return { success: false, error: verification.error };
      }

      const lockedRole = verification.role;
      const profileUser: User = {
        id: fbUser.uid,
        name: fbUser.displayName || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: lockedRole,
        avatar: fbUser.photoURL || (lockedRole === 'organizer'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
        clubId: lockedRole === 'organizer' ? 'pandal-marxgunj' : undefined,
      };

      setUser(profileUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profileUser));
      setIsAuthModalOpen(false);

      if (lockedRole === 'organizer' && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', 'organizer');
        window.history.replaceState({}, '', url.toString());
      }

      return { success: true };
    } catch (error: any) {
      console.error('Email Sign-In Error:', error);
      let msg = error.message || 'Sign in failed.';
      if (
        error.code === 'auth/user-not-found' || 
        error.code === 'auth/wrong-password' || 
        error.code === 'auth/invalid-credential'
      ) {
        msg = 'Invalid email or password. Please verify and try again.';
      }
      if (error.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      return { success: false, error: msg };
    }
  };

  // Fallback demo login with permanent role locking
  const loginWithDemo = (role: UserRole, name?: string, email?: string) => {
    const userEmail = (email || (role === 'organizer' ? 'marxgunj.puja@gmail.com' : 'voter.dgp@gmail.com')).trim().toLowerCase();
    // Enforce permanent locked role if email has been seen before
    const existingLocked = getPermanentLocalRole(userEmail);
    if (existingLocked && existingLocked !== role) {
      alert(`Strict Role Lock: Account '${userEmail}' is permanently locked to role '${existingLocked}'. Role switching is prohibited.`);
      return;
    }
    setPermanentLocalRole(userEmail, role, { name, email: userEmail });

    const demoUser: User = {
      id: `usr-${role}-${Date.now().toString(36)}`,
      name: name || (role === 'organizer' ? 'Marxgunj Club Secretary' : 'Aniket Mukherjee'),
      email: userEmail,
      role: role,
      avatar: role === 'organizer'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      clubId: role === 'organizer' ? 'pandal-marxgunj' : undefined,
    };
    setUser(demoUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
    setIsAuthModalOpen(false);

    if (role === 'organizer' && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'organizer');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const logout = async () => {
    if (auth && firebaseUser && !firebaseUser.isAnonymous) {
      try {
        await signOut(auth);
      } catch (err) {}
    }
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);

    // Automatically re-sign in anonymously as voter
    if (auth) {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const cred = await signInAnonymously(auth);
        setFirebaseUser(cred.user);
      } catch (e) {
        const anon = getOrCreateDeviceVoter();
        setUser(anon);
      }
    } else {
      const anon = getOrCreateDeviceVoter();
      setUser(anon);
    }
  };

  const openAuthModal = (defaultRole: UserRole = 'voter') => {
    setAuthDefaultRole(defaultRole);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Silent anonymous voter authentication
  const ensureSilentAnonymousAuth = async () => {
    if (user?.role === 'organizer') return;
    if (auth && (!auth.currentUser || !firebaseUser)) {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const cred = await signInAnonymously(auth);
        setFirebaseUser(cred.user);
      } catch (err) {
        console.warn('Silent anonymous auth note:', err);
      }
    }
  };

  const openVotingModal = (pandal: Pandal) => {
    // Organizers cannot open the voting modal
    if (user?.role === 'organizer') return;
    ensureSilentAnonymousAuth();
    setSelectedPandal(pandal);
    setIsVotingModalOpen(true);
  };

  const closeVotingModal = () => {
    setIsVotingModalOpen(false);
    setSelectedPandal(null);
  };

  const openQRScanner = () => {
    // Organizers cannot access the QR scanner
    if (user?.role === 'organizer') return;
    ensureSilentAnonymousAuth();
    setIsQRScannerOpen(true);
  };
  const closeQRScanner = () => setIsQRScannerOpen(false);

  const openSupportModal = () => setIsSupportModalOpen(true);
  const closeSupportModal = () => setIsSupportModalOpen(false);

  // Strict "4-Token Gamified" and "One Device, One Vote" checking
  const hasVoted = (pandalId: string, category?: VoteCategory): boolean => {
    if (isPandalHonored(pandalId)) return true;
    if (category && isCategoryExhausted(category)) return true;

    // 1. Layer 3 specific LocalStorage key: hasVoted_${pandalId}
    if (typeof window !== 'undefined') {
      if (localStorage.getItem(`hasVoted_${pandalId}`) === 'true') {
        return true;
      }
      if (category && localStorage.getItem(`hasVoted_${pandalId}_${category}`) === 'true') {
        return true;
      }
      if (category && localStorage.getItem(`exhaustedCategory_${category}`) === 'true') {
        return true;
      }
    }

    // 2. Check in-memory userVotes
    if (user) {
      if (userVotes.some(v => v.pandalId === pandalId && (category ? v.category === category : true) && v.userId === user.id)) {
        return true;
      }
    }

    // 3. Check localStorage device votes map
    if (typeof window !== 'undefined') {
      try {
        const devVotesStr = localStorage.getItem(STORAGE_KEYS.DEVICE_VOTES);
        if (devVotesStr) {
          const map = JSON.parse(devVotesStr);
          if (map[`${pandalId}`]) return true;
          if (category && map[`${pandalId}_${category}`]) return true;
        }
        const storedVotesStr = localStorage.getItem(STORAGE_KEYS.VOTES);
        if (storedVotesStr) {
          const storedVotes: VoteRecord[] = JSON.parse(storedVotesStr);
          if (storedVotes.some(v => v.pandalId === pandalId && (category ? v.category === category : true) && (user ? v.userId === user.id : true))) {
            return true;
          }
        }
      } catch (e) {}
    }

    return false;
  };

  const castVote = async (pandalId: string, category: VoteCategory, skipApiCheck: boolean = false): Promise<{ success: boolean; message: string; status?: number }> => {
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

    const voterUid = firebaseUser?.uid || currentVoter.id;

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

    // Layer 3 LocalStorage Check: check specific localStorage keys
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

    // Layer 2: Strict Firestore Atomic Transaction Validation & Write (CRITICAL)
    if (db && voterUid) {
      try {
        await runTransaction(db, async (transaction) => {
          const userRef = doc(db, 'users', voterUid);
          const pandalDocRef = doc(db, 'pandals', pandalId);

          const userSnap = await transaction.get(userRef);
          const pandalDocSnap = await transaction.get(pandalDocRef);

          if (userSnap.exists()) {
            const uData = userSnap.data();
            const vp: string[] = Array.isArray(uData?.votedPandals) ? uData.votedPandals : [];
            const ec: string[] = Array.isArray(uData?.exhaustedCategories) ? uData.exhaustedCategories : [];

            if (vp.includes(pandalId)) {
              throw new Error('You have already honored this pandal.');
            }
            if (ec.includes(category)) {
              throw new Error('This category has already been awarded.');
            }
          }

          if (pandalDocSnap.exists()) {
            const pData = pandalDocSnap.data();
            if (Array.isArray(pData?.voters) && pData.voters.includes(voterUid)) {
              throw new Error('You have already honored this pandal.');
            }
          }

          const timestamp = serverTimestamp();

          // Atomic Writes: increment pandal vote count AND update user's arrays
          transaction.set(userRef, {
            uid: voterUid,
            role: 'voter',
            isAnonymous: true,
            deviceId: voterUid,
            votedPandals: arrayUnion(pandalId),
            exhaustedCategories: arrayUnion(category),
            lastVoteAt: timestamp,
          }, { merge: true });

          if (pandalDocSnap.exists()) {
            transaction.update(pandalDocRef, {
              [`votes.${category}`]: increment(1),
              totalVotes: increment(1),
              voters: arrayUnion(voterUid),
              lastVoteAt: timestamp,
            });
          } else {
            transaction.set(pandalDocRef, {
              id: pandalId,
              votes: { [category]: 1 },
              totalVotes: 1,
              voters: [voterUid],
              lastVoteAt: timestamp,
            }, { merge: true });
          }
        });
      } catch (txErr: any) {
        console.warn('Firestore transaction validation note:', txErr);
        if (txErr.message?.includes('You have already honored this pandal')) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(`hasVoted_${pandalId}`, 'true');
          }
          return { success: false, message: 'You have already honored this pandal.' };
        }
        if (txErr.message?.includes('This category has already been awarded')) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(`exhaustedCategory_${category}`, 'true');
          }
          return { success: false, message: 'This category has already been awarded.' };
        }
      }
    }

    // Call server API for secondary server-side validation and audit unless already validated
    if (!skipApiCheck) {
      try {
        const apiRes = await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: voterUid, voterUid, pandalId, category }),
        });
        const apiData = await apiRes.json();
        if (!apiRes.ok && !apiData.success) {
          if (apiData.message?.includes('honored') || apiData.error?.includes('honored') || apiData.message?.includes('pandal')) {
            if (typeof window !== 'undefined') {
              localStorage.setItem(`hasVoted_${pandalId}`, 'true');
            }
          }
          if (apiData.message?.includes('awarded') || apiData.error?.includes('awarded') || apiData.message?.includes('category') || apiData.message?.includes('token')) {
            if (typeof window !== 'undefined') {
              localStorage.setItem(`exhaustedCategory_${category}`, 'true');
            }
          }
          return { success: false, message: apiData.message || 'You have already voted for this pandal or used this category token.', status: apiRes.status };
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

      try {
        const devVotesStr = localStorage.getItem(STORAGE_KEYS.DEVICE_VOTES);
        const devVotesMap = devVotesStr ? JSON.parse(devVotesStr) : {};
        devVotesMap[`${pandalId}`] = {
          pandalId,
          category,
          timestamp: Date.now(),
          uid: voterUid
        };
        devVotesMap[`${pandalId}_${category}`] = {
          pandalId,
          category,
          timestamp: Date.now(),
          uid: voterUid
        };
        localStorage.setItem(STORAGE_KEYS.DEVICE_VOTES, JSON.stringify(devVotesMap));
      } catch (e) {}
    }

    // Record in Firestore across collections for strict immutable audit trail
    if (db && voterUid) {
      try {
        const timestamp = serverTimestamp();
        const votePayload = {
          pandalId,
          userId: voterUid,
          uid: voterUid,
          category,
          timestamp,
          votedAt: timestamp,
          pandalName: pandals.find(p => p.id === pandalId)?.name || '',
          deviceId: voterUid,
        };

        const voterSubRef = doc(db, 'pandals', pandalId, 'voters', voterUid);
        await setDoc(voterSubRef, votePayload, { merge: true });

        const pandalDocRef = doc(db, 'pandals', pandalId);
        await setDoc(pandalDocRef, {
          voters: arrayUnion(voterUid),
          lastVoteAt: timestamp,
        }, { merge: true });

        const voteRootRef = doc(db, 'votes', `${pandalId}_${voterUid}`);
        await setDoc(voteRootRef, votePayload, { merge: true });

        const userVoteRef = doc(db, 'users', voterUid, 'votes', pandalId);
        await setDoc(userVoteRef, votePayload, { merge: true });

        const ledgerRef = doc(db, 'ballots', `${pandalId}_${category}_${voterUid}`);
        await setDoc(ledgerRef, {
          pandalId,
          category,
          uid: voterUid,
          timestamp,
          deviceVote: true,
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore vote write note:', err);
      }
    }

    // Increment vote count locally
    const updatedPandals = pandals.map(p => {
      if (p.id === pandalId) {
        const newCategoryCount = (p.votes[category] || 0) + 1;
        const newTotal = p.totalVotes + 1;
        return {
          ...p,
          votes: { ...p.votes, [category]: newCategoryCount },
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
        name: pandalData.name || 'New Durgapur Pandal',
        clubName: pandalData.clubName || 'Puja Committee',
        location: pandalData.location || 'Durgapur, West Bengal',
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
        tags: ['New Entry', 'Durgapur 2026'],
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
        firebaseUser,
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
        loginWithDemo,
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
