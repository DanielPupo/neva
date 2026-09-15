import React, { type PropsWithChildren } from 'react';
import { Animated } from 'react-native';
import type { Motion } from '../rendering/motion';

export function WorldSprite({
  motion,
  width,
  height,
  children,
}: PropsWithChildren<{ motion: Motion; width: number; height: number }>) {
  return (
    <Animated.View
      style={{
        position: 'absolute',
        width,
        height,
        opacity: motion.opacity,
        zIndex: motion.depth,
        transform: [{ translateX: motion.x }, { translateY: motion.y }, { scale: motion.scale }],
      }}
    >
      {children}
    </Animated.View>
  );
}
