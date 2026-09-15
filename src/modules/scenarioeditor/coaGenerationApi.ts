import type { CoaAssumptionsCatalog } from "@/modules/scenarioeditor/coaGenerationAssumptions";
import type { CoaHypothesisPriors } from "@/modules/scenarioeditor/coaGenerationParameters";
import type { CoaLogKind } from "@/modules/scenarioeditor/coaGenerationSession";
import type { TrafficReportRecord } from "@/modules/scenarioeditor/collectTrafficReports";

export const TRAFFIC_BATCH_SIZE = 50;

const DEFAULT_API_BASE = "/api/coa";

export interface CoaApiLogEntry {
  t: string;
  kind: CoaLogKind;
  message: string;
}

export interface EntityEvidence {
  hypotheses: string[];
  entities: string[];
  log_Z: number[][];
  evidence: number;
  spread: number[];
}

export interface CoaStepResponse {
  done: boolean;
  step_index: number;
  step_time: string;
  mlcoa: string;
  p_c: CoaHypothesisPriors;
  entropy: number;
  flags: string[];
  latency_ms: number;
  report_count: number;
  log: CoaApiLogEntry[];
  entity_evidence: EntityEvidence | null;
}

export interface CoaResetResponse {
  observation_count: number;
  skipped_count: number;
  skipped: { index: string; report_id: string; reason: string }[];
  step_count: number;
  window_start: string;
  window_end: string;
  partial?: boolean;
}

export interface CoaExtendResponse {
  added_observations: number;
  observation_count: number;
  step_count: number;
  extended_steps: number;
  window_end: string | null;
  partial?: boolean;
}

function apiBase() {
  return import.meta.env.VITE_COA_API_BASE ?? DEFAULT_API_BASE;
}

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
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
  return response.json() as Promise<T>;
}

export async function resetCoaSession(
  scenarioId: string,
  priors: CoaHypothesisPriors,
  options?: { records?: TrafficReportRecord[]; partial?: boolean },
): Promise<CoaResetResponse> {
  return postJson<CoaResetResponse>("/reset", {
    scenario_id: scenarioId,
    priors,
    records: options?.records,
    partial: options?.partial ?? false,
  });
}

export async function extendCoaSession(
  records: TrafficReportRecord[],
): Promise<CoaExtendResponse> {
  return postJson<CoaExtendResponse>("/session/extend", { records });
}

export async function stepCoaSession(): Promise<CoaStepResponse> {
  return postJson<CoaStepResponse>("/step");
}

export async function applyCoaFrago(priors: CoaHypothesisPriors): Promise<{
  mlcoa: string;
  p_c: CoaHypothesisPriors;
  entropy: number;
}> {
  return postJson("/frago", { priors });
}

export async function checkCoaApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${apiBase()}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchCoaAssumptions(): Promise<CoaAssumptionsCatalog> {
  const response = await fetch(`${apiBase()}/assumptions`);
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
  return response.json() as Promise<CoaAssumptionsCatalog>;
}
