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

export function parseOdinDragon(wb: WorkBook) {
  const sheetNames = wb.SheetNames;
  if (sheetNames[0] !== "UNIT INFO") {
    throw new Error("Invalid spreadsheet format");
  }

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
