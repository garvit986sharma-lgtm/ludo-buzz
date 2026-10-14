/**
 * LUDO BUZZ - SVG Board & Pin Marker Tokens
 *
 * Faithfully matches the iconic classic Ludo board layout:
 * - 4 vibrant corner yards (Red top-left, Green top-right, Blue bottom-left, Yellow bottom-right)
 * - 4x4 inner white box with 4 token circular docks
 * - Empty docks show solid colored discs when tokens leave home
 * - 52 crisp path squares with thin slate borders
 * - 5-pointed outlined stars on safe squares: (6,2), (12,6), (8,12), (2,8)
 * - Entry directional arrows: Red →, Green ↓, Yellow ←, Blue ↑
 * - Green home stretch with large directional entry arrow
 * - Center finish triangles meeting cleanly at center
 * - Iconic teardrop pin-marker gotis with white casing and colored inner disc
 */

import React from 'react';
import {
  COLOR_CONFIG,
  HOME_STRETCH_COORDINATES,
  HOME_YARD_SLOTS,
  PATH_COORDINATES,
  SAFE_SQUARES,
  STAR_SQUARES,
} from '../game/constants';
import { GameState, PlayerColor, Token, TokenPosition } from '../game/types';

interface LudoBoardProps {
  state: GameState;
  onTokenClick: (playerId: PlayerColor, tokenId: number) => void;
  animatingTokenPos?: {
    color: PlayerColor;
    id: number;
    coord: { x: number; y: number };
  } | null;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  state,
  onTokenClick,
  animatingTokenPos,
}) => {
  const cellSize = 100;
  const boardSize = 1500;

  // Set of legal tokens that can move
  const legalMoveTokenIds = new Set(
    state.legalMoves.map((m) => `${m.playerId}-${m.tokenId}`)
  );

  // Group tokens by square for dynamic stacking
  const getSquareKey = (pos: TokenPosition, color: PlayerColor): string => {
    if (pos.type === 'HOME') return `HOME-${color}`;
    if (pos.type === 'PATH') return `PATH-${pos.index}`;
    if (pos.type === 'HOME_STRETCH') return `STRETCH-${color}-${pos.index}`;
    return `FINISH-${color}`;
  };

  const tokensBySquare: Record<string, Array<{ token: Token; playerColor: PlayerColor }>> = {};

  for (const player of state.players) {
    for (const token of player.tokens) {
      if (
        animatingTokenPos &&
        animatingTokenPos.color === token.color &&
        animatingTokenPos.id === token.id
      ) {
        continue;
      }
      const key = getSquareKey(token.position, token.color);
      if (!tokensBySquare[key]) tokensBySquare[key] = [];
      tokensBySquare[key].push({ token, playerColor: player.id });
    }
  }

  // Calculate pixel coordinate for a token
  const calculateTokenPixelPos = (
    token: Token,
    playerColor: PlayerColor
  ): { cx: number; cy: number; scale: number } => {
    if (token.position.type === 'HOME') {
      const slot = HOME_YARD_SLOTS[playerColor][token.id];
      return {
        cx: slot.x * cellSize + cellSize / 2,
        cy: slot.y * cellSize + cellSize / 2,
        scale: 1,
      };
    }

    if (token.position.type === 'FINISHED') {
      const coord = HOME_STRETCH_COORDINATES[playerColor][5];
      const offsets = [
        { dx: -18, dy: -18 },
        { dx: 18, dy: -18 },
        { dx: -18, dy: 18 },
        { dx: 18, dy: 18 },
      ];
      const off = offsets[token.id % 4];
      return {
        cx: coord.x * cellSize + cellSize / 2 + off.dx,
        cy: coord.y * cellSize + cellSize / 2 + off.dy,
        scale: 0.85,
      };
    }

    if (token.position.type === 'HOME_STRETCH') {
      const coord = HOME_STRETCH_COORDINATES[playerColor][token.position.index];
      const key = getSquareKey(token.position, playerColor);
      const group = tokensBySquare[key] || [];
      const indexInGroup = group.findIndex(
        (g) => g.token.id === token.id && g.playerColor === playerColor
      );
      const offset = getStackOffset(indexInGroup, group.length);
      return {
        cx: coord.x * cellSize + cellSize / 2 + offset.dx,
        cy: coord.y * cellSize + cellSize / 2 + offset.dy,
        scale: group.length > 1 ? 0.82 : 1,
      };
    }

    // PATH (0..51)
    const coord = PATH_COORDINATES[token.position.index];
    const key = getSquareKey(token.position, playerColor);
    const group = tokensBySquare[key] || [];
    const indexInGroup = group.findIndex(
      (g) => g.token.id === token.id && g.playerColor === playerColor
    );
    const offset = getStackOffset(indexInGroup, group.length);
    return {
      cx: coord.x * cellSize + cellSize / 2 + offset.dx,
      cy: coord.y * cellSize + cellSize / 2 + offset.dy,
      scale: group.length > 1 ? 0.82 : 1,
    };
  };

  const getStackOffset = (index: number, total: number): { dx: number; dy: number } => {
    if (total <= 1 || index < 0) return { dx: 0, dy: 0 };
    if (total === 2) {
      return index === 0 ? { dx: -16, dy: -16 } : { dx: 16, dy: 16 };
    }
    if (total === 3) {
      if (index === 0) return { dx: -16, dy: -15 };
      if (index === 1) return { dx: 16, dy: -15 };
      return { dx: 0, dy: 16 };
    }
    const positions = [
      { dx: -18, dy: -18 },
      { dx: 18, dy: -18 },
      { dx: -18, dy: 18 },
      { dx: 18, dy: 18 },
    ];
    return positions[index % 4];
  };

  // 5-Point Outlined Star (exact match with image)
  const renderCleanStar = (cx: number, cy: number) => (
    <g transform={`translate(${cx}, ${cy})`}>
      <polygon
        points="0,-26 8,-8 27,-7 12,6 17,25 0,14 -17,25 -12,6 -27,-7 -8,-8"
        fill="#ffffff"
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </g>
  );

  return (
    <div className="relative w-full max-w-[560px] sm:max-w-[620px] aspect-square rounded-[36px] p-2 sm:p-3 bg-gradient-to-br from-[#1b100a] via-[#2c1810] to-[#120a06] shadow-2xl border-4 border-[#5a3622] select-none">
      <svg
        viewBox={`0 0 ${boardSize} ${boardSize}`}
        className="w-full h-full rounded-[28px] shadow-2xl bg-white overflow-hidden"
      >
        <defs>
          <filter id="token-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.35" />
          </filter>
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* 1. BOARD BACKGROUND */}
        <rect x="0" y="0" width={boardSize} height={boardSize} fill="#ffffff" />

        {/* 2. FOUR CORNER HOME BASES (6x6 each = 600x600) */}
        {/* RED BASE (Top-Left) */}
        <rect x="0" y="0" width="600" height="600" fill="#ea1d24" />
        <rect
          x="100"
          y="100"
          width="400"
          height="400"
          rx="16"
          fill="#ffffff"
          stroke="#b80f14"
          strokeWidth="2"
        />

        {/* GREEN BASE (Top-Right) */}
        <rect x="900" y="0" width="600" height="600" fill="#009e49" />
        <rect
          x="1000"
          y="100"
          width="400"
          height="400"
          rx="16"
          fill="#ffffff"
          stroke="#006f33"
          strokeWidth="2"
        />

        {/* BLUE BASE (Bottom-Left) */}
        <rect x="0" y="900" width="600" height="600" fill="#0093e9" />
        <rect
          x="100"
          y="1000"
          width="400"
          height="400"
          rx="16"
          fill="#ffffff"
          stroke="#006cb0"
          strokeWidth="2"
        />

        {/* YELLOW BASE (Bottom-Right) */}
        <rect x="900" y="900" width="600" height="600" fill="#f5b800" />
        <rect
          x="1000"
          y="1000"
          width="400"
          height="400"
          rx="16"
          fill="#ffffff"
          stroke="#b88600"
          strokeWidth="2"
        />

        {/* Yard Token Bases / Docks */}
        {(['RED', 'GREEN', 'YELLOW', 'BLUE'] as PlayerColor[]).map((col) => {
          const player = state.players.find((p) => p.id === col);
          return HOME_YARD_SLOTS[col].map((slot, idx) => {
            const token = player?.tokens[idx];
            const isAtHome = token?.position.type === 'HOME';
            const cx = slot.x * cellSize + cellSize / 2;
            const cy = slot.y * cellSize + cellSize / 2;
            const primaryColor = COLOR_CONFIG[col].primary;
            const secondaryColor = COLOR_CONFIG[col].secondary;

            return (
              <g key={`yard-slot-${col}-${idx}`}>
                {isAtHome ? (
                  // Full dock with concentric rings when token is present
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r="48"
                      fill={secondaryColor}
                      opacity="0.85"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="40"
                      fill={primaryColor}
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="32"
                      fill="#ffffff"
                      opacity="0.3"
                    />
                  </g>
                ) : (
                  // Solid colored flat circle when token has left home (exact detail from user's image!)
                  <circle
                    cx={cx}
                    cy={cy}
                    r="44"
                    fill={primaryColor}
                  />
                )}
              </g>
            );
          });
        })}

        {/* 3. 52 PATH SQUARES */}
        {PATH_COORDINATES.map((coord, idx) => {
          const isStar = STAR_SQUARES.includes(idx);
          const isRedEntry = idx === COLOR_CONFIG.RED.entryIndex;
          const isGreenEntry = idx === COLOR_CONFIG.GREEN.entryIndex;
          const isYellowEntry = idx === COLOR_CONFIG.YELLOW.entryIndex;
          const isBlueEntry = idx === COLOR_CONFIG.BLUE.entryIndex;

          const cx = coord.x * cellSize + cellSize / 2;
          const cy = coord.y * cellSize + cellSize / 2;

          return (
            <g key={`cell-${idx}`}>
              {/* White cell */}
              <rect
                x={coord.x * cellSize}
                y={coord.y * cellSize}
                width={cellSize}
                height={cellSize}
                fill={
                  isRedEntry
                    ? '#ea1d24'
                    : isGreenEntry
                    ? '#009e49'
                    : isYellowEntry
                    ? '#f5b800'
                    : isBlueEntry
                    ? '#0093e9'
                    : '#ffffff'
                }
                stroke="#64748b"
                strokeWidth="1.5"
              />

              {/* 5-pointed outlined star on safe squares */}
              {isStar && renderCleanStar(cx, cy)}
            </g>
          );
        })}

        {/* Small Directional Entry Arrows on track edges */}
        {/* Red Entry Arrow: cell (0, 6) points right → */}
        <g transform="translate(50, 650)">
          <path
            d="M -20,-10 L 10,-10 L 10,-20 L 25,0 L 10,20 L 10,10 L -20,10 Z"
            fill="#ea1d24"
            opacity="0.85"
          />
        </g>
        {/* Green Entry Arrow: cell (7, 0) points down ↓ */}
        <g transform="translate(750, 50)">
          <path
            d="M -10,-20 L -10,10 L -20,10 L 0,25 L 20,10 L 10,10 L 10,-20 Z"
            fill="#009e49"
            opacity="0.85"
          />
        </g>
        {/* Yellow Entry Arrow: cell (14, 8) points left ← */}
        <g transform="translate(1450, 850)">
          <path
            d="M 20,-10 L -10,-10 L -10,-20 L -25,0 L -10,20 L -10,10 L 20,10 Z"
            fill="#f5b800"
            opacity="0.85"
          />
        </g>
        {/* Blue Entry Arrow: cell (7, 14) points up ↑ */}
        <g transform="translate(750, 1450)">
          <path
            d="M -10,20 L -10,-10 L -20,-10 L 0,-25 L 20,-10 L 10,-10 L 10,20 Z"
            fill="#0093e9"
            opacity="0.85"
          />
        </g>

        {/* 4. HOME STRETCH PATHS (5 colored squares each) */}
        {/* RED STRETCH (col 1..5, row 7) */}
        {HOME_STRETCH_COORDINATES.RED.slice(0, 5).map((coord, idx) => (
          <rect
            key={`red-stretch-${idx}`}
            x={coord.x * cellSize}
            y={coord.y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#ea1d24"
            stroke="#b80f14"
            strokeWidth="1.5"
          />
        ))}

        {/* GREEN STRETCH (col 7, row 1..5) with large entry arrow */}
        {HOME_STRETCH_COORDINATES.GREEN.slice(0, 5).map((coord, idx) => (
          <rect
            key={`green-stretch-${idx}`}
            x={coord.x * cellSize}
            y={coord.y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#009e49"
            stroke="#006f33"
            strokeWidth="1.5"
          />
        ))}

        {/* Large Green Stretch Directional Arrow (exact from image) */}
        <polygon
          points="715,120 785,120 785,500 830,500 750,590 670,500 715,500"
          fill="#007a38"
          opacity="0.85"
        />

        {/* YELLOW STRETCH (col 9..13, row 7) */}
        {HOME_STRETCH_COORDINATES.YELLOW.slice(0, 5).map((coord, idx) => (
          <rect
            key={`yellow-stretch-${idx}`}
            x={coord.x * cellSize}
            y={coord.y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#f5b800"
            stroke="#b88600"
            strokeWidth="1.5"
          />
        ))}

        {/* BLUE STRETCH (col 7, row 9..13) */}
        {HOME_STRETCH_COORDINATES.BLUE.slice(0, 5).map((coord, idx) => (
          <rect
            key={`blue-stretch-${idx}`}
            x={coord.x * cellSize}
            y={coord.y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#0093e9"
            stroke="#006cb0"
            strokeWidth="1.5"
          />
        ))}

        {/* 5. CENTER FINISH TRIANGLES (meeting at center point 750, 750) */}
        {/* Red Triangle (Left) */}
        <polygon points="600,600 750,750 600,900" fill="#ea1d24" />
        {/* Green Triangle (Top) */}
        <polygon points="600,600 750,750 900,600" fill="#009e49" />
        {/* Yellow Triangle (Right) */}
        <polygon points="900,600 750,750 900,900" fill="#f5b800" />
        {/* Blue Triangle (Bottom) */}
        <polygon points="600,900 750,750 900,900" fill="#0093e9" />

        {/* Center Diagonal Divider Lines */}
        <line x1="600" y1="600" x2="900" y2="900" stroke="#ffffff" strokeWidth="2.5" />
        <line x1="600" y1="900" x2="900" y2="600" stroke="#ffffff" strokeWidth="2.5" />

        {/* 6. TOKENS: AUTHENTIC TEARDROP PIN/MARKER SHAPE */}
        {state.players.map((player) =>
          player.tokens.map((token) => {
            const isCurrentlyAnimating =
              animatingTokenPos &&
              animatingTokenPos.color === player.id &&
              animatingTokenPos.id === token.id;

            let cx: number;
            let cy: number;
            let scale: number;

            if (isCurrentlyAnimating) {
              cx = animatingTokenPos.coord.x * cellSize + cellSize / 2;
              cy = animatingTokenPos.coord.y * cellSize + cellSize / 2;
              scale = 1.15;
            } else {
              const pos = calculateTokenPixelPos(token, player.id);
              cx = pos.cx;
              cy = pos.cy;
              scale = pos.scale;
            }

            const tokenKey = `${player.id}-${token.id}`;
            const isLegal = legalMoveTokenIds.has(tokenKey) && !isCurrentlyAnimating;
            const colorInfo = COLOR_CONFIG[player.id];

            return (
              <g
                key={`pin-token-${player.id}-${token.id}`}
                transform={`translate(${cx}, ${cy}) scale(${scale})`}
                onClick={() => {
                  if (isLegal) {
                    onTokenClick(player.id, token.id);
                  }
                }}
                className={`transition-transform duration-150 ${
                  isLegal ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Legal Move Pulsing Aura */}
                {isLegal && (
                  <circle
                    cx="0"
                    cy="-6"
                    r="44"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="6"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Legal Move Outer Selector Ring */}
                {isLegal && (
                  <circle
                    cx="0"
                    cy="-6"
                    r="40"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="4"
                    strokeDasharray="6 4"
                    className="animate-spin-slow"
                  />
                )}

                {/* Ground Shadow for Pin Marker */}
                <ellipse
                  cx="0"
                  cy="36"
                  rx="16"
                  ry="6"
                  fill="rgba(0,0,0,0.35)"
                  filter="url(#soft-shadow)"
                />

                {/* Pin Shell: White teardrop marker body with outline and drop shadow */}
                <path
                  d="M 0,-34 C 18,-34 30,-22 30,-4 C 30,12 10,26 0,36 C -10,26 -30,12 -30,-4 C -30,-22 -18,-34 0,-34 Z"
                  fill="#ffffff"
                  stroke="#64748b"
                  strokeWidth="2.5"
                  filter="url(#token-shadow)"
                />

                {/* Inner Colored Disc of the Pin */}
                <circle
                  cx="0"
                  cy="-6"
                  r="16"
                  fill={colorInfo.primary}
                  stroke={colorInfo.secondary}
                  strokeWidth="1.5"
                />

                {/* Subtle top specular sheen */}
                <ellipse
                  cx="-4"
                  cy="-10"
                  rx="6"
                  ry="3"
                  transform="rotate(-25, -4, -10)"
                  fill="rgba(255, 255, 255, 0.65)"
                />
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};
