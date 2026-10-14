/**
 * LUDO BUZZ - Player Info Card
 */

import React from 'react';
import { COLOR_CONFIG } from '../game/constants';
import { Player, PlayerColor } from '../game/types';
import { Award, Shield, Target } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  isCurrentTurn: boolean;
  rank?: number;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isCurrentTurn,
  rank,
}) => {
  const colorInfo = COLOR_CONFIG[player.color];

  const homeTokens = player.tokens.filter((t) => t.position.type === 'HOME').length;
  const pathTokens = player.tokens.filter(
    (t) => t.position.type === 'PATH' || t.position.type === 'HOME_STRETCH'
  ).length;
  const finishedTokens = player.tokens.filter((t) => t.position.type === 'FINISHED').length;

  return (
    <div
      className={`relative rounded-2xl p-3 sm:p-4 transition-all duration-300 border-2 backdrop-blur-md ${
        isCurrentTurn
          ? 'bg-white shadow-xl scale-[1.02] border-slate-900 ring-2'
          : 'bg-white/90 shadow-sm border-slate-200 hover:border-slate-300 opacity-90'
      }`}
      style={{
        boxShadow: isCurrentTurn
          ? `0 10px 25px -5px ${colorInfo.glowHex}`
          : undefined,
      }}
    >
      {/* Turn indicator glow pill */}
      {isCurrentTurn && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md flex items-center gap-1 animate-pulse"
          style={{ backgroundColor: colorInfo.primary }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          Active Turn
        </div>
      )}

      {/* Rank badge if finished */}
      {rank && (
        <div className="absolute -top-3 -right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1 border border-amber-500">
          <Award className="w-3.5 h-3.5 text-slate-900" />
          <span>#{rank}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className="w-4 h-4 rounded-full shadow-inner flex-shrink-0"
          style={{ backgroundColor: colorInfo.primary }}
        />
        <h3 className="font-bold text-sm sm:text-base text-slate-800 truncate">
          {player.name}
        </h3>
      </div>

      {/* Token status breakdown */}
      <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
        <div className="rounded-lg bg-slate-50 p-1.5 border border-slate-100">
          <div className="text-[10px] font-medium text-slate-400">Home</div>
          <div className="font-bold text-slate-700">{homeTokens}</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-1.5 border border-slate-100">
          <div className="text-[10px] font-medium text-slate-400">Board</div>
          <div className="font-bold text-slate-700">{pathTokens}</div>
        </div>
        <div
          className="rounded-lg p-1.5 border"
          style={{
            backgroundColor: colorInfo.light,
            borderColor: colorInfo.borderHex,
          }}
        >
          <div className="text-[10px] font-bold" style={{ color: colorInfo.secondary }}>
            Done
          </div>
          <div className="font-black" style={{ color: colorInfo.secondary }}>
            {finishedTokens}/4
          </div>
        </div>
      </div>

      {/* Stat tags */}
      {player.stats.captures > 0 && (
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3 text-red-500" /> Captures
          </span>
          <span className="font-semibold text-slate-700">{player.stats.captures}</span>
        </div>
      )}
    </div>
  );
};
