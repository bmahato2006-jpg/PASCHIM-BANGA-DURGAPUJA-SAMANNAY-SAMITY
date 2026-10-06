import React from 'react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center px-4 relative z-50">
      
      {/* Ambient Radial Festive Glow */}
      <div 
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-[100px] opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245, 130, 32, 0.45) 0%, rgba(217, 34, 42, 0.25) 50%, transparent 75%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-sm mx-auto">
        
        {/* Minimal Golden Diya Spinner with Official Logo */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Outer glowing pulsing ring */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-300/40 animate-ping opacity-30" />
          
          {/* Dual-color spinning border */}
          <div className="w-16 h-16 rounded-full border-[3px] border-amber-200 border-t-sindoor-600 border-r-marigold-500 animate-spin" />
          
          {/* Center Official Logo */}
          <div className="absolute w-10 h-10 rounded-full overflow-hidden shadow-xs border border-orange-200">
            <Image
              src="/logo.jpg"
              alt="PBDS Logo"
              width={40}
              height={40}
              priority
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Minimal Typography */}
        <div className="space-y-1">
          <p className="text-xs font-black tracking-widest text-amber-900 uppercase font-serif">
            Paschim Banga DurgaPuja Samannay Samity
          </p>
          <p className="text-xs text-gray-500 font-medium animate-pulse">
            Loading official voting portal...
          </p>
        </div>

      </div>
    </div>
  );
}
