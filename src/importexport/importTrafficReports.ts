import dayjs from "dayjs";
import type { Position } from "geojson";

import { SID } from "@/symbology/values";
import type { TScenario } from "@/scenariostore";
import type { NGeometryLayerItem, NUnitAdd } from "@/types/internalModels";

export const TRAFFIC_REPORTS_SIDE_ID = "trafficReportsSide";
export const TRAFFIC_REPORTS_GROUP_ID = "trafficReportsGroup";
export const TRAFFIC_REPORTS_LAYER_ID = "trafficReportsLayer";

export interface TrafficReportFeaturePayload {
  id: string;
  name: string;
  description: string;
  geometry: { type: "Point"; coordinates: Position };
  visibleFromT: string;
  visibleUntilT?: string;
  userData?: Record<string, unknown>;
  sidc?: string;
}

export interface TrafficReportUnitPayload {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  sidc: string;
  location: Position;
  visibleFromT: string;
  /** When set, the unit leaves the map again at this time. */
  visibleUntilT?: string;
  textAmplifiers?: Record<string, string>;
  userData?: Record<string, unknown>;
}

export interface TrafficReportsPayload {
  scenarioId?: string;
  unitCount?: number;
  startTime?: string;
  currentTime?: string;
  center?: Position;
  boundingBox?: [number, number, number, number];
  features: TrafficReportFeaturePayload[];
  units: TrafficReportUnitPayload[];
}

export async function fetchTrafficReportsPayload(
  url = "/traffic_reports_payload.json",
): Promise<TrafficReportsPayload> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load traffic reports payload (${response.status})`);
  }
  return response.json() as Promise<TrafficReportsPayload>;
}

export function importTrafficReports(
  scenario: TScenario,
  payload: TrafficReportsPayload,
): { importedFeatures: number; importedUnits: number; center?: Position } {
  const { store, unitActions, geo, time } = scenario;

  if (payload.startTime) {
    store.update((s) => {
      s.info.startTime = +dayjs(payload.startTime);
      s.currentTime = +dayjs(payload.currentTime ?? payload.startTime);
    });
  }

  if (payload.boundingBox) {
    store.update((s) => {
      s.boundingBox = payload.boundingBox!;
    });
  }

  store.groupUpdate(() => {
    if (store.state.sideMap[TRAFFIC_REPORTS_SIDE_ID]) {
      unitActions.deleteSide(TRAFFIC_REPORTS_SIDE_ID);
    }
    if (store.state.layerStackMap[TRAFFIC_REPORTS_LAYER_ID]) {
      geo.deleteLayer(TRAFFIC_REPORTS_LAYER_ID, { noEmit: true });
    }

    const layer = geo.addLayer({
      id: TRAFFIC_REPORTS_LAYER_ID,
      name: "Traffic Reports",
      items: [],
    });
    if (!layer) return;

    for (const feature of payload.features) {
      const item: NGeometryLayerItem = {
        id: feature.id,
        kind: "geometry",
        name: feature.name,
        description: feature.description,
        geometry: feature.geometry,
        geometryMeta: { geometryKind: "Point" },
        visibleFromT: +dayjs(feature.visibleFromT),
        ...(feature.visibleUntilT
          ? { visibleUntilT: +dayjs(feature.visibleUntilT) }
          : {}),
        style: {
          "marker-color": "#EAB308",
          "marker-symbol": "circle",
        },
        userData: {
          ...feature.userData,
          sidc: feature.sidc,
        },
        _pid: layer.id,
      };
      geo.addFeature(item, layer.id, { noEmit: true });
    }

    const sideId = unitActions.addSide(
      {
        id: TRAFFIC_REPORTS_SIDE_ID,
        name: "Traffic Reports",
        standardIdentity: SID.Neutral,
      },
      { markAsNew: false, addDefaultGroup: false, newId: false },
    );

    const groupId = unitActions.addSideGroup(
      sideId,
      {
        id: TRAFFIC_REPORTS_GROUP_ID,
        name: "ITDX Traffic Reports",
        _isNew: false,
      },
      { newId: false },
    );
    if (!groupId) return;

    for (const unit of payload.units) {
      // Deliberately no `location`: an initial position projects from the beginning of
      // time, which would put every report on the map at once regardless of the clock.
      // The position only exists as timed state, so a report appears when it is reported.
      const state: NUnitAdd["state"] = [
        {
          id: `${unit.id}-t0`,
          t: +dayjs(unit.visibleFromT),
          location: unit.location,
        },
      ];
      if (unit.visibleUntilT) {
        state.push({
          id: `${unit.id}-t1`,
          t: +dayjs(unit.visibleUntilT),
          location: null,
        });
      }
      const unitData: NUnitAdd = {
        id: unit.id,
        name: unit.name,
        shortName: unit.shortName,
        description: unit.description,
        sidc: unit.sidc,
        subUnits: [],
        textAmplifiers: unit.textAmplifiers,
        state,
      };
      unitActions.addUnit(unitData, groupId, undefined, { noUndo: true, updateState: true });
    }
  });

  time.setCurrentTime(store.state.currentTime);

  return {
    importedFeatures: payload.features.length,
    importedUnits: payload.units.length,
    center: payload.center,
  };
}
