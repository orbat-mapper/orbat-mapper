export type CoordinateMode = "none" | "separate" | "combined";
export type PositionTimeMode = "current" | "event";

export interface FieldDefinition {
  label: string;
  value: string;
  aliases: string[];
  helpText: string;
  essential?: boolean;
}

export interface Props {
  workbook: any; // WorkBook type from xlsx
}
