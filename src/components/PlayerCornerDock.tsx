/**
 * LUDO BUZZ - Player Corner Dock with Dedicated Interactive Dice
 *
 * Each of the 4 players has their own corner station directly adjacent
 * to their board quadrant, containing their player info and their personal dice!
 */

import React from 'react';
import { Award, Target, Trophy } from 'lucide-react';
import { COLOR_CONFIG } from '../game/constants';
import { Player, PlayerColor } from '../game/types';
import { Dice3D } from './Dice3D';

interface PlayerCornerDockProps {
  player?: Player;
  color: PlayerColor;
  isCurrentTurn: boolean;
  isRolling: boolean;
  canRoll: boolean;
  hasRolled: boolean;
  currentRoll: number | null;
  hasLegalMoves: boolean;
  rank?: number;
  onRollDice: () => void;
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PlayerCornerDock: React.FC<PlayerCornerDockProps> = ({
  player,
  color,
  isCurrentTurn,
  isRolling,
  canRoll,
  hasRolled,
  currentRoll,
  hasLegalMoves,
  rank,
  onRollDice,
  corner,
}) => {
  const colorInfo = COLOR_CONFIG[color];

  // If this color is not active in a 2 or 3 player match:
  if (!player) {
    return (
      <div className="w-full max-w-[210px] p-2.5 rounded-2xl bg-white/5 border border-white/5 opacity-30 flex items-center justify-center text-xs text-slate-500 font-medium">
        Inactive
      </div>
    );
  }

  const finishedCount = player.tokens.filter((t) => t.position.type === 'FINISHED').length;
  const boardCount = player.tokens.filter(
    (t) => t.position.type === 'PATH' || t.position.type === 'HOME_STRETCH'
  ).length;

  const isRightSide = corner === 'top-right' || corner === 'bottom-right';

  return (
    <div
      className={`relative w-full max-w-[210px] sm:max-w-[240px] p-2 sm:p-2.5 rounded-2xl transition-all duration-300 border-2 backdrop-blur-md flex items-center justify-between gap-2 shadow-lg ${
        isCurrentTurn
          ? 'bg-slate-900/90 border-amber-400 ring-2 ring-amber-400/50 scale-[1.02] shadow-2xl'
          : 'bg-slate-900/60 border-white/10 opacity-80'
      } ${isRightSide ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
      style={{
        boxShadow: isCurrentTurn
          ? `0 10px 25px -5px ${colorInfo.glowHex}, 0 0 15px rgba(251, 191, 36, 0.25)`
          : undefined,
      }}
    >
      {/* Turn indicator glow pill */}
      {isCurrentTurn && (
        <div
          className={`absolute -top-2.5 px-2.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-md flex items-center gap-1 animate-pulse z-10 ${
            isRightSide ? 'right-3' : 'left-3'
          }`}
          style={{ backgroundColor: colorInfo.primary }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          YOUR TURN
        </div>
      )}

      {/* Rank badge if finished */}
      {rank && (
        <div
          className={`absolute -bottom-2 px-2 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-md flex items-center gap-0.5 border border-amber-500 z-10 ${
            isRightSide ? 'right-3' : 'left-3'
          }`}
        >
          <Award className="w-3 h-3 text-slate-950" />
          <span>#{rank}</span>
        </div>
      )}

      {/* Player identity details */}
      <div className="flex-1 min-w-0">
        <div className={`flex items-center gap-1.5 mb-1 ${isRightSide ? 'justify-end' : 'justify-start'}`}>
          <span
            className="w-3 h-3 rounded-full flex-shrink-0 shadow-xs"
            style={{ backgroundColor: colorInfo.primary }}
          />
          <h4 className="font-black text-xs sm:text-sm text-white truncate max-w-[90px] sm:max-w-[110px]">
            {player.name}
          </h4>
        </div>

        {/* Mini token indicators */}
        <div className={`flex items-center gap-1 text-[10px] text-slate-300 ${isRightSide ? 'justify-end' : 'justify-start'}`}>
          <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[9px] font-semibold">
            Board: {boardCount}
          </span>
          <span
            className="px-1.5 py-0.5 rounded-md text-[9px] font-black"
            style={{
              backgroundColor: colorInfo.light,
              color: colorInfo.secondary,
            }}
          >
            {finishedCount}/4 Done
          </span>
        </div>

        {player.stats.captures > 0 && (
          <div className={`mt-1 text-[9px] text-red-400 font-semibold flex items-center gap-0.5 ${isRightSide ? 'justify-end' : 'justify-start'}`}>
            <Target className="w-2.5 h-2.5" />
            <span>{player.stats.captures} caps</span>
          </div>
        )}
      </div>

      {/* DEDICATED CORNER DICE FOR THIS PLAYER */}
      <div className="flex-shrink-0">
        <Dice3D
          playerColor={color}
          value={isCurrentTurn ? currentRoll : (hasRolled ? currentRoll : 1)}
          isRolling={isCurrentTurn && isRolling}
          disabled={!isCurrentTurn || !canRoll}
          onRoll={onRollDice}
          hasRolled={isCurrentTurn && hasRolled}
          hasLegalMoves={isCurrentTurn && hasLegalMoves}
          size="sm"
        />
      </div>
    </div>
  );
};
