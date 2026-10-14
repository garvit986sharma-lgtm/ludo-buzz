/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  Terminal,
  Trophy,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  COLOR_CONFIG,
  HOME_STRETCH_COORDINATES,
  PATH_COORDINATES,
} from './game/constants';
import {
  advanceTurn,
  calculateTokenPath,
  createGame,
  getDiceResult,
  getLegalMoves,
  moveToken,
  restartGame,
} from './game/core';
import { sound } from './game/audio';
import { GameMode, GameState, PlayerColor } from './game/types';
import { LudoBoard } from './components/LudoBoard';
import { Dice3D } from './components/Dice3D';
import { PlayerCard } from './components/PlayerCard';
import { PlayerCornerDock } from './components/PlayerCornerDock';
import { GameControls } from './components/GameControls';
import { LudoLogo } from './components/LudoLogo';
import { RulesModal } from './components/RulesModal';
import { WinnerModal } from './components/WinnerModal';
import { TestRunnerModal } from './components/TestRunnerModal';
import { Lobby } from './components/Lobby';

export default function App() {
  const [screen, setScreen] = useState<'LOBBY' | 'GAME'>('LOBBY');
  const [gameState, setGameState] = useState<GameState>(() => createGame(4, 'STANDARD'));
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isTestsOpen, setIsTestsOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Smooth step-by-step animation state
  const [animatingToken, setAnimatingToken] = useState<{
    color: PlayerColor;
    id: number;
    coord: { x: number; y: number };
  } | null>(null);

  const isAnimatingRef = useRef(false);

  // Sync sound manager enabled state
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  const handleStartGame = (
    playerCount: 2 | 3 | 4,
    mode: GameMode,
    playerNames: Record<PlayerColor, string>,
    soundPref: boolean
  ) => {
    const newGame = createGame(playerCount, mode);
    // Apply custom player names
    newGame.players = newGame.players.map((p) => ({
      ...p,
      name: playerNames[p.id] || p.name,
    }));
    setSoundEnabled(soundPref);
    setGameState(newGame);
    setScreen('GAME');
  };

  const handleRestart = () => {
    sound.playClick();
    const freshGame = restartGame(gameState);
    // Preserve custom player names
    freshGame.players = freshGame.players.map((p) => {
      const existing = gameState.players.find((ep) => ep.id === p.id);
      return existing ? { ...p, name: existing.name } : p;
    });
    setGameState(freshGame);
    setAnimatingToken(null);
    isAnimatingRef.current = false;
  };

  const handleReturnToLobby = () => {
    sound.playClick();
    setScreen('LOBBY');
    setAnimatingToken(null);
    isAnimatingRef.current = false;
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  // Roll the dice
  const handleRollDice = () => {
    if (
      gameState.phase !== 'WAITING_ROLL' ||
      gameState.hasRolled ||
      isRolling ||
      isAnimatingRef.current ||
      gameState.winner
    ) {
      return;
    }

    setIsRolling(true);
    sound.playDiceRoll();

    setTimeout(() => {
      setIsRolling(false);

      // Isolated dice engine: fair in Standard, Yellow-favouring in Ludo Offline
      const rollValue = getDiceResult(gameState, gameState.mode);
      const currentPlayer = gameState.players[gameState.turnIndex];

      const legalMoves = getLegalMoves(gameState, currentPlayer.id, rollValue);

      // Track consecutive 6s
      const newConsecutiveSixes = rollValue === 6 ? gameState.consecutiveSixes + 1 : 0;

      // Update rolls stats
      const updatedPlayers = gameState.players.map((p, idx) =>
        idx === gameState.turnIndex
          ? {
              ...p,
              stats: {
                ...p.stats,
                rolls: p.stats.rolls + 1,
                sixes: rollValue === 6 ? p.stats.sixes + 1 : p.stats.sixes,
              },
            }
          : p
      );

      // If rolled 3 sixes in a row: forfeit turn
      if (newConsecutiveSixes === 3) {
        const nextSt: GameState = {
          ...gameState,
          players: updatedPlayers,
          currentRoll: rollValue,
          hasRolled: true,
          consecutiveSixes: 0,
          legalMoves: [],
          phase: 'WAITING_ROLL',
          lastActionDescription: `Three consecutive 6s! ${currentPlayer.name} loses their turn.`,
        };
        setGameState(nextSt);

        setTimeout(() => {
          setGameState((prev) => advanceTurn(prev, false));
        }, 1100);
        return;
      }

      const rolledState: GameState = {
        ...gameState,
        players: updatedPlayers,
        currentRoll: rollValue,
        hasRolled: true,
        consecutiveSixes: newConsecutiveSixes,
        legalMoves,
        phase: legalMoves.length > 0 ? 'WAITING_MOVE' : 'WAITING_ROLL',
        lastActionDescription:
          legalMoves.length > 0
            ? `${currentPlayer.name} rolled a ${rollValue}! Select a token to move.`
            : `${currentPlayer.name} rolled a ${rollValue}. No legal moves available!`,
      };

      setGameState(rolledState);

      // If no legal moves available, automatically advance turn after a brief pause
      if (legalMoves.length === 0) {
        setTimeout(() => {
          setGameState((prev) => advanceTurn(prev, false));
        }, 900);
      }
    }, 550);
  };

  // Execute token move with step-by-step animation
  const handleSelectToken = (playerId: PlayerColor, tokenId: number) => {
    if (
      gameState.phase !== 'WAITING_MOVE' ||
      !gameState.hasRolled ||
      gameState.currentRoll === null ||
      isAnimatingRef.current
    ) {
      return;
    }

    const currentPlayer = gameState.players[gameState.turnIndex];
    if (currentPlayer.id !== playerId) return;

    const move = gameState.legalMoves.find((m) => m.tokenId === tokenId);
    if (!move) return;

    // Calculate step-by-step path for smooth animation
    const steps = calculateTokenPath(gameState, playerId, tokenId, gameState.currentRoll);

    if (steps.length <= 1) {
      // Exit home onto entry square directly
      sound.playExitHome();
      const nextSt = moveToken(gameState, playerId, tokenId, gameState.currentRoll);
      setGameState(nextSt);

      setTimeout(() => {
        setGameState((prev) => advanceTurn(prev, nextSt.extraTurnPending));
      }, 400);
      return;
    }

    // Multi-step movement animation
    isAnimatingRef.current = true;
    setGameState((prev) => ({ ...prev, phase: 'ANIMATING' }));

    let stepIdx = 0;

    const stepInterval = setInterval(() => {
      if (stepIdx < steps.length) {
        const curStep = steps[stepIdx];
        sound.playStep(stepIdx);

        let coord = { x: 0, y: 0 };
        if (curStep.position.type === 'PATH') {
          coord = PATH_COORDINATES[curStep.position.index];
        } else if (curStep.position.type === 'HOME_STRETCH') {
          coord = HOME_STRETCH_COORDINATES[playerId][curStep.position.index];
        } else if (curStep.position.type === 'FINISHED') {
          coord = HOME_STRETCH_COORDINATES[playerId][5];
        }

        setAnimatingToken({
          color: playerId,
          id: tokenId,
          coord,
        });

        stepIdx++;
      } else {
        clearInterval(stepInterval);
        isAnimatingRef.current = false;
        setAnimatingToken(null);

        // Execute actual game logic move
        const nextSt = moveToken(gameState, playerId, tokenId, gameState.currentRoll!);

        if (move.willCapture) {
          sound.playCapture();
        } else if (move.isFinish) {
          sound.playFinishToken();
        } else if (
          move.toPosition.type === 'PATH' &&
          [0, 8, 13, 21, 26, 34, 39, 47].includes(move.toPosition.index)
        ) {
          sound.playSafeSquare();
        }

        setGameState(nextSt);

        // If game is over, don't advance turn
        if (nextSt.phase === 'GAME_OVER') return;

        // Advance turn or grant bonus turn
        setTimeout(() => {
          setGameState((prev) => advanceTurn(prev, nextSt.extraTurnPending));
        }, 450);
      }
    }, 110);
  };

  const currentPlayer = gameState.players[gameState.turnIndex];
  const redPlayer = gameState.players.find((p) => p.id === 'RED');
  const greenPlayer = gameState.players.find((p) => p.id === 'GREEN');
  const yellowPlayer = gameState.players.find((p) => p.id === 'YELLOW');
  const bluePlayer = gameState.players.find((p) => p.id === 'BLUE');

  const canRoll =
    gameState.phase === 'WAITING_ROLL' &&
    !gameState.hasRolled &&
    !isRolling &&
    !isAnimatingRef.current &&
    !gameState.winner;

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans relative"
      style={{
        backgroundColor: '#20120a',
        backgroundImage: `
          radial-gradient(ellipse at 50% 35%, rgba(217, 119, 6, 0.16) 0%, rgba(15, 7, 4, 0.88) 80%),
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
          repeating-linear-gradient(0deg, #2b170e, #2b170e 45px, #23120a 45px, #23120a 90px)
        `,
        backgroundSize: '100% 100%, 45px 45px, 45px 45px, 100% 90px',
      }}
    >
      {/* Top Header */}
      <header className="px-3 py-2.5 sm:px-6 border-b border-amber-900/30 bg-slate-950/75 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <LudoLogo size="sm" />
          {gameState.mode === 'LUDO_OFFLINE' && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3 h-3 text-amber-300" /> Ludo Offline
            </span>
          )}
        </div>

        {screen === 'GAME' ? (
          <div className="flex items-center gap-2">
            <GameControls
              mode={gameState.mode}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              onRestart={handleRestart}
              onReturnToLobby={handleReturnToLobby}
              onOpenRules={() => setIsRulesOpen(true)}
              onOpenTests={() => setIsTestsOpen(true)}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRulesOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Rules
            </button>
            <button
              onClick={() => setIsTestsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Unit Tests
            </button>
          </div>
        )}
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 w-full max-w-5xl mx-auto">
        {screen === 'LOBBY' ? (
          <Lobby
            onStartGame={handleStartGame}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenTests={() => setIsTestsOpen(true)}
          />
        ) : (
          <div className="w-full flex flex-col items-center gap-4">
            {/* Status / Announcement Bar */}
            <div className="w-full max-w-2xl px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 truncate">
                <span
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0 animate-pulse"
                  style={{ backgroundColor: COLOR_CONFIG[currentPlayer.color].primary }}
                />
                <span className="font-semibold text-slate-200 truncate">
                  {gameState.lastActionDescription}
                </span>
              </div>
              {gameState.extraTurnPending && (
                <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs animate-bounce-subtle">
                  Bonus Roll!
                </span>
              )}
            </div>

            {/* 4-Corner Layout: Exact Ludo King Style */}
            <div className="w-full max-w-[660px] flex flex-col items-center gap-2.5">
              {/* TOP ROW: Red (Top-Left) & Green (Top-Right) */}
              <div className="w-full flex items-center justify-between gap-3">
                <div className="flex-1 flex justify-start">
                  {redPlayer && (
                    <PlayerCornerDock
                      player={redPlayer}
                      color="RED"
                      isCurrentTurn={currentPlayer.id === 'RED'}
                      isRolling={isRolling}
                      canRoll={canRoll}
                      hasRolled={gameState.hasRolled}
                      currentRoll={gameState.currentRoll}
                      hasLegalMoves={gameState.legalMoves.length > 0}
                      rank={
                        gameState.ranking.indexOf('RED') !== -1
                          ? gameState.ranking.indexOf('RED') + 1
                          : undefined
                      }
                      onRollDice={handleRollDice}
                      corner="top-left"
                    />
                  )}
                </div>

                <div className="flex-1 flex justify-end">
                  {greenPlayer && (
                    <PlayerCornerDock
                      player={greenPlayer}
                      color="GREEN"
                      isCurrentTurn={currentPlayer.id === 'GREEN'}
                      isRolling={isRolling}
                      canRoll={canRoll}
                      hasRolled={gameState.hasRolled}
                      currentRoll={gameState.currentRoll}
                      hasLegalMoves={gameState.legalMoves.length > 0}
                      rank={
                        gameState.ranking.indexOf('GREEN') !== -1
                          ? gameState.ranking.indexOf('GREEN') + 1
                          : undefined
                      }
                      onRollDice={handleRollDice}
                      corner="top-right"
                    />
                  )}
                </div>
              </div>

              {/* CENTER: The 15x15 Ludo Board */}
              <div className="w-full flex items-center justify-center">
                <LudoBoard
                  state={gameState}
                  onTokenClick={handleSelectToken}
                  animatingTokenPos={animatingToken}
                />
              </div>

              {/* BOTTOM ROW: Blue (Bottom-Left) & Yellow (Bottom-Right) */}
              <div className="w-full flex items-center justify-between gap-3">
                <div className="flex-1 flex justify-start">
                  {bluePlayer && (
                    <PlayerCornerDock
                      player={bluePlayer}
                      color="BLUE"
                      isCurrentTurn={currentPlayer.id === 'BLUE'}
                      isRolling={isRolling}
                      canRoll={canRoll}
                      hasRolled={gameState.hasRolled}
                      currentRoll={gameState.currentRoll}
                      hasLegalMoves={gameState.legalMoves.length > 0}
                      rank={
                        gameState.ranking.indexOf('BLUE') !== -1
                          ? gameState.ranking.indexOf('BLUE') + 1
                          : undefined
                      }
                      onRollDice={handleRollDice}
                      corner="bottom-left"
                    />
                  )}
                </div>

                <div className="flex-1 flex justify-end">
                  {yellowPlayer && (
                    <PlayerCornerDock
                      player={yellowPlayer}
                      color="YELLOW"
                      isCurrentTurn={currentPlayer.id === 'YELLOW'}
                      isRolling={isRolling}
                      canRoll={canRoll}
                      hasRolled={gameState.hasRolled}
                      currentRoll={gameState.currentRoll}
                      hasLegalMoves={gameState.legalMoves.length > 0}
                      rank={
                        gameState.ranking.indexOf('YELLOW') !== -1
                          ? gameState.ranking.indexOf('YELLOW') + 1
                          : undefined
                      }
                      onRollDice={handleRollDice}
                      corner="bottom-right"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 py-2.5 border-t border-white/10 bg-slate-950/70 text-slate-400 text-[11px] flex items-center justify-between">
        <div>
          <span className="font-bold text-slate-300">Ludo Buzz</span> · Complete Standard Rules & Ludo Offline Mode
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRulesOpen(true)}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            How to Play
          </button>
          <span>·</span>
          <button
            onClick={() => setIsTestsOpen(true)}
            className="hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Run Unit Tests
          </button>
        </div>
      </footer>

      {/* Modals */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        currentMode={gameState.mode}
      />

      <TestRunnerModal
        isOpen={isTestsOpen}
        onClose={() => setIsTestsOpen(false)}
      />

      {gameState.phase === 'GAME_OVER' && (
        <WinnerModal
          state={gameState}
          onPlayAgain={handleRestart}
          onReturnToLobby={handleReturnToLobby}
        />
      )}
    </div>
  );
}
