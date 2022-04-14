export function groupBy<T extends object, K extends keyof T>(arr: T[], key: K) {
  return arr.reduce((acc, item) => {
    acc.set(item[key], [...(acc.get(item[key]) || []), item]);
    return acc;
  }, new Map());
}

export function enum2Items(enumType: { [key: number]: string }) {
  return Object.entries(enumType).map(([label, value]) => ({
    label,
    value,
  }));
}

export function moveItemMutable<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  if (!(fromIndex >= 0 && fromIndex < array.length)) return array;
  if (!(toIndex >= 0 && toIndex < array.length)) return array;

  const item = array[fromIndex];
  array.splice(fromIndex, 1);
  array.splice(toIndex, 0, item);
  return array;
}
