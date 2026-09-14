import { describe, expect, it } from "vitest";
import {
  DEFAULT_COA_HYPOTHESIS_PRIORS,
  formatCoaPriors,
} from "@/modules/scenarioeditor/coaGenerationParameters";

describe("coaGenerationParameters", () => {
  it("uses ITDX-2026 default hypothesis priors", () => {
    expect(DEFAULT_COA_HYPOTHESIS_PRIORS).toEqual({
      SPOIL: 0.55,
      INTEG: 0.2,
      DISP: 0.15,
      HOLD: 0.1,
    });
  });

  it("formats priors like the Streamlit sidebar", () => {
    expect(formatCoaPriors(DEFAULT_COA_HYPOTHESIS_PRIORS)).toBe(
      "SPOIL 55%, INTEG 20%, DISP 15%, HOLD 10%",
    );
  });
});
