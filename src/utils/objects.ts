export function enum2Items(enumType: { [key: number]: string }) {
  return Object.entries(enumType).map(([label, value]) => ({
    label,
    value,
  }));
}

/**
 * Compares two objects and returns the differences between them.
 *
 * @template T
 * @param {Partial<T>} obj1 - The first object, which may contain a subset of the properties of `T`.
 * @param {T} obj2 - The second object, which is a complete object of type `T`.
 * @returns {Partial<T>} An object containing the properties that have different values between `obj1` and `obj2`.
 */
export function getChangedValues<T extends Record<string, any>>(
  obj1: Partial<T>,
  obj2: T,
): Partial<T> {
  const diff: any = {};
  Object.keys(obj1).forEach((key) => {
    if (obj2[key] !== obj1[key]) {
      diff[key] = obj1[key];
    }
  });
  return diff;
}

export function removeUndefined<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined)) as T;
}

/**
 * Creates a map from item names to their IDs.
 *
 * @template T - The type of the items, which must include `name` and `id` properties.
 * @param {Record<string, T>} items - The items to create the map from.
 * @returns {Map<string, string>} A map where the keys are item names and the values are item IDs.
 */
export function createNameToIdMap<T extends { name: string; id: string }>(
  items: Record<string, T>,
): Map<string, string> {
  return new Map(Object.values(items).map((e) => [e.name, e.id]));
}

/**
 * Creates an object from item names to their IDs.
 *
 * @template T - The type of the items, which must include `name` and `id` properties.
 * @param {Record<string, T>} items - The items to create the object from.
 * @returns {Record<string, string>} An object where the keys are item names and the values are item IDs.
 */
export function createNameToIdMapObject<T extends { name: string; id: string }>(
  items: Record<string, T>,
): Record<string, string> {
  return Object.fromEntries(Object.values(items).map((e) => [e.name, e.id]));
}
