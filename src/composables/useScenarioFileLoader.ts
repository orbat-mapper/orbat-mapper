import { ref } from "vue";

import type { ImportedScenarioPayload } from "@/composables/importScenarioTransfer";

function isScenarioFilePayload(payload: unknown): payload is ImportedScenarioPayload {
  if (!payload || typeof payload !== "object") return false;
  const scenario = payload as ImportedScenarioPayload;
  return scenario.type === "ORBAT-mapper" || scenario.type === "ORBAT-mapper-encrypted";
}

export function useScenarioFileLoader(
  onLoaded: (scenario: ImportedScenarioPayload) => void | Promise<void>,
) {
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const isError = ref(false);

  async function loadFile(file: File) {
    isError.value = false;

    try {
      const content = await readFileText(file);
      const scenarioData = JSON.parse(content) as unknown;

      if (!isScenarioFilePayload(scenarioData)) {
        throw new Error("Invalid scenario file");
      }

      await onLoaded(scenarioData);
    } catch (error) {
      console.error("Failed to load", file.name, error);
      isError.value = true;
    }
  }

  async function onFileChange(event: Event) {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0];
    if (!file) return;

    await loadFile(file);

    // Allow re-selecting the same file in the native picker.
    target.value = "";
  }

  function openFilePicker() {
    fileInputRef.value?.click();
  }

  return {
    fileInputRef,
    isError,
    loadFile,
    onFileChange,
    openFilePicker,
  };
}

async function readFileText(file: File): Promise<string> {
  if (typeof file.text === "function") {
    return await file.text();
  }

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
