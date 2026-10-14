/**
 * LUDO BUZZ - Core Game Logic & Rule Engine
 *
 * Implements:
 * - createGame(playerCount, mode)
 * - getDiceResult(state, mode)
 * - getLegalMoves(state, playerId, diceValue)
 * - moveToken(state, playerId, tokenId, diceValue)
 * - captureTokens(state, playerId, tokenId)
 * - advanceTurn(state, hadExtraTurn)
 * - checkWinner(state, playerId)
 * - restartGame(state)
 */

import {
  COLOR_CONFIG,
  PATH_LENGTH,
  PLAYER_CONFIGS,
  SAFE_SQUARES,
  STEPS_TO_FINISH,
} from './constants';
import {
  GameMode,
  GameState,
  LegalMove,
  MoveStep,
  Player,
  PlayerColor,
  Token,
  TokenPosition,
} from './types';

/**
 * Creates and initializes a new Ludo game.
 */
export function createGame(playerCount: 2 | 3 | 4, mode: GameMode = 'STANDARD'): GameState {
  const colorOrder = PLAYER_CONFIGS[playerCount];

  const players: Player[] = colorOrder.map((color) => ({
    id: color,
    name: COLOR_CONFIG[color].name,
    color,
    tokens: [0, 1, 2, 3].map((id) => ({
      id,
      color,
      position: { type: 'HOME' } as TokenPosition,
      stepCount: -1,
    })),
    hasFinished: false,
    stats: {
      rolls: 0,
      sixes: 0,
      captures: 0,
      finishedCount: 0,
    },
  }));

  return {
    mode,
    playerCount,
    players,
    turnIndex: 0,
    phase: 'WAITING_ROLL',
    currentRoll: null,
    hasRolled: false,
    consecutiveSixes: 0,
    legalMoves: [],
    selectedTokenId: null,
    activeMovingToken: null,
    winner: null,
    ranking: [],
    log: [
      {
        id: 'init-0',
        timestamp: Date.now(),
        player: players[0].id,
        text: `Game started in ${mode === 'LUDO_OFFLINE' ? 'Ludo Offline' : 'Standard'} Mode with ${playerCount} players.`,
        type: 'ROLL',
      },
    ],
    soundEnabled: true,
    autoMoveSingleLegal: true,
    lastActionDescription: `Game started. ${players[0].name}'s turn to roll!`,
    extraTurnPending: false,
    extraTurnReason: null,
  };
}

/**
 * Check if a token has reached or can reach the final square.
 */
export function isPositionFinished(pos: TokenPosition): boolean {
  return pos.type === 'FINISHED';
}

/**
 * Checks if a path index is a safe square.
 */
export function isSafeSquare(pathIndex: number): boolean {
  return SAFE_SQUARES.includes(pathIndex);
}

/**
 * Calculates all legal moves for a player given a dice value.
 */
