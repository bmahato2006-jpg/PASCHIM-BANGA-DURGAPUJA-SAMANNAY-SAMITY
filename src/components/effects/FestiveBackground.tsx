'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const FestiveBackground: React.FC = () => {
  const { scrollY } = useScroll();

  // Multi-layered parallax transforms for subtle Bengali Alpona depths
  const yAlponaLayer1 = useTransform(scrollY, [0, 2000], [0, -180]);
  const yAlponaLayer2 = useTransform(scrollY, [0, 2000], [0, -90]);
  const yAlponaLayer3 = useTransform(scrollY, [0, 2000], [0, -260]);
  const opacityAlpona = useTransform(scrollY, [0, 600, 1800], [0.12, 0.18, 0.1]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 3D Falling Marigold (Genda Phool) Petals (Mobile-optimized count)
  const marigoldPetals = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${(i * 7.5 + (i % 3) * 4) % 96}%`,
      size: 14 + (i % 5) * 4, // 14px to 30px
      duration: 11 + (i % 6) * 2.5, // 11s to 23s
      delay: (i * 1.3) % 8,
      driftX: (i % 2 === 0 ? 1 : -1) * (20 + (i % 4) * 15),
      color:
        i % 3 === 0
          ? 'linear-gradient(135deg, #F58220 0%, #E65100 100%)' // Deep Marigold
          : i % 2 === 0
          ? 'linear-gradient(135deg, #FFB300 0%, #F58220 100%)' // Golden Marigold
          : 'linear-gradient(135deg, #FFD54F 0%, #FFA000 100%)', // Bright Kash/Genda
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      
      {/* Soft Ambient Radial Lights */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[550px] rounded-full blur-[140px] opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(245, 130, 32, 0.45) 0%, rgba(217, 34, 42, 0.25) 50%, transparent 75%)',
        }}
      />
      <div 
        className="absolute top-1/2 -right-40 w-[550px] h-[550px] rounded-full blur-[150px] opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(223, 178, 61, 0.35) 0%, rgba(245, 130, 32, 0.15) 60%, transparent 80%)',
        }}
      />

      {/* PARALLAX LAYER 1: Deep Background Alpona Mandala (Moves slow) */}
      <motion.div
        style={{ y: yAlponaLayer1, opacity: opacityAlpona }}
        className="absolute top-16 left-[-100px] w-[500px] h-[500px] pointer-events-none transform-gpu"
      >
        <svg viewBox="0 0 400 400" fill="none" stroke="#D9222A" strokeWidth="1.2" className="w-full h-full opacity-60">
          <circle cx="200" cy="200" r="180" strokeDasharray="4 4" />
          <circle cx="200" cy="200" r="150" />
          <circle cx="200" cy="200" r="120" strokeDasharray="2 3" />
          <circle cx="200" cy="200" r="90" />
          <circle cx="200" cy="200" r="50" fill="#FFF4E6" fillOpacity="0.3" />
          {/* Petal radiating geometry */}
          {Array.from({ length: 12 }).map((_, idx) => (
            <path
              key={idx}
              d={`M 200 200 Q ${200 + 70 * Math.cos((idx * Math.PI) / 6)} ${200 + 70 * Math.sin((idx * Math.PI) / 6)} ${200 + 150 * Math.cos(((idx + 0.5) * Math.PI) / 6)} ${200 + 150 * Math.sin(((idx + 0.5) * Math.PI) / 6)}`}
              stroke="#D9222A"
              strokeWidth="0.8"
            />
          ))}
        </svg>
      </motion.div>

      {/* PARALLAX LAYER 2: Mid-ground Alpona Ring (Opposite side, medium speed) */}
      <motion.div
        style={{ y: yAlponaLayer2, opacity: opacityAlpona }}
        className="absolute top-[45%] right-[-120px] w-[600px] h-[600px] pointer-events-none transform-gpu"
      >
        <svg viewBox="0 0 500 500" fill="none" stroke="#F58220" strokeWidth="1.4" className="w-full h-full opacity-50">
          <circle cx="250" cy="250" r="230" strokeDasharray="5 5" />
          <circle cx="250" cy="250" r="190" />
          <circle cx="250" cy="250" r="140" strokeDasharray="3 4" />
          <circle cx="250" cy="250" r="80" />
          {/* Traditional Paisley / Kalka Motifs */}
          {Array.from({ length: 8 }).map((_, idx) => (
            <path
              key={idx}
              d={`M 250 250 C ${250 + 90 * Math.cos((idx * Math.PI) / 4)} ${250 + 90 * Math.sin((idx * Math.PI) / 4)} ${250 + 170 * Math.cos(((idx + 0.4) * Math.PI) / 4)} ${250 + 170 * Math.sin(((idx + 0.4) * Math.PI) / 4)} ${250 + 220 * Math.cos((idx * Math.PI) / 4)} ${250 + 220 * Math.sin((idx * Math.PI) / 4)}`}
              stroke="#F58220"
              strokeWidth="1"
            />
          ))}
        </svg>
      </motion.div>

      {/* PARALLAX LAYER 3: Lower-ground Intricate Border Alpona (Fastest speed) */}
      <motion.div
        style={{ y: yAlponaLayer3 }}
        className="absolute top-[85%] left-[10%] w-[450px] h-[450px] pointer-events-none opacity-10 transform-gpu"
      >
        <svg viewBox="0 0 300 300" fill="none" stroke="#DFB23D" strokeWidth="1.5" className="w-full h-full">
          <circle cx="150" cy="150" r="130" strokeDasharray="4 3" />
          <circle cx="150" cy="150" r="95" />
          <path d="M 150 20 L 150 280 M 20 150 L 280 150 M 55 55 L 245 245 M 55 245 L 245 55" stroke="#DFB23D" strokeWidth="0.8" />
        </svg>
      </motion.div>

      {/* 3D CONTINUOUS FALLING MARIGOLD (GENDA PHOOL) PETALS */}
      {mounted && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-20 select-none">
          {marigoldPetals.map((petal) => (
            <motion.div
              key={petal.id}
              className="absolute pointer-events-none will-change-transform transform-gpu"
              style={{
                left: petal.left,
                top: -40,
                width: petal.size,
                height: petal.size * 1.35,
              }}
              animate={{
                y: ['0vh', '110vh'],
                x: [0, petal.driftX, -petal.driftX * 0.5, petal.driftX * 0.8, 0],
                rotateX: [0, 180, 360, 540],
                rotateY: [0, 240, 480, 720],
                rotateZ: [0, 45, -30, 60, 0],
                opacity: [0, 0.85, 0.9, 0.75, 0],
              }}
              transition={{
                duration: petal.duration,
                repeat: Infinity,
                delay: petal.delay,
                ease: 'linear',
              }}
            >
              {/* Petal SVG with realistic curving leaf shape and gradient */}
              <svg
                viewBox="0 0 24 32"
                fill="none"
                className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(230,81,0,0.25)]"
              >
                <path
                  d="M12 0 C18 6 24 16 22 26 C20 32 14 32 12 32 C10 32 4 32 2 26 C0 16 6 6 12 0 Z"
                  fill={`url(#genda-grad-${petal.id % 3})`}
                />
                <defs>
                  <linearGradient id={`genda-grad-${petal.id % 3}`} x1="0" y1="0" x2="1" y2="1">
                    {petal.id % 3 === 0 ? (
                      <>
                        <stop offset="0%" stopColor="#FFA000" />
                        <stop offset="60%" stopColor="#F58220" />
                        <stop offset="100%" stopColor="#C41E24" />
                      </>
                    ) : petal.id % 3 === 1 ? (
                      <>
                        <stop offset="0%" stopColor="#FFD54F" />
                        <stop offset="70%" stopColor="#FFA000" />
                        <stop offset="100%" stopColor="#E65100" />
                      </>
                    ) : (
                      <>
                        <stop offset="0%" stopColor="#FFE082" />
                        <stop offset="50%" stopColor="#FFB300" />
                        <stop offset="100%" stopColor="#F58220" />
                      </>
                    )}
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          ))}
        </div>
      )}

      {/* RISING DHUNO (INCENSE) SMOKE AT BOTTOM OF VIEWPORT */}
      <div className="absolute inset-x-0 bottom-0 h-44 sm:h-56 pointer-events-none overflow-hidden z-0">
        
        {/* Smoke Layer 1: Slow billowing wave */}
        <div 
          className="absolute inset-x-[-15%] bottom-[-20px] h-full opacity-35 filter blur-[18px] animate-smoke-slow"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(255, 245, 225, 0.6) 0%, rgba(245, 130, 32, 0.12) 45%, transparent 75%)',
          }}
        />

        {/* Smoke Layer 2: Fast curling wisps */}
        <div 
          className="absolute inset-x-[-10%] bottom-0 h-40 opacity-30 filter blur-[14px] animate-smoke-fast"
          style={{
            background: 'radial-gradient(ellipse at 30% 100%, rgba(255, 250, 240, 0.7) 0%, rgba(217, 34, 42, 0.08) 50%, transparent 80%), radial-gradient(ellipse at 75% 100%, rgba(255, 240, 215, 0.6) 0%, transparent 65%)',
          }}
        />

        {/* Subtle Dhuno Earthen Incense Burner Silhouette at lower corner */}
        <div className="absolute bottom-2 right-6 hidden lg:block opacity-25">
          <svg width="45" height="40" viewBox="0 0 50 45" fill="none">
            <path d="M15 35 C15 42 35 42 35 35 L33 22 C33 20 17 20 17 22 Z" fill="#8B4513" />
            <path d="M12 22 C12 18 38 18 38 22 C38 24 12 24 12 22 Z" fill="#A0522D" />
            <circle cx="25" cy="19" r="3" fill="#F58220" className="animate-ping" />
          </svg>
        </div>

      </div>

    </div>
  );
};
