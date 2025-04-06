// from https://logaretm.com/blog/making-the-most-out-of-vuejs-injections/
import { getCurrentInstance, inject, type InjectionKey } from "vue";

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
