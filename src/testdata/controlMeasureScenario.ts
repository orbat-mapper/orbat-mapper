/**
 * The hand-authored M1 control-measure fixture.
 *
 * `controlMeasureScenario.json` is a real scenario *file* — modern shape, ISO
 * timestamps, no internal `_`-prefixed fields — so tests that load it exercise the
 * same path a user's file takes: `upgradeScenarioIfNecessary` → `prepareScenario` →
 * the kind-agnostic base passes.
 *
 * What it deliberately contains:
 * - control measures spread over **two** layers, so cross-layer render ordering is real;
 * - one of each host projection (identity, monochrome, planned status, authored style);
 * - one control measure that is manually hidden and one that is not yet in force, so
 *   the two tiers of visibility filtering are distinguishable;
 * - one `graphicKind` this build cannot draw, covering the aggregated load warning and
 *   the render-batch filter;
 * - an annotation and a measurement with timed state — the kinds whose state has never
 *   projected before the step-2 base passes;
 * - a geometry item, so nothing here can pass by accidentally treating every item as a
 *   control measure.
 */
import type { Scenario } from "@/types/scenarioModels";
import controlMeasureScenario from "@/testdata/controlMeasureScenario.json";

/** Scenario start, and the store's `currentTime` immediately after load. */
export const FIXTURE_T0 = Date.parse("2025-06-01T00:00:00Z");
/**
 * Between T0 and T2. `annotation-note` and `cm-late` are stamped `visibleFromT` here.
 * The bound is exclusive, so at exactly T1 both are still hidden; at T2 they are not.
 */
export const FIXTURE_T1 = Date.parse("2025-06-01T06:00:00Z");
/** Every timed state entry in the fixture is stamped here. */
export const FIXTURE_T2 = Date.parse("2025-06-01T12:00:00Z");

/**
 * A fresh deep copy of the fixture on every call.
 *
 * The scenario store keeps references into the object it is handed and Vue then wraps
 * them reactively, so a shared instance would leak state between tests.
 */
export function loadControlMeasureScenarioFixture(): Scenario {
  return JSON.parse(JSON.stringify(controlMeasureScenario)) as Scenario;
}
