import type { ExpressionSpecification, FilterSpecification } from "maplibre-gl";
import { metadataValue } from "./metadata";

/**
 * The smallest kind of place the plate names, each choice including the ones
 * above it. Hamlets fill a battle-scale plate but include present-day housing
 * estates that OpenStreetMap tags the same way, so a plate can stop at
 * villages, or at towns. A place left out loses its dot along with its name.
 */
export const SMALLEST_PLACES = [
  { value: "towns", label: "Towns", kind: "town" },
  { value: "villages", label: "Villages", kind: "village" },
  { value: "hamlets", label: "Hamlets", kind: "hamlet" },
] as const satisfies readonly { value: string; label: string; kind: string }[];

export type SmallestPlace = (typeof SMALLEST_PLACES)[number]["value"];

export const DEFAULT_SMALLEST_PLACE: SmallestPlace = "hamlets";

/** A style opts a layer of places in by this metadata key, set to true. */
export const ATLAS_PLACES_METADATA_KEY = "atlas:places";

export function isSmallestPlace(value: unknown): value is SmallestPlace {
  return SMALLEST_PLACES.some((choice) => choice.value === value);
}

/** Whether a place's rank is shown at the zoom: `steps` is a `step` over zoom. */
export const rankUpTo = (...steps: number[]): ExpressionSpecification => [
  "<=",
  ["coalesce", ["get", "rank"], 99],
  ["step", ["zoom"], ...steps] as ExpressionSpecification,
];

/**
 * The kinds of place the plate names, most important first. Up to zoom 8 the
 * ranks are Natural Earth's (1–10); past it OpenMapTiles ranks every other
 * place from 11 by its importance in its grid cell, so each zoom lets in the
 * next one or two per cell. Villages arrive at 10 and hamlets at 12, in
 * smaller type and rings.
 */
const TOWN_RANKS = [4, 6, 7, 8, 10, 9, 11, 10, 12, 11, 13, 12, 99] as const;
export const PLACE_KINDS = [
  { class: "city", ranks: TOWN_RANKS, ring: 1.3, type: 1, dot: 2.5 },
  { class: "town", ranks: TOWN_RANKS, ring: 1.3, type: 1, dot: 2.5 },
  { class: "village", ranks: [-1, 10, 12, 11, 13, 12, 99], ring: 1.1, type: 0.9, dot: 2 },
  { class: "hamlet", ranks: [-1, 12, 12, 13, 99], ring: 0.95, type: 0.82, dot: 1.6 },
] as const;

type PlaceKind = (typeof PLACE_KINDS)[number];

/** One value per kind of place in `kinds`, from `value(kind)`. */
export const byPlaceKind = (
  value: (kind: PlaceKind) => unknown,
  fallback: unknown,
  kinds: readonly PlaceKind[] = PLACE_KINDS,
): ExpressionSpecification =>
  [
    "match",
    ["get", "class"],
    ...kinds.flatMap((kind) => [kind.class, value(kind)]),
    fallback,
  ] as unknown as ExpressionSpecification;

/** The places listed down to `smallest`: each named with its dot, or a bare dot while names are hidden. */
export function placesFilter(smallest: SmallestPlace): FilterSpecification {
  const last = SMALLEST_PLACES.find((choice) => choice.value === smallest)!.kind;
  const count = PLACE_KINDS.findIndex((kind) => kind.class === last);
  return byPlaceKind(
    (kind) => rankUpTo(...kind.ranks),
    false,
    PLACE_KINDS.slice(0, count + 1),
  );
}

/** Cities, towns, villages, then hamlets; the best ranked first within each. */
export const placementOrder: ExpressionSpecification = [
  "+",
  ["*", 1000, byPlaceKind((kind) => PLACE_KINDS.indexOf(kind), PLACE_KINDS.length)],
  ["coalesce", ["get", "rank"], 999],
];

/** Lists the style's places down to `smallest`; false when it has no place layers. */
export function applySmallestPlace(
  map: {
    getLayersOrder(): string[];
    getLayer(layerId: string): { metadata?: unknown } | undefined;
    setFilter(layerId: string, filter: FilterSpecification): unknown;
  },
  smallest: SmallestPlace,
): boolean {
  const ids = map
    .getLayersOrder()
    .filter(
      (id) =>
        metadataValue(map.getLayer(id)?.metadata, ATLAS_PLACES_METADATA_KEY) === true,
    );
  const filter = placesFilter(smallest);
  for (const id of ids) map.setFilter(id, filter);
  return ids.length > 0;
}
