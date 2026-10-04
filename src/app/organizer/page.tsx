'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function OrganizerRouteGuard() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/?tab=organizer');
      } else {
        router.replace('/organizer-login');
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF9] text-center p-4">
      <div className="w-10 h-10 border-3 border-marigold-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-bold text-gray-700">Checking Organizer Authorization...</p>
    </div>
  );
}
