// Types for the Spatial Illusions ORBAT builder

export interface SpatialIllusionsOrbat {
  options: SpatialIllusionsOptions;
  subOrganizations?: SpatialIllusionsOrbat[];
}

export interface SpatialIllusionsOptions {
  uniqueDesignation?: string;
  sidc: string;
  fillColor?: string;
  stack?: number;
}

export type OrbatGeneratorOrbat = OrbatGeneratorItem[];
// sidc, level, position, unit name, subtitle, color
export type OrbatGeneratorItem = [string, string, string, string, string, string];
