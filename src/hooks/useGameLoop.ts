import { useEffect, useRef } from 'react';
import { PHYSICS } from '../config/game';

export function useGameLoop(active: boolean, tick: (dt: number) => void) {
  const callback = useRef(tick);
  const frameRef = useRef<number | null>(null);

  callback.current = tick;

  useEffect(() => {
    if (!active) return;

    let last = 0;

    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, PHYSICS.maxFrame) : 0;
      last = now;
      callback.current(dt);
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [active]);
}
