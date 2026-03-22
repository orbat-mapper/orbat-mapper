import { describe, expect, it } from "vitest";
import { MappingRegistry, parseMappingsFromXlsxWorkbook } from "./mappingRegistry";
import {
  BUILTIN_ICON_DEFINITIONS,
  ICON_UNSPECIFIED,
  buildIconSidc,
  extractEntityCode,
} from "./iconRegistry";
import { BUILTIN_ECHELON_DEFINITIONS } from "./echelonRegistry";

const ICON_INFANTRY = extractEntityCode(
  BUILTIN_ICON_DEFINITIONS.find((d) => d.label === "Infantry")!.sidc,
);
const ICON_ARMOR = extractEntityCode(
  BUILTIN_ICON_DEFINITIONS.find((d) => d.label === "Armor")!.sidc,
);
const ECHELON_BATTALION = BUILTIN_ECHELON_DEFINITIONS.find(
  (d) => d.label === "Battalion",
)!.code;
import {
  getIconCodeFromName,
  getEchelonCodeFromName,
  parseTextToUnits,
  getIconFromSidc,
} from "./textToOrbat";

describe("MappingRegistry — adding new mappings", () => {
  it("adds a new icon mapping that matches in getIconCodeFromName", () => {
    const registry = new MappingRegistry();
    const DRONE_CODE = "1206010000";

    // Before: "drone" matches nothing
    expect(getIconCodeFromName("Drone Squadron", registry)).toBe(ICON_UNSPECIFIED);

    // Add user-defined mapping
    registry.addIcon({
      sidc: buildIconSidc(DRONE_CODE),
      label: "Drone",
      aliases: ["drone", "uav", "uas", "rpas"],
    });

    // After: all aliases resolve
    expect(getIconCodeFromName("Drone Squadron", registry)).toBe(DRONE_CODE);
    expect(getIconCodeFromName("1st UAV Company", registry)).toBe(DRONE_CODE);
    expect(getIconCodeFromName("UAS Platoon", registry)).toBe(DRONE_CODE);
    expect(getIconCodeFromName("RPAS Flight", registry)).toBe(DRONE_CODE);
  });

  it("extends an existing icon with extra aliases", () => {
    const registry = new MappingRegistry();

    // "fusiliers" doesn't match infantry by default
    expect(getIconCodeFromName("Royal Fusiliers", registry)).toBe(ICON_UNSPECIFIED);

    // Extend the infantry icon with a new alias (now uses full SIDC)
    registry.extendIcon(buildIconSidc(ICON_INFANTRY), ["fusilier(s)"]);

    expect(getIconCodeFromName("Royal Fusiliers", registry)).toBe(ICON_INFANTRY);
    expect(getIconCodeFromName("Fusilier Company", registry)).toBe(ICON_INFANTRY);
  });

  it("user-prepended mappings take priority over built-ins", () => {
    const registry = new MappingRegistry();
    const CUSTOM_CODE = "9999000000";

    // "Panzer" normally matches armor
    expect(getIconCodeFromName("Panzer Division", registry)).toBe(ICON_ARMOR);

    // Prepend a user mapping that hijacks "panzer"
    registry.addIcon(
      {
        sidc: buildIconSidc(CUSTOM_CODE),
        label: "Custom Panzer",
        aliases: ["panzer"],
      },
      "prepend",
    );

    // Now the user mapping wins
    expect(getIconCodeFromName("Panzer Division", registry)).toBe(CUSTOM_CODE);
  });

  it("extends an existing echelon with extra aliases", () => {
    const registry = new MappingRegistry();

    // "Tabor" doesn't match anything by default
    expect(getEchelonCodeFromName("1st Tabor", registry)).toBe("00");

    // Let "tabor" map to battalion
    registry.extendEchelon(ECHELON_BATTALION, ["tabor"]);

    expect(getEchelonCodeFromName("1st Tabor", registry)).toBe(ECHELON_BATTALION);
  });

  it("custom registry flows through parseTextToUnits", () => {
    const registry = new MappingRegistry();
    const DRONE_CODE = "1206010000";

    registry.addIcon({
      sidc: buildIconSidc(DRONE_CODE),
      label: "Drone",
      aliases: ["drone", "uav"],
    });

    const text = `1st Infantry Division
  UAV Company
  Drone Platoon`;

    const units = parseTextToUnits(text, registry);
    expect(units).toHaveLength(1);
    expect(getIconFromSidc(units[0].sidc)).toBe(ICON_INFANTRY);
    expect(getIconFromSidc(units[0].children[0].sidc)).toBe(DRONE_CODE);
    expect(getIconFromSidc(units[0].children[1].sidc)).toBe(DRONE_CODE);
  });

  it("does not affect other MappingRegistry instances", () => {
    const registryA = new MappingRegistry();
    const registryB = new MappingRegistry();

    registryA.addIcon({
      sidc: buildIconSidc("1206010000"),
      label: "Drone",
      aliases: ["drone"],
    });

    // registryA matches, registryB does not
    expect(getIconCodeFromName("Drone Squadron", registryA)).toBe("1206010000");
    expect(getIconCodeFromName("Drone Squadron", registryB)).toBe(ICON_UNSPECIFIED);
  });

  it("exportMappings → importMappings round-trip preserves mappings", () => {
    const registry1 = new MappingRegistry();
    registry1.extendIcon(buildIconSidc(ICON_INFANTRY), ["fusilier(s)"]);
    registry1.addIcon({
      sidc: buildIconSidc("1206010000"),
      label: "Drone",
      aliases: ["drone"],
    });
    registry1.extendEchelon(ECHELON_BATTALION, ["tabor"]);

    const exported = registry1.exportMappings();

    const registry2 = new MappingRegistry();
    registry2.importMappings(exported);

    expect(getIconCodeFromName("Fusilier Company", registry2)).toBe(ICON_INFANTRY);
    expect(getIconCodeFromName("Drone Squadron", registry2)).toBe("1206010000");
    expect(getEchelonCodeFromName("1st Tabor", registry2)).toBe(ECHELON_BATTALION);
    // Built-ins still work
    expect(getIconCodeFromName("1st Armored Division", registry2)).toBe(ICON_ARMOR);
  });

  it("resetToDefaults clears all customizations", () => {
    const registry = new MappingRegistry();

    registry.extendIcon(buildIconSidc(ICON_INFANTRY), ["fusilier(s)"]);
    registry.addIcon({
      sidc: buildIconSidc("1206010000"),
      label: "Drone",
      aliases: ["drone"],
    });
    registry.extendEchelon(ECHELON_BATTALION, ["tabor"]);

    expect(getIconCodeFromName("Fusilier Company", registry)).toBe(ICON_INFANTRY);

    registry.resetToDefaults();

    expect(getIconCodeFromName("Fusilier Company", registry)).toBe(ICON_UNSPECIFIED);
    expect(getIconCodeFromName("Drone Squadron", registry)).toBe(ICON_UNSPECIFIED);
    expect(getEchelonCodeFromName("1st Tabor", registry)).toBe("00");
    // Built-ins still work
    expect(getIconCodeFromName("1st Infantry Division", registry)).toBe(ICON_INFANTRY);
  });

  it("version increments on each mutation", () => {
    const registry = new MappingRegistry();
    const v0 = registry.version;

    registry.extendIcon(buildIconSidc(ICON_INFANTRY), ["fusilier(s)"]);
    expect(registry.version).toBeGreaterThan(v0);

    const v1 = registry.version;
    registry.addIcon({
      sidc: buildIconSidc("1206010000"),
      label: "Drone",
      aliases: ["drone"],
    });
    expect(registry.version).toBeGreaterThan(v1);

    const v2 = registry.version;
    registry.extendEchelon(ECHELON_BATTALION, ["tabor"]);
    expect(registry.version).toBeGreaterThan(v2);
  });

  it("XLSX roundtrip: exportRows → parseMappingsFromXlsxWorkbook → importMappings preserves mappings", () => {
    const registry1 = new MappingRegistry();
    registry1.extendIcon(buildIconSidc(ICON_INFANTRY), ["fusilier(s)"]);
    registry1.addIcon({
      sidc: buildIconSidc("1206010000"),
      label: "Drone",
      aliases: ["drone", "uav"],
      patterns: [/\bRPA\b/],
    });
    registry1.extendEchelon(ECHELON_BATTALION, ["tabor"]);

    // Simulate XLSX roundtrip: export rows, build a mock workbook, parse it back
    const iconRows = registry1.exportIconRows();
    const echelonRows = registry1.exportEchelonRows();

    const mockWorkbook = {
      SheetNames: ["Icons", "Echelons"],
      Sheets: { Icons: iconRows, Echelons: echelonRows },
    };
    // sheetToJson returns the rows directly (same as xlsxUtils.sheet_to_json roundtrip)
    const parsed = parseMappingsFromXlsxWorkbook(
      mockWorkbook,
      (sheet) => sheet as Record<string, unknown>[],
    );

    const registry2 = new MappingRegistry();
    registry2.importMappings(parsed);

    // Custom aliases work
    expect(getIconCodeFromName("Fusilier Company", registry2)).toBe(ICON_INFANTRY);
    expect(getIconCodeFromName("Drone Squadron", registry2)).toBe("1206010000");
    expect(getIconCodeFromName("1st UAV Platoon", registry2)).toBe("1206010000");
    expect(getEchelonCodeFromName("1st Tabor", registry2)).toBe(ECHELON_BATTALION);
    // Built-ins still work
    expect(getIconCodeFromName("1st Armored Division", registry2)).toBe(ICON_ARMOR);
  });

  it("importMappings replaces all definitions", () => {
    const registry = new MappingRegistry();

    // Import a minimal set — only one icon and one echelon
    registry.importMappings({
      icons: [
        {
          sidc: buildIconSidc("1211000000"),
          label: "Infantry",
          aliases: ["infantry", "inf"],
        },
      ],
      echelons: [{ code: "16", label: "Battalion", aliases: ["battalion", "bn"] }],
    });

    // The imported mappings work
    expect(getIconCodeFromName("1st Infantry", registry)).toBe("1211000000");
    expect(getEchelonCodeFromName("1st Battalion", registry)).toBe("16");

    // Other built-ins are gone since we replaced everything
    expect(getIconCodeFromName("Armor Company", registry)).toBe(ICON_UNSPECIFIED);
  });
});
