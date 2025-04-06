import type { EntityId } from "@/types/base";
import type { FeatureId } from "@/types/scenarioGeoModels";

export function groupBy<T extends object, K extends keyof T>(arr: T[], key: K) {
  return arr.reduce((acc, item) => {
    acc.set(item[key], [...(acc.get(item[key]) || []), item]);
    return acc;
  }, new Map<T[K], T[]>());
}

export function groupByGetter<T extends object>(arr: T[], getter: (i: T) => string) {
  return arr.reduce((acc, item) => {
    const key = getter(item);
    acc.set(key, [...(acc.get(key) || []), item]);
    return acc;
  }, new Map<string, T[]>());
}

export function removeElement(
  value: EntityId | FeatureId,
  array: (EntityId | FeatureId)[],
) {
  const index = array.indexOf(value);
  if (index > -1) {
    array.splice(index, 1);
  }
}

// https://gist.github.com/albertein/4496103
export function moveElement<T>(array: T[], element: T, delta: number) {
  const index = array.indexOf(element);
  const newIndex = index + delta;
  if (newIndex < 0 || newIndex === array.length) {
    return;
  }
  const indexes = [index, newIndex].sort();
  array.splice(indexes[0], 2, array[indexes[1]], array[indexes[0]]);
}

export function moveItemMutable<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  if (!(fromIndex >= 0 && fromIndex < array.length)) return array;
  if (!(toIndex >= 0 && toIndex <= array.length)) return array;

  const item = array[fromIndex];
  array.splice(fromIndex, 1);
  array.splice(toIndex, 0, item);
  return array;
}

// sort array by object property
export function sortBy<T extends object, K extends keyof T>(
  arr: T[],
  key: K,
  ascending = true,
) {
  return arr.sort((a, b) => {
    if (ascending) {
      return (a[key] || "") > (b[key] || "") ? 1 : -1;
    } else {
      return (a[key] || "") < (b[key] || "") ? 1 : -1;
    }
  });
}

export function mergeArray<T>(a: T[], b: T[], key: keyof T): T[] {
  const map = new Map();
  for (const item of a) {
    map.set(item[key], item);
  }
  for (const item of b) {
    map.set(item[key], item);
  }
  return Array.from(map.values());
}
