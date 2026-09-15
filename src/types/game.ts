export type Vector = { x: number; y: number; z: number };
export type Gesture = 'left' | 'right' | 'jump';
export type Lane = 0 | 1 | 2;
export const OBSTACLE_KINDS = ['tree', 'log', 'rock'] as const;
export type ObstacleKind = (typeof OBSTACLE_KINDS)[number];
export type Obstacle = {
  id: number;
  lane: Lane;
  distance: number;
  kind: ObstacleKind;
  passed: boolean;
};
export type TrailPoint = { x: number; distance: number; active: boolean };
export type Hud = { distance: number; score: number; speed: number; dodged: number };
export type Screen = 'home' | 'calibration' | 'playing' | 'paused' | 'falling' | 'over';
