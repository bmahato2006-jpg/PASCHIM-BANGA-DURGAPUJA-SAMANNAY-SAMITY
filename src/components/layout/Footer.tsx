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
  FileText,
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 leading-tight">
              <span>২৪/৭ আঞ্চলিক জরুরি হেল্পলাইন:</span>
              <span className="text-[10px] opacity-75">24/7 Regional Emergency Helplines:</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-gray-600 font-medium text-xs">
            <div className="flex items-center gap-1">
              <span>পুলিশ (Police):</span>
              <strong className="text-gray-900 font-bold">100 / 0343-2546200</strong>
            </div>
            <div className="flex items-center gap-1">
              <span>ফায়ার স্টেশন (Fire Station):</span>
              <strong className="text-gray-900 font-bold">101</strong>
            </div>
            <div className="flex items-center gap-1">
              <span>অ্যাম্বুলেন্স (Ambulance):</span>
              <strong className="text-gray-900 font-bold">102</strong>
            </div>
            <div className="flex items-center gap-1">
              <span>মহিলা হেল্পলাইন (Women Helpline):</span>
              <strong className="text-gray-900 font-bold">1091</strong>
            </div>
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
              <div className="flex flex-col">
                <span className="font-serif font-black text-base sm:text-lg text-gray-900 block leading-tight">
                  পশ্চিমবঙ্গ <span className="text-sindoor-600">দুর্গাপূজা</span> সমন্বয় সমিতি
                </span>
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block mt-0.5">
                  Paschim Banga DurgaPuja Samannay Samity
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির কেন্দ্রীয় ডিজিটাল ভোটিং, লাইভ লিডারবোর্ড ও অন্বেষণ প্ল্যাটফর্ম। শিল্পকলা, ঐতিহ্য এবং পরিবেশ-বান্ধব কারুশিল্পের সম্মাননা।
              <span className="block text-[11px] opacity-75 mt-1 text-gray-500">
                The centralized digital voting, live leaderboard, and discovery platform for Paschim Banga DurgaPuja Samannay Samity. Honoring artistry, heritage, and eco-friendly craftsmanship.
              </span>
            </p>

            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-snug">
                <span className="font-bold">নাগরিক স্বীকৃতি ও নিরাপত্তা সমন্বয়</span>
                <span className="block opacity-75">Civic accreditation & safety coordination across Paschim Bardhaman & West Bengal.</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5 pb-1 border-b border-gray-100">
              <Compass className="w-3.5 h-3.5 text-sindoor-500" />
              <div className="flex flex-col leading-tight">
                <span>দ্রুত নেভিগেশন</span>
                <span className="text-[9px] opacity-75 normal-case font-normal text-gray-500">Quick Navigation</span>
              </div>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleLinkClick('feed')}
                  className="text-gray-600 hover:text-sindoor-600 font-medium transition flex items-center gap-1.5 min-h-[32px] text-left"
                >
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-gray-800">মণ্ডপ দেখুন</span>
                    <span className="text-[10px] opacity-75 text-gray-500">Explore All Pandals</span>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('leaderboard')}
                  className="text-gray-600 hover:text-marigold-600 font-medium transition flex items-center gap-1.5 min-h-[32px] text-left"
                >
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-gray-800">লাইভ লিডারবোর্ড</span>
                    <span className="text-[10px] opacity-75 text-gray-500">Live City Leaderboard</span>
                  </div>
                </button>
              </li>
              {!isOrganizer && (
                <>
                  <li>
                    <button
                      onClick={() => handleLinkClick('my-votes')}
                      className="text-gray-600 hover:text-sindoor-600 font-medium transition flex items-center gap-1.5 min-h-[32px] text-left"
                    >
                      <div className="flex flex-col leading-tight">
                        <span className="font-bold text-gray-800">আমার ভোট তালিকা</span>
                        <span className="text-[10px] opacity-75 text-gray-500">My Voting History & Ballot</span>
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openQRScanner}
                      className="text-gray-600 hover:text-marigold-600 font-medium transition flex items-center gap-1.5 min-h-[32px] text-left"
                    >
                      <div className="flex flex-col leading-tight">
                        <span className="font-bold text-gray-800">প্যান্ডেল কিউআর কোড স্ক্যান</span>
                        <span className="text-[10px] opacity-75 text-gray-500">Scan Pandal QR Code</span>
                      </div>
                    </button>
                  </li>
                  <li>
                    <a
                      href="/organizer/auth"
                      className="text-gray-600 hover:text-marigold-600 font-medium transition flex items-center gap-1.5 min-h-[32px] text-left"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <div className="flex flex-col leading-tight">
                        <span className="font-bold text-gray-800">আয়োজক পোর্টাল</span>
                        <span className="text-[10px] opacity-75 text-gray-500">Organizer Portal</span>
                      </div>
                    </a>
                  </li>
                </>
              )}
              {isOrganizer && (
                <li>
                  <button
                    onClick={() => handleLinkClick('organizer')}
                    className="text-gray-600 hover:text-marigold-600 font-medium transition flex items-center gap-1.5 min-h-[32px] text-left"
                  >
                    <div className="flex flex-col leading-tight">
                      <span className="font-bold text-gray-800">আয়োজক ড্যাশবোর্ড ও কিউআর</span>
                      <span className="text-[10px] opacity-75 text-gray-500">Organizer Dashboard & QR Standee</span>
                    </div>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Dedicated Helpdesk & Direct WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5 pb-1 border-b border-gray-100">
              <HeartHandshake className="w-3.5 h-3.5 text-marigold-600" />
              <div className="flex flex-col leading-tight">
                <span>অফিসিয়াল হেল্পডেস্ক</span>
                <span className="text-[9px] opacity-75 normal-case font-normal text-gray-500">Official Helpdesk</span>
              </div>
            </h4>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              ভোট সংক্রান্ত সমস্যা বা প্যান্ডেলের জন্য জরুরি সহায়তার প্রয়োজন? আমাদের কন্ট্রোল ডেস্কে যোগাযোগ করুন।
              <span className="block text-[11px] opacity-75 mt-1 text-gray-500">
                Facing voting issues or need urgent assistance for your pandal? Contact our dedicated control desk.
              </span>
            </p>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Voter Support Ticket Modal */}
              <button
                onClick={openSupportModal}
                className="w-full min-h-[44px] py-2 px-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 transition shadow-2xs"
              >
                <LifeBuoy className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="flex flex-col items-center leading-tight">
                  <span>অভিযোগ টিকিট জমা দিন</span>
                  <span className="text-[10px] opacity-75 font-normal">Submit Grievance Ticket</span>
                </div>
              </button>

              {/* Option 2: Direct WhatsApp Support Button */}
              <a
                href="https://wa.me/918918267828?text=Hi,%20I%20am%20a%20Pandal%20Organizer%20and%20need%20help%20with%20the%20Voting%20Platform"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] py-2.5 px-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-gray-900 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <MessageCircle className="w-4 h-4 fill-current text-gray-900 shrink-0" />
                <div className="flex flex-col items-center leading-tight">
                  <span>আয়োজক হোয়াটসঅ্যাপ ডেস্ক</span>
                  <span className="text-[10px] opacity-75 font-normal">Organizer WhatsApp Desk</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Column 4: Legal & Civic Guidelines */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5 pb-1 border-b border-gray-100">
              <FileText className="w-3.5 h-3.5 text-gray-600" />
              <div className="flex flex-col leading-tight">
                <span>আইনি ও নাগরিক নিয়মাবলী</span>
                <span className="text-[9px] opacity-75 normal-case font-normal text-gray-500">Legal & Civic Rules</span>
              </div>
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-600 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-sindoor-500 font-bold">•</span>
                <div>
                  <span className="font-bold text-gray-800">প্রতি বিভাগে একটি ভোট (Single Vote Per Category):</span>
                  <span className="block text-[11px] text-gray-600">প্রত্যেক যাচাইকৃত ভোটার প্রতি ক্যাটাগরিতে ১টি করে ভোট দিতে পারেন।</span>
                </div>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-sindoor-500 font-bold">•</span>
                <div>
                  <span className="font-bold text-gray-800">প্লাস্টিকমুক্ত নির্দেশিকা (Zero-Plastic Mandate):</span>
                  <span className="block text-[11px] text-gray-600">মণ্ডপ প্রাঙ্গণে একক ব্যবহারের প্লাস্টিক কঠোরভাবে নিষিদ্ধ।</span>
                </div>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-sindoor-500 font-bold">•</span>
                <div>
                  <span className="font-bold text-gray-800">অগ্নি নিরাপত্তা ছাড়পত্র (Fire Safety Clearance):</span>
                  <span className="block text-[11px] text-gray-600">জননিরাপত্তার স্বার্থে পৃথক প্রবেশ ও প্রস্থান পথ বাধ্যতামূলক।</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Greeting */}
        <div className="mt-12 pt-6 border-t border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="text-center sm:text-left leading-relaxed">
            <p>
              <span>© ২০২৬ পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি। সর্বস্বত্ব সংরক্ষিত।</span>
              <span className="block text-xs opacity-70 mt-1">© 2026 Paschim Banga DurgaPuja Samannay Samity. All rights reserved.</span>
            </p>
            <p className="text-amber-800 font-bold mt-2">
              <span>দুর্গাপূজার আন্তরিক প্রীতি ও শুভেচ্ছা</span>
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium text-gray-600">
            <span>পশ্চিম বর্ধমান অঞ্চল <span className="opacity-70">(Paschim Bardhaman)</span></span>
            <span>•</span>
            <span>যাচাইকৃত PWA ইঞ্জিন <span className="opacity-70">(Verified PWA)</span></span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">১০০% সুরক্ষিত RBAC</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
