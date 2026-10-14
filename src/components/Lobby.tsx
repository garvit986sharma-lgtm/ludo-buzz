/**
 * LUDO BUZZ - Game Lobby & Setup Component
 */

import React, { useState } from 'react';
import {
  Users,
  Play,
  Volume2,
  VolumeX,
  BookOpen,
  Terminal,
  Sparkles,
  Gamepad2,
  Zap,
} from 'lucide-react';
import { COLOR_CONFIG } from '../game/constants';
import { GameMode, PlayerColor } from '../game/types';
import { sound } from '../game/audio';
import { LudoLogo } from './LudoLogo';

interface LobbyProps {
  onStartGame: (
    playerCount: 2 | 3 | 4,
    mode: GameMode,
    playerNames: Record<PlayerColor, string>,
    soundEnabled: boolean
  ) => void;
  onOpenRules: () => void;
  onOpenTests: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  onStartGame,
  onOpenRules,
  onOpenTests,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('STANDARD');
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [playerNames, setPlayerNames] = useState<Record<PlayerColor, string>>({
    RED: 'Red Master',
    GREEN: 'Green Comet',
    YELLOW: 'Yellow Buzz',
    BLUE: 'Blue Shark',
  });

  const handleNameChange = (color: PlayerColor, name: string) => {
    setPlayerNames((prev) => ({
      ...prev,
      [color]: name,
    }));
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  const activeColors: Record<2 | 3 | 4, PlayerColor[]> = {
    2: ['RED', 'YELLOW'],
    3: ['RED', 'GREEN', 'YELLOW'],
    4: ['RED', 'GREEN', 'YELLOW', 'BLUE'],
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Banner with Ludo Logo */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-amber-600 via-amber-700 to-red-700 text-white text-center overflow-hidden flex flex-col items-center">
          {/* Subtle decorative circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-black/20 rounded-full blur-xl" />

          <div className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 backdrop-blur-xs text-[10px] font-black tracking-widest uppercase mb-3 border border-amber-300/30">
            <Gamepad2 className="w-3.5 h-3.5 text-amber-300" />
            OFFLINE PASS &amp; PLAY
          </div>

          <div className="my-1">
            <LudoLogo size="lg" />
          </div>

          <p className="text-xs sm:text-sm font-medium text-amber-100/90 max-w-md mx-auto mt-2">
            Play classic Ludo with 2, 3, or 4 players on one phone!
          </p>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6">
          {/* 1. GAME MODE SELECTION */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Standard Mode */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('STANDARD');
                  sound.playClick();
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  selectedMode === 'STANDARD'
                    ? 'border-amber-500 bg-amber-50/70 shadow-md ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">Standard Mode</span>
                  {selectedMode === 'STANDARD' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Classic international tournament rules with balanced fair dice rolls.
                </p>
              </button>

              {/* Ludo Offline Mode */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('LUDO_OFFLINE');
                  sound.playClick();
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                  selectedMode === 'LUDO_OFFLINE'
                    ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-amber-950">Ludo Offline</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  {selectedMode === 'LUDO_OFFLINE' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Pass &amp; Play on this device with friends and family. No internet required.
                </p>
              </button>
            </div>
          </div>

          {/* 2. NUMBER OF PLAYERS */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-500" />
              Number of Players (Same Device)
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {([2, 3, 4] as const).map((count) => {
                const isSelected = playerCount === count;
                return (
                  <button
                    key={`count-${count}`}
                    type="button"
                    onClick={() => {
                      setPlayerCount(count);
                      sound.playClick();
                    }}
                    className={`py-3 px-2 rounded-2xl border-2 font-bold text-sm flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span>{count} Players</span>
                    <span
                      className={`text-[10px] font-normal ${
                        isSelected ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {count === 2
                        ? 'Red vs Yellow'
                        : count === 3
                        ? 'Red, Green, Yellow'
                        : 'All 4 Colors'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. CUSTOMIZE PLAYER NAMES */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">
              Player Names
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeColors[playerCount].map((col) => {
                const conf = COLOR_CONFIG[col];
                return (
                  <div
                    key={`input-${col}`}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-slate-400 transition-colors"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: conf.primary }}
                    />
                    <input
                      type="text"
                      value={playerNames[col]}
                      onChange={(e) => handleNameChange(col, e.target.value)}
                      maxLength={18}
                      aria-label={`${conf.name} player name`}
                      className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-hidden"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. UTILITIES & SOUND */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={handleToggleSound}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  Sound On
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  Sound Muted
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenRules}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                Rules
              </button>

              <button
                type="button"
                onClick={onOpenTests}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
                title="Run Unit Tests"
              >
                <Terminal className="w-4 h-4 text-emerald-600" />
                Tests
              </button>
            </div>
          </div>

          {/* 5. START GAME BUTTON */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onStartGame(playerCount, selectedMode, playerNames, soundEnabled);
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 hover:from-amber-600 hover:to-red-700 text-slate-950 font-black text-base shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
            START GAME ({selectedMode === 'LUDO_OFFLINE' ? 'Ludo Offline' : 'Standard'})
          </button>
        </div>
      </div>
    </div>
  );
};
