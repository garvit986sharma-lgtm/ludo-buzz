/**
 * LUDO BUZZ - Rules Modal
 */

import React from 'react';
import { X, Award, Shield, RotateCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { GameMode } from '../game/types';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: GameMode;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  currentMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-slate-950" />
            <h2 className="text-lg font-black tracking-tight">LUDO BUZZ RULES</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
            aria-label="Close rules"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700">
          {/* Ludo Offline notice */}
          {currentMode === 'LUDO_OFFLINE' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
              <div className="font-bold flex items-center gap-1.5 text-amber-900 mb-1 text-xs">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Ludo Offline (Pass &amp; Play)
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Take turns on the same phone. Guide your tokens around the board, take advantage of safe star spots, capture opponents, and be the first to reach the home triangle!
              </p>
            </div>
          )}

          {/* Standard Rules */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold flex-shrink-0 text-xs mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Leaving Home</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Each player starts with 4 tokens in their Home Yard. A token can <strong>only leave home on a dice roll of 6</strong>, which places it on that player&apos;s colored entry square.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 text-xs mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Clockwise Movement</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Tokens travel clockwise around the 52-square shared track according to the number shown on the dice.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 text-xs mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Captures & Safe Squares</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Landing on an opponent token on a normal square captures it, sending it back to Home. The <strong>8 safe squares</strong> (the 4 entry squares and the 4 golden star squares) protect tokens from capture!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold flex-shrink-0 text-xs mt-0.5">
                4
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Bonus Turns</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  A player receives an extra roll immediately whenever they roll a <strong>6</strong> or when they <strong>capture an opponent token</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0 text-xs mt-0.5">
                5
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Exact Roll to Finish</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  After completing a lap, tokens enter their colored Home Stretch. Tokens must land on the center finish square with an <strong>exact dice roll</strong>. Any move exceeding the final square is rejected.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0 text-xs mt-0.5">
                6
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Winning the Game</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  The first player to safely guide all 4 tokens into the center home finish wins the match!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            Got it, Let&apos;s Play!
          </button>
        </div>
      </div>
    </div>
  );
};
