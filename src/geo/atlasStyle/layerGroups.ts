/**
 * Parts of the plate a user can leave out, such as present-day borders on a
 * historical map. A layer lists its groups in its style metadata and draws only
 * while all of them are shown, so a town's name needs cities, labels and its own
 * category. A style opts in by the same metadata; its layer names don't matter.
 *
 * Rivers and lakes are present-day water: a river that has since moved its
 * course, or a reservoir dammed after the period mapped. Lakes include
 * reservoirs and large lakes such as the Great Lakes, which the tiles don't
 * tell apart. The sea always draws.
 */
export const ATLAS_LAYER_GROUPS = [
  { value: "borders", label: "Borders" },
  { value: "cities", label: "Cities" },
  { value: "waterways", label: "Rivers" },
  { value: "lakes", label: "Lakes & reservoirs" },
  { value: "labels", label: "Labels" },
] as const satisfies readonly { value: string; label: string }[];

/** The kinds of label, each hidden on its own while `labels` stays on. */
export const ATLAS_LABEL_CATEGORIES = [
  { value: "countries", label: "Countries" },
  { value: "states", label: "States" },
  { value: "rivers", label: "Rivers" },
  { value: "seas", label: "Seas" },
  { value: "islands", label: "Islands" },
  { value: "towns", label: "Cities" },
] as const satisfies readonly { value: string; label: string }[];

export type AtlasLayerGroup =
  | (typeof ATLAS_LAYER_GROUPS)[number]["value"]
  | (typeof ATLAS_LABEL_CATEGORIES)[number]["value"];

export const ALL_ATLAS_LAYER_GROUPS: readonly AtlasLayerGroup[] = [
  ...ATLAS_LAYER_GROUPS,
  ...ATLAS_LABEL_CATEGORIES,
].map((group) => group.value);

export const ATLAS_LAYER_GROUPS_METADATA_KEY = "atlas:layer-groups";

/** The metadata that puts a layer in `groups`. */
export function layerGroupMetadata(...groups: AtlasLayerGroup[]) {
  return { [ATLAS_LAYER_GROUPS_METADATA_KEY]: groups };
}

function groupsOf(metadata: unknown): readonly unknown[] | undefined {
  const groups = (metadata as Record<string, unknown> | undefined)?.[
    ATLAS_LAYER_GROUPS_METADATA_KEY
  ];
  return Array.isArray(groups) ? groups : undefined;
}

/** Whether a layer with this metadata draws while `show` is on; a layer in no group always does. */
export function drawsWithLayerGroups(
  metadata: unknown,
  show: readonly AtlasLayerGroup[],
): boolean {
  return (groupsOf(metadata) ?? []).every((group) =>
    show.includes(group as AtlasLayerGroup),
  );
}

/** The group a label category's names belong to besides `labels`: no river names without rivers. */
const LABEL_CATEGORY_NEEDS: Partial<
  Record<(typeof ATLAS_LABEL_CATEGORIES)[number]["value"], AtlasLayerGroup>
> = { towns: "cities", rivers: "waterways" };

/** Whether a label category would draw if it were on: the rest of what its layer needs is shown. */
export function canDrawLabelCategory(
  category: (typeof ATLAS_LABEL_CATEGORIES)[number]["value"],
  show: readonly AtlasLayerGroup[],
): boolean {
  const needed = LABEL_CATEGORY_NEEDS[category];
  return show.includes("labels") && (needed === undefined || show.includes(needed));
}

/** Shows and hides the style's grouped layers; false when it has none. */
export function applyAtlasLayerGroups(
  map: {
    getLayersOrder(): string[];
    getLayer(layerId: string): { metadata?: unknown } | undefined;
    setLayoutProperty(layerId: string, name: string, value: unknown): unknown;
  },
  show: readonly AtlasLayerGroup[],
): boolean {
  let found = false;
  for (const id of map.getLayersOrder()) {
    const metadata = map.getLayer(id)?.metadata;
    if (!groupsOf(metadata)) continue;
    found = true;
    map.setLayoutProperty(
      id,
      "visibility",
      drawsWithLayerGroups(metadata, show) ? "visible" : "none",
    );
  }
  return found;
}
