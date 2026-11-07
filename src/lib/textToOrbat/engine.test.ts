import { describe, expect, it, vi } from "vitest";
import { createTextToOrbat } from "./index";

const NAME_FIRST = { fields: "name,shortName,description" } as const;

describe("createTextToOrbat", () => {
  it("parses with its own mappings", () => {
    const engine = createTextToOrbat();
    engine.mappings.addIcon(
      { sidc: "10001000001205000000", label: "Wombats", aliases: ["wombat"] },
      "prepend",
    );

    const [unit] = engine.parse("Wombat Company");

    expect(unit.sidc).toBe("10031000151205000000");
  });

  it("keeps engines independent", () => {
    const custom = createTextToOrbat();
    const plain = createTextToOrbat();
    custom.mappings.extendEchelon("16", ["warband"]);

    expect(custom.classify("1st Warband").echelon?.code).toBe("16");
    expect(plain.classify("1st Warband").echelon).toBeNull();
  });

  it("starts from saved mappings without undo history", () => {
    const source = createTextToOrbat();
    source.mappings.extendEchelon("16", ["warband"]);

    const restored = createTextToOrbat({ mappings: source.mappings.exportMappings() });

    expect(restored.classify("1st Warband").echelon?.code).toBe("16");
    expect(restored.mappings.canUndo).toBe(false);
    expect(restored.mappings.isCustomized).toBe(true);
  });
});

describe("classify", () => {
  it("reports the matched echelon and icon with labels", () => {
    const result = createTextToOrbat().classify("2nd Armoured Battalion");

    expect(result.echelon).toEqual({ code: "16", label: "Battalion" });
    expect(result.icon?.label).toBe("Armor");
    expect(result.sidc.substring(8, 10)).toBe("16");
  });

  it("returns null matches but still a SIDC for unknown names", () => {
    const result = createTextToOrbat().classify("Zebra", { standardIdentity: "6" });

    expect(result.echelon).toBeNull();
    expect(result.icon).toBeNull();
    expect(result.sidc[3]).toBe("6");
  });
});

describe("describe", () => {
  it("labels the echelon and icon of a SIDC", () => {
    const engine = createTextToOrbat();
    const [unit] = engine.parse("1st Infantry Battalion");

    expect(engine.describe(unit.sidc)).toEqual({
      echelon: "Battalion",
      icon: "Infantry",
    });
  });
});

describe("mappings change notification", () => {
  it("notifies subscribers once per change, undo included", () => {
    const engine = createTextToOrbat();
    const listener = vi.fn();
    const unsubscribe = engine.mappings.subscribe(listener);

    engine.mappings.resetToDefaults();
    engine.mappings.undo();
    unsubscribe();
    engine.mappings.extendEchelon("16", ["warband"]);

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("tracks whether the mappings differ from the built-ins", () => {
    const engine = createTextToOrbat();
    expect(engine.mappings.isCustomized).toBe(false);

    engine.mappings.extendEchelon("16", ["warband"]);
    expect(engine.mappings.isCustomized).toBe(true);

    engine.mappings.resetIconsToDefaults();
    expect(engine.mappings.isCustomized).toBe(true);

    engine.mappings.resetEchelonsToDefaults();
    expect(engine.mappings.isCustomized).toBe(false);
  });
});

describe("suggestions", () => {
  it("follows changes to the mappings", () => {
    const engine = createTextToOrbat();
    expect(engine.suggestions().some((s) => s.label === "warband")).toBe(false);

    engine.mappings.extendEchelon("16", ["warband"]);

    expect(engine.suggestions()).toContainEqual(
      expect.objectContaining({ label: "warband", detail: "Battalion", kind: "echelon" }),
    );
  });
});

describe("rewriteShortNames", () => {
  it("applies generated short names without destroying comments or metadata markup", () => {
    const source = [
      "# heading",
      "5 Inf Bde // mech",
      "  2nd Bn Scots Guards [infantry] # comment",
      "  1st Bn Welsh Guards, 1 BN WEL |guards|",
    ].join("\n");

    const result = createTextToOrbat().rewriteShortNames(source, "generate", NAME_FIRST);

    expect(result.changedCount).toBe(2);
    expect(result.text).toContain("5 Inf Bde, 5 INF BDE // mech");
    expect(result.text).toContain("2nd Bn Scots Guards, 2 BN SCOT [infantry] # comment");
    expect(result.text).toContain("1st Bn Welsh Guards, 1 BN WEL |guards|");
    expect(result.text).toContain("# heading");
  });

  it("fills an empty short-name slot when description is already present", () => {
    const result = createTextToOrbat().rewriteShortNames(
      "3rd RA,,description",
      "generate",
      NAME_FIRST,
    );

    expect(result.changedCount).toBe(1);
    expect(result.text).toBe("3rd RA, 3 RA, description");
  });

  it("clears short names while preserving descriptions", () => {
    const result = createTextToOrbat().rewriteShortNames(
      "3rd RA, 3 RA, description",
      "clear",
      NAME_FIRST,
    );

    expect(result.changedCount).toBe(1);
    expect(result.text).toBe("3rd RA, , description");
  });

  it("passes short-name settings through", () => {
    const result = createTextToOrbat().rewriteShortNames("63 AD Squadron", "generate", {
      shortNames: {
        maxLength: 4,
        uppercase: false,
        allowWhitespace: false,
        forceLength: true,
      },
    });

    expect(result.text).toBe("63 AD Squadron, 63AD");
  });

  it("reports no changes when every unit already has a short name", () => {
    const source = "1st Division, 1 DIV";
    const result = createTextToOrbat().rewriteShortNames(source, "generate", NAME_FIRST);

    expect(result).toEqual({ text: source, changedCount: 0 });
  });
});
