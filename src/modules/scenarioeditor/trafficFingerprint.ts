import type { TrafficReportRecord } from "@/modules/scenarioeditor/collectTrafficReports";

/** Cheap change detector so we only sync traffic to SQLite when the layer changed. */
export function trafficRecordsFingerprint(records: TrafficReportRecord[]): string {
  if (!records.length) return "0";
  const first = records[0]?.timestamp_utc ?? "";
  const last = records.at(-1)?.timestamp_utc ?? "";
  return `${records.length}|${first}|${last}`;
}
