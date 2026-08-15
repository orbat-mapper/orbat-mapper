import { describe, expect, it } from "vitest";
import {
  CONTROL_MEASURE_IDS,
  CONTROL_MEASURE_METADATA,
} from "@orbat-mapper/control-measures";
import type { ControlMeasureKind } from "@orbat-mapper/control-measures";
import { PREVIEW_FILL_PATTERNS } from "@orbat-mapper/control-measures/preview";
import {
  CONTROL_MEASURE_FILL_PATTERNS,
  GENERIC_GRAPHICS_ENTITY,
  canAuthorFillPattern,
  canAuthorStrokeWidth,
  fillPatternLabel,
  isStyleableControlMeasureKind,
  newControlMeasureDefaults,
} from "@/modules/scenarioeditor/controlMeasureStyleOptions";

describe("the styling gate", () => {
  it("covers exactly the 7 Generic Graphics kinds", () => {
    const styleable = CONTROL_MEASURE_IDS.filter(isStyleableControlMeasureKind);
    expect(styleable).toHaveLength(7);
    expect(styleable).toEqual(
      CONTROL_MEASURE_IDS.filter(
        (id) => CONTROL_MEASURE_METADATA[id].entity === GENERIC_GRAPHICS_ENTITY,
      ),
    );
    expect(isStyleableControlMeasureKind("polygon")).toBe(true);
    expect(isStyleableControlMeasureKind("phase-line")).toBe(false);
  });

  it("says nothing about an unknown kind", () => {
    expect(isStyleableControlMeasureKind("no-such-kind" as ControlMeasureKind)).toBe(
      false,
    );
    expect(isStyleableControlMeasureKind(undefined)).toBe(false);
  });

  it("offers a fill pattern only where the library says one reaches the output", () => {
    // `paints.fill === "user"` — the kinds governed by a `filled` boolean option.
    expect(CONTROL_MEASURE_IDS.filter(canAuthorFillPattern)).toEqual([
      "block-arrow",
      "polygon",
      "rectangle",
      "circle",
    ]);
    // Styleable, but its generator pins the pattern, so the control would be inert.
    expect(canAuthorFillPattern("classic-arrow")).toBe(false);
    expect(canAuthorFillPattern("line")).toBe(false);
  });

  it("offers stroke width exactly where the registry paints a stroke", () => {
    expect(canAuthorStrokeWidth("phase-line")).toBe(true);
    expect(canAuthorStrokeWidth("polygon")).toBe(true);
    expect(canAuthorStrokeWidth("text")).toBe(false);
  });
});

describe("fill pattern options", () => {
  it("is the library's own list plus solid, which has no tile", () => {
    expect(CONTROL_MEASURE_FILL_PATTERNS).toEqual([
      "solid",
      ...PREVIEW_FILL_PATTERNS.map((pattern) => pattern.id),
    ]);
  });

  it("labels a pattern from its id", () => {
    expect(fillPatternLabel("reverse-hatch")).toBe("Reverse hatch");
    expect(fillPatternLabel("dots")).toBe("Dots");
  });
});

describe("newControlMeasureDefaults", () => {
  const defaults = {
    standardIdentity: "3",
    colorMode: "identity",
    status: "planned",
    style: { color: "#ff0000", fillPattern: "hatch", strokeWidth: 4 },
    options: { smooth: true, smoothResolution: 8 },
  } as const;

  it("keeps the host-owned fields for every kind", () => {
    expect(newControlMeasureDefaults(defaults, "phase-line")).toEqual({
      standardIdentity: "3",
      colorMode: "identity",
      status: "planned",
      style: { strokeWidth: 4 },
      options: { smooth: true, smoothResolution: 8 },
    });
  });

  it("carries an authored colour onto a Generic Graphics kind", () => {
    expect(newControlMeasureDefaults(defaults, "polygon").style).toEqual({
      color: "#ff0000",
      fillPattern: "hatch",
      strokeWidth: 4,
    });
  });

  it("drops the fill pattern where it would be inert, but keeps the colour", () => {
    expect(newControlMeasureDefaults(defaults, "line").style).toEqual({
      color: "#ff0000",
      strokeWidth: 4,
    });
  });

  it("drops sticky smoothing for kinds that do not support it", () => {
    expect(newControlMeasureDefaults(defaults, "text").options).toBeUndefined();
  });

  it("copies sticky smoothing for kinds that support it", () => {
    const result = newControlMeasureDefaults(defaults, "phase-line");
    expect(result.options).toEqual({ smooth: true, smoothResolution: 8 });
    expect(result.options).not.toBe(defaults.options);
  });

  it("carries non-text doctrinal options only onto kinds that declare them", () => {
    const doctrinal = {
      ...defaults,
      options: { ...defaults.options, mineType: "antitank" },
    } as const;

    expect(newControlMeasureDefaults(doctrinal, "minefield").options).toEqual({
      mineType: "antitank",
    });
    expect(newControlMeasureDefaults(doctrinal, "phase-line").options).toEqual({
      smooth: true,
      smoothResolution: 8,
    });
  });

  it("emits no style at all when nothing survives the gate", () => {
    const colourless = { standardIdentity: "3", style: { fillPattern: "dots" } } as const;
    expect(newControlMeasureDefaults(colourless, "line")).toEqual({
      standardIdentity: "3",
    });
  });

  it("does not hand the store's own style object to the caller", () => {
    const result = newControlMeasureDefaults(defaults, "polygon");
    expect(result.style).not.toBe(defaults.style);
  });
});
