/**
 * LUDO BUZZ - Iconic Game Brand Logo
 */

import React from 'react';

interface LudoLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const LudoLogo: React.FC<LudoLogoProps> = ({ size = 'md', showText = true }) => {
  const iconDimensions = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-11 sm:h-11',
    lg: 'w-14 h-14 sm:w-18 sm:h-18',
  }[size];

  const textSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-lg sm:text-2xl',
    lg: 'text-2xl sm:text-4xl',
  }[size];

  return (
    <div className="inline-flex items-center gap-2 select-none">
      {/* 4-Quadrant Ludo Board Shield Icon */}
      <div className={`relative ${iconDimensions} rounded-xl overflow-hidden shadow-lg border-2 border-amber-400 flex-shrink-0 bg-slate-900`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="logo-gold-rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* 4 quadrants */}
          <rect x="0" y="0" width="50" height="50" fill="#ea1d24" />
          <rect x="50" y="0" width="50" height="50" fill="#009e49" />
          <rect x="0" y="50" width="50" height="50" fill="#0093e9" />
          <rect x="50" y="50" width="50" height="50" fill="#f5b800" />

          {/* Inner white track lines */}
          <line x1="50" y1="0" x2="50" y2="100" stroke="#ffffff" strokeWidth="4" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#ffffff" strokeWidth="4" />

          {/* Center 3D Dice Badge with Crown */}
          <rect
            x="26"
            y="26"
            width="48"
            height="48"
            rx="12"
            fill="#ffffff"
            stroke="url(#logo-gold-rim)"
            strokeWidth="4"
            filter="url(#logo-shadow)"
          />

          {/* Pips for 6 or Star */}
          <circle cx="38" cy="38" r="4" fill="#ea1d24" />
          <circle cx="62" cy="38" r="4" fill="#009e49" />
          <circle cx="38" cy="50" r="4" fill="#1e293b" />
          <circle cx="62" cy="50" r="4" fill="#1e293b" />
          <circle cx="38" cy="62" r="4" fill="#0093e9" />
          <circle cx="62" cy="62" r="4" fill="#f5b800" />

          {/* Tiny Golden Crown at Top */}
          <polygon
            points="50,6 56,16 66,12 60,22 40,22 34,12 44,16"
            fill="#f59e0b"
            stroke="#78350f"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Typography: LUDO BUZZ */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1">
            <span
              className={`font-black tracking-tight ${textSizes} bg-gradient-to-r from-amber-300 via-amber-100 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              LUDO
            </span>
            <span
              className={`font-black tracking-wider ${textSizes} text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
            >
              BUZZ
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-amber-200/70 -mt-0.5">
            CLASSIC BOARD
          </span>
        </div>
      )}
    </div>
  );
};
