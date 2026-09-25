import { Animated } from 'react-native';
import { project } from './projection';

const animatedCache = new WeakMap<Animated.Value, number>();

export function setAnimatedValue(value: Animated.Value, next: number, tolerance = 0.001) {
  const previous = animatedCache.get(value);
  if (previous !== undefined && Math.abs(previous - next) <= tolerance) return;
  value.setValue(next);
  animatedCache.set(value, next);
}

export function createMotion() {
  return {
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    scale: new Animated.Value(1),
    opacity: new Animated.Value(0),
    depth: new Animated.Value(0),
  };
}
export type Motion = ReturnType<typeof createMotion>;

export function positionSprite(
  motion: Motion,
  point: ReturnType<typeof project>,
  width: number,
  height: number,
  base: number,
  opacity = 1,
) {
  const visibleOpacity = point.opacity * opacity;
  if (visibleOpacity <= 0) {
    setAnimatedValue(motion.opacity, 0);
    return;
  }
  setAnimatedValue(motion.x, point.x - width / 2);
  // Anchor scale to the contact point, so objects never float above the slope.
  setAnimatedValue(motion.y, point.y - height / 2 - (base - height / 2) * point.scale);
  setAnimatedValue(motion.scale, point.scale);
  setAnimatedValue(motion.opacity, visibleOpacity);
  setAnimatedValue(motion.depth, point.depth);
}
