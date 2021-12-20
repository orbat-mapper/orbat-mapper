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
