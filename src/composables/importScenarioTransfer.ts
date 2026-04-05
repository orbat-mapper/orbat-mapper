import { nanoid } from "@/utils";
import type { EncryptedScenario } from "@/types/scenarioModels";
import type { LoadableScenario } from "@/scenariostore/upgrade";

export type ImportedScenarioPayload = LoadableScenario | EncryptedScenario;

const STORAGE_PREFIX = "import-scenario-transfer:";
const MAX_AGE_MS = 5 * 60 * 1000;

interface StoredImportedScenario {
  savedAt: number;
  payload: ImportedScenarioPayload;
}

function getStorageKey(token: string) {
  return `${STORAGE_PREFIX}${token}`;
}

function isImportedScenarioPayload(payload: unknown): payload is ImportedScenarioPayload {
  if (!payload || typeof payload !== "object") return false;
  const scenario = payload as ImportedScenarioPayload;
  return scenario.type === "ORBAT-mapper" || scenario.type === "ORBAT-mapper-encrypted";
}

export function saveImportedScenario(payload: ImportedScenarioPayload): string {
  const token = nanoid();
  const storageKey = getStorageKey(token);
  const value: StoredImportedScenario = { savedAt: Date.now(), payload };
  sessionStorage.setItem(storageKey, JSON.stringify(value));
  return token;
}

export function consumeImportedScenario(token: string): ImportedScenarioPayload | null {
  const storageKey = getStorageKey(token);
  const raw = sessionStorage.getItem(storageKey);
  if (!raw) return null;

  // One-time read semantics for transient transfer payloads.
  sessionStorage.removeItem(storageKey);

  try {
    const parsed = JSON.parse(raw) as StoredImportedScenario;
    if (!parsed || typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    if (!isImportedScenarioPayload(parsed.payload)) return null;
    return parsed.payload;
  } catch {
    return null;
  }
}
