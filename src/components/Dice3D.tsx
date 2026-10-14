/**
 * LUDO BUZZ - Interactive Dice Component
 * Provides tactile rolling animations and visual feedback for the current player.
 */

import React, { useEffect, useState } from 'react';
import { COLOR_CONFIG } from '../game/constants';
import { PlayerColor } from '../game/types';

interface Dice3DProps {
  playerColor: PlayerColor;
  value: number | null;
  isRolling: boolean;
  disabled: boolean;
  onRoll: () => void;
  hasRolled: boolean;
  hasLegalMoves: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Dice3D: React.FC<Dice3DProps> = ({
  playerColor,
  value,
  isRolling,
  disabled,
  onRoll,
  hasRolled,
  hasLegalMoves,
  size = 'md',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value ?? 1);
  const colorInfo = COLOR_CONFIG[playerColor];

  // Animate tumbling dice faces during roll
  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 70);
      return () => clearInterval(interval);
    } else if (value !== null) {
      setDisplayValue(value);
    }
  }, [isRolling, value]);

  const sizeClasses = {
    sm: 'w-11 h-11 sm:w-13 sm:h-13 rounded-xl border-2 sm:border-3',
    md: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-3',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4',
  }[size];

  const pipSizes = {
    sm: 'w-2 h-2 sm:w-2.5 sm:h-2.5',
    md: 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5',
    lg: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
  }[size];

  const canClick = !disabled && !isRolling && !hasRolled;

  const pipPositions: Record<number, number[][]> = {
    1: [[1, 1]],
    2: [
      [0, 0],
      [2, 2],
    ],
    3: [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    4: [
      [0, 0],
      [0, 2],
      [2, 0],
      [2, 2],
    ],
    5: [
      [0, 0],
      [0, 2],
      [1, 1],
      [2, 0],
      [2, 2],
    ],
    6: [
      [0, 0],
      [0, 2],
      [1, 0],
      [1, 2],
      [2, 0],
      [2, 2],
    ],
  };

  const activePips = pipPositions[displayValue] || [[1, 1]];

  return (
    <div className="flex flex-col items-center select-none">
      <button
        type="button"
        onClick={() => {
          if (canClick) onRoll();
        }}
        disabled={!canClick}
        aria-label={`Roll dice for ${colorInfo.name}`}
        className={`relative group ${sizeClasses} bg-white transition-all duration-200 transform cursor-pointer flex items-center justify-center
          ${canClick ? 'hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl animate-bounce-subtle' : 'opacity-85'}
          ${isRolling ? 'rotate-12 scale-95 shadow-md' : ''}
        `}
        style={{
          borderColor: colorInfo.primary,
          boxShadow: canClick
            ? `0 8px 20px -4px ${colorInfo.glowHex}, 0 4px 6px -2px ${colorInfo.glowHex}`
            : '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Glow overlay */}
        {canClick && (
          <span
            className="absolute -inset-1 rounded-2xl opacity-75 blur-xs transition group-hover:opacity-100"
            style={{ backgroundColor: colorInfo.glowHex }}
          />
        )}

        {/* Dice face */}
        <div
          className={`relative w-full h-full rounded-lg sm:rounded-xl bg-gradient-to-br from-white via-slate-50 to-slate-200 flex items-center justify-center shadow-inner overflow-hidden ${
            isRolling ? 'animate-spin-fast' : ''
          }`}
        >
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-1 sm:p-1.5 gap-0.5 sm:gap-1">
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => {
                const hasPip = activePips.some(([pr, pc]) => pr === r && pc === c);
                return (
                  <div key={`${r}-${c}`} className="flex items-center justify-center">
                    {hasPip && (
                      <span
                        className={`${pipSizes} rounded-full shadow-inner transition-transform`}
                        style={{
                          backgroundColor: displayValue === 6 ? '#dc2626' : '#1e293b',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Six / Extra turn badge */}
        {value === 6 && !isRolling && (
          <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 rounded-full shadow-md animate-pulse">
            +1
          </span>
        )}
      </button>

      {/* Subtext info */}
      <div className="mt-1 text-center min-h-[16px]">
        {isRolling ? (
          <span className="text-[10px] font-bold text-amber-300 animate-pulse">Rolling...</span>
        ) : canClick ? (
          <span
            className="text-[10px] font-black tracking-wide uppercase px-1.5 py-0.2 rounded-full text-white shadow-xs animate-pulse"
            style={{ backgroundColor: colorInfo.primary }}
          >
            ROLL
          </span>
        ) : hasRolled && hasLegalMoves ? (
          <span className="text-[10px] font-bold text-emerald-400">
            Pick token
          </span>
        ) : null}
      </div>
    </div>
  );
};
