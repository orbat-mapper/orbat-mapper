import { importTrafficReports } from "@/importexport/importTrafficReports";
import { trafficReportsJsonlToPayload } from "@/importexport/importTrafficReportsJsonl";
import { trafficReportsImportOptions } from "@/importexport/trafficReportsImportOptions";
import { useNotifications } from "@/composables/notifications";
import type { TScenario } from "@/scenariostore";
import { useGeoStore } from "@/stores/geoStore";

export function isTrafficReportsJsonlFile(file: File) {
  return file.name.toLowerCase().endsWith(".jsonl");
}

/**
 * Shared by the layers panel drop zone and the editor-wide file drop target, which both
 * have to bypass the import wizard: it cannot map a report line to a located unit.
 */
export async function importTrafficReportsJsonlFile(
  scenario: TScenario,
  file: File,
): Promise<boolean> {
  const { send: notify } = useNotifications();
  const geoStore = useGeoStore();
  try {
    const options = trafficReportsImportOptions.value;
    const payload = trafficReportsJsonlToPayload(await file.text(), options);
    const result = importTrafficReports(scenario, payload);
    if (result.center) geoStore.panToLocation(result.center, 1200);
    const window =
      options.visibilityMinutes > 0
        ? `each visible for ${options.visibilityMinutes} min`
        : "each visible once reported";
    notify({
      type: "success",
      message: `Imported ${result.importedUnits} traffic reports (${options.targetYear}, ${window}).`,
    });
    return true;
  } catch (error) {
    notify({
      type: "error",
      message:
        error instanceof Error ? error.message : `Could not import ${file.name}.`,
    });
    return false;
  }
}
