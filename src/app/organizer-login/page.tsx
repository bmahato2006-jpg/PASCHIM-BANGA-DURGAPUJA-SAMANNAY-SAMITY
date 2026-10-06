'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { isSuperAdmin } from '@/lib/admin';

export default function OrganizerLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && isSuperAdmin(user.email)) {
        router.replace('/dashboard/admin');
      } else {
        router.replace('/organizer/auth');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
      <div className="w-10 h-10 border-3 border-marigold-500 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs font-bold text-gray-700">Redirecting to Organizer Portal...</p>
    </div>
  );
}
