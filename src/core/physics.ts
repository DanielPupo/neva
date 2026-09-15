import { PHYSICS } from '../config/game';
import { clamp } from './math';

export function integrateJump(height: number, velocity: number, dt: number) {
  const nextHeight = height + velocity * dt - 0.5 * PHYSICS.gravity * dt * dt;
  const nextVelocity = velocity - PHYSICS.gravity * dt;
  const landed = nextHeight <= 0 && nextVelocity < 0;
  return { height: Math.max(0, nextHeight), velocity: landed ? 0 : nextVelocity, landed };
}

/** Critically damped spring: smooth steering without oscillating between lanes. */
export function integrateTurn(
  x: number,
  velocity: number,
  target: number,
  dt: number,
  airborne: boolean,
) {
  const frequency = PHYSICS.turnFrequency * (airborne ? PHYSICS.airSteering : 1);
  const offset = x - target;
  const c = velocity + frequency * offset;
  const decay = Math.exp(-frequency * dt);
  return {
    x: target + (offset + c * dt) * decay,
    velocity: (velocity - frequency * c * dt) * decay,
  };
}

export function downhillSpeed(speed: number, dt: number) {
  const gravity = PHYSICS.gravity * Math.sin(PHYSICS.slope);
  const friction = PHYSICS.friction * PHYSICS.gravity * Math.cos(PHYSICS.slope);
  return clamp(
    speed + (gravity - friction - PHYSICS.drag * speed * speed) * dt,
    0,
    PHYSICS.maxSpeed,
  );
}
