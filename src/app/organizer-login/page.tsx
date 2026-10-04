'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizerLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/organizer/auth');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-4">
      <div className="w-10 h-10 border-3 border-marigold-500 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs font-bold text-gray-700">Redirecting to Organizer Portal...</p>
    </div>
  );
}
