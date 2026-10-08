import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { FestiveBackground } from '@/components/effects/FestiveBackground';
import { UniversalModals } from '@/components/layout/UniversalModals';
import { Toaster } from 'react-hot-toast';
import { GlobalClickAnimation } from '@/components/effects/GlobalClickAnimation';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  metadataBase: new URL('https://paschim-banga-durgapuja.vercel.app'),
  title: 'Paschim Banga DurgaPuja Live Voting',
  description: 'Vote for the best Durga Puja Pandal!',
  openGraph: {
    title: 'Paschim Banga DurgaPuja Live Voting',
    description: 'Vote for the best Durga Puja Pandal!',
    url: 'https://paschim-banga-durgapuja.vercel.app',
    siteName: 'Paschim Banga DurgaPuja Samannay Samity',
    images: [
      {
        url: 'https://paschim-banga-durgapuja.vercel.app/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Paschim Banga DurgaPuja Live Voting',
      },
    ],
    locale: 'bn_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paschim Banga DurgaPuja Live Voting',
    description: 'Vote for the best Durga Puja Pandal!',
    images: ['https://paschim-banga-durgapuja.vercel.app/logo.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="scroll-smooth overflow-x-hidden">
      <body className="min-h-screen text-[#22150F] relative pb-28 md:pb-0 overflow-x-hidden w-full max-w-full select-none bg-[url('/durga-bg.png')] bg-cover bg-center bg-fixed bg-no-repeat before:fixed before:inset-0 before:bg-white/90 before:-z-10 before:pointer-events-none">
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
            <div className="relative z-10 w-full min-h-screen bg-transparent">
              {children}
            </div>
            {/* Universal Modals (Lazy Loaded on Demand) */}
            <UniversalModals />
          </AppProvider>
        </GlobalClickAnimation>
        {/* Vercel Web Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
