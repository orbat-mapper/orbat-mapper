import { useLocalStorage } from "@vueuse/core";

/** COA hypothesis names from ITDX-2026 `config/priors.yaml`. */
export const COA_HYPOTHESIS_NAMES = ["SPOIL", "INTEG", "DISP", "HOLD"] as const;

export type CoaHypothesisName = (typeof COA_HYPOTHESIS_NAMES)[number];

export type CoaHypothesisPriors = Record<CoaHypothesisName, number>;

export interface CoaGenerationParameters {
  /** Slider values in the FRAGO editor (draft). */
  draftPriors: CoaHypothesisPriors;
  /** Last applied P₀, shown as "current belief" like the Streamlit sidebar. */
  appliedPriors: CoaHypothesisPriors;
}

/** Defaults mirror ITDX-2026 `config/priors.yaml`. */
export const DEFAULT_COA_HYPOTHESIS_PRIORS: CoaHypothesisPriors = {
  SPOIL: 0.55,
  INTEG: 0.2,
  DISP: 0.15,
  HOLD: 0.1,
};

export const DEFAULT_COA_GENERATION_PARAMETERS: CoaGenerationParameters = {
  draftPriors: { ...DEFAULT_COA_HYPOTHESIS_PRIORS },
  appliedPriors: { ...DEFAULT_COA_HYPOTHESIS_PRIORS },
};

export function formatCoaPriors(priors: CoaHypothesisPriors): string {
  return COA_HYPOTHESIS_NAMES.map((name) => `${name} ${(priors[name] * 100).toFixed(0)}%`).join(
    ", ",
  );
}

/**
 * Module-level store so the nav menu and details panel share the same COA inputs
 * without prop drilling through the scenario editor shell.
 */
export const coaGenerationParameters = useLocalStorage<CoaGenerationParameters>(
  "coaGenerationParameters",
  DEFAULT_COA_GENERATION_PARAMETERS,
  { mergeDefaults: true },
);
