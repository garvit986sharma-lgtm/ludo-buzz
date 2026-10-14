/**
 * LUDO BUZZ - Game Controls Bar
 */

import React from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Home,
  BookOpen,
  Terminal,
  Sparkles,
  Zap,
} from 'lucide-react';
import { GameMode } from '../game/types';

interface GameControlsProps {
  mode: GameMode;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
  onReturnToLobby: () => void;
  onOpenRules: () => void;
  onOpenTests: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  mode,
  soundEnabled,
  onToggleSound,
  onRestart,
  onReturnToLobby,
  onOpenRules,
  onOpenTests,
}) => {
  return (
    <div className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200">
      {/* Mode Badge */}
      <div className="flex items-center gap-1.5">
        <span
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-xs shadow-xs ${
            mode === 'LUDO_OFFLINE'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-slate-100 text-slate-800 border border-slate-200'
          }`}
        >
          {mode === 'LUDO_OFFLINE' ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Ludo Offline
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-slate-600" />
              Standard
            </>
          )}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Sound toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Rules */}
        <button
          type="button"
          onClick={onOpenRules}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="View game rules"
          title="Game Rules"
        >
          <BookOpen className="w-4 h-4 text-amber-600" />
        </button>

        {/* Unit tests */}
        <button
          type="button"
          onClick={onOpenTests}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Run unit test suite"
          title="Logic Unit Tests"
        >
          <Terminal className="w-4 h-4 text-emerald-600" />
        </button>

        {/* Restart */}
        <button
          type="button"
          onClick={onRestart}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Restart match"
          title="Restart Match"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Home / Lobby */}
        <button
          type="button"
          onClick={onReturnToLobby}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Return to lobby"
          title="Return to Lobby"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
