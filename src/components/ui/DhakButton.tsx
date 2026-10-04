'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DhakButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'gold' | 'outline';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

export const DhakButton: React.FC<DhakButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  disabled = false,
  type = 'button',
  title,
}) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isDhakBeating, setIsDhakBeating] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (onClick) onClick(e);
  };

  // Variant styling
  const variantStyles = {
    primary: 'bg-gradient-to-r from-sindoor-500 to-marigold-500 text-white shadow-festive border border-amber-300/40',
    secondary: 'bg-white/90 text-gray-800 border border-gray-200 hover:border-marigold-400 hover:text-sindoor-600 shadow-sm',
    gold: 'bg-gradient-to-r from-amber-500 via-marigold-500 to-amber-600 text-white shadow-gold-glow border border-amber-200',
    outline: 'bg-transparent text-sindoor-600 border-2 border-sindoor-400 hover:bg-sindoor-50',
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      title={title}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`relative overflow-hidden font-bold transition-all duration-75 diya-glow-hover select-none touch-manipulation ${
        !disabled ? 'active:scale-95' : ''
      } ${variantStyles[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {/* Lit Diya Expanding Glow Aura on Hover */}
      <span className="absolute -inset-1 rounded-inherit bg-gradient-to-r from-marigold-400/0 via-amber-300/30 to-sindoor-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md pointer-events-none" />

      {/* Dhak Rhythm Sonic Ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.75 }}
            animate={{ scale: 3.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: 40,
              height: 40,
              marginLeft: -20,
              marginTop: -20,
              borderRadius: '50%',
              background: variant === 'secondary' 
                ? 'radial-gradient(circle, rgba(245, 130, 32, 0.4) 0%, rgba(217, 34, 42, 0.1) 70%, transparent 100%)' 
                : 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 215, 0, 0.4) 60%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
