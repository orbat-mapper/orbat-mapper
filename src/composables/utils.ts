import { Ref, watch } from "vue";
import { useTimeoutFn } from "@vueuse/core";

// Based on https://vueuse.org/shared/bisyncref/#usage
export function biSyncDelayedRef<R extends Ref<any>>(a: R, b: R, delay = 200) {
  const flush = "sync";

  const stop1 = watch(
    a,
    (newValue) => {
      useTimeoutFn(() => {
        b.value = newValue;
      }, delay);
    },
    {
      flush,
      immediate: true,
    }
  );

  const stop2 = watch(
    b,
    (newValue) => {
      useTimeoutFn(() => {
        a.value = newValue;
      }, delay);
    },
    {
      flush,
      immediate: true,
    }
  );
  return () => {
    stop1();
    stop2();
  };
}
