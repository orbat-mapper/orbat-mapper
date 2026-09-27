import { ref, shallowRef, watch } from "vue";
import {
  type MaybeElementRef,
  unrefElement,
  useMutationObserver,
  useResizeObserver,
} from "@vueuse/core";

/**
 * Tracks how much vertical space an overlay element (e.g. the map toolbar footer)
 * occupies at the bottom of its positioned container. Direct children are included,
 * so absolutely positioned sub-toolbars stacked above the main toolbar are counted.
 */
export function useOverlayBottomInset(target: MaybeElementRef) {
  const inset = ref(0);
  const observed = shallowRef<HTMLElement[]>([]);

  function update() {
    const el = unrefElement(target) as HTMLElement | null | undefined;
    const container = el?.offsetParent;
    if (!el || !container) {
      inset.value = 0;
      return;
    }
    let top = el.getBoundingClientRect().top;
    for (const child of Array.from(el.children)) {
      const rect = child.getBoundingClientRect();
      if (rect.height > 0) top = Math.min(top, rect.top);
    }
    inset.value = Math.max(0, Math.round(container.getBoundingClientRect().bottom - top));
  }

  // The resize observer's initial callback for newly observed elements triggers update()
  function refresh() {
    const el = unrefElement(target) as HTMLElement | null | undefined;
    observed.value = el ? [el, ...(Array.from(el.children) as HTMLElement[])] : [];
    if (!el) inset.value = 0;
  }

  watch(() => unrefElement(target), refresh, { immediate: true, flush: "post" });
  useMutationObserver(target, refresh, { childList: true });
  useResizeObserver(observed, update);

  return inset;
}