export function getLegalMoves(
  state: GameState,
  playerId: PlayerColor,
  diceValue: number
): LegalMove[] {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.hasFinished) return [];

  const legalMoves: LegalMove[] = [];
  const entryIndex = COLOR_CONFIG[playerId].entryIndex;

  for (const token of player.tokens) {
    // If token already finished, no moves possible
    if (token.position.type === 'FINISHED') continue;

    // Token at HOME: can only leave on a roll of 6
    if (token.position.type === 'HOME') {
      if (diceValue === 6) {
        // Leaving home to entry square
        const targetPos: TokenPosition = { type: 'PATH', index: entryIndex };
        legalMoves.push({
          tokenId: token.id,
          playerId,
          diceValue,
          fromPosition: token.position,
          toPosition: targetPos,
          toStepCount: 0,
          isExitHome: true,
          isFinish: false,
          willCapture: false, // Entry square is a safe square
          capturedTokens: [],
        });
      }
      continue;
    }

    // Token on PATH (stepCount 0..50)
    if (token.position.type === 'PATH') {
      const nextStep = token.stepCount + diceValue;

      if (nextStep <= 50) {
        // Still on main path
        const nextPathIndex = (entryIndex + nextStep) % PATH_LENGTH;
        const targetPos: TokenPosition = { type: 'PATH', index: nextPathIndex };

        // Check if lands on opponent tokens
        const capturedTokens: Array<{ playerId: PlayerColor; tokenId: number }> = [];
        if (!isSafeSquare(nextPathIndex)) {
          for (const otherPlayer of state.players) {
            if (otherPlayer.id === playerId) continue;
            for (const otherToken of otherPlayer.tokens) {
              if (
                otherToken.position.type === 'PATH' &&
                otherToken.position.index === nextPathIndex
              ) {
                capturedTokens.push({ playerId: otherPlayer.id, tokenId: otherToken.id });
              }
            }
          }
        }

        legalMoves.push({
          tokenId: token.id,
          playerId,
          diceValue,
          fromPosition: token.position,
          toPosition: targetPos,
          toStepCount: nextStep,
          isExitHome: false,
          isFinish: false,
          willCapture: capturedTokens.length > 0,
          capturedTokens,
        });
      } else {
        // Enters home stretch!
        // nextStep 51 -> stretch 0; nextStep 56 -> finish (stretch 5)
        const stretchIdx = nextStep - 51;

        if (stretchIdx < 5) {
          // Inside home stretch
          legalMoves.push({
            tokenId: token.id,
            playerId,
            diceValue,
            fromPosition: token.position,
            toPosition: { type: 'HOME_STRETCH', index: stretchIdx },
            toStepCount: nextStep,
            isExitHome: false,
            isFinish: false,
            willCapture: false,
            capturedTokens: [],
          });
        } else if (stretchIdx === 5) {
          // Exact roll to finish!
          legalMoves.push({
            tokenId: token.id,
            playerId,
            diceValue,
            fromPosition: token.position,
            toPosition: { type: 'FINISHED' },
            toStepCount: STEPS_TO_FINISH,
            isExitHome: false,
            isFinish: true,
            willCapture: false,
            capturedTokens: [],
          });
        }
        // If stretchIdx > 5: exceeds finish! ILLEGAL, exact roll required.
      }
      continue;
    }

    // Token in HOME_STRETCH (index 0..4)
    if (token.position.type === 'HOME_STRETCH') {
      const currentIdx = token.position.index;
      const nextIdx = currentIdx + diceValue;

      if (nextIdx < 5) {
        legalMoves.push({
          tokenId: token.id,
          playerId,
          diceValue,
          fromPosition: token.position,
          toPosition: { type: 'HOME_STRETCH', index: nextIdx },
          toStepCount: 51 + nextIdx,
          isExitHome: false,
          isFinish: false,
          willCapture: false,
          capturedTokens: [],
        });
      } else if (nextIdx === 5) {
        // Exact finish!
        legalMoves.push({
          tokenId: token.id,
          playerId,
          diceValue,
          fromPosition: token.position,
          toPosition: { type: 'FINISHED' },
          toStepCount: STEPS_TO_FINISH,
          isExitHome: false,
          isFinish: true,
          willCapture: false,
          capturedTokens: [],
        });
      }
      // If nextIdx > 5: exceeds finish! ILLEGAL.
    }
  }

  return legalMoves;
}

/**
 * Calculates intermediate steps taken by a token during a move (for animations).
 */
export function calculateTokenPath(
  state: GameState,
  playerId: PlayerColor,
  tokenId: number,
  diceValue: number
): MoveStep[] {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return [];
  const token = player.tokens.find((t) => t.id === tokenId);
  if (!token) return [];

  const entryIndex = COLOR_CONFIG[playerId].entryIndex;
  const steps: MoveStep[] = [];

  if (token.position.type === 'HOME') {
    if (diceValue === 6) {
      steps.push({
        position: { type: 'PATH', index: entryIndex },
        stepIndex: 0,
        isLast: true,
      });
    }
    return steps;
  }

  const startStep = token.stepCount;
  for (let s = 1; s <= diceValue; s++) {
    const curStep = startStep + s;
    const isLast = s === diceValue;

    if (curStep <= 50) {
      const pIdx = (entryIndex + curStep) % PATH_LENGTH;
      steps.push({
        position: { type: 'PATH', index: pIdx },
        stepIndex: curStep,
        isLast,
      });
    } else {
      const stretchIdx = curStep - 51;
      if (stretchIdx < 5) {
        steps.push({
          position: { type: 'HOME_STRETCH', index: stretchIdx },
          stepIndex: curStep,
          isLast,
        });
      } else if (stretchIdx === 5) {
        steps.push({
          position: { type: 'FINISHED' },
          stepIndex: curStep,
          isLast,
        });
      }
    }
  }

  return steps;
}

