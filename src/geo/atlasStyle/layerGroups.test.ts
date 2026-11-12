import { describe, expect, it, vi } from "vitest";
import {
  ALL_ATLAS_LAYER_GROUPS,
  ATLAS_LABEL_CATEGORIES,
  ATLAS_LAYER_GROUPS,
  applyAtlasLayerGroups,
  canDrawLabelCategory,
  createAtlasStyle,
  type AtlasLayerGroup,
} from "@/geo/atlasStyle";

const ALL = [...ALL_ATLAS_LAYER_GROUPS];
const allBut = (...hidden: AtlasLayerGroup[]) =>
  ALL.filter((group) => !hidden.includes(group));

type Layer = ReturnType<typeof createAtlasStyle>["layers"][number];

/** The ids `createAtlasStyle` draws when only `show` is on. */
function visibleIds(show: AtlasLayerGroup[]) {
  return createAtlasStyle({ show })
    .layers.filter((layer: Layer) => layer.layout?.visibility !== "none")
    .map((layer: Layer) => layer.id);
}

/** A live map over a style, recording what `applyAtlasLayerGroups` sets. */
function fakeMap(layers: { id: string; metadata?: unknown }[]) {
  const visibility = new Map<string, string>();
  return {
    visibility,
    getLayersOrder: () => layers.map((layer) => layer.id),
    getLayer: (id: string) => layers.find((layer) => layer.id === id),
    setLayoutProperty: vi.fn<(id: string, name: string, value: unknown) => void>(
      (id, name, value) => {
        if (name === "visibility") visibility.set(id, value as string);
      },
    ),
  };
}

describe("Atlas layer groups", () => {
  it("offers borders, cities, rivers, lakes and labels", () => {
    expect(ATLAS_LAYER_GROUPS.map((group) => group.value)).toEqual([
      "borders",
      "cities",
      "waterways",
      "lakes",
      "labels",
    ]);
    expect(ATLAS_LAYER_GROUPS.map((group) => group.label)).toEqual([
      "Borders",
      "Cities",
      "Rivers",
      "Lakes & reservoirs",
      "Labels",
    ]);
  });

  it("offers a category for each kind of label", () => {
    expect(ATLAS_LABEL_CATEGORIES.map((category) => category.label)).toEqual([
      "Countries",
      "States",
      "Rivers",
      "Seas",
      "Islands",
      "Cities",
    ]);
  });

  it("draws every layer by default", () => {
    const all = createAtlasStyle().layers;
    expect(all.every((layer) => layer.layout?.visibility !== "none")).toBe(true);
    expect(visibleIds(ALL)).toEqual(all.map((layer) => layer.id));
  });

  it("leaves out all four kinds of border, and nothing else, without borders", () => {
    const removed = visibleIds(ALL).filter(
      (id) => !visibleIds(allBut("borders")).includes(id),
    );
    expect(removed).toEqual([
      "state-borders",
      "border-ribbon",
      "borders",
      "borders-disputed",
    ]);
  });

  it("leaves out town dots and names without cities", () => {
    const removed = visibleIds(ALL).filter(
      (id) => !visibleIds(allBut("cities")).includes(id),
    );
    expect(removed).toEqual(["town-dots", "town-labels"]);
  });

  it("leaves out rivers, their banks and names without waterways", () => {
    const removed = visibleIds(ALL).filter(
      (id) => !visibleIds(allBut("waterways")).includes(id),
    );
    expect(removed).toEqual(["rivers", "river-shoreline", "river-water", "river-labels"]);
  });

  it("leaves out lakes, reservoirs and their names without lakes", () => {
    const removed = visibleIds(ALL).filter(
      (id) => !visibleIds(allBut("lakes")).includes(id),
    );
    expect(removed).toEqual(["lake-shoreline", "lake-water", "lake-labels"]);
  });

  it("draws each water polygon in exactly one of ocean, river and lake", () => {
    const waterLayers = (type: string) =>
      createAtlasStyle().layers.filter(
        (layer) =>
          layer.type === type &&
          "source-layer" in layer &&
          layer["source-layer"] === "water",
      );
    for (const type of ["fill", "line"]) {
      expect(
        waterLayers(type)
          .map((layer) => layer.id)
          .sort(),
      ).toEqual(
        type === "fill"
          ? ["lake-water", "river-water", "water"]
          : ["lake-shoreline", "river-shoreline", "shoreline"],
      );
    }
  });

  it("leaves out every name, but keeps the town dots, without labels", () => {
    const shown = visibleIds(allBut("labels"));
    const removed = visibleIds(ALL).filter((id) => !shown.includes(id));
    expect(removed).toEqual([
      "river-labels",
      "sea-labels",
      "lake-labels",
      "state-labels",
      "country-labels",
      "island-labels",
      "town-labels",
    ]);
    expect(shown).toContain("town-dots");
  });

  it.each([
    ["countries", "country-labels"],
    ["states", "state-labels"],
    ["rivers", "river-labels"],
    ["seas", "sea-labels", "lake-labels"],
    ["islands", "island-labels"],
    ["towns", "town-labels"],
  ] as const)(
    "leaves out only the %s names without that category",
    (category, ...layers) => {
      const removed = visibleIds(ALL).filter(
        (id) => !visibleIds(allBut(category)).includes(id),
      );
      expect(removed).toEqual(layers);
    },
  );

  it("keeps the base of the plate with every group off", () => {
    expect(visibleIds([])).toEqual(
      expect.arrayContaining(["paper", "elevation-bands-4", "shoreline", "water"]),
    );
  });

  it("keeps the sea with rivers and lakes off", () => {
    expect(visibleIds(allBut("waterways", "lakes"))).toEqual(
      expect.arrayContaining(["shoreline", "water", "sea-labels"]),
    );
  });
});

