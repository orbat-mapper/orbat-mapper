/**
 * Pixel ratio used when generating programmatic sprites (unit symbols,
 * custom symbols, feature markers, arrows) for MapLibre. A value of 2
 * keeps icons crisp on common high-DPI displays.
 */
const SPRITE_PIXEL_RATIO = 2;

export function getSpritePixelRatio(): number {
  return SPRITE_PIXEL_RATIO;
}
