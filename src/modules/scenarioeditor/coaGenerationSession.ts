import { computed, ref } from "vue";
import { useIntervalFn, useLocalStorage } from "@vueuse/core";
import dayjs from "dayjs";

import type { TScenario } from "@/scenariostore";
import {
  applyCoaFrago,
  extendCoaSession,
  resetCoaSession,
  stepCoaSession,
  TRAFFIC_BATCH_SIZE,
  type CoaApiLogEntry,
  type CoaExtendResponse,
  type CoaResetResponse,
} from "@/modules/scenarioeditor/coaGenerationApi";
import {
  collectTrafficReports,
  type TrafficReportRecord,
} from "@/modules/scenarioeditor/collectTrafficReports";
import { syncTrafficToCoaDb } from "@/modules/scenarioeditor/syncTrafficToCoaDb";
import { trafficRecordsFingerprint } from "@/modules/scenarioeditor/trafficFingerprint";
import {
  COA_HYPOTHESIS_NAMES,
  coaGenerationParameters,
  type CoaHypothesisName,
  type CoaHypothesisPriors,
} from "@/modules/scenarioeditor/coaGenerationParameters";

export type CoaLogKind = "REPORT" | "MLCOA" | "DISPOSITION" | "FLAG" | "LATENCY" | "INFO";

export interface CoaLogEntry {
  id: string;
  t: string;
  kind: CoaLogKind;
  message: string;
}

export interface CoaRunSnapshot {
  stepIndex: number;
  stepLabel: string;
  stepTime: string | null;
  mlcoa: CoaHypothesisName | null;
  p_c: CoaHypothesisPriors;
  entropy: number | null;
  flags: string[];
  done: boolean;
  observationCount: number;
  skippedCount: number;
  stepCount: number;
}

const PLAY_INTERVAL_MS = 350;

let logCounter = 0;
let scenarioRef: TScenario | null = null;

function nextLogId() {
  logCounter += 1;
  return `coa-log-${logCounter}`;
}

function defaultSnapshot(): CoaRunSnapshot {
  return {
    stepIndex: 0,
    stepLabel: "Not started",
    stepTime: null,
    mlcoa: null,
    p_c: { ...coaGenerationParameters.value.appliedPriors },
    entropy: null,
    flags: [],
    done: false,
    observationCount: 0,
    skippedCount: 0,
    stepCount: 0,
  };
}

const snapshot = ref<CoaRunSnapshot>(defaultSnapshot());
const logEntries = ref<CoaLogEntry[]>([]);
const playing = ref(false);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const sessionReady = ref(false);
const trafficLoading = ref(false);
const lastSyncedFingerprint = ref<string | null>(null);
let backgroundLoadPromise: Promise<void> | null = null;

export const coaGenerationActiveTab = useLocalStorage("coaGenerationActiveTab", "0");

export function bindCoaGenerationScenario(scenario: TScenario) {
  scenarioRef = scenario;
}

function appendLog(kind: CoaLogKind, message: string, t?: string) {
  logEntries.value.push({
    id: nextLogId(),
    kind,
    t: t ?? snapshot.value.stepLabel,
    message,
  });
}

function appendApiLog(entries: CoaApiLogEntry[]) {
  for (const entry of entries) {
    appendLog(entry.kind, entry.message, formatApiTime(entry.t));
  }
}

function formatApiTime(value: string) {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD HHmm[Z]") : value;
}

function applyStepResponse(response: Awaited<ReturnType<typeof stepCoaSession>>) {
  snapshot.value = {
    ...snapshot.value,
    stepIndex: response.step_index,
    stepLabel: formatApiTime(response.step_time),
    stepTime: response.step_time,
    mlcoa: response.mlcoa as CoaHypothesisName,
    p_c: response.p_c,
    entropy: response.entropy,
    flags: response.flags,
    done: response.done,
  };
  appendApiLog(response.log);

  if (scenarioRef && response.step_time) {
    scenarioRef.time.setCurrentTime(dayjs(response.step_time).valueOf());
  }
}

function applyResetResponse(response: CoaResetResponse) {
  snapshot.value = {
    ...snapshot.value,
    stepIndex: 0,
    stepLabel: "Ready",
    stepTime: response.window_start,
    observationCount: response.observation_count,
    skippedCount: response.skipped_count,
    stepCount: response.step_count,
    done: false,
  };
  sessionReady.value = true;
  appendLog(
    "INFO",
    `Loaded ${response.observation_count} traffic reports (${response.skipped_count} skipped). ` +
      `Window ${formatApiTime(response.window_start)} → ${formatApiTime(response.window_end)}; ` +
      `${response.step_count} hourly steps.`,
    "INIT",
  );
  if (response.skipped_count > 0) {
    appendLog(
      "INFO",
      `Skipped ${response.skipped_count} off-map or unparseable reports.`,
      "INIT",
    );
  }
}

function applyExtendResponse(response: CoaExtendResponse) {
  snapshot.value = {
    ...snapshot.value,
    observationCount: response.observation_count,
    stepCount: response.step_count,
  };
}

