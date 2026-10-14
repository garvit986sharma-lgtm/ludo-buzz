/**
 * LUDO BUZZ - Victory Celebration Modal
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Sparkles, Award } from 'lucide-react';
import { COLOR_CONFIG } from '../game/constants';
import { GameState, PlayerColor } from '../game/types';
import { sound } from '../game/audio';

interface WinnerModalProps {
  state: GameState;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  state,
  onPlayAgain,
  onReturnToLobby,
}) => {
  const winnerColor = state.winner || state.ranking[0] || 'RED';
  const winnerInfo = COLOR_CONFIG[winnerColor];
  const winnerPlayer = state.players.find((p) => p.id === winnerColor);

  useEffect(() => {
    sound.playVictory();

    // Trigger colorful confetti shower
    const end = Date.now() + 3.5 * 1000;
    const colors = ['#ef4444', '#22c55e', '#eab308', '#3b82f6', '#f59e0b'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [winnerColor]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden text-center p-6 sm:p-8 animate-scale-up">
        {/* Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-50"
          style={{ backgroundColor: winnerInfo.primary }}
        />

        {/* Trophy icon */}
        <div className="relative inline-flex p-4 rounded-3xl bg-amber-100 text-amber-600 shadow-inner mb-3 border-2 border-amber-300">
          <Trophy className="w-12 h-12 text-amber-500 animate-bounce-subtle" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          VICTORY!
        </h2>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          {state.mode === 'LUDO_OFFLINE' ? 'Ludo Offline Match Completed' : 'Match Completed'}
        </p>

        {/* Winner Banner */}
        <div
          className="mt-4 p-4 rounded-2xl text-white shadow-lg flex items-center justify-center gap-3"
          style={{ backgroundColor: winnerInfo.primary }}
        >
          <Award className="w-6 h-6 text-yellow-200" />
          <span className="text-xl font-black tracking-wide">
            {winnerPlayer?.name || winnerInfo.name} Wins!
          </span>
        </div>

        {/* Rankings */}
        <div className="mt-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Player Standings
          </div>
          <div className="space-y-1.5">
            {state.players.map((player) => {
              const rankIdx = state.ranking.indexOf(player.id);
              const rank = rankIdx !== -1 ? rankIdx + 1 : undefined;
              const col = COLOR_CONFIG[player.color];

              return (
                <div
                  key={`podium-${player.id}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: col.primary }}
                    />
                    <span className="font-bold text-slate-800">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[11px]">
                      {player.stats.captures} caps · {player.stats.sixes} sixes
                    </span>
                    <span
                      className={`font-black px-2 py-0.5 rounded-full text-[11px] ${
                        rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {rank ? `#${rank}` : 'Runner-up'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
          <button
            onClick={onReturnToLobby}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Lobby
          </button>
        </div>
      </div>
    </div>
  );
};
