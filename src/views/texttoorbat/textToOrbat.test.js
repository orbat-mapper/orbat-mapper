"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var textToOrbat_ts_1 = require("./textToOrbat.ts");
(0, vitest_1.describe)("getEchelonCodeFromName", function () {
    (0, vitest_1.it)("detects Division from full word", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Infantry Division")).toBe("21");
    });
    (0, vitest_1.it)("detects Division from abbreviation", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Inf Div")).toBe("21");
    });
    (0, vitest_1.it)("detects Brigade", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Brigade")).toBe("18");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Bde")).toBe("18");
    });
    (0, vitest_1.it)("detects Regiment", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("Artillery Regiment")).toBe("17");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Regt")).toBe("17");
    });
    (0, vitest_1.it)("detects Battalion", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Battalion")).toBe("16");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Bn")).toBe("16");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("2nd Btn")).toBe("16");
    });
    (0, vitest_1.it)("detects Squadron", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Cavalry Squadron")).toBe("16");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Sqn")).toBe("16");
    });
    (0, vitest_1.it)("detects Company", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("Alpha Company")).toBe("15");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("A Coy")).toBe("15");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("A Co")).toBe("15");
    });
    (0, vitest_1.it)("detects Battery", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Battery")).toBe("15");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("A Btry")).toBe("15");
    });
    (0, vitest_1.it)("detects Troop", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("A Troop")).toBe("15");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Trp")).toBe("15");
    });
    (0, vitest_1.it)("detects Platoon", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Platoon")).toBe("14");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Plt")).toBe("14");
    });
    (0, vitest_1.it)("detects Detachment", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("Forward Detachment")).toBe("14");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("Recon Det")).toBe("14");
    });
    (0, vitest_1.it)("detects Section", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("Mortar Section")).toBe("13");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Sect")).toBe("13");
    });
    (0, vitest_1.it)("detects Squad", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Squad")).toBe("12");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("Alpha Sqd")).toBe("12");
    });
    (0, vitest_1.it)("detects Team", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("Fire Team")).toBe("11");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("Alpha Tm")).toBe("11");
    });
    (0, vitest_1.it)("detects Crew", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("Tank Crew")).toBe("11");
    });
    (0, vitest_1.it)("detects Corps", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("XVIII Airborne Corps")).toBe("22");
    });
    (0, vitest_1.it)("detects Army", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("3rd Army")).toBe("23");
    });
    (0, vitest_1.it)("detects Army Group", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("12th Army Group")).toBe("24");
    });
    (0, vitest_1.it)("detects Front", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st Belorussian Front")).toBe("24");
    });
    (0, vitest_1.it)("returns 00 for unrecognized names", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("Headquarters")).toBe("00");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("Support Unit")).toBe("00");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("Alpha")).toBe("00");
    });
    (0, vitest_1.it)("is case insensitive", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1ST INFANTRY DIVISION")).toBe("21");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCodeFromName)("1st infantry division")).toBe("21");
    });
});
(0, vitest_1.describe)("getNextLowerEchelon", function () {
    (0, vitest_1.it)("returns Brigade for Division", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getNextLowerEchelon)("21")).toBe("18");
    });
    (0, vitest_1.it)("returns Regiment for Brigade", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getNextLowerEchelon)("18")).toBe("17");
    });
    (0, vitest_1.it)("returns Battalion for Regiment", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getNextLowerEchelon)("17")).toBe("16");
    });
    (0, vitest_1.it)("returns Company for Battalion", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getNextLowerEchelon)("16")).toBe("15");
    });
    (0, vitest_1.it)("returns 00 for Team (lowest)", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getNextLowerEchelon)("11")).toBe("00");
    });
    (0, vitest_1.it)("returns 00 for unknown echelon", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getNextLowerEchelon)("99")).toBe("00");
    });
});
(0, vitest_1.describe)("getEchelonCode", function () {
    (0, vitest_1.it)("returns Army Group for level 0", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCode)(0)).toBe("24");
    });
    (0, vitest_1.it)("returns Division for level 3", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCode)(3)).toBe("21");
    });
    (0, vitest_1.it)("returns Team for very deep levels", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonCode)(100)).toBe("11");
    });
});
(0, vitest_1.describe)("buildSidc", function () {
    (0, vitest_1.it)("returns 20-character SIDC", function () {
        var sidc = (0, textToOrbat_ts_1.buildSidc)(0, "1st Infantry Division");
        (0, vitest_1.expect)(sidc).toHaveLength(20);
    });
    (0, vitest_1.it)("starts with version 10", function () {
        var sidc = (0, textToOrbat_ts_1.buildSidc)(0, "1st Infantry Division");
        (0, vitest_1.expect)(sidc.substring(0, 2)).toBe("10");
    });
    (0, vitest_1.it)("uses friendly standard identity", function () {
        var sidc = (0, textToOrbat_ts_1.buildSidc)(0, "1st Infantry Division");
        (0, vitest_1.expect)(sidc.substring(3, 4)).toBe("3");
    });
    (0, vitest_1.it)("uses land unit symbol set", function () {
        var sidc = (0, textToOrbat_ts_1.buildSidc)(0, "1st Infantry Division");
        (0, vitest_1.expect)(sidc.substring(4, 6)).toBe("10");
    });
    (0, vitest_1.it)("detects echelon from name", function () {
        var sidc = (0, textToOrbat_ts_1.buildSidc)(0, "1st Infantry Division");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(sidc)).toBe("21");
    });
    (0, vitest_1.it)("infers echelon from parent when name has no keyword", function () {
        var sidc = (0, textToOrbat_ts_1.buildSidc)(1, "Alpha", "21"); // parent is Division
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(sidc)).toBe("18"); // should be Brigade
    });
    (0, vitest_1.it)("falls back to level-based echelon when no parent", function () {
        var sidc = (0, textToOrbat_ts_1.buildSidc)(3, "Headquarters");
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(sidc)).toBe("21"); // level 3 = Division
    });
    (0, vitest_1.it)("name detection takes priority over parent inference", function () {
        var sidc = (0, textToOrbat_ts_1.buildSidc)(1, "1st Battalion", "21"); // parent is Division, but name says Battalion
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(sidc)).toBe("16"); // should be Battalion from name
    });
});
(0, vitest_1.describe)("parseTextToUnits", function () {
    (0, vitest_1.it)("parses single unit", function () {
        var units = (0, textToOrbat_ts_1.parseTextToUnits)("1st Infantry Division");
        (0, vitest_1.expect)(units).toHaveLength(1);
        (0, vitest_1.expect)(units[0].name).toBe("1st Infantry Division");
        (0, vitest_1.expect)(units[0].level).toBe(0);
        (0, vitest_1.expect)(units[0].children).toHaveLength(0);
    });
    (0, vitest_1.it)("parses flat list as siblings", function () {
        var text = "1st Division\n2nd Division\n3rd Division";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        (0, vitest_1.expect)(units).toHaveLength(3);
        (0, vitest_1.expect)(units[0].name).toBe("1st Division");
        (0, vitest_1.expect)(units[1].name).toBe("2nd Division");
        (0, vitest_1.expect)(units[2].name).toBe("3rd Division");
    });
    (0, vitest_1.it)("parses indented units as children", function () {
        var text = "1st Division\n  1st Brigade\n  2nd Brigade";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        (0, vitest_1.expect)(units).toHaveLength(1);
        (0, vitest_1.expect)(units[0].children).toHaveLength(2);
        (0, vitest_1.expect)(units[0].children[0].name).toBe("1st Brigade");
        (0, vitest_1.expect)(units[0].children[1].name).toBe("2nd Brigade");
    });
    (0, vitest_1.it)("parses multi-level hierarchy", function () {
        var text = "1st Infantry Division\n  1st Brigade\n    1st Battalion\n    2nd Battalion\n  2nd Brigade\n    3rd Battalion";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        (0, vitest_1.expect)(units).toHaveLength(1);
        var div = units[0];
        (0, vitest_1.expect)(div.name).toBe("1st Infantry Division");
        (0, vitest_1.expect)(div.children).toHaveLength(2);
        var bde1 = div.children[0];
        (0, vitest_1.expect)(bde1.name).toBe("1st Brigade");
        (0, vitest_1.expect)(bde1.children).toHaveLength(2);
        (0, vitest_1.expect)(bde1.children[0].name).toBe("1st Battalion");
        (0, vitest_1.expect)(bde1.children[1].name).toBe("2nd Battalion");
        var bde2 = div.children[1];
        (0, vitest_1.expect)(bde2.name).toBe("2nd Brigade");
        (0, vitest_1.expect)(bde2.children).toHaveLength(1);
        (0, vitest_1.expect)(bde2.children[0].name).toBe("3rd Battalion");
    });
    (0, vitest_1.it)("detects echelons from names", function () {
        var text = "1st Infantry Division\n  1st Brigade\n    1st Battalion";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(units[0].sidc)).toBe("21"); // Division
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(units[0].children[0].sidc)).toBe("18"); // Brigade
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(units[0].children[0].children[0].sidc)).toBe("16"); // Battalion
    });
    (0, vitest_1.it)("infers echelons from parent when names lack keywords", function () {
        var text = "1st Infantry Division\n  Alpha\n    Red";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(units[0].sidc)).toBe("21"); // Division from name
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(units[0].children[0].sidc)).toBe("18"); // Brigade inferred from parent
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(units[0].children[0].children[0].sidc)).toBe("17"); // Regiment inferred
    });
    (0, vitest_1.it)("handles mixed keyword and non-keyword names", function () {
        var text = "1st Infantry Division\n  Alpha\n  Artillery Regiment\n    1st Battery";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        var div = units[0];
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(div.sidc)).toBe("21"); // Division
        var alpha = div.children[0];
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(alpha.sidc)).toBe("18"); // Brigade inferred
        var arty = div.children[1];
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(arty.sidc)).toBe("17"); // Regiment from name
        var battery = arty.children[0];
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(battery.sidc)).toBe("15"); // Company from "Battery"
    });
    (0, vitest_1.it)("handles empty input", function () {
        (0, vitest_1.expect)((0, textToOrbat_ts_1.parseTextToUnits)("")).toHaveLength(0);
        (0, vitest_1.expect)((0, textToOrbat_ts_1.parseTextToUnits)("   ")).toHaveLength(0);
        (0, vitest_1.expect)((0, textToOrbat_ts_1.parseTextToUnits)("\n\n\n")).toHaveLength(0);
    });
    (0, vitest_1.it)("ignores blank lines", function () {
        var text = "1st Division\n\n  1st Brigade\n\n    1st Battalion";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        (0, vitest_1.expect)(units).toHaveLength(1);
        (0, vitest_1.expect)(units[0].children).toHaveLength(1);
        (0, vitest_1.expect)(units[0].children[0].children).toHaveLength(1);
    });
    (0, vitest_1.it)("handles tabs as indentation", function () {
        var text = "1st Division\n\t1st Brigade\n\t\t1st Battalion";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        (0, vitest_1.expect)(units).toHaveLength(1);
        (0, vitest_1.expect)(units[0].children).toHaveLength(1);
        (0, vitest_1.expect)(units[0].children[0].children).toHaveLength(1);
    });
    (0, vitest_1.it)("assigns unique IDs to each unit", function () {
        var text = "1st Division\n  1st Brigade\n  2nd Brigade";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        var ids = [units[0].id, units[0].children[0].id, units[0].children[1].id];
        var uniqueIds = new Set(ids);
        (0, vitest_1.expect)(uniqueIds.size).toBe(3);
    });
    (0, vitest_1.it)("assigns correct level to each unit", function () {
        var text = "1st Division\n  1st Brigade\n    1st Battalion\n      Alpha Company";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        (0, vitest_1.expect)(units[0].level).toBe(0);
        (0, vitest_1.expect)(units[0].children[0].level).toBe(1);
        (0, vitest_1.expect)(units[0].children[0].children[0].level).toBe(2);
        (0, vitest_1.expect)(units[0].children[0].children[0].children[0].level).toBe(3);
    });
    (0, vitest_1.it)("handles dedent correctly", function () {
        var text = "1st Division\n  1st Brigade\n    1st Battalion\n  2nd Brigade";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        (0, vitest_1.expect)(units[0].children).toHaveLength(2);
        (0, vitest_1.expect)(units[0].children[0].name).toBe("1st Brigade");
        (0, vitest_1.expect)(units[0].children[0].children).toHaveLength(1);
        (0, vitest_1.expect)(units[0].children[1].name).toBe("2nd Brigade");
        (0, vitest_1.expect)(units[0].children[1].children).toHaveLength(0);
    });
    (0, vitest_1.it)("handles multiple root units", function () {
        var text = "1st Division\n  1st Brigade\n2nd Division\n  2nd Brigade";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        (0, vitest_1.expect)(units).toHaveLength(2);
        (0, vitest_1.expect)(units[0].name).toBe("1st Division");
        (0, vitest_1.expect)(units[0].children[0].name).toBe("1st Brigade");
        (0, vitest_1.expect)(units[1].name).toBe("2nd Division");
        (0, vitest_1.expect)(units[1].children[0].name).toBe("2nd Brigade");
    });
});
(0, vitest_1.describe)("getEchelonFromSidc", function () {
    (0, vitest_1.it)("extracts echelon code from positions 8-9", function () {
        var sidc = "10031000210000000000";
        (0, vitest_1.expect)((0, textToOrbat_ts_1.getEchelonFromSidc)(sidc)).toBe("21");
    });
});
(0, vitest_1.describe)("getIconCodeFromName", function () {
    (0, vitest_1.describe)("Infantry types", function () {
        (0, vitest_1.it)("detects basic infantry", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Infantry Division")).toBe(textToOrbat_ts_1.ICON_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Inf Bn")).toBe(textToOrbat_ts_1.ICON_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Rifles Company")).toBe(textToOrbat_ts_1.ICON_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Foot Regiment")).toBe(textToOrbat_ts_1.ICON_INFANTRY);
        });
        (0, vitest_1.it)("detects mechanized infantry", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Mechanized Infantry Division")).toBe(textToOrbat_ts_1.ICON_MECHANIZED_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Mech Inf Bn")).toBe(textToOrbat_ts_1.ICON_MECHANIZED_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Panzergrenadier Battalion")).toBe(textToOrbat_ts_1.ICON_MECHANIZED_INFANTRY);
        });
        (0, vitest_1.it)("detects motorized infantry", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Motorized Infantry Division")).toBe(textToOrbat_ts_1.ICON_MOTORIZED_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Mot Inf Bn")).toBe(textToOrbat_ts_1.ICON_MOTORIZED_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Motorised Company")).toBe(textToOrbat_ts_1.ICON_MOTORIZED_INFANTRY);
        });
        (0, vitest_1.it)("detects light infantry", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Light Infantry Battalion")).toBe(textToOrbat_ts_1.ICON_LIGHT_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Lt Inf Company")).toBe(textToOrbat_ts_1.ICON_LIGHT_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Jäger Battalion")).toBe(textToOrbat_ts_1.ICON_LIGHT_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Chasseur Regiment")).toBe(textToOrbat_ts_1.ICON_LIGHT_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Bersaglieri Brigade")).toBe(textToOrbat_ts_1.ICON_LIGHT_INFANTRY);
        });
        (0, vitest_1.it)("detects airborne infantry", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Airborne Division")).toBe(textToOrbat_ts_1.ICON_PARACHUTE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("82nd Abn Division")).toBe(textToOrbat_ts_1.ICON_PARACHUTE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Parachute Regiment")).toBe(textToOrbat_ts_1.ICON_PARACHUTE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Para Battalion")).toBe(textToOrbat_ts_1.ICON_PARACHUTE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Fallschirmjäger Division")).toBe(textToOrbat_ts_1.ICON_PARACHUTE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Airborne Infantry Battalion")).toBe(textToOrbat_ts_1.ICON_AIRBORNE_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Abn Inf Company")).toBe(textToOrbat_ts_1.ICON_AIRBORNE_INFANTRY);
        });
        (0, vitest_1.it)("detects air assault infantry", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Air Assault Brigade")).toBe(textToOrbat_ts_1.ICON_AIR_ASSAULT_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("AASLT Inf Battalion")).toBe(textToOrbat_ts_1.ICON_AIR_ASSAULT_INFANTRY);
        });
        (0, vitest_1.it)("detects mountain infantry", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Mountain Infantry Division")).toBe(textToOrbat_ts_1.ICON_MOUNTAIN_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Mtn Inf Brigade")).toBe(textToOrbat_ts_1.ICON_MOUNTAIN_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Alpine Regiment")).toBe(textToOrbat_ts_1.ICON_MOUNTAIN_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Gebirgsjäger Battalion")).toBe(textToOrbat_ts_1.ICON_MOUNTAIN_INFANTRY);
        });
        (0, vitest_1.it)("detects marine infantry", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Marine Division")).toBe(textToOrbat_ts_1.ICON_MARINE_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Marines Regiment")).toBe(textToOrbat_ts_1.ICON_MARINE_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("USMC Battalion")).toBe(textToOrbat_ts_1.ICON_MARINE_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Naval Infantry Brigade")).toBe(textToOrbat_ts_1.ICON_MARINE_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Royal Marines Commando")).toBe(textToOrbat_ts_1.ICON_MARINE_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("40 Commando RM")).toBe(textToOrbat_ts_1.ICON_MARINE_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("RM Battalion")).toBe(textToOrbat_ts_1.ICON_MARINE_INFANTRY);
        });
        (0, vitest_1.it)("detects sniper units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Sniper Platoon")).toBe(textToOrbat_ts_1.ICON_SNIPER);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Marksman Section")).toBe(textToOrbat_ts_1.ICON_SNIPER);
        });
    });
    (0, vitest_1.describe)("Armor and cavalry", function () {
        (0, vitest_1.it)("detects armor units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Armored Division")).toBe(textToOrbat_ts_1.ICON_ARMOR);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Armour Brigade")).toBe(textToOrbat_ts_1.ICON_ARMOR);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Tank Battalion")).toBe(textToOrbat_ts_1.ICON_ARMOR);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Panzer Division")).toBe(textToOrbat_ts_1.ICON_ARMOR);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Pz Battalion")).toBe(textToOrbat_ts_1.ICON_ARMOR);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Char Regiment")).toBe(textToOrbat_ts_1.ICON_ARMOR);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Blindé Brigade")).toBe(textToOrbat_ts_1.ICON_ARMOR);
        });
        (0, vitest_1.it)("detects light armor units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Light Armor Battalion")).toBe(textToOrbat_ts_1.ICON_LIGHT_ARMOR);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Light Tank Company")).toBe(textToOrbat_ts_1.ICON_LIGHT_ARMOR);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Lt Tk Squadron")).toBe(textToOrbat_ts_1.ICON_LIGHT_ARMOR);
        });
        (0, vitest_1.it)("detects cavalry units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Cavalry Regiment")).toBe(textToOrbat_ts_1.ICON_CAVALRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Cav Squadron")).toBe(textToOrbat_ts_1.ICON_CAVALRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Hussars Regiment")).toBe(textToOrbat_ts_1.ICON_CAVALRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Dragoons Squadron")).toBe(textToOrbat_ts_1.ICON_CAVALRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Lancers Regiment")).toBe(textToOrbat_ts_1.ICON_CAVALRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Cuirassiers Regiment")).toBe(textToOrbat_ts_1.ICON_CAVALRY);
        });
        (0, vitest_1.it)("detects reconnaissance units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Reconnaissance Battalion")).toBe(textToOrbat_ts_1.ICON_RECONNAISSANCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Recon Troop")).toBe(textToOrbat_ts_1.ICON_RECONNAISSANCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Recce Squadron")).toBe(textToOrbat_ts_1.ICON_RECONNAISSANCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Aufklärung Battalion")).toBe(textToOrbat_ts_1.ICON_RECONNAISSANCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Scout Platoon")).toBe(textToOrbat_ts_1.ICON_RECONNAISSANCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Rcn Company")).toBe(textToOrbat_ts_1.ICON_RECONNAISSANCE);
        });
    });
    (0, vitest_1.describe)("Artillery", function () {
        (0, vitest_1.it)("detects artillery units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Artillery Regiment")).toBe(textToOrbat_ts_1.ICON_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Field Artillery Battalion")).toBe(textToOrbat_ts_1.ICON_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st FA Bn")).toBe(textToOrbat_ts_1.ICON_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Arty Regt")).toBe(textToOrbat_ts_1.ICON_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Howitzer Battery")).toBe(textToOrbat_ts_1.ICON_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Cannon Company")).toBe(textToOrbat_ts_1.ICON_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Art Bn")).toBe(textToOrbat_ts_1.ICON_ARTILLERY);
            // shorthand 'RA' (e.g., "29 Cdo RA") should map to artillery
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("29 Cdo RA")).toBe(textToOrbat_ts_1.ICON_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("29 Cdo R.A.")).toBe(textToOrbat_ts_1.ICON_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("RA Battery")).toBe(textToOrbat_ts_1.ICON_ARTILLERY);
        });
        (0, vitest_1.it)("detects self-propelled artillery", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Self-Propelled Artillery Battalion")).toBe(textToOrbat_ts_1.ICON_SELF_PROPELLED_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("SP Artillery Regiment")).toBe(textToOrbat_ts_1.ICON_SELF_PROPELLED_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("StuG Brigade")).toBe(textToOrbat_ts_1.ICON_SELF_PROPELLED_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Panzerhaubitze Battery")).toBe(textToOrbat_ts_1.ICON_SELF_PROPELLED_ARTILLERY);
        });
        (0, vitest_1.it)("detects rocket artillery", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Rocket Artillery Battalion")).toBe(textToOrbat_ts_1.ICON_ROCKET_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("MLRS Battery")).toBe(textToOrbat_ts_1.ICON_ROCKET_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("HIMARS Platoon")).toBe(textToOrbat_ts_1.ICON_ROCKET_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Katyusha Regiment")).toBe(textToOrbat_ts_1.ICON_ROCKET_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Nebelwerfer Battalion")).toBe(textToOrbat_ts_1.ICON_ROCKET_ARTILLERY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("BM-21 Battery")).toBe(textToOrbat_ts_1.ICON_ROCKET_ARTILLERY);
        });
        (0, vitest_1.it)("detects mortar units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Heavy Mortar Company")).toBe(textToOrbat_ts_1.ICON_MORTAR);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Mort Platoon")).toBe(textToOrbat_ts_1.ICON_MORTAR);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Granatwerfer Company")).toBe(textToOrbat_ts_1.ICON_MORTAR);
        });
        (0, vitest_1.it)("detects missile units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Missile Battalion")).toBe(textToOrbat_ts_1.ICON_MISSILE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("ATGM Platoon")).toBe(textToOrbat_ts_1.ICON_MISSILE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("TOW Section")).toBe(textToOrbat_ts_1.ICON_MISSILE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Javelin Team")).toBe(textToOrbat_ts_1.ICON_MISSILE);
        });
    });
    (0, vitest_1.describe)("Air defense", function () {
        (0, vitest_1.it)("detects air defense units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Air Defense Artillery")).toBe(textToOrbat_ts_1.ICON_AIR_DEFENSE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Air Defence Battalion")).toBe(textToOrbat_ts_1.ICON_AIR_DEFENSE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Anti-Aircraft Battery")).toBe(textToOrbat_ts_1.ICON_AIR_DEFENSE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st AAA Battalion")).toBe(textToOrbat_ts_1.ICON_AIR_DEFENSE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Flak Regiment")).toBe(textToOrbat_ts_1.ICON_AIR_DEFENSE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("SAM Battery")).toBe(textToOrbat_ts_1.ICON_AIR_DEFENSE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("SHORAD Battalion")).toBe(textToOrbat_ts_1.ICON_AIR_DEFENSE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Patriot Battery")).toBe(textToOrbat_ts_1.ICON_AIR_DEFENSE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Stinger Platoon")).toBe(textToOrbat_ts_1.ICON_AIR_DEFENSE);
        });
    });
    (0, vitest_1.describe)("Anti-tank", function () {
        (0, vitest_1.it)("detects anti-tank units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Anti-Tank Battalion")).toBe(textToOrbat_ts_1.ICON_ANTITANK);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Antitank Company")).toBe(textToOrbat_ts_1.ICON_ANTITANK);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st AT Platoon")).toBe(textToOrbat_ts_1.ICON_ANTITANK);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Panzerjäger Battalion")).toBe(textToOrbat_ts_1.ICON_ANTITANK);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Tank Destroyer Company")).toBe(textToOrbat_ts_1.ICON_ANTITANK);
        });
    });
    (0, vitest_1.describe)("Aviation", function () {
        (0, vitest_1.it)("detects aviation units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Aviation Battalion")).toBe(textToOrbat_ts_1.ICON_AVIATION);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Helicopter Regiment")).toBe(textToOrbat_ts_1.ICON_AVIATION);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Avn Brigade")).toBe(textToOrbat_ts_1.ICON_AVIATION);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Airmobile Battalion")).toBe(textToOrbat_ts_1.ICON_AVIATION);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Hubschrauber Regiment")).toBe(textToOrbat_ts_1.ICON_AVIATION);
        });
        (0, vitest_1.it)("detects attack helicopter units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Attack Helicopter Battalion")).toBe(textToOrbat_ts_1.ICON_ATTACK_HELICOPTER);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Apache Squadron")).toBe(textToOrbat_ts_1.ICON_ATTACK_HELICOPTER);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("AH-64 Company")).toBe(textToOrbat_ts_1.ICON_ATTACK_HELICOPTER);
        });
        (0, vitest_1.it)("detects air force units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Air Force Wing")).toBe(textToOrbat_ts_1.ICON_AIR_FORCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Luftwaffe Squadron")).toBe(textToOrbat_ts_1.ICON_AIR_FORCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("USAF Element")).toBe(textToOrbat_ts_1.ICON_AIR_FORCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Tactical Air Support")).toBe(textToOrbat_ts_1.ICON_AIR_FORCE);
        });
    });
    (0, vitest_1.describe)("Combat support", function () {
        (0, vitest_1.it)("detects engineer units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Engineer Battalion")).toBe(textToOrbat_ts_1.ICON_ENGINEER);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Eng Company")).toBe(textToOrbat_ts_1.ICON_ENGINEER);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Bridging Company")).toBe(textToOrbat_ts_1.ICON_ENGINEER);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Construction Battalion")).toBe(textToOrbat_ts_1.ICON_ENGINEER);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Pionier Battalion")).toBe(textToOrbat_ts_1.ICON_ENGINEER);
        });
        (0, vitest_1.it)("detects combat engineer units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Combat Engineer Company")).toBe(textToOrbat_ts_1.ICON_COMBAT_ENGINEER);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Assault Engineer Platoon")).toBe(textToOrbat_ts_1.ICON_COMBAT_ENGINEER);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Sapper Platoon")).toBe(textToOrbat_ts_1.ICON_COMBAT_ENGINEER);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Breacher Team")).toBe(textToOrbat_ts_1.ICON_COMBAT_ENGINEER);
        });
        (0, vitest_1.it)("detects signal units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Signal Battalion")).toBe(textToOrbat_ts_1.ICON_SIGNAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Communications Company")).toBe(textToOrbat_ts_1.ICON_SIGNAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Sig Company")).toBe(textToOrbat_ts_1.ICON_SIGNAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Radio Platoon")).toBe(textToOrbat_ts_1.ICON_SIGNAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Comms Detachment")).toBe(textToOrbat_ts_1.ICON_SIGNAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Fernmelde Battalion")).toBe(textToOrbat_ts_1.ICON_SIGNAL);
        });
        (0, vitest_1.it)("detects military police units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Military Police Company")).toBe(textToOrbat_ts_1.ICON_MILITARY_POLICE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st MP Battalion")).toBe(textToOrbat_ts_1.ICON_MILITARY_POLICE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Feldjäger Company")).toBe(textToOrbat_ts_1.ICON_MILITARY_POLICE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Provost Company")).toBe(textToOrbat_ts_1.ICON_MILITARY_POLICE);
        });
        (0, vitest_1.it)("detects security units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Security Battalion")).toBe(textToOrbat_ts_1.ICON_SECURITY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Guard Company")).toBe(textToOrbat_ts_1.ICON_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Force Protection Platoon")).toBe(textToOrbat_ts_1.ICON_SECURITY);
        });
    });
    (0, vitest_1.describe)("NBC/Chemical", function () {
        (0, vitest_1.it)("detects chemical units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Chemical Battalion")).toBe(textToOrbat_ts_1.ICON_CHEMICAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("CBRN Company")).toBe(textToOrbat_ts_1.ICON_CHEMICAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("NBC Platoon")).toBe(textToOrbat_ts_1.ICON_CHEMICAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Decon Company")).toBe(textToOrbat_ts_1.ICON_CHEMICAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Smoke Platoon")).toBe(textToOrbat_ts_1.ICON_CHEMICAL);
        });
    });
    (0, vitest_1.describe)("Intelligence and Electronic Warfare", function () {
        (0, vitest_1.it)("detects electronic warfare units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Electronic Warfare Battalion")).toBe(textToOrbat_ts_1.ICON_ELECTRONIC_WARFARE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("EW Company")).toBe(textToOrbat_ts_1.ICON_ELECTRONIC_WARFARE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("SIGINT Platoon")).toBe(textToOrbat_ts_1.ICON_ELECTRONIC_WARFARE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Cyber Company")).toBe(textToOrbat_ts_1.ICON_ELECTRONIC_WARFARE);
        });
        (0, vitest_1.it)("detects intelligence units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Military Intelligence Battalion")).toBe(textToOrbat_ts_1.ICON_MILITARY_INTELLIGENCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("MI Company")).toBe(textToOrbat_ts_1.ICON_MILITARY_INTELLIGENCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("G2 Section")).toBe(textToOrbat_ts_1.ICON_MILITARY_INTELLIGENCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Intel Platoon")).toBe(textToOrbat_ts_1.ICON_MILITARY_INTELLIGENCE);
        });
        (0, vitest_1.it)("detects civil affairs units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Civil Affairs Battalion")).toBe(textToOrbat_ts_1.ICON_CIVIL_AFFAIRS);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("CA Company")).toBe(textToOrbat_ts_1.ICON_CIVIL_AFFAIRS);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("CIMIC Team")).toBe(textToOrbat_ts_1.ICON_CIVIL_AFFAIRS);
        });
        (0, vitest_1.it)("detects psychological operations units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Psychological Operations Battalion")).toBe(textToOrbat_ts_1.ICON_PSYCHOLOGICAL_OPS);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("PSYOP Company")).toBe(textToOrbat_ts_1.ICON_PSYCHOLOGICAL_OPS);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("MISO Detachment")).toBe(textToOrbat_ts_1.ICON_PSYCHOLOGICAL_OPS);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Info Ops Team")).toBe(textToOrbat_ts_1.ICON_PSYCHOLOGICAL_OPS);
        });
    });
    (0, vitest_1.describe)("Sustainment", function () {
        (0, vitest_1.it)("detects supply units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Supply Battalion")).toBe(textToOrbat_ts_1.ICON_SUPPLY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Logistics Brigade")).toBe(textToOrbat_ts_1.ICON_SUPPLY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Log Company")).toBe(textToOrbat_ts_1.ICON_SUPPLY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Sustainment Battalion")).toBe(textToOrbat_ts_1.ICON_SUPPLY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("CSS Company")).toBe(textToOrbat_ts_1.ICON_SUPPLY);
        });
        (0, vitest_1.it)("detects maintenance units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Maintenance Battalion")).toBe(textToOrbat_ts_1.ICON_MAINTENANCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Maint Company")).toBe(textToOrbat_ts_1.ICON_MAINTENANCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Ordnance Battalion")).toBe(textToOrbat_ts_1.ICON_MAINTENANCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Recovery Platoon")).toBe(textToOrbat_ts_1.ICON_MAINTENANCE);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Wrecker Section")).toBe(textToOrbat_ts_1.ICON_MAINTENANCE);
        });
        (0, vitest_1.it)("detects medical units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Medical Battalion")).toBe(textToOrbat_ts_1.ICON_MEDICAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Hospital")).toBe(textToOrbat_ts_1.ICON_MEDICAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Med Company")).toBe(textToOrbat_ts_1.ICON_MEDICAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("MEDEVAC Platoon")).toBe(textToOrbat_ts_1.ICON_MEDICAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("CASEVAC Team")).toBe(textToOrbat_ts_1.ICON_MEDICAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("FST Alpha")).toBe(textToOrbat_ts_1.ICON_MEDICAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Aid Station")).toBe(textToOrbat_ts_1.ICON_MEDICAL);
        });
        (0, vitest_1.it)("detects transportation units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Transportation Battalion")).toBe(textToOrbat_ts_1.ICON_TRANSPORTATION);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Truck Company")).toBe(textToOrbat_ts_1.ICON_TRANSPORTATION);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Trans Company")).toBe(textToOrbat_ts_1.ICON_TRANSPORTATION);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("MVT Platoon")).toBe(textToOrbat_ts_1.ICON_TRANSPORTATION);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Movement Control Team")).toBe(textToOrbat_ts_1.ICON_TRANSPORTATION);
        });
    });
    (0, vitest_1.describe)("Special operations", function () {
        (0, vitest_1.it)("detects special forces units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Special Forces Group")).toBe(textToOrbat_ts_1.ICON_SPECIAL_FORCES);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Rangers Battalion")).toBe(textToOrbat_ts_1.ICON_SPECIAL_FORCES);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st Commando Company")).toBe(textToOrbat_ts_1.ICON_SPECIAL_FORCES);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("SF Team")).toBe(textToOrbat_ts_1.ICON_SPECIAL_FORCES);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("SAS Squadron")).toBe(textToOrbat_ts_1.ICON_SPECIAL_FORCES);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("SEAL Team")).toBe(textToOrbat_ts_1.ICON_SPECIAL_FORCES);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Delta Force")).toBe(textToOrbat_ts_1.ICON_SPECIAL_FORCES);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("KSK Company")).toBe(textToOrbat_ts_1.ICON_SPECIAL_FORCES);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Green Berets Detachment")).toBe(textToOrbat_ts_1.ICON_SPECIAL_FORCES);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("LRRP Platoon")).toBe(textToOrbat_ts_1.ICON_SPECIAL_FORCES);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Pathfinder Company")).toBe(textToOrbat_ts_1.ICON_SPECIAL_FORCES);
        });
    });
    (0, vitest_1.describe)("Amphibious and Naval", function () {
        (0, vitest_1.it)("detects amphibious units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Amphibious Battalion")).toBe(textToOrbat_ts_1.ICON_AMPHIBIOUS);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Landing Force")).toBe(textToOrbat_ts_1.ICON_AMPHIBIOUS);
        });
        (0, vitest_1.it)("detects naval units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Naval Support Group")).toBe(textToOrbat_ts_1.ICON_NAVAL);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Navy Detachment")).toBe(textToOrbat_ts_1.ICON_NAVAL);
        });
    });
    (0, vitest_1.describe)("Headquarters", function () {
        (0, vitest_1.it)("detects headquarters units", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Division Headquarters")).toBe(textToOrbat_ts_1.ICON_HEADQUARTERS);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Brigade HQ")).toBe(textToOrbat_ts_1.ICON_HEADQUARTERS);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Command Post")).toBe(textToOrbat_ts_1.ICON_HEADQUARTERS);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("CP Alpha")).toBe(textToOrbat_ts_1.ICON_HEADQUARTERS);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Tactical Operations Center")).toBe(textToOrbat_ts_1.ICON_HEADQUARTERS);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("TOC")).toBe(textToOrbat_ts_1.ICON_HEADQUARTERS);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Hauptquartier")).toBe(textToOrbat_ts_1.ICON_HEADQUARTERS);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Stab Company")).toBe(textToOrbat_ts_1.ICON_HEADQUARTERS);
        });
    });
    (0, vitest_1.describe)("Edge cases", function () {
        (0, vitest_1.it)("returns unspecified for unrecognized names", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Alpha")).toBe(textToOrbat_ts_1.ICON_UNSPECIFIED);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("Support Element")).toBe(textToOrbat_ts_1.ICON_UNSPECIFIED);
        });
        (0, vitest_1.it)("is case insensitive", function () {
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1ST INFANTRY DIVISION")).toBe(textToOrbat_ts_1.ICON_INFANTRY);
            (0, vitest_1.expect)((0, textToOrbat_ts_1.getIconCodeFromName)("1st infantry division")).toBe(textToOrbat_ts_1.ICON_INFANTRY);
        });
    });
});
(0, vitest_1.describe)("buildSidc with icon detection", function () {
    (0, vitest_1.it)("sets infantry icon for infantry units", function () {
        var sidc = (0, textToOrbat_ts_1.buildSidc)(0, "1st Infantry Division");
        // Entity code is at positions 10-15 (6 chars)
        var entityCode = sidc.substring(10, 20);
        (0, vitest_1.expect)(entityCode).toBe(textToOrbat_ts_1.ICON_INFANTRY);
    });
    (0, vitest_1.it)("sets armor icon for tank units", function () {
        var sidc = (0, textToOrbat_ts_1.buildSidc)(0, "1st Tank Battalion");
        var entityCode = sidc.substring(10, 20);
        (0, vitest_1.expect)(entityCode).toBe(textToOrbat_ts_1.ICON_ARMOR);
    });
    (0, vitest_1.it)("sets artillery icon for artillery units", function () {
        var sidc = (0, textToOrbat_ts_1.buildSidc)(0, "1st Artillery Regiment");
        var entityCode = sidc.substring(10, 20);
        (0, vitest_1.expect)(entityCode).toBe(textToOrbat_ts_1.ICON_ARTILLERY);
    });
    (0, vitest_1.it)("inherits parent icon when unit type cannot be determined", function () {
        // "Alpha" has no recognizable unit type, should inherit from parent
        var sidc = (0, textToOrbat_ts_1.buildSidc)(1, "Alpha", "16", textToOrbat_ts_1.ICON_INFANTRY);
        var entityCode = sidc.substring(10, 20);
        (0, vitest_1.expect)(entityCode).toBe(textToOrbat_ts_1.ICON_INFANTRY);
    });
    (0, vitest_1.it)("uses detected icon over parent icon when unit type is recognized", function () {
        // "Artillery Battery" should use artillery icon, not parent's infantry icon
        var sidc = (0, textToOrbat_ts_1.buildSidc)(1, "Artillery Battery", "15", textToOrbat_ts_1.ICON_INFANTRY);
        var entityCode = sidc.substring(10, 20);
        (0, vitest_1.expect)(entityCode).toBe(textToOrbat_ts_1.ICON_ARTILLERY);
    });
    (0, vitest_1.it)("returns unspecified when no icon detected and no parent icon", function () {
        var sidc = (0, textToOrbat_ts_1.buildSidc)(0, "Alpha");
        var entityCode = sidc.substring(10, 20);
        (0, vitest_1.expect)(entityCode).toBe(textToOrbat_ts_1.ICON_UNSPECIFIED);
    });
});
(0, vitest_1.describe)("parseTextToUnits with icon inheritance", function () {
    (0, vitest_1.it)("child units inherit parent icon when type not detected", function () {
        var text = "1st Infantry Division\n  Alpha\n  Bravo";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        (0, vitest_1.expect)(units[0].name).toBe("1st Infantry Division");
        (0, vitest_1.expect)(units[0].sidc.substring(10, 20)).toBe(textToOrbat_ts_1.ICON_INFANTRY);
        // Alpha and Bravo should inherit Infantry icon from parent
        (0, vitest_1.expect)(units[0].children[0].name).toBe("Alpha");
        (0, vitest_1.expect)(units[0].children[0].sidc.substring(10, 20)).toBe(textToOrbat_ts_1.ICON_INFANTRY);
        (0, vitest_1.expect)(units[0].children[1].name).toBe("Bravo");
        (0, vitest_1.expect)(units[0].children[1].sidc.substring(10, 20)).toBe(textToOrbat_ts_1.ICON_INFANTRY);
    });
    (0, vitest_1.it)("grandchild units inherit icon through hierarchy", function () {
        var text = "1st Tank Division\n  1st Brigade\n    Alpha\n    Bravo";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        // Tank Division -> armor icon
        (0, vitest_1.expect)(units[0].sidc.substring(10, 20)).toBe(textToOrbat_ts_1.ICON_ARMOR);
        // 1st Brigade inherits armor from Tank Division
        (0, vitest_1.expect)(units[0].children[0].sidc.substring(10, 20)).toBe(textToOrbat_ts_1.ICON_ARMOR);
        // Alpha and Bravo inherit armor through the chain
        (0, vitest_1.expect)(units[0].children[0].children[0].sidc.substring(10, 20)).toBe(textToOrbat_ts_1.ICON_ARMOR);
        (0, vitest_1.expect)(units[0].children[0].children[1].sidc.substring(10, 20)).toBe(textToOrbat_ts_1.ICON_ARMOR);
    });
    (0, vitest_1.it)("child with specific type overrides parent icon", function () {
        var text = "1st Infantry Division\n  Artillery Battery\n  Alpha";
        var units = (0, textToOrbat_ts_1.parseTextToUnits)(text);
        // Parent is infantry
        (0, vitest_1.expect)(units[0].sidc.substring(10, 20)).toBe(textToOrbat_ts_1.ICON_INFANTRY);
        // Artillery Battery should have artillery icon, not inherited infantry
        (0, vitest_1.expect)(units[0].children[0].sidc.substring(10, 20)).toBe(textToOrbat_ts_1.ICON_ARTILLERY);
        // Alpha should still inherit infantry from parent
        (0, vitest_1.expect)(units[0].children[1].sidc.substring(10, 20)).toBe(textToOrbat_ts_1.ICON_INFANTRY);
    });
});
