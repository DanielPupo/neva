export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (value: number) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};
export const modulo = (value: number, range: number) => ((value % range) + range) % range;
