'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { DhakButton } from '@/components/ui/DhakButton';
import { 
  X, 
  QrCode, 
  Camera, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  UploadCloud,
  Flame,
  ShieldAlert
} from 'lucide-react';

export const QRScannerModal: React.FC = () => {
  const { isQRScannerOpen, closeQRScanner, pandals, openVotingModal } = useApp();
  
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedPandalName, setDetectedPandalName] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'real-camera-qr-view';

  // Start real camera scanner when modal opens
  useEffect(() => {
    if (!isQRScannerOpen) return;

    let isMounted = true;
    setCameraError(null);
    setDetectedPandalName(null);

    const initCamera = async () => {
      try {
        // Small delay to ensure DOM element is mounted
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (!isMounted) return;

        const container = document.getElementById(scannerContainerId);
        if (!container) return;

        const qrScanner = new Html5Qrcode(scannerContainerId);
        html5QrCodeRef.current = qrScanner;

        const config = {
          fps: 12,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        };

        await qrScanner.start(
          { facingMode },
          config,
          (decodedText) => {
            if (isMounted) {
              handleDecodedText(decodedText);
            }
          },
          () => {
            // Frame search error - ignore continuous scan loop
          }
        );

        if (isMounted) setIsScanning(true);
      } catch (err: any) {
        console.warn('Real camera error:', err);
        if (isMounted) {
          setCameraError(
            err.message?.includes('Permission') 
              ? 'Camera permission was denied. Please allow camera permissions in your browser or test using the options below.'
              : 'Unable to access hardware camera. Check device permissions or upload a QR image.'
          );
        }
      }
    };

    initCamera();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().then(() => {
              html5QrCodeRef.current?.clear();
            }).catch(() => {});
          }
        } catch (e) {}
      }
    };
  }, [isQRScannerOpen, facingMode]);

  if (!isQRScannerOpen) return null;

  // Process decoded QR text
  const handleDecodedText = (text: string) => {
    // Extract pandal ID from raw id, URL hash, or search parameter
    let matchedId = text.trim();
    if (text.includes('#')) {
      matchedId = text.split('#')[1];
    } else if (text.includes('pandal=')) {
      matchedId = text.split('pandal=')[1].split('&')[0];
    }

    // Match with existing pandals
    const target = pandals.find(
      (p) => p.id === matchedId || p.name.toLowerCase().includes(matchedId.toLowerCase())
    );

    if (target) {
      setDetectedPandalName(target.name);
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }

      setTimeout(() => {
        closeQRScanner();
        openVotingModal(target);
      }, 1100);
    } else {
      setCameraError(`Scanned code "${text}" does not match any registered Durgapur Pandal.`);
    }
  };

  // Support uploading a QR image file
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !html5QrCodeRef.current) return;

    try {
      const decodedResult = await html5QrCodeRef.current.scanFile(file, true);
      handleDecodedText(decodedResult);
    } catch (err) {
      setCameraError('No valid QR code recognized in the uploaded image.');
    }
  };

  // Toggle front vs back camera
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="relative w-full max-w-md glass-modal rounded-3xl p-6 overflow-hidden my-6 border-2 border-amber-400 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sindoor-500 text-white shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg text-gray-900 leading-tight">
                Live Camera QR Scanner
              </h3>
              <p className="text-xs text-gray-500">
                Point camera at physical Pandal Gate QR Code
              </p>
            </div>
          </div>
          <button
            onClick={closeQRScanner}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder Stream */}
        <div className="relative aspect-square w-full rounded-2xl bg-black overflow-hidden flex items-center justify-center border-2 border-amber-300/40 shadow-inner">
          
          {/* HTML5 QR Container for Video Stream */}
          <div id={scannerContainerId} className="w-full h-full object-cover" />

          {/* Viewfinder Target Overlays when scanning */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-56 h-56 rounded-2xl border-2 border-white/50 flex items-center justify-center">
              
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-marigold-500 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-marigold-500 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-marigold-500 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-marigold-500 rounded-br-lg" />

              {/* Scanning Laser Beam */}
              {isScanning && !detectedPandalName && (
                <motion.div
                  className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-sindoor-500 to-transparent shadow-[0_0_14px_#D9222A]"
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </div>
          </div>

          {/* Detection Success State */}
          <AnimatePresence>
            {detectedPandalName && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-emerald-950/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 text-center text-white z-30"
              >
                <CheckCircle className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Official Pandal QR Verified!
                </span>
                <p className="font-bold text-base mt-1">
                  {detectedPandalName}
                </p>
                <span className="text-xs text-emerald-200 mt-2">
                  Unfolding Blossoming Voting Ballot...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Camera Permission / Error Fallback Notice */}
          {cameraError && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center text-white z-20">
              <ShieldAlert className="w-10 h-10 text-amber-400 mb-2" />
              <p className="text-xs font-semibold text-amber-200 mb-3 px-2">
                {cameraError}
              </p>
              
              {/* Image Upload Alternative */}
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-white text-gray-900 text-xs font-bold flex items-center gap-2 hover:bg-gray-100 transition shadow-sm">
                <UploadCloud className="w-4 h-4 text-sindoor-500" />
                <span>Upload QR Image File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileScan}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Camera Switch Controls */}
          <div className="absolute bottom-3 right-3 z-10">
            <button
              onClick={toggleCameraFacing}
              className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-md transition"
              title="Flip Camera (Front/Back)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rapid Testing Shortcuts for Dev & Demo */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
            <span>Instant Test Simulator:</span>
            <span className="text-[10px] text-sindoor-600 bg-sindoor-50 px-2 py-0.5 rounded font-bold">1-Click</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {pandals.slice(0, 4).map((pandal) => (
              <button
                key={pandal.id}
                onClick={() => handleDecodedText(pandal.id)}
                className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-white hover:bg-amber-50 hover:border-marigold-300 text-left transition text-xs font-semibold text-gray-800"
              >
                <div className="w-6 h-6 rounded-lg bg-marigold-100 text-marigold-700 flex items-center justify-center shrink-0">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{pandal.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
};
