'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Flame, 
  LifeBuoy, 
  Phone, 
  ShieldCheck, 
  MessageCircle,
  ExternalLink,
  Compass,
  Trophy,
  QrCode,
  FileText,
  AlertTriangle,
  HeartHandshake,
  Lock
} from 'lucide-react';

export const Footer: React.FC<{
  onNavigateTab?: (tab: string) => void;
}> = ({ onNavigateTab }) => {
  const { openSupportModal, openQRScanner, isOrganizer } = useApp();

  const handleLinkClick = (tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  return (
    <footer className="mt-16 sm:mt-24 border-t border-amber-200/80 bg-white/80 backdrop-blur-xl relative z-10 pb-36 sm:pb-16">
      
      {/* Top Emergency Fast-Response Strip */}
      <div className="bg-gradient-to-r from-amber-50 via-sindoor-50/50 to-amber-50 border-b border-amber-200/60 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <Phone className="w-3.5 h-3.5 text-sindoor-600 animate-pulse" />
            <span>24/7 Regional Emergency Helplines:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-gray-600 font-medium">
            <span>Police: <strong className="text-gray-900 font-bold">100 / 0343-2546200</strong></span>
            <span>Fire Station: <strong className="text-gray-900 font-bold">101</strong></span>
            <span>Ambulance: <strong className="text-gray-900 font-bold">102</strong></span>
            <span>Women Helpline: <strong className="text-gray-900 font-bold">1091</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        
        {/* Main Structured 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Civic Sanction */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sindoor-500 via-marigold-500 to-amber-400 text-white flex items-center justify-center shadow-md shrink-0">
                <Flame className="w-6 h-6 animate-pulse-subtle" />
              </div>
              <div>
                <span className="font-serif font-black text-base sm:text-lg text-gray-900 block leading-tight">
                  Paschim Banga <span className="text-sindoor-600">DurgaPuja</span> Samannay Samity
                </span>
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block mt-0.5">
                  The Official Voting Platform
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              The centralized digital voting, live leaderboard, and discovery platform for Paschim Banga DurgaPuja Samannay Samity across the region. Honoring artistry, heritage, and eco-friendly craftsmanship.
            </p>

            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-snug">
                Civic accreditation & safety coordination across Paschim Bardhaman & West Bengal.
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5 pb-1 border-b border-gray-100">
              <Compass className="w-3.5 h-3.5 text-sindoor-500" />
              <span>Quick Navigation</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleLinkClick('feed')}
                  className="text-gray-600 hover:text-sindoor-600 font-medium transition flex items-center gap-1.5 min-h-[32px]"
                >
                  <span>Explore All Pandals</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('leaderboard')}
                  className="text-gray-600 hover:text-marigold-600 font-medium transition flex items-center gap-1.5 min-h-[32px]"
                >
                  <span>Live City Leaderboard</span>
                </button>
              </li>
              {!isOrganizer && (
                <>
                  <li>
                    <button
                      onClick={() => handleLinkClick('my-votes')}
                      className="text-gray-600 hover:text-sindoor-600 font-medium transition flex items-center gap-1.5 min-h-[32px]"
                    >
                      <span>My Voting History & Ballot</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openQRScanner}
                      className="text-gray-600 hover:text-marigold-600 font-medium transition flex items-center gap-1.5 min-h-[32px]"
                    >
                      <span>Scan Pandal QR Code</span>
                    </button>
                  </li>
                  <li>
                    <a
                      href="/organizer/auth"
                      className="text-gray-500 hover:text-marigold-600 font-medium transition flex items-center gap-1.5 min-h-[32px]"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Organizer Portal</span>
                    </a>
                  </li>
                </>
              )}
              {isOrganizer && (
                <li>
                  <button
                    onClick={() => handleLinkClick('organizer')}
                    className="text-gray-600 hover:text-marigold-600 font-medium transition flex items-center gap-1.5 min-h-[32px]"
                  >
                    <span>Organizer Dashboard & QR Standee</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Dedicated Helpdesk & Direct WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5 pb-1 border-b border-gray-100">
              <HeartHandshake className="w-3.5 h-3.5 text-marigold-600" />
              <span>Official Helpdesk</span>
            </h4>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              Facing voting issues or need urgent assistance for your pandal? Contact our dedicated control desk.
            </p>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Voter Support Ticket Modal */}
              <button
                onClick={openSupportModal}
                className="w-full min-h-[44px] py-2 px-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 transition shadow-2xs"
              >
                <LifeBuoy className="w-4 h-4 text-amber-600" />
                <span>Submit Grievance Ticket</span>
              </button>

              {/* Option 2: Direct WhatsApp Support Button */}
              <a
                href="https://wa.me/918918267828?text=Hi,%20I%20am%20a%20Pandal%20Organizer%20and%20need%20help%20with%20the%20Voting%20Platform"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] py-2.5 px-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-gray-900 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <MessageCircle className="w-4 h-4 fill-current text-gray-900" />
                <span>Organizer WhatsApp Desk</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>

          {/* Column 4: Legal & Civic Guidelines */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5 pb-1 border-b border-gray-100">
              <FileText className="w-3.5 h-3.5 text-gray-600" />
              <span>Legal & Civic Rules</span>
            </h4>
            <ul className="space-y-2 text-xs text-gray-600 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-sindoor-500 font-bold">•</span>
                <span><strong>Single Vote Per Category:</strong> Each verified voter can cast at most 1 vote per pandal category.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-sindoor-500 font-bold">•</span>
                <span><strong>Zero-Plastic Mandate:</strong> Pandals strictly comply with DMC single-use plastic prohibition.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-sindoor-500 font-bold">•</span>
                <span><strong>Fire Safety Clearance:</strong> Mandated separate ingress/egress corridors for crowd safety.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Bengali Blessing */}
        <div className="mt-12 pt-6 border-t border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p className="text-center sm:text-left">
            © 2026 Paschim Banga DurgaPuja Samannay Samity. All rights reserved. 
            <span className="text-amber-800 font-semibold block sm:inline sm:ml-2">
              দুর্গাপূজার আন্তরিক প্রীতি ও শুভেচ্ছা
            </span>
          </p>
          <div className="flex items-center gap-4 text-[11px] font-medium text-gray-600">
            <span>Paschim Bardhaman Region</span>
            <span>•</span>
            <span>Verified PWA Engine</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">100% Secure RBAC</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
