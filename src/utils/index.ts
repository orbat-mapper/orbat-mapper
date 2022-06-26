import { customAlphabet } from "nanoid";
import { EntityId } from "@/types/base";
import { getCurrentInstance, inject, InjectionKey } from "vue";

export function groupBy<T extends object, K extends keyof T>(arr: T[], key: K) {
  return arr.reduce((acc, item) => {
    acc.set(item[key], [...(acc.get(item[key]) || []), item]);
    return acc;
  }, new Map<T[K], T[]>());
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

export function htmlTagEscape(text: string) {
  return text.replace(/&/g, " ").replace(/</g, " ").replace(/>/g, " ");
}

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const nanoid = customAlphabet(alphabet, 10);

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

export function removeElement(value: EntityId, array: EntityId[]) {
  const index = array.indexOf(value);
  if (index > -1) {
    array.splice(index, 1);
  }
}

// from https://logaretm.com/blog/making-the-most-out-of-vuejs-injections/
export function injectStrict<T>(key: InjectionKey<T>, fallback?: T) {
  const resolved = inject(key, fallback);
  if (!resolved) {
    throw new Error(`Could not resolve ${key.description}`);
  }

  return resolved;
}

export function injectStrictWithSelf<T>(key: InjectionKey<T>): T | undefined {
  const vm = getCurrentInstance() as any;

  return vm?.provides[key as any] || injectStrict(key);
}
