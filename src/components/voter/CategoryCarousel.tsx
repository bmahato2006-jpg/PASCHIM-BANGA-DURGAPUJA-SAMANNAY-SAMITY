'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Palette, 
  Zap, 
  Leaf, 
  Award, 
  LayoutGrid,
  ChevronRight,
  Flame
} from 'lucide-react';

export interface CategoryOption {
  id: string;
  label: string;
  bengaliLabel: string;
  icon: React.ReactNode;
  activeColor: string;
  badge?: string;
}

interface CategoryCarouselProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  counts: Record<string, number>;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  const categories: CategoryOption[] = [
    {
      id: 'all',
      label: 'All Pandals',
      bengaliLabel: 'সব পুজো মণ্ডপ',
      icon: <LayoutGrid className="w-4 h-4" />,
      activeColor: 'bg-gray-900 text-white border-gray-900 shadow-md',
      badge: `${counts.all || 0}`,
    },
    {
      id: 'idol',
      label: 'Best Idol',
      bengaliLabel: 'সেরা প্রতিমা',
      icon: <Sparkles className="w-4 h-4 text-rose-500" />,
      activeColor: 'bg-gradient-to-r from-sindoor-600 to-rose-600 text-white border-sindoor-500 shadow-festive',
      badge: 'Popular',
    },
    {
      id: 'theme',
      label: 'Best Theme',
      bengaliLabel: 'সেরা ভাবনা',
      icon: <Palette className="w-4 h-4 text-marigold-500" />,
      activeColor: 'bg-gradient-to-r from-marigold-500 to-amber-500 text-white border-marigold-400 shadow-md',
      badge: 'Artistry',
    },
    {
      id: 'lighting',
      label: 'Lighting Spectacle',
      bengaliLabel: 'সেরা আলোকসজ্জা',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      activeColor: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-400 shadow-md',
      badge: `${counts.lighting || 0}`,
    },
    {
      id: 'eco',
      label: '100% Eco-Friendly',
      bengaliLabel: 'সবুজ পরিবেশ পূজা',
      icon: <Leaf className="w-4 h-4 text-emerald-500" />,
      activeColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md',
      badge: 'Zero-Carbon',
    },
    {
      id: 'budget',
      label: 'Grand Budget',
      bengaliLabel: 'মেগা বাজেট (>₹45L)',
      icon: <Award className="w-4 h-4 text-amber-300" />,
      activeColor: 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white border-purple-600 shadow-md',
      badge: 'Mega',
    },
  ];

  return (
    <div className="relative w-full my-4">
      {/* Scrollable Container with Smooth Touch Momentum */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2 px-1 snap-x snap-mandatory scroll-smooth">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelectCategory(cat.id)}
              className={`min-h-[48px] shrink-0 snap-start flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                isSelected
                  ? `${cat.activeColor} ring-2 ring-amber-300/60 shadow-gold-glow`
                  : 'bg-white/80 backdrop-blur-xl text-gray-700 hover:text-gray-900 hover:bg-white border-amber-200/70 shadow-2xs hover:shadow-sm'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-amber-50'}`}>
                {cat.icon}
              </div>

              <div className="text-left">
                <span className="block leading-tight font-bold">{cat.label}</span>
                <span className={`block text-[10px] font-medium leading-tight ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                  {cat.bengaliLabel}
                </span>
              </div>

              {cat.badge && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  isSelected ? 'bg-white text-gray-900' : 'bg-amber-100 text-amber-900'
                }`}>
                  {cat.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
