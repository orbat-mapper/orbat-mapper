import { type AllGeoJSON, featureCollection, point as turfPoint } from "@turf/helpers";
import turfBbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import type { Feature, Position } from "geojson";
import { useActiveScenario } from "@/composables/scenarioUtils";
import { layerItemToGeoJsonFeature } from "@/geo/layerItemExtent";
import { useGeoStore } from "@/stores/geoStore";
import type {
  EventLocation,
  ItemsWhere,
  UnitsWhere,
  WhereOptions,
} from "@/types/scenarioModels";
import type { EntityId } from "@/types/base";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { TScenario } from "@/scenariostore";

const SCENARIO_EVENT_UNIT_PADDING: [number, number, number, number] = [50, 50, 50, 50];
const EVENT_LOCATION_DURATION = 900;
const EVENT_LOCATION_MAX_ZOOM = 15;

export interface EventLocationItems {
  units: EntityId[];
  features: FeatureId[];
}

/** The units and layer items an event location points at; none for a fixed shape. */
export function eventLocationItems(where: EventLocation | undefined): EventLocationItems {
  if (where?.type === "units") return { units: [...where.units], features: [] };
  if (where?.type === "items") {
    return { units: [...(where.units ?? [])], features: [...(where.features ?? [])] };
  }
  return { units: [], features: [] };
}

/** The camera options of an event location, to carry over when its target changes. */
export function eventLocationCameraOptions(where?: EventLocation): WhereOptions {
  return {
    ...(where?.maxZoom !== undefined && { maxZoom: where.maxZoom }),
    ...(where?.mapAnimation !== undefined && { mapAnimation: where.mapAnimation }),
  };
}

/**
 * The event location for a set of units and layer items, keeping the camera options of
 * the previous location. Units alone stay `"units"` so older builds can read them.
 */
export function eventLocationFromItems(
  { units, features }: EventLocationItems,
  previous?: EventLocation,
): EventLocation | undefined {
  if (!units.length && !features.length) return undefined;
  const options = eventLocationCameraOptions(previous);
  if (!features.length) return { type: "units", units, ...options };
  return { type: "items", ...(units.length && { units }), features, ...options };
}

/** Moves the map to an event location. Missing units and items are skipped (ADR-0011). */
export function useEventLocation(
  options: Partial<{
    activeScenario: TScenario;
  }> = {},
) {
  const {
    store: { state },
    helpers: { getUnitById },
  } = options.activeScenario || useActiveScenario();
  const geoStore = useGeoStore();

  /** The shapes of the units and layer items a location points at. */
  function resolveShapes(where: UnitsWhere | ItemsWhere): Feature[] {
    const unitPoints = (where.units ?? [])
      .map((id) => getUnitById(id)?._state?.location)
      .filter((location): location is Position => !!location)
      .map((location) => turfPoint(location));
    const features = (where.type === "items" ? (where.features ?? []) : [])
      .map((id) => layerItemToGeoJsonFeature(state, id))
      .filter((feature): feature is Feature => !!feature);
    return [...unitPoints, ...features];
  }

  /** What an event location frames, or null when nothing in it can be placed. */
  function eventLocationShape(where: EventLocation | undefined): AllGeoJSON | null {
    if (!where) return null;
    if (where.type === "geometry") return where.geometry;
    if (where.type !== "units" && where.type !== "items") return null;
    const shapes = resolveShapes(where);
    return shapes.length ? featureCollection(shapes) : null;
  }

  function flyToShape(where: EventLocation, shape: AllGeoJSON) {
    geoStore.zoomToGeometry(shape, {
      duration: EVENT_LOCATION_DURATION,
      ...(where.type === "geometry"
        ? { maxZoom: where.maxZoom }
        : {
            maxZoom: where.maxZoom ?? EVENT_LOCATION_MAX_ZOOM,
            padding: SCENARIO_EVENT_UNIT_PADDING,
          }),
    });
  }

  /** The outline of what a location frames: a fixed shape as is, otherwise its bbox. */
  function outlineOf(where: EventLocation, shape: AllGeoJSON): Feature {
    if (where.type === "geometry") {
      return { type: "Feature", geometry: where.geometry, properties: {} };
    }
    const [west, south, east, north] = turfBbox(shape);
    if (west === east && south === north) return turfPoint([west, south]);
    return bboxPolygon([west, south, east, north]);
  }

  /** The area an event location frames, as one shape to outline on the map. */
  function eventLocationOutline(where: EventLocation | undefined): Feature | null {
    const shape = eventLocationShape(where);
    return where && shape ? outlineOf(where, shape) : null;
  }

  /** Moves the map to an event location and outlines what it frames for a moment. */
  function showEventLocation(where: EventLocation | undefined) {
    const shape = eventLocationShape(where);
    if (!where || !shape) return;
    flyToShape(where, shape);
    geoStore.flashOutline(outlineOf(where, shape));
  }

  function flyToEventLocation(where: EventLocation | undefined) {
    const shape = eventLocationShape(where);
    if (where && shape) flyToShape(where, shape);
  }

  return { flyToEventLocation, showEventLocation, eventLocationOutline };
}

export function useScenarioEvents() {
  const {
    time: { onGoToScenarioEventEvent },
  } = useActiveScenario();
  const { flyToEventLocation } = useEventLocation();

  onGoToScenarioEventEvent(({ event }) => flyToEventLocation(event.where));
  return {};
}
