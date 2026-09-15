/** Simulation units: metres, seconds and radians. Tune gameplay here. */
export const PHYSICS = {
  step: 1 / 120,
  maxFrame: 0.1,
  gravity: 9.81,
  jumpVelocity: 5.3,
  slope: 0.24,
  friction: 0.035,
  drag: 0.0035,
  initialSpeed: 11,
  maxSpeed: 24,
  laneWidth: 2.5,
  turnFrequency: 9,
  airSteering: 0.72,
  playerRadius: 0.32,
  playerDepth: 0.36,
} as const;

export const WORLD = {
  obstacleCount: 8,
  firstRow: 55,
  rowSpacing: 58,
  rowVariation: 12,
  viewDistance: 220,
  fogStart: 160,
  recycleBehind: 14,
  decorationSpacing: 22,
  decorationCount: 8,
  snowSpacing: 12,
  snowCount: 12,
  trailCount: 16,
} as const;

export const CAMERA = {
  focalDistance: 18,
  horizon: 0.255,
  playerY: 0.79,
  laneScreenWidth: 0.235,
} as const;

export const SENSOR = {
  interval: 20,
  filterTime: 90,
  tilt: 0.23,
  neutral: 0.095,
  debounce: 90,
  laneCooldown: 340,
  jumpCooldown: 1150,
  jump: 0.46,
  minSamples: 25,
  calibrationWindow: 900,
  maxVariance: 0.009,
  staleAfter: 1200,
} as const;