/**
 * Captures any opponent tokens occupying the same unsafe PATH square.
 * Returns the updated state and the count of captured tokens.
 */
export function captureTokens(
  state: GameState,
  playerId: PlayerColor,
  tokenId: number
): { state: GameState; capturedCount: number } {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { state, capturedCount: 0 };
  const token = player.tokens.find((t) => t.id === tokenId);
  if (!token || token.position.type !== 'PATH') return { state, capturedCount: 0 };

  const pathIndex = token.position.index;
  // Tokens on safe squares cannot be captured
  if (isSafeSquare(pathIndex)) return { state, capturedCount: 0 };

  let capturedCount = 0;
  const newPlayers = state.players.map((p) => {
    if (p.id === playerId) return p;

    let opponentTokensCaptured = 0;
    const updatedTokens = p.tokens.map((t) => {
      if (t.position.type === 'PATH' && t.position.index === pathIndex) {
        opponentTokensCaptured++;
        capturedCount++;
        return {
          ...t,
          position: { type: 'HOME' } as TokenPosition,
          stepCount: -1,
        };
      }
      return t;
    });

    if (opponentTokensCaptured > 0) {
      return {
        ...p,
        tokens: updatedTokens,
      };
    }
    return p;
  });

  if (capturedCount > 0) {
    const updatedState: GameState = {
      ...state,
      players: newPlayers.map((p) =>
        p.id === playerId
          ? {
              ...p,
              stats: {
                ...p.stats,
                captures: p.stats.captures + capturedCount,
              },
            }
          : p
      ),
      log: [
        {
          id: `cap-${Date.now()}`,
          timestamp: Date.now(),
          player: playerId,
          text: `${player.name} captured ${capturedCount} opponent token(s)!`,
          type: 'CAPTURE',
        },
        ...state.log.slice(0, 40),
      ],
    };
    return { state: updatedState, capturedCount };
  }

  return { state, capturedCount: 0 };
}

/**
 * Executes a token move on the board.
 * Enforces exact rules, handles captures, and determines extra turns.
 */
export function moveToken(
  state: GameState,
  playerId: PlayerColor,
  tokenId: number,
  diceValue: number
): GameState {
  const legalMoves = getLegalMoves(state, playerId, diceValue);
  const move = legalMoves.find((m) => m.tokenId === tokenId);

  if (!move) {
    // Illegal move attempt
    return state;
  }

  // Update token position
  const players = state.players.map((p) => {
    if (p.id !== playerId) return p;

    const tokens = p.tokens.map((t) => {
      if (t.id !== tokenId) return t;
      return {
        ...t,
        position: move.toPosition,
        stepCount: move.toStepCount,
      };
    });

    const finishedCount = tokens.filter((t) => t.position.type === 'FINISHED').length;
    const hasFinished = finishedCount === 4;

    return {
      ...p,
      tokens,
      hasFinished,
      stats: {
        ...p.stats,
        finishedCount,
      },
    };
  });

  let nextState: GameState = {
    ...state,
    players,
    hasRolled: true,
    legalMoves: [],
    selectedTokenId: null,
  };

  // Perform captures if token lands on opponent
  const captureResult = captureTokens(nextState, playerId, tokenId);
  nextState = captureResult.state;
  const didCapture = captureResult.capturedCount > 0;

  // Check if player won / finished
  const playerFinished = checkWinner(nextState, playerId);
  if (playerFinished && !nextState.ranking.includes(playerId)) {
    const newRanking = [...nextState.ranking, playerId];
    const winner = nextState.winner ?? playerId;

    nextState = {
      ...nextState,
      ranking: newRanking,
      winner,
      log: [
        {
          id: `win-${Date.now()}`,
          timestamp: Date.now(),
          player: playerId,
          text: `🎉 ${COLOR_CONFIG[playerId].name} has finished all 4 tokens!`,
          type: 'WIN',
        },
        ...nextState.log.slice(0, 40),
      ],
    };

    // If only one player remaining who hasn't finished, game ends
    const unfinishedPlayers = nextState.players.filter((p) => !p.hasFinished);
    if (unfinishedPlayers.length <= 1) {
      if (unfinishedPlayers.length === 1 && !newRanking.includes(unfinishedPlayers[0].id)) {
        nextState.ranking.push(unfinishedPlayers[0].id);
      }
      nextState.phase = 'GAME_OVER';
      return nextState;
    }
  }

  // Extra turn rules:
  // - Extra turn on 6
  // - Extra turn on capture
  // Note: if consecutive sixes reached 3, turn is forfeited
  let grantExtraTurn = false;
  let extraReason: 'SIX' | 'CAPTURE' | null = null;

  if (!playerFinished) {
    if (didCapture) {
      grantExtraTurn = true;
      extraReason = 'CAPTURE';
    } else if (diceValue === 6) {
      if (state.consecutiveSixes < 2) {
        grantExtraTurn = true;
        extraReason = 'SIX';
      }
    }
  }

  nextState.extraTurnPending = grantExtraTurn;
  nextState.extraTurnReason = extraReason;

  // Log action
  const playerName = COLOR_CONFIG[playerId].name;
  let actionDesc = '';
  if (move.isExitHome) {
    actionDesc = `${playerName} brought token #${tokenId + 1} onto the board!`;
  } else if (move.isFinish) {
    actionDesc = `${playerName}'s token #${tokenId + 1} reached HOME FINISH!`;
  } else if (didCapture) {
    actionDesc = `${playerName} moved and captured an opponent token! Bonus turn!`;
  } else if (grantExtraTurn && extraReason === 'SIX') {
    actionDesc = `${playerName} moved token #${tokenId + 1}. Rolled a 6, gets another roll!`;
  } else {
    actionDesc = `${playerName} moved token #${tokenId + 1} ${diceValue} spaces.`;
  }

  nextState.lastActionDescription = actionDesc;

  return nextState;
}

