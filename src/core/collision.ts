import { PHYSICS } from '../config/game';
import type { ObstacleKind } from '../types/game';

export const OBSTACLE_SHAPES: Record<
  ObstacleKind,
  { radius: number; depth: number; clearance: number }
> = {
  tree: { radius: 0.53, depth: 0.6, clearance: Infinity },
  rock: { radius: 0.7, depth: 0.65, clearance: Infinity },
  log: { radius: 0.92, depth: 0.4, clearance: 0.62 },
};

export function collides(
  kind: ObstacleKind,
  relativeZ: number,
  lateralGap: number,
  height: number,
) {
  const shape = OBSTACLE_SHAPES[kind];
  return (
    Math.abs(relativeZ) <= shape.depth + PHYSICS.playerDepth &&
    Math.abs(lateralGap) < shape.radius + PHYSICS.playerRadius &&
    height < shape.clearance
  );
}
