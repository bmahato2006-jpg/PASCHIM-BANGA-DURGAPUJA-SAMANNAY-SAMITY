import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center px-4 relative z-50">
      
      {/* Ambient Radial Festive Glow */}
      <div 
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-[100px] opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245, 130, 32, 0.45) 0%, rgba(217, 34, 42, 0.25) 50%, transparent 75%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-sm mx-auto">
        
        {/* Minimal Golden Diya Spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Outer glowing pulsing ring */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-300/40 animate-ping opacity-30" />
          
          {/* Dual-color spinning border */}
          <div className="w-14 h-14 rounded-full border-[3px] border-amber-200 border-t-sindoor-600 border-r-marigold-500 animate-spin" />
          
          {/* Center Diya Flame Icon */}
          <div className="absolute w-6 h-6 rounded-full bg-gradient-to-tr from-sindoor-500 to-marigold-400 flex items-center justify-center shadow-xs">
            <svg 
              className="w-3.5 h-3.5 text-white animate-pulse" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2c1.1 0 2 .9 2 2 0 .7-.4 1.4-1 1.7V7c2.8 0 5 2.2 5 5 0 2.2-1.4 4-3.4 4.7.3.7.4 1.5.4 2.3 0 3.3-2.7 6-6 6s-6-2.7-6-6c0-.8.1-1.6.4-2.3C3.4 16 2 14.2 2 12c0-2.8 2.2-5 5-5V5.7C6.4 5.4 6 4.7 6 4c0-1.1.9-2 2-2 1.4 0 2.5 1.1 2.5 2.5V7h3V4.5C13.5 3.1 14.6 2 16 2h-4z" />
            </svg>
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
