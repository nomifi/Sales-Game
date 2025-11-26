
export enum GamePhase {
  START = "START",
  PLAYING = "PLAYING",
  GAME_OVER = "GAME_OVER",
  VICTORY = "VICTORY"
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Player extends Rect {
  vy: number; // Vertical velocity
  isGrounded: boolean;
}

export interface Obstacle extends Rect {
  id: string;
  name: string; // The specific pain point text
}

export interface Platform extends Rect {
  id: string;
  stageTitle: string; // "Prospecting"
  role: string; // "SDR"
  color: string;
  isGap?: boolean; // If true, it's a pitfall
}