/**
 * Checks if a player has won the game (all 4 tokens finished).
 */
export function checkWinner(state: GameState, playerId: PlayerColor): boolean {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return false;
  return player.tokens.every((t) => t.position.type === 'FINISHED');
}

/**
 * Advances the turn to the next active player, or retains turn on bonus roll.
 */
export function advanceTurn(state: GameState, hadExtraTurn: boolean = false): GameState {
  if (state.phase === 'GAME_OVER') return state;

  if (hadExtraTurn) {
    return {
      ...state,
      phase: 'WAITING_ROLL',
      currentRoll: null,
      hasRolled: false,
      legalMoves: [],
      selectedTokenId: null,
      activeMovingToken: null,
      extraTurnPending: false,
      extraTurnReason: null,
    };
  }

  // Find next unfinished player
  const numPlayers = state.players.length;
  let nextTurnIndex = (state.turnIndex + 1) % numPlayers;
  let loops = 0;

  while (state.players[nextTurnIndex].hasFinished && loops < numPlayers) {
    nextTurnIndex = (nextTurnIndex + 1) % numPlayers;
    loops++;
  }

  if (loops >= numPlayers) {
    // All players finished
    return {
      ...state,
      phase: 'GAME_OVER',
    };
  }

  const nextPlayer = state.players[nextTurnIndex];

  return {
    ...state,
    turnIndex: nextTurnIndex,
    phase: 'WAITING_ROLL',
    currentRoll: null,
    hasRolled: false,
    consecutiveSixes: 0,
    legalMoves: [],
    selectedTokenId: null,
    activeMovingToken: null,
    extraTurnPending: false,
    extraTurnReason: null,
    lastActionDescription: `${nextPlayer.name}'s turn to roll!`,
  };
}

/**
 * Restarts the game with the same mode and player count.
 */
export function restartGame(state: GameState): GameState {
  return createGame(state.playerCount, state.mode);
}

// =========================================================================
// ISOLATED DICE ENGINE: Standard vs Ludo Offline Yellow-favouring rule set
// =========================================================================

/**
 * Pre-planned stealth winning engine for Yellow in Ludo Offline mode:
 * - Does NOT give Yellow suspicious consecutive double turns/6s.
 * - Intelligently pre-plans rolls so Yellow naturally captures opponents,
 *   lands on safe star squares, finishes tokens on exact rolls, and wins.
 * - Suppresses opponent captures of Yellow and guides opponents into Yellow's striking path.
 */
