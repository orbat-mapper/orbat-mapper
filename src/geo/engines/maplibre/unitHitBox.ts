import type { MapGeoJSONFeature, Map as MlMap, PointLike } from "maplibre-gl";
import type { SymbolOptions } from "milsymbol";
import { toRaw } from "vue";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import { isUnitLayerId } from "@/geo/engines/maplibre/unitLayer";

/**
 * The clickable body of a unit symbol in CSS px around its icon anchor, as
 * `[left, top, right, bottom]`. The symbol images also hold the text amplifiers and
 * are padded to center the anchor, so their bounds reach far beyond the symbol.
 */
export type UnitHitBox = [number, number, number, number];

/**
 * The bounds of the symbol drawn with `infoFields: false`: the frame plus the echelon,
 * headquarters staff and mobility markers, but not the text amplifiers. Its anchor
 * sits on the same spot of the symbol as the anchor of the full symbol.
 */
export function getMilSymbolHitBox(sidc: string, options: SymbolOptions): UnitHitBox {
  const bodySymbol = symbolGenerator(sidc, { ...options, infoFields: false });
  const { width, height } = bodySymbol.getSize();
  const anchor = bodySymbol.getAnchor();
  return [-anchor.x, -anchor.y, width - anchor.x, height - anchor.y];
}

// Per raw map, since callers may hold it through a reactive proxy, and then per
// MapLibre image id of the symbol, which unit features carry as `symbolKey`.
// Images without a box (custom symbols) keep their whole image.
const hitBoxesByMap = new WeakMap<MlMap, Map<string, UnitHitBox>>();

function getHitBoxes(map: MlMap) {
  return hitBoxesByMap.get(toRaw(map));
}

export function setUnitHitBox(map: MlMap, imageId: string, box: UnitHitBox) {
  let boxes = getHitBoxes(map);
  if (!boxes) {
    boxes = new Map();
    hitBoxesByMap.set(toRaw(map), boxes);
  }
  boxes.set(imageId, box);
}

export function deleteUnitHitBox(map: MlMap, imageId: string) {
  getHitBoxes(map)?.delete(imageId);
}

export function clearUnitHitBoxes(map: MlMap) {
  getHitBoxes(map)?.clear();
}

export function pointToXY(point: PointLike): [number, number] {
  return Array.isArray(point) ? point : [point.x, point.y];
}

/**
 * How far `point` lies outside the symbol body of a rendered unit feature, in px.
 * Inside the body it is 0. Without a known body the whole image counts as body.
 */
function getUnitHitDistance(
  map: MlMap,
  feature: MapGeoJSONFeature,
  point: PointLike,
): number {
  const box = getHitBoxes(map)?.get(feature.properties?.symbolKey);
  if (!box || feature.geometry.type !== "Point") return 0;
  const anchor = map.project(feature.geometry.coordinates as [number, number]);
  const [x, y] = pointToXY(point);
  // Undo the icon rotation, which turns clockwise on screen. A map-aligned icon
  // also turns with the map bearing.
  const mapAligned =
    map.getLayoutProperty(feature.layer.id, "icon-rotation-alignment") === "map";
  const rotation =
    (Number(feature.properties?.symbolRotation) || 0) -
    (mapAligned ? map.getBearing() : 0);
  const radians = (-rotation * Math.PI) / 180;
  const dx = x - anchor.x;
  const dy = y - anchor.y;
  const localX = dx * Math.cos(radians) - dy * Math.sin(radians);
  const localY = dx * Math.sin(radians) + dy * Math.cos(radians);
  const [left, top, right, bottom] = box;
  const outsideX = Math.max(left - localX, 0, localX - right);
  const outsideY = Math.max(top - localY, 0, localY - bottom);
  return Math.hypot(outsideX, outsideY);
}

/**
 * The rendered unit features whose symbol body lies within `tolerance` px of `point`,
 * closest first. MapLibre hits a unit anywhere on its symbol image, which also holds
 * the text amplifiers. The sort is stable, so units under the pointer keep their
 * draw order.
 */
export function rankUnitHits(
  map: MlMap,
  features: MapGeoJSONFeature[],
  point: PointLike,
  tolerance = 0,
): MapGeoJSONFeature[] {
  return features
    .map((feature) => ({ feature, distance: getUnitHitDistance(map, feature, point) }))
    .filter(({ distance }) => distance <= tolerance)
    .sort((a, b) => a.distance - b.distance)
    .map(({ feature }) => feature);
}

/** The units whose symbol is under `point`, topmost first. */
export function queryUnitHitsAt(map: MlMap, point: PointLike): MapGeoJSONFeature[] {
  const layers = map.getLayersOrder().filter(isUnitLayerId);
  if (!layers.length) return [];
  return rankUnitHits(map, map.queryRenderedFeatures(point, { layers }), point);
}
