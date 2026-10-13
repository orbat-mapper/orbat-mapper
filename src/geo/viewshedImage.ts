import {
  heightsToRgba,
  maskToRgba,
  Visibility,
  type Coverage,
  type Rgba,
} from "@/lib/terrain";

/** What the Viewshed image shows: the ground the target is seen on, only the
 *  dead ground no observer sees, or how high a target must rise to be seen,
 *  in bands. */
export type ViewshedDisplay = "visible" | "dead" | "masking";

/** Visible ground green, hidden ground shaded. */
export const VIEWSHED_COLORS: { visible: Rgba; hidden: Rgba } = {
  visible: [34, 197, 94, 110],
  hidden: [15, 23, 42, 90],
};

/** Masking height bands, in metres above the ground: seen at the ground in the
 *  viewshed's green, then warmer the higher a target must fly to be seen. */
export const MASKING_BANDS: readonly { max: number; label: string; color: Rgba }[] = [
  { max: 0, label: "0", color: VIEWSHED_COLORS.visible },
  { max: 25, label: "25", color: [250, 204, 21, 120] },
  { max: 50, label: "50", color: [251, 146, 60, 125] },
  { max: 100, label: "100", color: [239, 68, 68, 125] },
  { max: 200, label: "200", color: [185, 28, 28, 130] },
  { max: 500, label: "500", color: [126, 34, 206, 130] },
  { max: Infinity, label: "500+", color: [59, 7, 100, 140] },
];

/** Dead ground, strong enough to stand out on its own over any basemap. */
export const DEAD_GROUND_COLOR: Rgba = [220, 38, 38, 140];
const CLEAR: Rgba = [0, 0, 0, 0];

/** How many observers see combined ground, each deeper than the last: the
 *  last band takes every count from its own up. Ground none sees is hidden. */
export const SEEN_BY_BANDS: readonly { label: string; color: Rgba }[] = [
  { label: "1", color: [134, 239, 172, 120] },
  { label: "2", color: [34, 197, 94, 135] },
  { label: "3+", color: [21, 128, 61, 155] },
];

/** The coverage's pixels, one per cell, for a map image source to take as they
 *  are: nothing to encode, fetch or decode on the way to the map. */
export function viewshedImage(
  { grid, mask, masking, seenBy }: Coverage,
  display: ViewshedDisplay,
): ImageData {
  const rgba =
    display === "masking"
      ? heightsToRgba(masking, MASKING_BANDS)
      : display === "dead"
        ? maskToRgba(mask, { visible: CLEAR, hidden: DEAD_GROUND_COLOR })
        : maskToRgba(mask, VIEWSHED_COLORS);
  // Combined ground shades by how many see it.
  if (display === "visible" && seenBy)
    for (let i = 0; i < mask.length; i++)
      if (mask[i] === Visibility.Visible)
        rgba.set(
          SEEN_BY_BANDS[Math.min(seenBy[i]!, SEEN_BY_BANDS.length) - 1]!.color,
          i * 4,
        );
  return new ImageData(rgba, grid.width, grid.height);
}
