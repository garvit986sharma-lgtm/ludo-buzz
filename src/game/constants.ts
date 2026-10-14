/**
 * LUDO BUZZ - Game Constants & Board Layout Mapping
 */

import { PlayerColor } from './types';

export const PATH_LENGTH = 52;
export const HOME_STRETCH_LENGTH = 6; // 0..5 (5 is FINISHED)
export const STEPS_TO_FINISH = 56; // 0..50 on path, 51..55 in stretch, 56 is finish

export interface BoardCoord {
  x: number; // grid col 0..14
  y: number; // grid row 0..14
}

export const COLOR_CONFIG: Record<
  PlayerColor,
  {
    name: string;
    primary: string;
    secondary: string;
    light: string;
    bgHex: string;
    borderHex: string;
    glowHex: string;
    tokenHex: string;
    entryIndex: number; // Path index where token enters from home
    homeTurnIndex: number; // Path index after which token turns into stretch
    homeYardOrigin: BoardCoord;
  }
> = {
  RED: {
    name: 'Red',
    primary: '#ea1d24',
    secondary: '#b80f14',
    light: '#fee2e2',
    bgHex: '#ea1d24',
    borderHex: '#b80f14',
    glowHex: 'rgba(234, 29, 36, 0.4)',
    tokenHex: '#ea1d24',
    entryIndex: 0,
    homeTurnIndex: 50,
    homeYardOrigin: { x: 0, y: 0 },
  },
  GREEN: {
    name: 'Green',
    primary: '#009e49',
    secondary: '#006f33',
    light: '#dcfce7',
    bgHex: '#009e49',
    borderHex: '#006f33',
    glowHex: 'rgba(0, 158, 73, 0.4)',
    tokenHex: '#009e49',
    entryIndex: 13,
    homeTurnIndex: 11,
    homeYardOrigin: { x: 9, y: 0 },
  },
  YELLOW: {
    name: 'Yellow',
    primary: '#f5b800',
    secondary: '#b88600',
    light: '#fef9c3',
    bgHex: '#f5b800',
    borderHex: '#b88600',
    glowHex: 'rgba(245, 184, 0, 0.45)',
    tokenHex: '#f5b800',
    entryIndex: 26,
    homeTurnIndex: 24,
    homeYardOrigin: { x: 9, y: 9 },
  },
  BLUE: {
    name: 'Blue',
    primary: '#0093e9',
    secondary: '#006cb0',
    light: '#dbeafe',
    bgHex: '#0093e9',
    borderHex: '#006cb0',
    glowHex: 'rgba(0, 147, 233, 0.4)',
    tokenHex: '#0093e9',
    entryIndex: 39,
    homeTurnIndex: 37,
    homeYardOrigin: { x: 0, y: 9 },
  },
};

// Safe squares on the 52-path (indices 0..51)
// 4 entries + 4 star squares
export const SAFE_SQUARES: readonly number[] = [0, 8, 13, 21, 26, 34, 39, 47];

export const STAR_SQUARES: readonly number[] = [8, 21, 34, 47];

