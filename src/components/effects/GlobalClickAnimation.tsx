'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
}

interface ClickBurst {
  id: number;
  x: number;
  y: number;
  particles: Particle[];
}

const FESTIVE_COLORS = [
  '#FFD700', // Royal Gold
  '#F58220', // Radiant Marigold
  '#D9222A', // Sindoor Vermillion
  '#FFA000', // Amber Flame
  '#FFF8E7', // Champak White/Cream
  '#FF6B6B', // Ruby Coral
];

export const GlobalClickAnimation: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [bursts, setBursts] = useState<ClickBurst[]>([]);

  const handlePointerDown = useCallback((e: MouseEvent | TouchEvent | PointerEvent) => {
    // Unblock mobile UI thread: Skip heavy particle bursts on touch devices to ensure 60fps instant tapping
    if ('pointerType' in e && (e as PointerEvent).pointerType === 'touch') return;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

    let clientX: number;
    let clientY: number;

    if ('clientX' in e && typeof e.clientX === 'number') {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if ('touches' in e && (e as TouchEvent).touches?.length > 0) {
      clientX = (e as TouchEvent).touches[0].clientX;
      clientY = (e as TouchEvent).touches[0].clientY;
    } else {
      return;
    }

    const burstId = Date.now() + Math.random();
    const particleCount = 7;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i * (360 / particleCount) + (Math.random() * 25 - 12)) * (Math.PI / 180);
      const distance = 28 + Math.random() * 32;
      const color = FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)];
      const size = 3 + Math.random() * 4;

      particles.push({
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        angle: angle * (180 / Math.PI),
        distance,
        color,
        size,
      });
    }

    const newBurst: ClickBurst = {
      id: burstId,
      x: clientX,
      y: clientY,
      particles,
    };

    setBursts((prev) => [...prev.slice(-6), newBurst]);

    // Fast cleanup after 650ms
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, 650);
  }, []);

  useEffect(() => {
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [handlePointerDown]);

  return (
    <>
      {children}

      {/* Global Click & Tap Shockwave / Sparkle Canvas Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[99998] overflow-hidden select-none"
      >
        <AnimatePresence>
          {bursts.map((burst) => (
            <React.Fragment key={burst.id}>
              {/* Outer Golden Concentric Shockwave Ring */}
              <motion.div
                initial={{ scale: 0.15, opacity: 0.95 }}
                animate={{ scale: 2.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute',
                  left: burst.x,
                  top: burst.y,
                  width: 54,
                  height: 54,
                  marginLeft: -27,
                  marginTop: -27,
                  borderRadius: '50%',
                  border: '2px solid rgba(245, 130, 32, 0.75)',
                  boxShadow:
                    '0 0 16px rgba(255, 215, 0, 0.6), inset 0 0 10px rgba(217, 34, 42, 0.4)',
                }}
              />

              {/* Inner Radiant Sindoor Diya Pulse */}
              <motion.div
                initial={{ scale: 0.2, opacity: 0.9 }}
                animate={{ scale: 1.6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left: burst.x,
                  top: burst.y,
                  width: 32,
                  height: 32,
                  marginLeft: -16,
                  marginTop: -16,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(255, 215, 0, 0.85) 0%, rgba(217, 34, 42, 0.4) 60%, transparent 100%)',
                  filter: 'blur(1px)',
                }}
              />

              {/* Radial Sparkling Festive Particles */}
              {burst.particles.map((particle) => (
                <motion.div
                  key={`${burst.id}-${particle.id}`}
                  initial={{
                    x: burst.x,
                    y: burst.y,
                    scale: 1,
                    opacity: 1,
                  }}
                  animate={{
                    x: burst.x + particle.x,
                    y: burst.y + particle.y,
                    scale: 0,
                    opacity: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
                  style={{
                    position: 'absolute',
                    width: particle.size,
                    height: particle.size,
                    marginLeft: -particle.size / 2,
                    marginTop: -particle.size / 2,
                    borderRadius: '50%',
                    backgroundColor: particle.color,
                    boxShadow: `0 0 8px ${particle.color}`,
                  }}
                />
              ))}
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};
