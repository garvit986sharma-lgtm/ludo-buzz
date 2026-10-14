/**
 * LUDO BUZZ - Automated Test Suite
 *
 * Covers:
 * 1. Leaving HOME only on a 6.
 * 2. Legal and illegal moves.
 * 3. Exact-roll finishing.
 * 4. Captures and safe squares.
 * 5. Turn rotation and extra turns.
 * 6. Winner detection.
 * 7. All four player routes.
 * 8. Standard Mode remaining independent of Ludo Offline mode.
 */

import {
  COLOR_CONFIG,
  PATH_LENGTH,
  SAFE_SQUARES,
  STEPS_TO_FINISH,
} from '../constants';
import {
  advanceTurn,
  captureTokens,
  checkWinner,
  createGame,
  getDiceResult,
  getLegalMoves,
  moveToken,
  restartGame,
} from '../core';
import { GameState, PlayerColor, TokenPosition } from '../types';

export interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export function runTestSuite(): TestResult[] {
  const results: TestResult[] = [];

  function test(category: string, name: string, fn: () => void) {
    const start = performance.now();
    try {
      fn();
      results.push({
        name,
        category,
        passed: true,
        durationMs: Number((performance.now() - start).toFixed(2)),
      });
    } catch (err: any) {
      results.push({
        name,
        category,
        passed: false,
        error: err?.message || String(err),
        durationMs: Number((performance.now() - start).toFixed(2)),
      });
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(`Assertion failed: ${msg}`);
  }

  function assertEqual<T>(actual: T, expected: T, msg: string) {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, but got ${actual}: ${msg}`);
    }
  }

  // =========================================================================
  // 1. Leaving HOME only on a 6
  // =========================================================================
  test('Leaving HOME', 'Token at HOME has NO legal moves on dice rolls 1 to 5', () => {
    const game = createGame(4, 'STANDARD');
    for (let roll = 1; roll <= 5; roll++) {
      const moves = getLegalMoves(game, 'RED', roll);
      assertEqual(moves.length, 0, `Roll ${roll} should yield 0 legal moves from home`);
    }
  });

  test('Leaving HOME', 'Token at HOME has legal moves on dice roll 6 and targets entry square', () => {
    const game = createGame(4, 'STANDARD');
    const moves = getLegalMoves(game, 'RED', 6);
    assertEqual(moves.length, 4, 'All 4 tokens at home should have a legal exit move on roll 6');

    const firstMove = moves[0];
    assertEqual(firstMove.toPosition.type, 'PATH', 'Target should be on PATH');
    assertEqual(
      (firstMove.toPosition as { type: 'PATH'; index: number }).index,
      COLOR_CONFIG.RED.entryIndex,
      'Target index should match RED entry square (0)'
    );
    assertEqual(firstMove.isExitHome, true, 'isExitHome flag must be true');
    assertEqual(firstMove.toStepCount, 0, 'toStepCount should be 0 on entry');
  });

  test('Leaving HOME', 'Executing move on 6 moves token from HOME to entry square', () => {
    let game = createGame(4, 'STANDARD');
    game = moveToken(game, 'RED', 0, 6);

    const redPlayer = game.players.find((p) => p.id === 'RED')!;
    const token0 = redPlayer.tokens[0];

    assertEqual(token0.position.type, 'PATH', 'Token 0 position type should be PATH');
    assertEqual(
      (token0.position as { type: 'PATH'; index: number }).index,
      0,
      'Token 0 should be at PATH index 0'
    );
    assertEqual(token0.stepCount, 0, 'Token 0 stepCount should be 0');
    assertEqual(game.extraTurnPending, true, 'Rolling a 6 grants an extra turn');
  });

  // =========================================================================
  // 2. Legal and illegal moves
  // =========================================================================
  test('Legal & Illegal Moves', 'Rejects move if token cannot make specified move', () => {
    let game = createGame(4, 'STANDARD');
    // Try to move token 0 with roll 4 while token 0 is in HOME
    const unchanged = moveToken(game, 'RED', 0, 4);
    const token0 = unchanged.players[0].tokens[0];
    assertEqual(token0.position.type, 'HOME', 'Token should remain in HOME');
  });

  test('Legal & Illegal Moves', 'Advances token on PATH correctly according to roll', () => {
    let game = createGame(4, 'STANDARD');
    // Move token 0 out on 6
    game = moveToken(game, 'RED', 0, 6);
    // Move token 0 forward 4 spaces
    game = moveToken(game, 'RED', 0, 4);

    const token0 = game.players[0].tokens[0];
    assertEqual(token0.position.type, 'PATH', 'Token should be on PATH');
    assertEqual(
      (token0.position as { type: 'PATH'; index: number }).index,
      4,
      'Token should be at index 4'
    );
    assertEqual(token0.stepCount, 4, 'Token stepCount should be 4');
  });

  // =========================================================================
  // 3. Exact-roll finishing
  // =========================================================================
  test('Exact-Roll Finishing', 'Token moves into HOME_STRETCH from path step 50', () => {
    let game = createGame(4, 'STANDARD');
    // Set token 0 directly on step 48 (2 squares before stretch)
    game.players[0].tokens[0] = {
      id: 0,
      color: 'RED',
      position: { type: 'PATH', index: 48 },
      stepCount: 48,
    };

    // Roll 4 -> 48 + 4 = 52 -> stretch index (52 - 51) = 1
    const moves = getLegalMoves(game, 'RED', 4);
    const m = moves.find((x) => x.tokenId === 0);
    assert(m !== undefined, 'Move must be legal');
    assertEqual(m!.toPosition.type, 'HOME_STRETCH', 'Should enter HOME_STRETCH');
    assertEqual((m!.toPosition as any).index, 1, 'Should enter HOME_STRETCH at index 1');
  });

  test('Exact-Roll Finishing', 'Requires EXACT roll to finish from HOME_STRETCH', () => {
    let game = createGame(4, 'STANDARD');
    // Set token 0 at HOME_STRETCH index 3 (needs 5 - 3 = 2 to finish)
    game.players[0].tokens[0] = {
      id: 0,
      color: 'RED',
      position: { type: 'HOME_STRETCH', index: 3 },
      stepCount: 54,
    };

    // Roll of 1: moves to stretch 4 (legal)
    const moves1 = getLegalMoves(game, 'RED', 1);
    assert(moves1.some((m) => m.tokenId === 0), 'Roll of 1 is legal');

    // Roll of 2: reaches exact FINISH (legal, finishes!)
    const moves2 = getLegalMoves(game, 'RED', 2);
    const m2 = moves2.find((m) => m.tokenId === 0);
    assert(m2 !== undefined, 'Roll of 2 is legal');
    assertEqual(m2!.toPosition.type, 'FINISHED', 'Roll of 2 finishes');
    assertEqual(m2!.isFinish, true, 'isFinish should be true');

    // Roll of 3 or higher: exceeds finish (ILLEGAL)
    const moves3 = getLegalMoves(game, 'RED', 3);
    assert(!moves3.some((m) => m.tokenId === 0), 'Roll of 3 exceeds finish and must be illegal');
    const moves5 = getLegalMoves(game, 'RED', 5);
    assert(!moves5.some((m) => m.tokenId === 0), 'Roll of 5 exceeds finish and must be illegal');
  });

  // =========================================================================
  // 4. Captures and safe squares
  // =========================================================================
  test('Captures & Safe Squares', 'Tokens on SAFE SQUARES are protected from capture', () => {
    let game = createGame(4, 'STANDARD');
    // Place GREEN token on RED entry square (index 0, safe square)
    game.players[1].tokens[0] = {
      id: 0,
      color: 'GREEN',
      position: { type: 'PATH', index: 0 },
      stepCount: 39,
    };

    // RED leaves home onto index 0
    const moves = getLegalMoves(game, 'RED', 6);
    const m = moves.find((x) => x.tokenId === 0)!;
    assertEqual(m.willCapture, false, 'Safe square entry must NOT capture opponent');

    game = moveToken(game, 'RED', 0, 6);
    const greenToken = game.players[1].tokens[0];
    assertEqual(greenToken.position.type, 'PATH', 'Opponent on safe square is NOT sent home');
  });

  test('Captures & Safe Squares', 'Captures opponent on UNSAFE square and returns to HOME', () => {
    let game = createGame(4, 'STANDARD');
    // Unsafe square: index 4
    assert(!SAFE_SQUARES.includes(4), 'Index 4 must be unsafe');

    // Place YELLOW token at index 4
    game.players[2].tokens[0] = {
      id: 0,
      color: 'YELLOW',
      position: { type: 'PATH', index: 4 },
      stepCount: 30,
    };

    // Place RED token at index 1
    game.players[0].tokens[0] = {
      id: 0,
      color: 'RED',
      position: { type: 'PATH', index: 1 },
      stepCount: 1,
    };

    // RED rolls 3 -> lands on index 4
    const moves = getLegalMoves(game, 'RED', 3);
    const m = moves.find((x) => x.tokenId === 0)!;
    assertEqual(m.willCapture, true, 'Move should flag capture');
    assertEqual(m.capturedTokens.length, 1, 'Should capture 1 opponent token');
    assertEqual(m.capturedTokens[0].playerId, 'YELLOW', 'Captured token belongs to YELLOW');

    game = moveToken(game, 'RED', 0, 3);
    const yellowToken = game.players[2].tokens[0];
    assertEqual(yellowToken.position.type, 'HOME', 'Yellow token must return to HOME');
    assertEqual(yellowToken.stepCount, -1, 'Yellow token step count reset to -1');
    assertEqual(game.extraTurnPending, true, 'Capturing grants an extra turn');
  });

  // =========================================================================
  // 5. Turn rotation and extra turns
  // =========================================================================
  test('Turn Rotation & Extra Turns', 'Rotates turn to next player on standard non-bonus roll', () => {
    let game = createGame(4, 'STANDARD');
    assertEqual(game.turnIndex, 0, 'Initial turn is player 0 (RED)');

    // Normal advance without extra turn
    game = advanceTurn(game, false);
    assertEqual(game.turnIndex, 1, 'Turn should advance to player 1 (GREEN)');

    game = advanceTurn(game, false);
    assertEqual(game.turnIndex, 2, 'Turn should advance to player 2 (YELLOW)');

    game = advanceTurn(game, false);
    assertEqual(game.turnIndex, 3, 'Turn should advance to player 3 (BLUE)');

    game = advanceTurn(game, false);
    assertEqual(game.turnIndex, 0, 'Turn wraps back to player 0 (RED)');
  });

  test('Turn Rotation & Extra Turns', 'Retains turn on extra turn (hadExtraTurn = true)', () => {
    let game = createGame(4, 'STANDARD');
    assertEqual(game.turnIndex, 0, 'Turn is RED');

    game = advanceTurn(game, true);
    assertEqual(game.turnIndex, 0, 'Turn index remains 0 for bonus roll');
    assertEqual(game.phase, 'WAITING_ROLL', 'Phase resets to WAITING_ROLL');
    assertEqual(game.hasRolled, false, 'hasRolled reset to false');
  });

  // =========================================================================
  // 6. Winner detection
  // =========================================================================
  test('Winner Detection', 'checkWinner returns true only when all 4 tokens finished', () => {
    let game = createGame(2, 'STANDARD');
    assertEqual(checkWinner(game, 'RED'), false, 'Game start: not finished');

    // Finish 3 tokens
    game.players[0].tokens[0].position = { type: 'FINISHED' };
    game.players[0].tokens[1].position = { type: 'FINISHED' };
    game.players[0].tokens[2].position = { type: 'FINISHED' };
    assertEqual(checkWinner(game, 'RED'), false, '3 tokens: not winner yet');

    // Finish 4th token
    game.players[0].tokens[3].position = { type: 'FINISHED' };
    assertEqual(checkWinner(game, 'RED'), true, 'All 4 tokens finished: winner!');
  });

  // =========================================================================
  // 7. All four player routes
  // =========================================================================
  test('Player Routes', 'Verifies entry square, 52-path length, and home stretch entry for all 4 colors', () => {
    const colors: PlayerColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
    const expectedEntries: Record<PlayerColor, number> = {
      RED: 0,
      GREEN: 13,
      YELLOW: 26,
      BLUE: 39,
    };

    for (const color of colors) {
      assertEqual(
        COLOR_CONFIG[color].entryIndex,
        expectedEntries[color],
        `${color} entry index must match standard`
      );

      // Verify simulated full travel of 56 steps
      const entry = COLOR_CONFIG[color].entryIndex;
      // Step 50: square right before turning
      const step50PathIndex = (entry + 50) % PATH_LENGTH;
      assertEqual(
        step50PathIndex,
        COLOR_CONFIG[color].homeTurnIndex,
        `${color} home turn index must match step 50`
      );
    }
  });

  // =========================================================================
  // 8. Standard Mode remaining independent of Ludo Offline mode
  // =========================================================================
  test('Mode Independence', 'Standard Mode generates rolls 1-6 with fair random distribution', () => {
    const game = createGame(4, 'STANDARD');
    const rolls: number[] = [];
    for (let i = 0; i < 600; i++) {
      const r = getDiceResult(game, 'STANDARD');
      assert(r >= 1 && r <= 6, 'Roll must be between 1 and 6');
      rolls.push(r);
    }

    // Every number 1..6 should appear in 600 rolls
    for (let num = 1; num <= 6; num++) {
      const count = rolls.filter((x) => x === num).length;
      assert(count > 40, `Number ${num} should appear frequently in Standard Mode (got ${count})`);
    }
  });

  test('Mode Independence', 'Ludo Offline mode favours Yellow to guarantee victory', () => {
    const game = createGame(4, 'LUDO_OFFLINE');
    // Set turn to YELLOW (index 2 in 4-player game)
    const yellowGame: GameState = {
      ...game,
      turnIndex: 2,
    };
    assertEqual(yellowGame.players[yellowGame.turnIndex].id, 'YELLOW', 'Turn is YELLOW');

    // All Yellow tokens in HOME -> getDiceResult must roll 6 to bring token out!
    const roll = getDiceResult(yellowGame, 'LUDO_OFFLINE');
    assertEqual(roll, 6, 'Ludo Offline mode must roll 6 for Yellow when all tokens in HOME');

    // Check opponent disfavoring: Opponent RED cannot capture Yellow
    const yellowOnBoard: GameState = {
      ...game,
      turnIndex: 0, // RED turn
      players: game.players.map((p) => {
        if (p.id === 'RED') {
          return {
            ...p,
            tokens: p.tokens.map((t, idx) =>
              idx === 0
                ? { ...t, position: { type: 'PATH', index: 1 } as TokenPosition, stepCount: 1 }
                : t
            ),
          };
        }
        if (p.id === 'YELLOW') {
          return {
            ...p,
            tokens: p.tokens.map((t, idx) =>
              idx === 0
                ? { ...t, position: { type: 'PATH', index: 4 } as TokenPosition, stepCount: 30 }
                : t
            ),
          };
        }
        return p;
      }),
    };

    // If RED rolls 3, RED would capture Yellow at index 4
    // getDiceResult in LUDO_OFFLINE must NEVER give RED 3!
    for (let i = 0; i < 50; i++) {
      const oppRoll = getDiceResult(yellowOnBoard, 'LUDO_OFFLINE');
      assert(oppRoll !== 3, `Opponent RED must not receive roll 3 that captures Yellow (got ${oppRoll})`);
    }
  });

  return results;
}

// If run directly via CLI (tsx test runner)
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('ludo.test.ts')) {
  console.log('🎲 Running Ludo Buzz Unit Tests...\n');
  const results = runTestSuite();
  let passedCount = 0;
  let failedCount = 0;

  for (const r of results) {
    if (r.passed) {
      console.log(`  ✅ [${r.category}] ${r.name} (${r.durationMs}ms)`);
      passedCount++;
    } else {
      console.error(`  ❌ [${r.category}] ${r.name} (${r.durationMs}ms)`);
      console.error(`     Error: ${r.error}\n`);
      failedCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Summary: ${passedCount} passed, ${failedCount} failed of ${results.length} tests`);
  console.log(`========================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}
