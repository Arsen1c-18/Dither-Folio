/** Convert between the shader's [0..1, 0..1, 0..1] RGB and a #rrggbb hex string. */

export function rgb01ToHex([r, g, b]: [number, number, number]): string {
  const to = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n * 255)))
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function hexToRgb01(hex: string): [number, number, number] {
  const m = hex.replace("#", "").match(/.{1,2}/g);
  if (!m || m.length < 3) return [0, 0, 0];
  return [
    parseInt(m[0], 16) / 255,
    parseInt(m[1], 16) / 255,
    parseInt(m[2], 16) / 255,
  ];
}
