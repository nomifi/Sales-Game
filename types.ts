
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
  difficulty: number;
}

export interface Platform extends Rect {
  id: string;
  stageTitle: string; // "Prospecting"
  role: string; // "SDR"
  color: string;
  isGap?: boolean; // If true, it's a pitfall
}

export interface SalesStage {
  id: string;
  title: string;
  role: string;
  color: string;
  pains: string[]; // List of specific pains for this segment
  difficulty: number; // 1 = Easy, 2 = Medium, 4 = Hard/Impossible
}
