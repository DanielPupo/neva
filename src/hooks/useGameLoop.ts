import { useEffect, useRef } from 'react';
import { PHYSICS } from '../config/game';
export function useGameLoop(active: boolean, tick: (dt: number) => void) {
  const callback = useRef(tick);
  callback.current = tick;
  useEffect(() => {
    if (!active) return;
    let frame = 0,
      last = 0;
    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, PHYSICS.maxFrame) : 0;
      last = now;
      callback.current(dt);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [active]);
}
