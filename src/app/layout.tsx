import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { FestiveBackground } from '@/components/effects/FestiveBackground';
import { AuthModal } from '@/components/auth/AuthModal';
import { VotingModal } from '@/components/voter/VotingModal';
import { QRScannerModal } from '@/components/voter/QRScannerModal';
import { VoterSupportModal } from '@/components/support/VoterSupportModal';
import { Toaster } from 'react-hot-toast';
import { GlobalClickAnimation } from '@/components/effects/GlobalClickAnimation';

export const metadata: Metadata = {
  title: 'Durgapur Durga Puja 2026 - Pandal Voting & Exploration Platform',
  description:
    'Official voting and discovery platform for Durgapur Durga Puja pandals. Vote across Best Idol, Best Theme, Best Lighting, and Best Eco-friendly categories.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth overflow-x-hidden">
      <body className="min-h-screen bg-[#FFFDF9] text-[#22150F] relative selection:bg-marigold-200 selection:text-sindoor-900 pb-28 md:pb-0 overflow-x-hidden w-full max-w-full">
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
            {children}
            {/* Universal Modals */}
            <AuthModal />
            <VotingModal />
            <QRScannerModal />
            <VoterSupportModal />
          </AppProvider>
        </GlobalClickAnimation>
      </body>
    </html>
  );
}
