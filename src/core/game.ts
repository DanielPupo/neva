import { PHYSICS, WORLD } from '../config/game';
import type { Gesture, Hud, Lane, TrailPoint } from '../types/game';
import { collides, OBSTACLE_SHAPES } from './collision';
import { clamp } from './math';
import { downhillSpeed, integrateJump, integrateTurn } from './physics';
import { ObstacleWorld } from './world';

export class Game {
  lane: Lane = 1;
  x = 0;
  lateralVelocity = 0;
  height = 0;
  verticalVelocity = 0;
  landing = 0;
  distance = 0;
  speed: number = PHYSICS.initialSpeed;
  time = 0;
  dodged = 0;
  over = false;
  private accumulator = 0;
  private trailCursor = 0;
  private lastTrail = 0;
  readonly world: ObstacleWorld;
  readonly trail: TrailPoint[] = Array.from({ length: WORLD.trailCount }, () => ({
    x: 0,
    distance: 0,
    active: false,
  }));

  constructor(random: () => number = Math.random) {
    this.world = new ObstacleWorld(random);
  }
  get obstacles() {
    return this.world.obstacles;
  }
  get score() {
    return Math.floor(this.distance);
  }
  get airborne() {
    return this.height > 0 || this.verticalVelocity > 0;
  }
  get targetX() {
    return (this.lane - 1) * PHYSICS.laneWidth;
  }

  input(gesture: Gesture) {
    if (this.over) return;
    if (gesture === 'jump') {
      if (!this.airborne) this.verticalVelocity = PHYSICS.jumpVelocity;
    } else {
      this.lane = clamp(this.lane + (gesture === 'right' ? 1 : -1), 0, 2) as Lane;
    }
  }

  /** Fixed timestep keeps gravity/collision behaviour consistent at 30, 60 and 120 FPS. */
  tick(frameSeconds: number) {
    if (this.over || !Number.isFinite(frameSeconds)) return;
    this.accumulator += clamp(frameSeconds, 0, PHYSICS.maxFrame);
    while (this.accumulator + 1e-10 >= PHYSICS.step && !this.over) {
      this.step(PHYSICS.step);
      this.accumulator -= PHYSICS.step;
    }
  }

  private step(dt: number) {
    this.time += dt;
    const previousSpeed = this.speed;
    this.speed = downhillSpeed(this.speed, dt);
    this.distance += (previousSpeed + this.speed) * 0.5 * dt;
    const turn = integrateTurn(this.x, this.lateralVelocity, this.targetX, dt, this.airborne);
    this.x = turn.x;
    this.lateralVelocity = turn.velocity;
    this.landing = Math.max(0, this.landing - dt * 4);
    if (this.airborne) {
      const jump = integrateJump(this.height, this.verticalVelocity, dt);
      this.height = jump.height;
      this.verticalVelocity = jump.velocity;
      if (jump.landed) this.landing = 1;
    }
    for (const obstacle of this.obstacles) {
      const relativeZ = obstacle.distance - this.distance;
      const gap = this.x - (obstacle.lane - 1) * PHYSICS.laneWidth;
      if (collides(obstacle.kind, relativeZ, gap, this.height)) {
        this.over = true;
        return;
      }
      if (
        !obstacle.passed &&
        relativeZ < -OBSTACLE_SHAPES[obstacle.kind].depth - PHYSICS.playerDepth
      ) {
        obstacle.passed = true;
        this.dodged++;
      }
    }
    this.world.recycle(this.distance);
    if (this.distance - this.lastTrail > 0.65) {
      Object.assign(this.trail[this.trailCursor], {
        x: this.x,
        distance: this.distance,
        active: !this.airborne,
      });
      this.trailCursor = (this.trailCursor + 1) % this.trail.length;
      this.lastTrail = this.distance;
    }
  }

  hud(): Hud {
    return {
      distance: Math.floor(this.distance),
      score: this.score,
      speed: Math.round(this.speed * 3.6),
      dodged: this.dodged,
    };
  }
}
