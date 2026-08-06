import { describe, expect, it, vi } from "vitest";
import type { ControlMeasure } from "@orbat-mapper/control-measures";
import type { TScenario } from "@/scenariostore";
import {
  applyScenarioControlMeasureEdit,
  toControlMeasureEditUpdate,
} from "@/modules/scenarioeditor/controlMeasureEditHelpers";

function settledMeasure(): ControlMeasure {
  return {
    id: "cm-1",
    kind: "phase-line",
    controlPoints: [
      [10, 60],
      [11, 61],
    ],
    options: { width: 100 },
    textAmplifiers: { T: "PL BLUE" },
    style: { color: "#00ff00", strokeDash: [8, 6] },
  } as unknown as ControlMeasure;
}

describe("toControlMeasureEditUpdate", () => {
  it("never writes the resolved style back", () => {
    const update = toControlMeasureEditUpdate(settledMeasure());
    expect(update.style).toBeUndefined();
  });

  it("copies the arrays out of the object the engine still holds", () => {
    const measure = settledMeasure();
    const update = toControlMeasureEditUpdate(measure);

    expect(update.controlPoints).toEqual(measure.controlPoints);
    expect(update.controlPoints![0]).not.toBe(measure.controlPoints[0]);
    expect(update.options).not.toBe(measure.options);
    expect(update.textAmplifiers).not.toBe(measure.textAmplifiers);
  });

  it("omits what the settled measure does not carry", () => {
    const update = toControlMeasureEditUpdate({
      id: "cm-1",
      kind: "phase-line",
      controlPoints: [[10, 60]],
    } as unknown as ControlMeasure);

    expect(Object.keys(update)).toEqual(["controlPoints"]);
  });
});

describe("applyScenarioControlMeasureEdit", () => {
  it("writes once, through the tacticalGraphic door", () => {
    const updateTacticalGraphic = vi.fn();
    const scenario = { geo: { updateTacticalGraphic } } as unknown as TScenario;

    applyScenarioControlMeasureEdit(scenario, settledMeasure());

    expect(updateTacticalGraphic).toHaveBeenCalledTimes(1);
    expect(updateTacticalGraphic).toHaveBeenCalledWith("cm-1", {
      controlPoints: [
        [10, 60],
        [11, 61],
      ],
      options: { width: 100 },
      textAmplifiers: { T: "PL BLUE" },
    });
  });

  it("records shape only, leaving option and amplifier edits timeless", () => {
    const updateTacticalGraphic = vi.fn();
    const addTacticalGraphicStateControlPoints = vi.fn();
    const groupUpdate = vi.fn((fn: () => void) => fn());
    const scenario = {
      store: { groupUpdate },
      geo: { updateTacticalGraphic, addTacticalGraphicStateControlPoints },
    } as unknown as TScenario;

    applyScenarioControlMeasureEdit(scenario, settledMeasure(), { recordShape: true });

    expect(addTacticalGraphicStateControlPoints).toHaveBeenCalledWith("cm-1", [
      [10, 60],
      [11, 61],
    ]);
    expect(updateTacticalGraphic).toHaveBeenCalledWith("cm-1", {
      options: { width: 100 },
      textAmplifiers: { T: "PL BLUE" },
    });
    // Still one undo step, however many vertex drags the session contained.
    expect(groupUpdate).toHaveBeenCalledTimes(1);
  });

  it("writes nothing top-level while recording a shape-only edit", () => {
    const updateTacticalGraphic = vi.fn();
    const addTacticalGraphicStateControlPoints = vi.fn();
    const scenario = {
      store: { groupUpdate: (fn: () => void) => fn() },
      geo: { updateTacticalGraphic, addTacticalGraphicStateControlPoints },
    } as unknown as TScenario;

    applyScenarioControlMeasureEdit(
      scenario,
      {
        id: "cm-1",
        kind: "phase-line",
        controlPoints: [[10, 60]],
      } as unknown as ControlMeasure,
      { recordShape: true },
    );

    expect(updateTacticalGraphic).not.toHaveBeenCalled();
    expect(addTacticalGraphicStateControlPoints).toHaveBeenCalledTimes(1);
  });
});
