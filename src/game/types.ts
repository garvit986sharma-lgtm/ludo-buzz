/**
 * LUDO BUZZ - Game Type Definitions
 */

export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

export type GameMode = 'STANDARD' | 'LUDO_OFFLINE';

export type TokenPositionType = 'HOME' | 'PATH' | 'HOME_STRETCH' | 'FINISHED';

export type TokenPosition =
  | { type: 'HOME' }
  | { type: 'PATH'; index: number }
  | { type: 'HOME_STRETCH'; index: number }
  | { type: 'FINISHED' };

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  position: TokenPosition;
  stepCount: number; // 0..56 (0 = just exited home onto entry square, 56 = finished)
}

export interface Player {
  id: PlayerColor;
  name: string;
  color: PlayerColor;
  tokens: Token[];
  hasFinished: boolean;
  rank?: number;
  stats: {
    rolls: number;
    sixes: number;
    captures: number;
    finishedCount: number;
  };
}

export interface LegalMove {
  tokenId: number;
  playerId: PlayerColor;
  diceValue: number;
  fromPosition: TokenPosition;
  toPosition: TokenPosition;
  toStepCount: number;
  isExitHome: boolean;
  isFinish: boolean;
  willCapture: boolean;
  capturedTokens: Array<{ playerId: PlayerColor; tokenId: number }>;
}

export interface MoveStep {
  position: TokenPosition;
  stepIndex: number;
  isLast: boolean;
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  player: PlayerColor;
  text: string;
  type: 'ROLL' | 'MOVE' | 'CAPTURE' | 'FINISH' | 'EXTRA_TURN' | 'PASS' | 'WIN';
}

export type GamePhase =
  | 'WAITING_ROLL'
  | 'ROLLING'
  | 'WAITING_MOVE'
  | 'ANIMATING'
  | 'GAME_OVER';

export interface GameState {
  mode: GameMode;
  playerCount: 2 | 3 | 4;
  players: Player[];
  turnIndex: number;
  phase: GamePhase;
  currentRoll: number | null;
  hasRolled: boolean;
  consecutiveSixes: number;
  legalMoves: LegalMove[];
  selectedTokenId: number | null;
  activeMovingToken: {
    playerId: PlayerColor;
    tokenId: number;
    path: MoveStep[];
    currentStepIdx: number;
  } | null;
  winner: PlayerColor | null;
  ranking: PlayerColor[];
  log: GameLogEntry[];
  soundEnabled: boolean;
  autoMoveSingleLegal: boolean;
  lastActionDescription: string | null;
  extraTurnPending: boolean;
  extraTurnReason: 'SIX' | 'CAPTURE' | null;
}
