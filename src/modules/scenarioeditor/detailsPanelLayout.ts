// Percentages resolve against the map column, so the overlay never hides the map controls.
export const DETAILS_OVERLAY_MAX_WIDTH = "min(50vw, calc(100% - 5rem))";

/** Right margin that keeps map header controls clear of the overlay details panel. */
export function detailsOverlayClearance(detailsWidth: number) {
  return `calc(min(${detailsWidth}px, 50vw, 100% - 5rem) + 1rem)`;
}
