import { describe, expect, it } from "vitest";
import { MappingRegistry } from "./mappingRegistry";
import { ICON_INFANTRY, ICON_ARMOR, ICON_UNSPECIFIED } from "./iconRegistry";
import { ECHELON_BATTALION } from "./echelonRegistry";
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
      name: "ICON_DRONE",
      code: DRONE_CODE,
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

    // Extend the infantry icon with a new alias
    registry.extendIcon(ICON_INFANTRY, ["fusiliers?"]);

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
        name: "ICON_CUSTOM_PANZER",
        code: CUSTOM_CODE,
        label: "Custom Panzer",
        aliases: ["panzer"],
      },
      "prepend",
    );

    // Now the user mapping wins
    expect(getIconCodeFromName("Panzer Division", registry)).toBe(CUSTOM_CODE);
  });

  it("positioned insertion respects 'before' and 'after'", () => {
    const registry = new MappingRegistry();

    // Insert before ICON_ARMOR so the more-specific "heavy armour" pattern matches first
    registry.addIcon(
      {
        name: "ICON_HEAVY_ARMOR",
        code: "1205020000",
        label: "Heavy Armor",
        aliases: ["heavy\\s*armou?r"],
      },
      { placement: "before", referenceCode: ICON_ARMOR },
    );

    expect(getIconCodeFromName("Heavy Armour Battalion", registry)).toBe("1205020000");
    // Plain armor still resolves to the built-in
    expect(getIconCodeFromName("1st Armored Division", registry)).toBe(ICON_ARMOR);
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
      name: "ICON_DRONE",
      code: DRONE_CODE,
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

  it("importUserMappings round-trips correctly", () => {
    const registry = new MappingRegistry();

    registry.importUserMappings({
      iconExtensions: [{ code: ICON_INFANTRY, extraAliases: ["fusiliers?"] }],
      iconAdditions: [
        {
          code: "1206010000",
          label: "Drone",
          aliases: ["drone", "uav"],
        },
      ],
      echelonExtensions: [{ code: ECHELON_BATTALION, extraAliases: ["tabor"] }],
    });

    expect(getIconCodeFromName("Fusilier Company", registry)).toBe(ICON_INFANTRY);
    expect(getIconCodeFromName("Drone Squadron", registry)).toBe("1206010000");
    expect(getEchelonCodeFromName("1st Tabor", registry)).toBe(ECHELON_BATTALION);
  });

  it("does not affect other MappingRegistry instances", () => {
    const registryA = new MappingRegistry();
    const registryB = new MappingRegistry();

    registryA.addIcon({
      name: "ICON_DRONE",
      code: "1206010000",
      label: "Drone",
      aliases: ["drone"],
    });

    // registryA matches, registryB does not
    expect(getIconCodeFromName("Drone Squadron", registryA)).toBe("1206010000");
    expect(getIconCodeFromName("Drone Squadron", registryB)).toBe(ICON_UNSPECIFIED);
  });
});
