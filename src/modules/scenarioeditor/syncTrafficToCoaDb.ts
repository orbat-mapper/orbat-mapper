import type { TrafficReportRecord } from "@/modules/scenarioeditor/collectTrafficReports";
import { trafficRecordsFingerprint } from "@/modules/scenarioeditor/trafficFingerprint";

const DEFAULT_API_BASE = "/api/coa";

function apiBase() {
  return import.meta.env.VITE_COA_API_BASE ?? DEFAULT_API_BASE;
}

export interface TrafficSyncResponse {
  scenario_id: string;
  report_count: number;
  updated_at: string;
}

export async function syncTrafficToCoaDb(
  scenarioId: string,
  records: TrafficReportRecord[],
): Promise<TrafficSyncResponse> {
  const response = await fetch(`${apiBase()}/traffic/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scenario_id: scenarioId,
      records,
      fingerprint: trafficRecordsFingerprint(records),
    }),
  });
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) detail = payload.detail;
    } catch {
      // keep status text
    }
    throw new Error(detail);
  }
  return response.json() as Promise<TrafficSyncResponse>;
}
