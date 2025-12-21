import { tryOnScopeDispose } from "@vueuse/core";
import { type MaybeRef, ref, unref } from "vue";

export function useTimer(
  cb: (...args: unknown[]) => any,
  delay: MaybeRef<number> = 4000,
) {
  let startedAt = Date.now();
  let timeRemaining = unref(delay);
  const isPending = ref(true);
  let timer: ReturnType<typeof setTimeout> | null = null;

  timer = setTimeout(() => {
    isPending.value = false;
    timer = null;
    cb();
  }, unref(timeRemaining));

  function pause() {
    stop();
    timeRemaining -= Date.now() - startedAt;
  }

  function stop() {
    if (timer) clearTimeout(timer);
  }

  function resume() {
    stop();
    startedAt = Date.now();
    timer = setTimeout(cb, unref(timeRemaining));
  }

  tryOnScopeDispose(() => {
    stop();
  });

  return { isPending, pause, resume, stop };
}
