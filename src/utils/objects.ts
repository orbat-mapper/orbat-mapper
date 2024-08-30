export function enum2Items(enumType: { [key: number]: string }) {
  return Object.entries(enumType).map(([label, value]) => ({
    label,
    value,
  }));
}

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