async function loadRemainingTrafficInBackground(allRecords: TrafficReportRecord[]) {
  if (!scenarioRef) return;

  const remainder = allRecords.slice(TRAFFIC_BATCH_SIZE);
  if (!remainder.length) {
    await syncTrafficToCoaDb(scenarioRef.store.state.id, allRecords);
    lastSyncedFingerprint.value = trafficRecordsFingerprint(allRecords);
    return;
  }

  trafficLoading.value = true;
  try {
    for (let offset = 0; offset < remainder.length; offset += TRAFFIC_BATCH_SIZE) {
      const batch = remainder.slice(offset, offset + TRAFFIC_BATCH_SIZE);
      const response = await extendCoaSession(batch);
      applyExtendResponse(response);
      const loaded = Math.min(offset + batch.length, remainder.length);
      appendLog(
        "INFO",
        `Background traffic: loaded ${loaded}/${remainder.length} remaining reports (+${response.extended_steps} hourly steps).`,
        "INIT",
      );
    }
    await syncTrafficToCoaDb(scenarioRef.store.state.id, allRecords);
    lastSyncedFingerprint.value = trafficRecordsFingerprint(allRecords);
    appendLog(
      "INFO",
      `All ${allRecords.length} traffic reports are now available for COA generation.`,
      "INIT",
    );
  } finally {
    trafficLoading.value = false;
    backgroundLoadPromise = null;
  }
}

async function ensureSessionInitialized(force = false) {
  if (!scenarioRef) {
    throw new Error("Open a scenario before running COA generation.");
  }
  if (sessionReady.value && !force) return;

  const allRecords = collectTrafficReports(scenarioRef);
  if (!allRecords.length) {
    throw new Error(
      "No traffic reports found. Import traffic reports onto the Traffic Reports layer first.",
    );
  }

  const initialBatch = allRecords.slice(0, TRAFFIC_BATCH_SIZE);
  const hasMoreTraffic = allRecords.length > initialBatch.length;

  const response = await resetCoaSession(
    scenarioRef.store.state.id,
    coaGenerationParameters.value.appliedPriors,
    { records: initialBatch, partial: hasMoreTraffic },
  );
  logEntries.value = [];
  applyResetResponse(response);

  if (hasMoreTraffic) {
    appendLog(
      "INFO",
      `Started with first ${initialBatch.length} of ${allRecords.length} reports — loading the rest in the background.`,
      "INIT",
    );
    backgroundLoadPromise = loadRemainingTrafficInBackground(allRecords);
    void backgroundLoadPromise;
  } else {
    const fingerprint = trafficRecordsFingerprint(allRecords);
    if (force || fingerprint !== lastSyncedFingerprint.value) {
      await syncTrafficToCoaDb(scenarioRef.store.state.id, allRecords);
      lastSyncedFingerprint.value = fingerprint;
    }
  }
}

async function step() {
  if (snapshot.value.done) return;
  loading.value = true;
  errorMessage.value = null;
  try {
    await ensureSessionInitialized();
    const response = await stepCoaSession();
    applyStepResponse(response);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error);
    appendLog("INFO", errorMessage.value, "ERROR");
  } finally {
    loading.value = false;
  }
}

async function reset() {
  pause();
  loading.value = true;
  errorMessage.value = null;
  try {
    sessionReady.value = false;
    trafficLoading.value = false;
    backgroundLoadPromise = null;
    lastSyncedFingerprint.value = null;
    snapshot.value = defaultSnapshot();
    logEntries.value = [];
    await ensureSessionInitialized(true);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error);
    appendLog("INFO", errorMessage.value, "ERROR");
  } finally {
    loading.value = false;
  }
}

function pause() {
  playing.value = false;
  pauseInterval();
}

async function togglePlay() {
  if (playing.value) {
    pause();
    return;
  }
  if (snapshot.value.done) return;
  playing.value = true;
  try {
    await ensureSessionInitialized();
    resumeInterval();
  } catch (error) {
    playing.value = false;
    errorMessage.value = error instanceof Error ? error.message : String(error);
    appendLog("INFO", errorMessage.value, "ERROR");
  }
}

const { pause: pauseInterval, resume: resumeInterval } = useIntervalFn(
  () => {
    void step().then(() => {
      if (snapshot.value.done) pause();
    });
  },
  PLAY_INTERVAL_MS,
  { immediate: false },
);

async function syncBeliefFromFrago() {
  snapshot.value = {
    ...snapshot.value,
    p_c: { ...coaGenerationParameters.value.appliedPriors },
    mlcoa: COA_HYPOTHESIS_NAMES.reduce((best, name) =>
      coaGenerationParameters.value.appliedPriors[name] >
      coaGenerationParameters.value.appliedPriors[best]
        ? name
        : best,
    ),
  };

  if (!sessionReady.value) return;

  try {
    const response = await applyCoaFrago(coaGenerationParameters.value.appliedPriors);
    snapshot.value = {
      ...snapshot.value,
      mlcoa: response.mlcoa as CoaHypothesisName,
      p_c: response.p_c,
      entropy: response.entropy,
    };
    appendLog(
      "INFO",
      `FRAGO applied — MLCOA ${response.mlcoa}, entropy ${response.entropy.toFixed(2)} bits.`,
      snapshot.value.stepLabel,
    );
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error);
    appendLog("INFO", errorMessage.value, "ERROR");
  }
}

const sortedLogEntries = computed(() => [...logEntries.value].reverse());

const ranking = computed(() =>
  COA_HYPOTHESIS_NAMES.map((name) => ({
    name,
    value: snapshot.value.p_c[name],
  })).sort((a, b) => b.value - a.value),
);

export function useCoaGenerationSession() {
  return {
    snapshot,
    logEntries,
    sortedLogEntries,
    ranking,
    playing,
    loading,
    errorMessage,
    sessionReady,
    trafficLoading,
    step,
    reset,
    togglePlay,
    pause,
    appendLog,
    syncBeliefFromFrago,
  };
}
