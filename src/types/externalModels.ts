// TypeScript types for the Spatial Illusions ORBAT builder export format
import { type SymbolOptions } from "milsymbol";

export interface SpatialIllusionsOrbat {
  options: SpatialIllusionsOptions;
  subOrganizations?: SpatialIllusionsOrbat[];
}

export interface SpatialIllusionsOptions extends SymbolOptions {
  uniqueDesignation?: string;
  sidc: string;
  fillColor?: string;
  stack?: number;
}

export type OrbatGeneratorOrbat = OrbatGeneratorItem[];
// sidc, level, position, unit name, subtitle, color
export type OrbatGeneratorItem = [string, string, string, string, string, string];
