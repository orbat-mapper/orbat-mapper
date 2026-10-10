/**
 * The outbound store → tactical-draw direction for point symbols: the `pointSymbol`
 * counterpart to `toControlMeasure` in `controlMeasures.ts`, and memoised the same way
 * for the same reason — tactical-draw caches rendered output on `Graphic` identity.
 */
import { toRaw } from "vue";
import type { PointSymbol } from "@orbat-mapper/tactical-draw";
import {
  POINT_SYMBOL_UPDATE_FIELDS,
  type PointSymbolLayerItem,
  type PointSymbolSize,
} from "@/types/scenarioLayerItems";

/** What a new point symbol is born with: screen-anchored, like a unit symbol. */
export const DEFAULT_POINT_SYMBOL_SIZE: PointSymbolSize = { value: 30, unit: "pixels" };

/**
 * The fields `toPointSymbol` reads — the ones an update can change; `_state` overrides
 * them when it carries them.
 */
const PROJECTION_FIELDS = POINT_SYMBOL_UPDATE_FIELDS;

function resolved<K extends (typeof PROJECTION_FIELDS)[number]>(
  item: PointSymbolLayerItem,
  field: K,
): PointSymbolLayerItem[K] {
  const projected = item._state?.[field] as PointSymbolLayerItem[K] | undefined;
  return toRaw(projected ?? item[field]);
}

/** The uncached projection behind `toPointSymbol`. */
function buildPointSymbol(item: PointSymbolLayerItem): PointSymbol {
  const textAmplifiers = resolved(item, "textAmplifiers");
  const symbol: PointSymbol = {
    id: item.id,
    kind: "point-symbol",
    sidc: resolved(item, "sidc"),
    position: resolved(item, "position"),
    rotation: resolved(item, "rotation") ?? 0,
    size: resolved(item, "size") ?? DEFAULT_POINT_SYMBOL_SIZE,
    ...(textAmplifiers ? { textAmplifiers } : {}),
  };
  // Detached from the store, so no reactive proxy or live store array reaches the
  // engine (ADR-0006).
  return structuredClone(symbol);
}

interface CacheEntry {
  signature: unknown[];
  state: unknown;
  symbol: PointSymbol;
}

const cache = new WeakMap<PointSymbolLayerItem, CacheEntry>();

function currentSignature(item: PointSymbolLayerItem): unknown[] {
  return PROJECTION_FIELDS.map((field) => item[field]);
}

/**
 * Project a stored `pointSymbol` item into tactical-draw's `PointSymbol`, handing back
 * the same object for as long as no projection input has changed. Item identity alone
 * is not enough, since the store patches items in place; see `toControlMeasure`.
 */
export function toPointSymbol(item: PointSymbolLayerItem): PointSymbol {
  const cached = cache.get(item);
  const signature = currentSignature(item);
  if (
    cached &&
    cached.state === item._state &&
    signature.every((value, i) => value === cached.signature[i])
  ) {
    return cached.symbol;
  }
  const symbol = buildPointSymbol(item);
  cache.set(item, { signature, state: item._state, symbol });
  return symbol;
}

/** The fields a settled point-symbol edit writes back. Copied out of the engine's object. */
export function toPointSymbolUpdate(symbol: PointSymbol) {
  const copy = structuredClone(symbol);
  return {
    position: copy.position,
    rotation: copy.rotation,
    size: copy.size,
  };
}