// Exact 15x15 Grid cell mapping for 52 path squares in clockwise order
export const PATH_COORDINATES: readonly BoardCoord[] = [
  // RED quadrant (0..12)
  { x: 1, y: 6 }, // 0: Red entry (Safe)
  { x: 2, y: 6 }, // 1
  { x: 3, y: 6 }, // 2
  { x: 4, y: 6 }, // 3
  { x: 5, y: 6 }, // 4
  { x: 6, y: 5 }, // 5
  { x: 6, y: 4 }, // 6
  { x: 6, y: 3 }, // 7
  { x: 6, y: 2 }, // 8: Red Star (Safe)
  { x: 6, y: 1 }, // 9
  { x: 6, y: 0 }, // 10
  { x: 7, y: 0 }, // 11
  { x: 8, y: 0 }, // 12

  // GREEN quadrant (13..25)
  { x: 8, y: 1 }, // 13: Green entry (Safe)
  { x: 8, y: 2 }, // 14
  { x: 8, y: 3 }, // 15
  { x: 8, y: 4 }, // 16
  { x: 8, y: 5 }, // 17
  { x: 9, y: 6 }, // 18
  { x: 10, y: 6 }, // 19
  { x: 11, y: 6 }, // 20
  { x: 12, y: 6 }, // 21: Green Star (Safe)
  { x: 13, y: 6 }, // 22
  { x: 14, y: 6 }, // 23
  { x: 14, y: 7 }, // 24
  { x: 14, y: 8 }, // 25

  // YELLOW quadrant (26..38)
  { x: 13, y: 8 }, // 26: Yellow entry (Safe)
  { x: 12, y: 8 }, // 27
  { x: 11, y: 8 }, // 28
  { x: 10, y: 8 }, // 29
  { x: 9, y: 8 }, // 30
  { x: 8, y: 9 }, // 31
  { x: 8, y: 10 }, // 32
  { x: 8, y: 11 }, // 33
  { x: 8, y: 12 }, // 34: Yellow Star (Safe)
  { x: 8, y: 13 }, // 35
  { x: 8, y: 14 }, // 36
  { x: 7, y: 14 }, // 37
  { x: 6, y: 14 }, // 38

  // BLUE quadrant (39..51)
  { x: 6, y: 13 }, // 39: Blue entry (Safe)
  { x: 6, y: 12 }, // 40
  { x: 6, y: 11 }, // 41
  { x: 6, y: 10 }, // 42
  { x: 6, y: 9 }, // 43
  { x: 5, y: 8 }, // 44
  { x: 4, y: 8 }, // 45
  { x: 3, y: 8 }, // 46
  { x: 2, y: 8 }, // 47: Blue Star (Safe)
  { x: 1, y: 8 }, // 48
  { x: 0, y: 8 }, // 49
  { x: 0, y: 7 }, // 50
  { x: 0, y: 6 }, // 51
];

// Home Stretch Coordinates: 6 squares for each color (indices 0..5, where 5 is the center finish)
export const HOME_STRETCH_COORDINATES: Record<PlayerColor, BoardCoord[]> = {
  RED: [
    { x: 1, y: 7 },
    { x: 2, y: 7 },
    { x: 3, y: 7 },
    { x: 4, y: 7 },
    { x: 5, y: 7 },
    { x: 6.5, y: 7 }, // Finished (Center Red Triangle)
  ],
  GREEN: [
    { x: 7, y: 1 },
    { x: 7, y: 2 },
    { x: 7, y: 3 },
    { x: 7, y: 4 },
    { x: 7, y: 5 },
    { x: 7, y: 6.5 }, // Finished (Center Green Triangle)
  ],
  YELLOW: [
    { x: 13, y: 7 },
    { x: 12, y: 7 },
    { x: 11, y: 7 },
    { x: 10, y: 7 },
    { x: 9, y: 7 },
    { x: 7.5, y: 7 }, // Finished (Center Yellow Triangle)
  ],
  BLUE: [
    { x: 7, y: 13 },
    { x: 7, y: 12 },
    { x: 7, y: 11 },
    { x: 7, y: 10 },
    { x: 7, y: 9 },
    { x: 7, y: 7.5 }, // Finished (Center Blue Triangle)
  ],
};

// Home Yard Slots (4 tokens per player when in HOME)
export const HOME_YARD_SLOTS: Record<PlayerColor, BoardCoord[]> = {
  RED: [
    { x: 1.6, y: 1.6 },
    { x: 3.4, y: 1.6 },
    { x: 1.6, y: 3.4 },
    { x: 3.4, y: 3.4 },
  ],
  GREEN: [
    { x: 10.6, y: 1.6 },
    { x: 12.4, y: 1.6 },
    { x: 10.6, y: 3.4 },
    { x: 12.4, y: 3.4 },
  ],
  YELLOW: [
    { x: 10.6, y: 10.6 },
    { x: 12.4, y: 10.6 },
    { x: 10.6, y: 12.4 },
    { x: 12.4, y: 12.4 },
  ],
  BLUE: [
    { x: 1.6, y: 10.6 },
    { x: 3.4, y: 10.6 },
    { x: 1.6, y: 12.4 },
    { x: 3.4, y: 12.4 },
  ],
};

// Player order presets
export const PLAYER_CONFIGS: Record<2 | 3 | 4, PlayerColor[]> = {
  2: ['RED', 'YELLOW'], // Opposing sides for balanced 2-player showdown
  3: ['RED', 'GREEN', 'YELLOW'],
  4: ['RED', 'GREEN', 'YELLOW', 'BLUE'],
};
