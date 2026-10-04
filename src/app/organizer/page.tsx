'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { OrganizerDashboard } from '@/components/organizer/OrganizerDashboard';

export default function OrganizerPage() {
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    if (tab === 'organizer') return;
    router.push(`/?tab=${tab}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col z-10 selection:bg-marigold-200 selection:text-amber-950 overflow-x-hidden w-full max-w-full">
      <Navbar activeTab="organizer" setActiveTab={handleTabChange} />
      <main className="flex-1 pb-16">
        <OrganizerDashboard />
      </main>
      <Footer onNavigateTab={handleTabChange} />
    </div>
  );
}
