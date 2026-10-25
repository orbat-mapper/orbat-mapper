/**
 * Short names: generating missing ones for a unit tree and writing changed
 * name fields back into the source text, keeping each line's indentation,
 * metadata and comment.
 */

import { createShortUnitName } from "./shortUnitName";
import { findMarkupStartIndex, readUnitLine } from "./lineSyntax";
import { formatUnitFields, type TextUnit } from "./parser";

export interface ShortNameOptions {
  /** Default 8. */
  maxLength?: number;
  /** Default true. */
  uppercase?: boolean;
  /** Default true. */
  allowWhitespace?: boolean;
  /** Default false. */
  forceLength?: boolean;
}

interface GenerateMissingShortNamesResult<T extends TextUnit> {
  units: T[];
  generatedCount: number;
}

function cloneUnit<T extends TextUnit>(unit: T): T {
  return {
    ...unit,
    subUnits: unit.subUnits?.map((child) => cloneUnit(child)),
  };
}

/**
 * Give every unit without a short name a generated one, unique among its
 * siblings. Returns copies; the input is not changed.
 */
export function generateMissingShortNames<T extends TextUnit>(
  units: T[],
  options: ShortNameOptions = {},
): GenerateMissingShortNamesResult<T> {
  const clonedUnits = units.map((unit) => cloneUnit(unit));
  const siblingNames = clonedUnits.map((unit) => unit.name);
  const reservedShortNames = clonedUnits
    .map((unit) => unit.shortName?.trim())
    .filter((shortName): shortName is string => Boolean(shortName));

  let generatedCount = 0;

  for (const unit of clonedUnits) {
    if (!unit.shortName?.trim()) {
      const generatedShortName = createShortUnitName(unit.name, {
        maxLength: options.maxLength ?? 8,
        otherNames: siblingNames,
        existingShortNames: reservedShortNames,
        uppercase: options.uppercase ?? true,
        allowWhitespace: options.allowWhitespace ?? true,
        forceLength: options.forceLength ?? false,
      });

      if (generatedShortName && generatedShortName.trim() !== unit.name.trim()) {
        unit.shortName = generatedShortName;
        reservedShortNames.push(generatedShortName);
        generatedCount += 1;
      }
    }

    if (unit.subUnits?.length) {
      const childResult = generateMissingShortNames(unit.subUnits, options);
      unit.subUnits = childResult.units;
      generatedCount += childResult.generatedCount;
    }
  }

  return { units: clonedUnits, generatedCount };
}

export function clearAllShortNames<T extends TextUnit>(units: T[]): T[] {
  return units.map((unit) => ({
    ...unit,
    shortName: undefined,
    subUnits: unit.subUnits ? clearAllShortNames(unit.subUnits) : unit.subUnits,
  }));
}

function flatten(units: TextUnit[]): TextUnit[] {
  return units.flatMap((unit) => [unit, ...flatten(unit.subUnits ?? [])]);
}

/**
 * Rewrite the name fields of each unit line whose name, short name or
 * description differs between `originalUnits` (parsed from `text`) and
 * `updatedUnits` (the same tree, changed). Rewritten lines use
 * `name,shortName,description` order.
 */
export function applyUnitFieldsToText(
  text: string,
  originalUnits: TextUnit[],
  updatedUnits: TextUnit[],
): { text: string; updatedCount: number } {
  const originalFlatUnits = flatten(originalUnits);
  const updatedFlatUnits = flatten(updatedUnits);
  const lines = text.split("\n");
  let unitIndex = 0;
  let updatedCount = 0;

  const nextLines = lines.map((line) => {
    const trimmedStart = line.trimStart();
    if (!readUnitLine(trimmedStart.trim()).displayName) {
      return line;
    }

    const originalUnit = originalFlatUnits[unitIndex];
    const updatedUnit = updatedFlatUnits[unitIndex];
    unitIndex += 1;

    if (!originalUnit || !updatedUnit) {
      return line;
    }

    if (
      (originalUnit.shortName?.trim() ?? "") === (updatedUnit.shortName?.trim() ?? "") &&
      (originalUnit.description ?? "") === (updatedUnit.description ?? "") &&
      originalUnit.name === updatedUnit.name
    ) {
      return line;
    }

    const indentLength = line.length - trimmedStart.length;
    const indent = line.slice(0, indentLength);

    const commentIndex = line.indexOf("#", indentLength);
    const bodyEnd = commentIndex === -1 ? line.length : commentIndex;
    const body = line.slice(indentLength, bodyEnd);
    const comment = commentIndex === -1 ? "" : line.slice(commentIndex);

    const markup = body.slice(findMarkupStartIndex(body));

    updatedCount += 1;
    return `${indent}${formatUnitFields(updatedUnit)}${markup}${comment}`;
  });

  return {
    text: nextLines.join("\n"),
    updatedCount,
  };
}
