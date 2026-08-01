export type UnitLabelData = {
  yOffset: number;
  text: string;
};

export const unitStyleCache = new Map<string, unknown>();
export const selectedUnitStyleCache = new Map<string, unknown>();
export const labelStyleCache = new Map<string, UnitLabelData>();

export function clearUnitStyleCache() {
  unitStyleCache.clear();
  selectedUnitStyleCache.clear();
  labelStyleCache.clear();
}

export function invalidateUnitStyle(cacheKey: string) {
  unitStyleCache.delete(cacheKey);
  selectedUnitStyleCache.delete(cacheKey);
  labelStyleCache.delete(cacheKey);
}
