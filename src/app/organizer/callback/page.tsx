'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { auth, onAuthStateChanged, signOut } from '@/lib/firebase';
import { getCommitteeByUser } from '@/lib/committeeService';
import toast from 'react-hot-toast';

function GatekeeperCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('Verifying Committee Authorization...');

  useEffect(() => {
    let isMounted = true;
    const action = searchParams.get('action') || 'login';

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (!user) {
        toast.error('Authentication session not found. Please try again.', {
          id: 'auth-not-found',
        });
        router.replace('/organizer/auth?mode=register');
        return;
      }

      setStatusMessage('Checking Committee Registry...');

      // Query database for committee record by user.uid or email
      const { committee } = await getCommitteeByUser(user.uid, user.email);

      if (action === 'login') {
        if (committee) {
          toast.success(`Welcome back, ${committee.committee_name}!`, {
            id: 'login-welcome',
          });
          router.replace('/organizer');
        } else {
          await signOut(auth);
          toast.error('Not registered. Please register first.', {
            id: 'not-registered-toast',
            duration: 6000,
          });
          router.replace('/organizer/auth?mode=register');
        }
      } else {
        if (committee) {
          toast('Account already exists', {
            id: 'account-exists-toast',
            icon: 'ℹ️',
          });
          router.replace('/organizer');
        } else {
          router.replace('/organizer/setup');
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-center selection:bg-marigold-200">
      <div className="w-16 h-16 mb-4 rounded-full overflow-hidden shadow-sm border border-orange-200 flex items-center justify-center">
        <Image
          src="/logo.jpg"
          alt="PBDS Logo"
          width={64}
          height={64}
          priority
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <div className="w-9 h-9 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
        {statusMessage}
      </h2>
      <p className="text-xs text-gray-500 mt-1 max-w-sm">
        Paschim Banga DurgaPuja Samannay Samity &bull; Secure Gatekeeper
      </p>
    </div>
  );
}

export default function GatekeeperCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <GatekeeperCallbackContent />
    </Suspense>
  );
}
