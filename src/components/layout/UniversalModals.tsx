'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';

// Ultra-heavy QR scanner camera library (html5-qrcode) dynamically loaded ONLY when scanner is requested
const QRScannerModal = dynamic(
  () => import('@/components/voter/QRScannerModal').then((mod) => mod.QRScannerModal),
  {
    ssr: false,
    loading: () => null,
  }
);

// Secondary modals dynamically loaded on-demand to drastically reduce initial page bundle
const AuthModal = dynamic(
  () => import('@/components/auth/AuthModal').then((mod) => mod.AuthModal),
  {
    ssr: false,
    loading: () => null,
  }
);

const VotingModal = dynamic(
  () => import('@/components/voter/VotingModal').then((mod) => mod.VotingModal),
  {
    ssr: false,
    loading: () => null,
  }
);

const VoterSupportModal = dynamic(
  () => import('@/components/support/VoterSupportModal').then((mod) => mod.VoterSupportModal),
  {
    ssr: false,
    loading: () => null,
  }
);

export const UniversalModals: React.FC = () => {
  const { isQRScannerOpen, isAuthModalOpen, isVotingModalOpen, isSupportModalOpen } = useApp();

  return (
    <>
      {isQRScannerOpen && <QRScannerModal />}
      {isAuthModalOpen && <AuthModal />}
      {isVotingModalOpen && <VotingModal />}
      {isSupportModalOpen && <VoterSupportModal />}
    </>
  );
};
