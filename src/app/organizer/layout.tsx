'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getCommitteeByUser } from '@/lib/committeeService';

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(true);

  // Routes that do not require layout guard checks
  const isAuthRoute =
    pathname === '/organizer/auth' ||
    pathname === '/organizer/callback' ||
    pathname?.startsWith('/organizer/auth') ||
    pathname?.startsWith('/organizer/callback');

  const isSetupRoute =
    pathname === '/organizer/setup' || pathname?.startsWith('/organizer/setup');

  useEffect(() => {
    // 1. If accessing auth or callback routes, bypass layout guard
    if (isAuthRoute) {
      setIsVerifying(false);
      return;
    }

    let isSubscribed = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (isSubscribed) {
          router.replace('/organizer/auth');
        }
        return;
      }

      try {
        // Query Firestore for committee record strictly matching user.uid
        const { committee } = await getCommitteeByUser(user.uid);

        if (isSetupRoute) {
          // If on /organizer/setup:
          // If committee already exists, they don't need setup -> redirect to dashboard
          if (committee) {
            if (isSubscribed) {
              router.replace('/dashboard/organizer');
            }
            return;
          }
          if (isSubscribed) {
            setIsVerifying(false);
          }
        } else {
          // If on /organizer (dashboard) or any other organizer route:
          // If no committee, redirect to /organizer/setup
          if (!committee) {
            if (isSubscribed) {
              router.replace('/organizer/setup');
            }
            return;
          }
          if (isSubscribed) {
            setIsVerifying(false);
          }
        }
      } catch (err) {
        console.error('Organizer layout verification error:', err);
        if (isSubscribed) {
          router.replace('/organizer/auth');
        }
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [pathname, isAuthRoute, isSetupRoute, router]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 text-center">
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
        <div className="w-9 h-9 border-3 border-marigold-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-800">Verifying Committee Credentials...</p>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          Checking authorized Puja Committee registry with Paschim Banga DurgaPuja Samannay Samity
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
