export type UnitClusteringMode = "off" | "naive" | "hierarchy";
export type UnitClusterGroupingMode = "strict" | "summary";

export interface UnitClusteringSettings {
  unitClusteringMode: UnitClusteringMode;
  unitClusterGroupingMode: UnitClusterGroupingMode;
  unitClusteringDistancePx: number;
  unitClusteringMinSize: number;
  unitClusteringMaxZoom: number;
  unitClusteringHierarchyMinDepth: number;
}
