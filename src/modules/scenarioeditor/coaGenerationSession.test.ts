import { beforeEach, describe, expect, it, vi } from "vitest";
import { coaGenerationParameters } from "@/modules/scenarioeditor/coaGenerationParameters";

vi.mock("@/modules/scenarioeditor/coaGenerationApi", () => ({
  TRAFFIC_BATCH_SIZE: 20,
  resetCoaSession: vi.fn(async () => ({
    observation_count: 1,
    skipped_count: 0,
    skipped: [],
    step_count: 3,
    window_start: "2014-06-08T00:00:00+00:00",
    window_end: "2014-06-08T02:00:00+00:00",
    partial: false,
  })),
  extendCoaSession: vi.fn(async () => ({
    added_observations: 1,
    observation_count: 2,
    step_count: 5,
    extended_steps: 2,
    window_end: "2014-06-08T04:00:00+00:00",
    partial: false,
  })),
  stepCoaSession: vi.fn(async () => ({
    done: false,
    step_index: 1,
    step_time: "2014-06-08T00:00:00+00:00",
    mlcoa: "SPOIL",
    p_c: { SPOIL: 0.55, INTEG: 0.2, DISP: 0.15, HOLD: 0.1 },
    entropy: 1.2,
    flags: [],
    latency_ms: 12,
    report_count: 1,
    log: [{ t: "2014-06-08T00:00:00+00:00", kind: "MLCOA", message: "MLCOA SPOIL" }],
  })),
  applyCoaFrago: vi.fn(async () => ({
    mlcoa: "INTEG",
    p_c: { SPOIL: 0.1, INTEG: 0.7, DISP: 0.15, HOLD: 0.05 },
    entropy: 1.0,
  })),
  checkCoaApiHealth: vi.fn(async () => true),
}));

vi.mock("@/modules/scenarioeditor/collectTrafficReports", () => ({
  collectTrafficReports: vi.fn(() => [
    {
      report_text: "080008Z JUN 14 CONTACTREP GR 34UFA0448841743",
      timestamp_utc: "2014-06-08T00:08:46Z",
      report_type: "CONTACTREP",
    },
  ]),
}));

vi.mock("@/modules/scenarioeditor/syncTrafficToCoaDb", () => ({
  syncTrafficToCoaDb: vi.fn(async () => ({
    scenario_id: "scenario-test",
    report_count: 1,
    updated_at: "2026-08-25T00:00:00Z",
  })),
}));

describe("useCoaGenerationSession", () => {
  beforeEach(() => {
    vi.resetModules();
    coaGenerationParameters.value.appliedPriors = {
      SPOIL: 0.55,
      INTEG: 0.2,
      DISP: 0.15,
      HOLD: 0.1,
    };
  });

  it("loads traffic reports on reset and records MLCOA log lines when stepping", async () => {
    const { useCoaGenerationSession, bindCoaGenerationScenario } = await import(
      "@/modules/scenarioeditor/coaGenerationSession"
    );
    bindCoaGenerationScenario({
      store: { state: { id: "scenario-test" } },
      time: { setCurrentTime: vi.fn() },
    } as never);
    const session = useCoaGenerationSession();
    await session.step();

    expect(session.snapshot.value.observationCount).toBe(1);
    expect(session.snapshot.value.stepIndex).toBe(1);
    expect(session.logEntries.value.some((entry) => entry.kind === "MLCOA")).toBe(true);
  });

  it("syncs run belief from applied FRAGO priors through the API", async () => {
    const { useCoaGenerationSession, bindCoaGenerationScenario } = await import(
      "@/modules/scenarioeditor/coaGenerationSession"
    );
    bindCoaGenerationScenario({
      store: { state: { id: "scenario-test" } },
      time: { setCurrentTime: vi.fn() },
    } as never);
    const session = useCoaGenerationSession();
    await session.reset();
    coaGenerationParameters.value.appliedPriors.INTEG = 0.7;
    coaGenerationParameters.value.appliedPriors.SPOIL = 0.1;
    await session.syncBeliefFromFrago();

    expect(session.snapshot.value.mlcoa).toBe("INTEG");
    expect(session.snapshot.value.p_c.INTEG).toBe(0.7);
  });
});
