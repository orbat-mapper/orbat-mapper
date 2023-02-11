export function enum2Items(enumType: { [key: number]: string }) {
  return Object.entries(enumType).map(([label, value]) => ({
    label,
    value,
  }));
}
