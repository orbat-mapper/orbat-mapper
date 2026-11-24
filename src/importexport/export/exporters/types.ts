import type { Component } from "vue";
import type { TScenario } from "@/scenariostore";
import type { ExportFormat } from "@/types/importExport";

/** What an exporter produces. The export dialog saves it or copies it to the clipboard. */
export interface ExportFile {
  content: string | Blob;
  fileName: string;
  mimeType: string;
  /** File name extension offered in the save dialog, with the dot. */
  extension: string;
  /** Things the user should know about the result, such as fallbacks that were used. */
  warnings?: string[];
}

export interface ExportContext {
  scenario: TScenario;
}

/** One export format in the export dialog. */
export interface Exporter<S extends object = object> {
  id: ExportFormat;
  label: string;
  description: string;
  /**
   * Edits the format's settings with `v-model`. Gets the format id as the `format` prop,
   * which it must declare.
   */
  settingsComponent: Component;
  /** The settings a user starts with. Each format's settings are saved separately. */
  defaultSettings: () => S;
  /** False for binary formats, which cannot be copied as text. */
  canCopyToClipboard: boolean;
  /** Shown under the format picker on small screens, where descriptions are hidden. */
  hint?: string;
  /** Shown below the settings, for example to say that a format is experimental. */
  note?: string;
  generate(context: ExportContext, settings: S): Promise<ExportFile>;
}
