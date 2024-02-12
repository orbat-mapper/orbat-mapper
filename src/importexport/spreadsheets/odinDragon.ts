/**
 * Parse spreadsheet data exported from https://odin.tradoc.army.mil/DATEWORLD
 *
 * Export as Excel, DRAGON format
 *
 */

import { type WorkBook } from "xlsx";
import { xlsxUtils } from "@/extlib/xlsx-lazy";
import { Unit } from "@/types/scenarioModels";
import { convertLetterSidc2NumberSidc } from "@orbat-mapper/convert-symbology";

interface OdinUnitInfoRow {
  TYPE: string;
  NAME: string;
  UID: number;
  "PARENT NAME": string;
  "PARENT UID": number;
  UIC: string;
  ECHELON: string;
  "UNIT CLASS": string;
  "TEMPLATE NAME": string;
  "2525C": string;
}

interface OdinUnitTemplateRow {
  TYPE: "U" | "E" | "P";
  NAME: string;
  UID: string;
  "PARENT UID": string;
  "TYPE GROUP": "UNIT" | "EQUIPMENT" | "PERSONNEL";
  ECHELON: string;
  "UNIT CLASS": string;
  "2525C": string;
  "EQUIPMENT TYPE": string;
  "PERSONNEL TYPE": "CREW" | "PASSENGER";
  "PERSONNEL TYPE CODE": "C" | "P";
  BILLET: string;
  "DIS ENUMERATION": string;
}

type ParseOdinDragonOptions = {
  expandTemplates?: boolean;
};

export function parseOdinDragon(wb: WorkBook, options: ParseOdinDragonOptions = {}) {
  const expandTemplates = options.expandTemplates ?? true;
  const sheetNames = wb.SheetNames;
  const sheetSet = new Set(sheetNames);
  if (sheetNames[0] !== "UNIT INFO") {
    throw new Error("Invalid spreadsheet format");
  }
  const templateCache = new Map<string, Unit>();
  const unitInfoSheet = wb.Sheets["UNIT INFO"];
  const unitRows = xlsxUtils.sheet_to_json(unitInfoSheet) as OdinUnitInfoRow[];
  const rowMap = new Map<number, OdinUnitInfoRow>(unitRows.map((row) => [row.UID, row]));

  const rootUnits: Unit[] = unitRows
    .filter((unit) => !rowMap.has(unit["PARENT UID"]))
    .map(convertUnitInfoRowToUnit2);

  const rootUnitHierarchies = helper(rootUnits);

  return {
    unitRows: unitRows.map(convertUnitInfoRowToUnit),
    rootUnits: rootUnitHierarchies,
  };

  function helper(units: Unit[]) {
    units.forEach((unit) => {
      unit.subUnits = unitRows
        .filter((row) => row["PARENT UID"] === +unit.id)
        .map((row) => convertUnitInfoRowToUnit2(rowMap.get(row.UID)!));

      if (unit.subUnits.length) {
        helper(unit.subUnits);
      } else {
        const row = rowMap.get(+unit.id);
        if (!row) return;
        const templateName = row["TEMPLATE NAME"];
        if (expandTemplates && sheetSet.has(templateName)) {
          const template =
            templateCache.get(templateName) || parseOdinDragonTemplate(wb, templateName);

          if (template) {
            templateCache.set(templateName, template);
            unit.subUnits = template.subUnits;
          }
        }

        // console.log("Template", row?.NAME, "has no subunits", row?.["TEMPLATE NAME"]);
      }
    });
    return units;
  }
}

export function parseOdinDragonTemplate(wb: WorkBook, templateName: string): Unit | null {
  const unitTemplateSheet = wb.Sheets[templateName];
  if (!unitTemplateSheet) {
    return null;
  }
  const unitRows = xlsxUtils.sheet_to_json(unitTemplateSheet) as OdinUnitTemplateRow[];

  const rowMap = new Map<string, OdinUnitTemplateRow>(
    unitRows.map((row) => [row.UID, row]),
  );

  const rootUnit: Unit = unitRows
    .filter((unit) => unit.TYPE === "U" && !rowMap.has(unit["PARENT UID"]))
    .map(convertUnitTemplateRowToUnit)[0];

  const rootUnitHierarchies = helper([rootUnit]);

  return rootUnitHierarchies[0];

  function helper(units: Unit[]) {
    units.forEach((unit) => {
      unit.subUnits = unitRows
        .filter((row) => row.TYPE === "U" && row["PARENT UID"] === unit.id)
        .map((row) => convertUnitTemplateRowToUnit(rowMap.get(row.UID)!));

      if (unit.subUnits.length) helper(unit.subUnits);
    });
    return units;
  }
}

export interface TestUnit extends OdinUnitInfoRow, Unit {
  id: string;
  name: string;
  sidc: string;
}

function convertUnitInfoRowToUnit(row: OdinUnitInfoRow): TestUnit {
  const unit = {
    ...row,
    id: row.UID.toString(),
    name: row.NAME,
    sidc: convertLetterSidc2NumberSidc(row["2525C"]).sidc,
  };
  return unit;
}

function convertUnitInfoRowToUnit2(row: OdinUnitInfoRow): Unit {
  const unit = {
    id: row.UID.toString(),
    name: row.NAME,
    sidc: convertLetterSidc2NumberSidc(row["2525C"]).sidc,
  };
  return unit;
}

function convertUnitTemplateRowToUnit(row: OdinUnitTemplateRow): Unit {
  const unit = {
    id: row.UID,
    name: row.NAME,
    sidc: convertLetterSidc2NumberSidc(row["2525C"]).sidc,
  };
  return unit;
}
