import { Animated } from 'react-native';
import { project } from './projection';

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
    motion.opacity.setValue(0);
    return;
  }
  motion.x.setValue(point.x - width / 2);
  // Anchor scale to the contact point, so objects never float above the slope.
  motion.y.setValue(point.y - height / 2 - (base - height / 2) * point.scale);
  motion.scale.setValue(point.scale);
  motion.opacity.setValue(visibleOpacity);
  motion.depth.setValue(point.depth);
}
