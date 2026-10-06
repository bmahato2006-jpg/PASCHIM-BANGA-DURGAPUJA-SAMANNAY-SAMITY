import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { FestiveBackground } from '@/components/effects/FestiveBackground';
import { UniversalModals } from '@/components/layout/UniversalModals';
import { Toaster } from 'react-hot-toast';
import { GlobalClickAnimation } from '@/components/effects/GlobalClickAnimation';

export const metadata: Metadata = {
  title: 'Paschim Banga DurgaPuja Samannay Samity',
  description:
    'The official voting and evaluation platform for Paschim Banga DurgaPuja Samannay Samity. Verified QR-first ballots across Best Idol, Best Theme, Best Lighting, and Best Eco-friendly categories for the region.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth overflow-x-hidden">
      <body className="min-h-screen text-[#22150F] relative pb-28 md:pb-0 overflow-x-hidden w-full max-w-full select-none bg-[#FFFDF9]">
        {/* ========================================================================= */}
        {/* GLOBAL DIVINE MAA DURGA WATERMARK BACKGROUND                              */}
        {/* ========================================================================= */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
        >
          {/* Fixed, Centered, Cover Image with Soft-Light Blending */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-fixed bg-no-repeat bg-blend-soft-light transform-gpu"
            style={{
              backgroundImage: `url('/durga-bg.png')`,
            }}
          />

          {/* Strong Festive Light Overlay for Subtle Watermark Effect & High Text Contrast */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9]/92 via-[#FFFDF9]/88 to-[#FFFDF9]/94 bg-blend-overlay"
          />

          {/* Soft White Translucent Veil to Ensure 100% Pristine Readability */}
          <div
            className="absolute inset-0 bg-white/70"
          />
        </div>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#22150F',
              color: '#FFF8E7',
              borderRadius: '16px',
              border: '1px solid rgba(245, 130, 32, 0.4)',
              boxShadow: '0 10px 30px -10px rgba(217, 34, 42, 0.3)',
              fontWeight: 500,
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
          containerStyle={{
            zIndex: 99999,
          }}
        />
        <GlobalClickAnimation>
          <AppProvider>
            <FestiveBackground />
            <div className="relative z-10 w-full min-h-screen">
              {children}
            </div>
            {/* Universal Modals (Lazy Loaded on Demand) */}
            <UniversalModals />
          </AppProvider>
        </GlobalClickAnimation>
      </body>
    </html>
  );
}
