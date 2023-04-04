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
