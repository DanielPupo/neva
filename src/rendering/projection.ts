import { CAMERA, PHYSICS, WORLD } from '../config/game';
import { smoothstep } from '../core/math';

/** Shared pinhole projection for snow, obstacles, tracks and scenery. */
export function project(x: number, z: number, width: number, height: number) {
  const scale = CAMERA.focalDistance / Math.max(3, z + CAMERA.focalDistance);
  return {
    x: width * 0.5 + (x / PHYSICS.laneWidth) * width * CAMERA.laneScreenWidth * scale,
    y: height * (CAMERA.horizon + (CAMERA.playerY - CAMERA.horizon) * scale),
    scale,
    opacity: smoothstep((WORLD.viewDistance - z) / (WORLD.viewDistance - WORLD.fogStart)),
    depth: Math.round(1000 - z),
  };
}
