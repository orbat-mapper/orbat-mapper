import { effectScope, type Ref } from "vue";
import { tryOnScopeDispose, useLocalStorage } from "@vueuse/core";
import { klona } from "klona";
import type { Exporter } from "./types";

/**
 * A format's settings, seeded from the export settings that all formats used to share
 * (local storage key `exportSettings`). Only the keys the format has defaults for are
 * taken, so users keep their choices when each format gets its own saved settings.
 */
export function settingsFromLegacy<S extends object>(defaults: S, legacy: unknown): S {
  const result = klona(defaults);
  if (!legacy || typeof legacy !== "object") return result;
  const old = legacy as Record<string, unknown>;
  for (const key of Object.keys(defaults) as (keyof S & string)[]) {
    if (old[key] !== undefined) result[key] = klona(old[key]) as S[typeof key];
  }
  return result;
}

const LEGACY_STORAGE_KEY = "exportSettings";

function readLegacySettings(): unknown {
  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * The saved settings of each export format, under `exportSettings.<format id>`. A format
 * with no saved settings yet starts from the old shared settings, then its defaults.
 * Settings added to a format later get their default value.
 *
 * Call it in a component's setup. A format's settings are loaded the first time they are
 * asked for, and stop syncing with local storage when the component unmounts.
 */
export function useExporterSettings() {
  // Formats are loaded lazily, after setup, so their watchers and storage listeners
  // live in a scope of their own, which ends with the component's.
  const scope = effectScope();
  tryOnScopeDispose(() => scope.stop());
  const byFormat = new Map<string, Ref<object>>();
  return function settingsFor<S extends object>(exporter: Exporter<S>): Ref<S> {
    let settings = byFormat.get(exporter.id);
    if (!settings) {
      settings = scope.run(() =>
        useLocalStorage<object>(
          `${LEGACY_STORAGE_KEY}.${exporter.id}`,
          settingsFromLegacy(exporter.defaultSettings(), readLegacySettings()),
          { mergeDefaults: true },
        ),
      )!;
      byFormat.set(exporter.id, settings);
    }
    return settings as Ref<S>;
  };
}
