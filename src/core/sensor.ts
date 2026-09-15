import { SENSOR } from '../config/game';
import type { Gesture, Vector } from '../types/game';
export type { Gesture, Vector } from '../types/game';

/** Normalizes opposite native gravity conventions using the upright neutral sample.
 * Rightward physical roll must always be positive, on both Android and iOS.
 */
export function rightwardTilt(sample: Vector, neutral: Vector) {
  const polarity = Math.sign(neutral.y) || 1;
  const angle = (v: Vector) => Math.atan2(-v.x * polarity, v.y * polarity);
  const difference = angle(sample) - angle(neutral);
  return Math.atan2(Math.sin(difference), Math.cos(difference));
}

export class GestureDetector {
  neutral: Vector = { x: 0, y: 1, z: 0 };
  smooth: Vector = { ...this.neutral };
  tilt = 0;
  private armed = false;
  private lastLane = -Infinity;
  private lastJump = -Infinity;
  private candidate = 0;
  private candidateSince = 0;
  private lastTime = 0;
  private initialized = false;

  calibrate(samples: Vector[]) {
    if (
      samples.length < SENSOR.minSamples ||
      samples.some((v) => !Object.values(v).every(Number.isFinite))
    )
      return false;
    const mean = { x: 0, y: 0, z: 0 };
    for (const sample of samples) {
      mean.x += sample.x / samples.length;
      mean.y += sample.y / samples.length;
      mean.z += sample.z / samples.length;
    }
    const variance =
      samples.reduce(
        (sum, v) => sum + (v.x - mean.x) ** 2 + (v.y - mean.y) ** 2 + (v.z - mean.z) ** 2,
        0,
      ) / samples.length;
    // Near-horizontal phones have no reliable upright roll reference.
    if (
      variance > SENSOR.maxVariance ||
      Math.abs(mean.y) < 0.35 ||
      Math.hypot(mean.x, mean.y, mean.z) < 0.65
    )
      return false;
    this.neutral = mean;
    this.reset();
    return true;
  }

  reset() {
    this.armed = false;
    this.candidate = 0;
    this.initialized = false;
    this.lastLane = -Infinity;
    this.lastJump = -Infinity;
    this.tilt = 0;
  }

  update(sample: Vector, now: number): Gesture | null {
    if (![sample.x, sample.y, sample.z, now].every(Number.isFinite)) return null;
    if (!this.initialized) {
      this.smooth = { x: sample.x, y: sample.y, z: sample.z };
      this.lastTime = now;
      this.initialized = true;
      return null;
    }
    const dt = Math.max(1, Math.min(100, now - this.lastTime));
    this.lastTime = now;
    const alpha = 1 - Math.exp(-dt / SENSOR.filterTime);
    const residual = {
      x: sample.x - this.smooth.x,
      y: sample.y - this.smooth.y,
      z: sample.z - this.smooth.z,
    };
    this.smooth.x += alpha * residual.x;
    this.smooth.y += alpha * residual.y;
    this.smooth.z += alpha * residual.z;
    const lift = residual.y * Math.sign(this.neutral.y);
    if (
      lift > SENSOR.jump &&
      Math.abs(residual.x) < 0.3 &&
      now - this.lastJump > SENSOR.jumpCooldown
    ) {
      this.lastJump = now;
      this.armed = false;
      this.candidate = 0;
      return 'jump';
    }
    this.tilt = rightwardTilt(this.smooth, this.neutral);
    if (Math.abs(this.tilt) < SENSOR.neutral) {
      this.armed = true;
      this.candidate = 0;
    }
    const direction = this.tilt < -SENSOR.tilt ? -1 : this.tilt > SENSOR.tilt ? 1 : 0;
    if (!direction || !this.armed || now - this.lastJump < 250) {
      this.candidate = 0;
      return null;
    }
    if (direction !== this.candidate) {
      this.candidate = direction;
      this.candidateSince = now;
      return null;
    }
    if (now - this.candidateSince < SENSOR.debounce || now - this.lastLane < SENSOR.laneCooldown)
      return null;
    this.armed = false;
    this.lastLane = now;
    return direction > 0 ? 'right' : 'left';
  }
}
