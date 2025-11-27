
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
  hLevel: number; // 0 or 1
  wLevel: number; // 0 or 1
  stageTitle: string;
}

export interface Platform extends Rect {
  id: string;
  stageTitle: string; // "Wrong ICP"
  color: string;
  isGap?: boolean; // If true, it's a pitfall
}

export interface Decoration {
  id: string;
  x: number;
  y: number;
  text: string;
  subText?: string;
  type: 'sign';
  opacity: number; // For animation
  scale: number;   // For animation
}

export interface SalesStage {
  id: string;
  title: string;
  color: string;
  hLevel: number; // 0 = Short, 1 = Tall
  wLevel: number; // 0 = Narrow, 1 = Wide
}
