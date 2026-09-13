import dayjs from "dayjs";

import { TRAFFIC_REPORTS_LAYER_ID } from "@/importexport/importTrafficReports";
import type { TScenario } from "@/scenariostore";
import type { NGeometryLayerItem } from "@/types/internalModels";
import { isScenarioOverlayLayer } from "@/types/scenarioStackLayers";

export interface TrafficReportRecord {
  report_text: string;
  timestamp_utc: string;
  report_type?: string;
  equipment?: string;
  activity?: string;
  source_evaluation?: string;
  evaluation?: string;
  report_id?: string;
  mgrs?: string;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function reportTypeFromName(name: string): string | undefined {
  const [head] = name.split(" — ");
  return head?.trim() || undefined;
}

function featureToRecord(feature: NGeometryLayerItem): TrafficReportRecord | null {
  const reportText = feature.description?.trim();
  if (!reportText) return null;

  const userData = feature.userData ?? {};
  const timestamp =
    asString(userData.timestamp_utc) ??
    (feature.visibleFromT != null
      ? new Date(feature.visibleFromT).toISOString()
      : undefined);
  if (!timestamp) return null;

  return {
    report_text: reportText,
    timestamp_utc: timestamp,
    report_type: asString(userData.report_type) ?? reportTypeFromName(feature.name ?? ""),
    equipment: asString(userData.equipment),
    activity: asString(userData.activity),
    source_evaluation: asString(userData.source_evaluation),
    evaluation: asString(userData.evaluation),
    report_id: asString(userData.report_id) ?? feature.id,
    mgrs: asString(userData.mgrs),
  };
}

/** Collect all traffic report features from the imported ITDX layer. */
export function collectTrafficReports(scenario: TScenario): TrafficReportRecord[] {
  const layer = scenario.store.state.layerStackMap[TRAFFIC_REPORTS_LAYER_ID];
  if (!isScenarioOverlayLayer(layer)) return [];

  const records: TrafficReportRecord[] = [];
  for (const featureId of layer.items) {
    const item = scenario.store.state.layerItemMap[featureId];
    if (!item || item.kind !== "geometry") continue;
    const record = featureToRecord(item as NGeometryLayerItem);
    if (record) records.push(record);
  }

  return records.sort(
    (a, b) => dayjs(a.timestamp_utc).valueOf() - dayjs(b.timestamp_utc).valueOf(),
  );
}
