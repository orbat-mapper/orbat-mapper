import { describe, expect, it } from "vitest";
import { renderControlMeasure } from "@orbat-mapper/control-measures";
import {
  controlMeasureToGeoJsonFeatures,
  isControlMeasureLabelFeature,
} from "@/importexport/export/controlMeasureGeoJson";
import { useGeoJsonConverter } from "@/importexport/export/geojsonConverter";
import type { TScenario } from "@/scenariostore";
import type { TacticalGraphicLayerItem } from "@/types/scenarioLayerItems";

function phaseLine(
  overrides: Partial<TacticalGraphicLayerItem> = {},
): TacticalGraphicLayerItem {
  return {
    id: "cm1",
    kind: "tacticalGraphic",
    graphicKind: "phase-line",
    controlPoints: [
      [0, 0],
      [1, 1],
    ],
    textAmplifiers: { T: "BLUE" },
    ...overrides,
  };
}

describe("controlMeasureToGeoJsonFeatures", () => {
  it("emits the rendered graphic, not the stored control points", () => {
    const features = controlMeasureToGeoJsonFeatures(phaseLine());
    expect(features.length).toBeGreaterThan(0);
    // A phase line's geometry is a LineString the renderer produced; the control
    // points survive only in the parameter bag.
    expect(features[0].geometry.type).toBe("LineString");
    expect(features[0].properties?.controlPoints).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });

  it("drops label features by labelPlacementKey", () => {
    const rendered = renderControlMeasure({
      id: "cm1",
      kind: "phase-line",
      controlPoints: [
        [0, 0],
        [1, 1],
      ],
      textAmplifiers: { T: "BLUE" },
    });
    // Guard the premise: this kind really does emit keyed labels.
    const labels = rendered.features.filter(isControlMeasureLabelFeature);
    expect(labels.length).toBeGreaterThan(0);

    const features = controlMeasureToGeoJsonFeatures(phaseLine());
    expect(features).toHaveLength(rendered.features.length - labels.length);
    expect(features.every((f) => f.properties?.part !== "label")).toBe(true);
  });

  it("keeps the `text` kind, which is a Point carrying text and nothing else", () => {
    const features = controlMeasureToGeoJsonFeatures(
      phaseLine({ graphicKind: "text", controlPoints: [[0, 0]] }),
    );
    expect(features).toHaveLength(1);
    expect(features[0].geometry.type).toBe("Point");
    expect(features[0].properties?.part).toBe("text");
  });

  it("keeps area-defense's unkeyed glyph label", () => {
    const item = phaseLine({
      graphicKind: "area-defense",
      controlPoints: [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    });
    const rendered = renderControlMeasure({
      id: item.id,
      kind: "area-defense",
      controlPoints: item.controlPoints,
    });
    const glyph = rendered.features.find((f) => f.properties.part === "label");
    // The premise the issue warns about: a "Point + text" filter would erase this.
    expect(glyph?.geometry.type).toBe("Point");
    expect(glyph?.properties.text).toBeTruthy();
    expect(glyph?.properties.labelPlacementKey).toBeUndefined();

    const parts = controlMeasureToGeoJsonFeatures(item).map((f) => f.properties?.part);
    expect(parts).toContain("label");
  });

  it("stamps a structural cmId/part/index on every feature regardless of includeId", () => {
    // area-defense keeps three parts, so `index` is exercised beyond 0.
    const item = phaseLine({
      graphicKind: "area-defense",
      controlPoints: [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    });
    const rendered = renderControlMeasure({
      id: item.id,
      kind: "area-defense",
      controlPoints: item.controlPoints,
    });
    const features = controlMeasureToGeoJsonFeatures(item, {
      includeId: false,
      includeIdInProperties: false,
    });
    expect(features.length).toBeGreaterThan(1);
    features.forEach((f, i) => {
      expect(f.properties?.cmId).toBe("cm1");
      // The renderer's own part/index, carried through unchanged.
      expect(f.properties?.part).toBe(rendered.features[i].properties.part);
      expect(f.properties?.index).toBe(rendered.features[i].properties.index);
      expect(f.id).toBeUndefined();
      expect(f.properties?.id).toBeUndefined();
    });
  });

  it("honours includeId and includeIdInProperties with the renderer's stable id", () => {
    const [feature] = controlMeasureToGeoJsonFeatures(phaseLine(), {
      includeId: true,
      includeIdInProperties: true,
    });
    expect(feature.id).toBe("cm1:phase-line:0");
    expect(feature.properties?.id).toBe("cm1:phase-line:0");
    expect(feature.properties?.cmId).toBe("cm1");
  });

  it("carries the full item-level parameter bag", () => {
    const item = phaseLine({
      name: "PL BLUE",
      description: "a line",
      externalUrl: "https://example.com",
      locked: true,
      isHidden: false,
      visibleFromT: 100,
      visibleUntilT: 200,
      options: { echelon: "battalion" },
      amplifierPlacements: { T: [1, 2] },
      style: { strokeWidth: 3 },
      standardIdentity: "6",
      colorMode: "monochrome",
      status: "planned",
      userData: { unit: "1 BDE" },
    });
    const [{ properties }] = controlMeasureToGeoJsonFeatures(item);
    expect(properties).toMatchObject({
      graphicKind: "phase-line",
      controlPoints: [
        [0, 0],
        [1, 1],
      ],
      options: { echelon: "battalion" },
      textAmplifiers: { T: "BLUE" },
      amplifierPlacements: { T: [1, 2] },
      standardIdentity: "6",
      colorMode: "monochrome",
      status: "planned",
      name: "PL BLUE",
      description: "a line",
      externalUrl: "https://example.com",
      locked: true,
      isHidden: false,
      visibleFromT: 100,
      visibleUntilT: 200,
      unit: "1 BDE",
    });
  });

  it("emits the authored style, not the resolved render style", () => {
    // The bag is the reconstruction payload: it ships `style` alongside
    // standardIdentity/colorMode/status so the host projections are re-run, not baked
    // in twice. `color` and `strokeDash` are projections and must not appear here.
    const [{ properties }] = controlMeasureToGeoJsonFeatures(
      phaseLine({
        style: { strokeWidth: 3 },
        status: "planned",
        colorMode: "monochrome",
      }),
    );
    expect(properties?.style).toEqual({ strokeWidth: 3 });
  });

  it("omits absent optional fields rather than emitting undefined", () => {
    const [{ properties }] = controlMeasureToGeoJsonFeatures(phaseLine());
    expect(Object.keys(properties!).sort()).toEqual(
      ["cmId", "controlPoints", "graphicKind", "index", "part", "textAmplifiers"].sort(),
    );
  });

  it("refuses to shadow the bag's own keys from userData", () => {
    const [{ properties }] = controlMeasureToGeoJsonFeatures(
      phaseLine({ userData: { cmId: "spoofed", graphicKind: "boundary", ok: 1 } }),
    );
    expect(properties?.cmId).toBe("cm1");
    expect(properties?.graphicKind).toBe("phase-line");
    expect(properties?.ok).toBe(1);
  });

  it("emits nothing for an unsupported graphicKind", () => {
    expect(
      controlMeasureToGeoJsonFeatures(
        phaseLine({ graphicKind: "not-a-real-kind" as never }),
      ),
    ).toEqual([]);
  });

  it("emits nothing for an off-contract measure instead of throwing", () => {
    expect(controlMeasureToGeoJsonFeatures(phaseLine({ controlPoints: [] }))).toEqual([]);
  });

  it("exports the graphic as projected at the current scenario time", () => {
    const moved = phaseLine({
      _state: {
        t: 0,
        controlPoints: [
          [10, 10],
          [11, 11],
        ],
      },
    });
    const [feature] = controlMeasureToGeoJsonFeatures(moved);
    expect(feature.properties?.controlPoints).toEqual([
      [10, 10],
      [11, 11],
    ]);
    expect((feature.geometry as { coordinates: number[][] }).coordinates[0]).toEqual([
      10, 10,
    ]);
  });
});

describe("convertScenarioFeaturesToGeoJson", () => {
  function converterOver(items: unknown[]) {
    const scenario = {
      geo: { layerItemsLayers: { value: [{ items }] } },
      unitActions: {},
    } as unknown as TScenario;
    return useGeoJsonConverter(scenario).convertScenarioFeaturesToGeoJson;
  }

  const geometryItem = {
    id: "g1",
    kind: "geometry",
    geometry: { type: "Point", coordinates: [0, 0] },
    geometryMeta: { geometryKind: "Point" },
    style: {},
  };

  it("fans control measures in beside the plain geometry features", () => {
    const collection = converterOver([geometryItem, phaseLine()])({ includeId: true });
    expect(collection.features[0].id).toBe("g1");
    const cmFeatures = collection.features.filter((f) => f.properties?.cmId === "cm1");
    expect(cmFeatures.length).toBeGreaterThan(0);
    expect(collection.features).toHaveLength(1 + cmFeatures.length);
  });

  it("still emits cmId when the KML path asks for no ids at all", () => {
    // kmlExport.ts calls this with no options; the grouping key must survive.
    const collection = converterOver([phaseLine()])();
    expect(collection.features.every((f) => f.properties?.cmId === "cm1")).toBe(true);
    expect(collection.features.every((f) => f.id === undefined)).toBe(true);
  });
});