describe("canDrawLabelCategory", () => {
  const LAYERS = {
    countries: "country-labels",
    states: "state-labels",
    rivers: "river-labels",
    seas: "sea-labels",
    islands: "island-labels",
    towns: "town-labels",
  } as const;
  const OTHERS: AtlasLayerGroup[] = ["labels", "cities", "waterways"];
  /** Every combination of the groups a label category may depend on. */
  const PREREQUISITES: AtlasLayerGroup[][] = OTHERS.reduce<AtlasLayerGroup[][]>(
    (subsets, group) => [...subsets, ...subsets.map((subset) => [...subset, group])],
    [[]],
  );

  it.each(ATLAS_LABEL_CATEGORIES.map((category) => category.value))(
    "agrees with what the style draws once %s is on",
    (category) => {
      for (const others of PREREQUISITES) {
        const show = [category, ...others];
        expect(canDrawLabelCategory(category, show)).toBe(
          visibleIds(show).includes(LAYERS[category]),
        );
      }
    },
  );

  it("answers for a category that is itself off", () => {
    expect(canDrawLabelCategory("seas", ["labels"])).toBe(true);
    expect(canDrawLabelCategory("seas", ["cities"])).toBe(false);
  });

  it("needs rivers on to draw river names", () => {
    expect(canDrawLabelCategory("rivers", ["labels"])).toBe(false);
    expect(canDrawLabelCategory("rivers", ["labels", "waterways"])).toBe(true);
  });
});

describe("applyAtlasLayerGroups", () => {
  const style = () => createAtlasStyle().layers;

  it("hides the groups left out and shows the rest", () => {
    const map = fakeMap(style());
    applyAtlasLayerGroups(map, allBut("cities"));
    expect(map.visibility.get("town-dots")).toBe("none");
    expect(map.visibility.get("borders")).toBe("visible");
    expect(map.visibility.get("country-labels")).toBe("visible");
  });

  it("shows a layer in several groups only while all of them are on", () => {
    const map = fakeMap(style());
    for (const group of ["cities", "labels", "towns"] as const) {
      applyAtlasLayerGroups(map, allBut(group));
      expect(map.visibility.get("town-labels")).toBe("none");
    }
    applyAtlasLayerGroups(map, ALL);
    expect(map.visibility.get("town-labels")).toBe("visible");
  });

  it("keeps a hidden category hidden when the labels come back on", () => {
    const map = fakeMap(style());
    applyAtlasLayerGroups(map, allBut("labels", "seas"));
    applyAtlasLayerGroups(map, allBut("seas"));
    expect(map.visibility.get("sea-labels")).toBe("none");
    expect(map.visibility.get("river-labels")).toBe("visible");
  });

  it("leaves layers outside the groups alone, whatever their names or types", () => {
    const map = fakeMap([
      ...style(),
      // A configured style's layer and an app overlay that only look like Atlas's.
      { id: "tactical-labels" },
    ]);
    applyAtlasLayerGroups(map, []);
    expect(map.visibility.has("tactical-labels")).toBe(false);
    expect(map.visibility.has("water")).toBe(false);
  });

  it("does not mistake another style's layer named like an Atlas one", () => {
    const map = fakeMap([
      { id: "borders" },
      { id: "town-labels", metadata: { other: true } },
    ]);
    expect(applyAtlasLayerGroups(map, [])).toBe(false);
    expect(map.setLayoutProperty).not.toHaveBeenCalled();
  });

  it("reports whether the style has any grouped layers", () => {
    expect(applyAtlasLayerGroups(fakeMap(style()), ALL)).toBe(true);
    expect(applyAtlasLayerGroups(fakeMap([{ id: "water" }]), ALL)).toBe(false);
  });
});
