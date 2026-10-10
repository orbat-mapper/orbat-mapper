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

/**
 * How far controls in the bottom-left corner (matched by `controls` inside `root`, e.g.
 * a scale line) must be lifted to clear the overlay. Only overlay children the
 * controls would overlap horizontally count, so the lift stays 0 while the controls
 * fit beside the overlay and clears just the rows they would hit.
 *
 * The widest extent the controls have reached is kept until the container is resized,
 * so text that changes width as it updates (a pointer coordinate readout) cannot make
 * the controls jump up and down.
 */
export function useBottomLeftClearance(
  target: MaybeElementRef,
  root: MaybeElementRef,
  controls: string,
  gap = 8,
) {
  const clearance = ref(0);
  const observed = shallowRef<HTMLElement[]>([]);
  let widestRight = 0;
  let containerWidth = 0;

  // Cached by refresh(), so resize callbacks do not re-query the subtree.
  let controlElements: HTMLElement[] = [];

  function update() {
    const el = unrefElement(target) as HTMLElement | null | undefined;
    const container = el?.offsetParent;
    if (!el || !container) {
      clearance.value = 0;
      return;
    }
    const containerRect = container.getBoundingClientRect();
    if (containerRect.width !== containerWidth) {
      containerWidth = containerRect.width;
      widestRight = 0;
    }
    for (const control of controlElements) {
      const rect = control.getBoundingClientRect();
      if (rect.width > 0) widestRight = Math.max(widestRight, rect.right);
    }
    let lift = 0;
    if (widestRight > 0) {
      for (const child of Array.from(el.children)) {
        const rect = child.getBoundingClientRect();
        if (rect.height <= 0 || rect.left >= widestRight + gap) continue;
        lift = Math.max(lift, containerRect.bottom - rect.top);
      }
    }
    clearance.value = Math.round(lift);
  }

  // Controls come and go (a readout shown only while the pointer is over the map, a
  // scale line toggled in settings), so the observed set is rebuilt on DOM changes.
  // Most mutations under the map area leave the set as it was; those are skipped.
  function refresh() {
    const el = unrefElement(target) as HTMLElement | null | undefined;
    const rootElement = unrefElement(root) as HTMLElement | null | undefined;
    controlElements = rootElement
      ? Array.from(rootElement.querySelectorAll<HTMLElement>(controls))
      : [];
    const next = el
      ? [el, ...(Array.from(el.children) as HTMLElement[]), ...controlElements]
      : [];
    const current = observed.value;
    if (next.length === current.length && next.every((item, i) => item === current[i])) {
      return;
    }
    observed.value = next;
    update();
  }

  watch(() => unrefElement(target), refresh, { immediate: true, flush: "post" });
  // `root` contains `target`, so this one observer also sees the overlay's children.
  useMutationObserver(root, refresh, { childList: true, subtree: true });
  useResizeObserver(observed, update);

  return clearance;
}
