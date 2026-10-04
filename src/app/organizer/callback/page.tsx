'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { getCommitteeByUser } from '@/lib/committeeService';
import toast from 'react-hot-toast';

function GatekeeperCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('Verifying Committee Authorization...');

  useEffect(() => {
    let isMounted = true;
    const action = searchParams.get('action') || 'login';

    const processAuth = async () => {
      try {
        // Allow a brief moment for Supabase JS client to parse auth hash/tokens from URL
        let user = (await supabase.auth.getUser()).data.user;

        if (!user) {
          // Listen to onAuthStateChange for token parsing completion
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (session?.user && isMounted) {
                authListener.subscription.unsubscribe();
                await handleGatekeeper(session.user, action);
              }
            }
          );

          // Retry getUser after a short timeout if event hasn't fired yet
          setTimeout(async () => {
            if (!isMounted) return;
            const retryUser = (await supabase.auth.getUser()).data.user;
            if (retryUser) {
              authListener.subscription.unsubscribe();
              await handleGatekeeper(retryUser, action);
            } else {
              authListener.subscription.unsubscribe();
              toast.error('Authentication session not found. Please try again.', {
                id: 'auth-not-found',
              });
              router.replace('/organizer/auth?mode=register');
            }
          }, 2000);
          return;
        }

        await handleGatekeeper(user, action);
      } catch (err: any) {
        console.error('Gatekeeper processing error:', err);
        if (isMounted) {
          toast.error(err?.message || 'Authentication error occurred.');
          router.replace('/organizer/auth?mode=register');
        }
      }
    };

    const handleGatekeeper = async (user: any, actionType: string) => {
      if (!isMounted) return;

      setStatusMessage('Checking Committee Registry...');

      // Query database for committee record by user_id or email
      const { committee } = await getCommitteeByUser(user.id, user.email);

      if (actionType === 'login') {
        if (committee) {
          toast.success(`Welcome back, ${committee.committee_name}!`, {
            id: 'login-welcome',
          });
          router.replace('/organizer');
        } else {
          // Strict Security Enforcement: Aggressively sign out unregistered user
          await supabase.auth.signOut();
          toast.error('Not registered. Please register first.', {
            id: 'not-registered-toast',
            duration: 6000,
          });
          router.replace('/organizer/auth?mode=register');
        }
      } else if (actionType === 'register') {
        if (committee) {
          toast('Account already exists', {
            id: 'account-exists-toast',
            icon: 'ℹ️',
          });
          router.replace('/organizer');
        } else {
          // Redirect to Onboarding Setup Page to enter Committee Name
          router.replace('/organizer/setup');
        }
      } else {
        // Fallback for default action
        if (committee) {
          router.replace('/organizer');
        } else {
          router.replace('/organizer/setup');
        }
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 text-center selection:bg-marigold-200">
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
        <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <GatekeeperCallbackContent />
    </Suspense>
  );
}