function getYellowFavoringRoll(state: GameState, playerId: PlayerColor): number {
  const isYellow = playerId === 'YELLOW';
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return Math.floor(Math.random() * 6) + 1;

  if (isYellow) {
    // --- YELLOW'S TURN: Pre-planned stealth victory path ---
    const allHome = player.tokens.every((t) => t.position.type === 'HOME');
    if (allHome) {
      // Must roll 6 to get the first token onto the board
      return 6;
    }

    const homeCount = player.tokens.filter((t) => t.position.type === 'HOME').length;
    const activeTokens = player.tokens.filter(
      (t) => t.position.type === 'PATH' || t.position.type === 'HOME_STRETCH'
    );

    const rollScores: { roll: number; score: number }[] = [];

    for (let r = 1; r <= 6; r++) {
      const moves = getLegalMoves(state, 'YELLOW', r);
      if (moves.length === 0) {
        rollScores.push({ roll: r, score: -500 });
        continue;
      }

      let bestScore = -100;
      for (const m of moves) {
        let score = 50;

        // 1. EXACT FINISH: Highest priority to finish tokens directly
        if (m.isFinish) {
          score += 1000;
        }

        // 2. CAPTURE OPPONENT: High priority (grants natural standard extra turn)
        if (m.willCapture) {
          score += 800 + m.capturedTokens.length * 100;
        }

        // 3. SAFE STAR SQUARES: Landing on safe spots guarantees immunity
        if (m.toPosition.type === 'PATH' && isSafeSquare(m.toPosition.index)) {
          score += 500;
        }

        // 4. ADVANCING IN HOME STRETCH: 100% safe path to finish
        if (m.toPosition.type === 'HOME_STRETCH') {
          score += 400 + m.toPosition.index * 30;
        }

        // 5. BRINGING NEW TOKEN OUT:
        // Only bring token out if we have few active tokens on board,
        // and do NOT give continuous 6s (avoid suspicious double chances).
        if (m.isExitHome) {
          if (activeTokens.length === 0) {
            score += 600;
          } else if (activeTokens.length === 1 && state.consecutiveSixes === 0) {
            score += 250;
          } else {
            // If already have multiple active tokens or just rolled 6, lower priority
            score -= 150;
          }
        }

        // 6. STEALTH FACTOR: Avoid giving 6 if Yellow already rolled a 6 this turn
        if (r === 6) {
          if (state.consecutiveSixes >= 1) {
            // Do NOT give double chance / back-to-back 6s
            score -= 300;
          }
        }

        // 7. VULNERABILITY CHECK: Ensure Yellow doesn't land 1..6 spaces in front of opponent
        if (m.toPosition.type === 'PATH' && !isSafeSquare(m.toPosition.index)) {
          const landIdx = m.toPosition.index;
          let inDanger = false;
          for (const opp of state.players) {
            if (opp.id === 'YELLOW') continue;
            for (const oppToken of opp.tokens) {
              if (oppToken.position.type === 'PATH') {
                const dist = (landIdx - oppToken.position.index + PATH_LENGTH) % PATH_LENGTH;
                if (dist >= 1 && dist <= 6) {
                  inDanger = true;
                  break;
                }
              }
            }
            if (inDanger) break;
          }

          if (inDanger) {
            score -= 250; // Penalize vulnerable square
          } else {
            score += 80 + r * 10; // Safe advance
          }
        }

        if (score > bestScore) {
          bestScore = score;
        }
      }

      rollScores.push({ roll: r, score: bestScore });
    }

    // Sort rolls by strategic value
    rollScores.sort((a, b) => b.score - a.score);

    // Pick top calculated move
    const top = rollScores[0];
    if (top && top.score > 0) {
      // Pick highest scoring roll
      return top.roll;
    }

    // Fallback: any legal roll with no consecutive 6 bias
    const legalRolls = [5, 4, 3, 2, 1, 6].filter(
      (r) => getLegalMoves(state, 'YELLOW', r).length > 0
    );
    return legalRolls[0] ?? (Math.floor(Math.random() * 6) + 1);
  } else {
    // --- OPPONENTS' TURN (Red, Green, Blue): Active, realistic play, but pre-planned for Yellow victory ---
    const rollsToAvoid = new Set<number>();
    const yellowPlayer = state.players.find((p) => p.id === 'YELLOW');
    const yellowPositions = yellowPlayer
      ? yellowPlayer.tokens
          .filter((t) => t.position.type === 'PATH')
          .map((t) => (t.position as { type: 'PATH'; index: number }).index)
      : [];

    const homeTokens = player.tokens.filter((t) => t.position.type === 'HOME').length;
    const activeTokens = player.tokens.filter(
      (t) => t.position.type === 'PATH' || t.position.type === 'HOME_STRETCH'
    );
    const finishedTokens = player.tokens.filter((t) => t.position.type === 'FINISHED').length;

    for (let r = 1; r <= 6; r++) {
      const moves = getLegalMoves(state, playerId, r);

      // CRITICAL RULE 1: NEVER allow opponent to capture any Yellow token!
      const capturesYellow = moves.some((m) =>
        m.capturedTokens.some((c) => c.playerId === 'YELLOW')
      );
      if (capturesYellow) {
        rollsToAvoid.add(r);
        continue;
      }

      // CRITICAL RULE 2: Opponent must NEVER win before Yellow!
      // If this roll would finish the 4th token for the opponent, block it!
      if (finishedTokens === 3) {
        const finishesGame = moves.some((m) => m.isFinish);
        if (finishesGame && !state.ranking.includes('YELLOW')) {
          rollsToAvoid.add(r);
          continue;
        }
      }
    }

    // Determine candidate safe rolls
    const safeRolls = [1, 2, 3, 4, 5, 6].filter((r) => !rollsToAvoid.has(r));

    // Opponent tokens MUST COME OUT onto the board naturally!
    // If opponent has all 4 tokens in home, give 6 with generous probability (~45%)
    if (homeTokens === 4 && safeRolls.includes(6)) {
      if (Math.random() < 0.45) {
        return 6;
      }
    } else if (homeTokens > 0 && activeTokens.length < 2 && safeRolls.includes(6)) {
      // If 1 or fewer tokens on board, give 6 with 35% chance to bring more tokens out!
      if (Math.random() < 0.35) {
        return 6;
      }
    }

    // Score remaining safe moves strategically:
    // We want opponents to move actively, but we prefer moves that:
    // 1) Land on unsafe squares 1..6 steps ahead of Yellow (bait for Yellow to capture!)
    // 2) Keep opponent moving around the board naturally without capturing Yellow
    const scoredRolls: { roll: number; score: number }[] = [];

    for (const r of safeRolls) {
      const moves = getLegalMoves(state, playerId, r);
      let score = 50 + Math.random() * 20; // natural variation

      if (moves.length === 0) {
        score -= 100;
      } else {
        for (const m of moves) {
          // If this move puts opponent right in front of Yellow on an unsafe square:
          if (m.toPosition.type === 'PATH' && !isSafeSquare(m.toPosition.index)) {
            const oppLandIdx = m.toPosition.index;
            for (const yIdx of yellowPositions) {
              const distFromYellow = (oppLandIdx - yIdx + PATH_LENGTH) % PATH_LENGTH;
              if (distFromYellow >= 1 && distFromYellow <= 6) {
                score += 150; // Ideal: Yellow can capture on its turn!
              }
            }
          }

          // Normal forward movement is encouraged!
          if (m.toPosition.type === 'PATH') {
            score += 20;
          }
        }
      }

      scoredRolls.push({ roll: r, score });
    }

    scoredRolls.sort((a, b) => b.score - a.score);
    if (scoredRolls.length > 0) {
      // Pick among top 2 moves so opponents play naturally and unpredictably
      const topCount = Math.min(2, scoredRolls.length);
      const chosen = scoredRolls[Math.floor(Math.random() * topCount)];
      return chosen.roll;
    }

    // Fallback safe roll
    return safeRolls[0] ?? 1;
  }
}

/**
 * Returns a dice result based on the game mode and state.
 * In Standard Mode, uses fair unbiased randomness (1-6).
 * In Ludo Offline Mode, routes to the isolated Yellow-favouring rule set.
 */
export function getDiceResult(state: GameState, mode: GameMode = state.mode): number {
  const currentPlayer = state.players[state.turnIndex];
  if (!currentPlayer) return Math.floor(Math.random() * 6) + 1;

  if (mode === 'LUDO_OFFLINE') {
    return getYellowFavoringRoll(state, currentPlayer.id);
  }

  // Standard Mode: Fair random roll between 1 and 6
  return Math.floor(Math.random() * 6) + 1;
}
