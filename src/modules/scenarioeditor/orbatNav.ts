export type OrbatNavDirection = "up" | "down";

export const ORBAT_NAV_TARGET_SELECTOR =
  '[data-orbat-nav="section-toggle"], [data-orbat-nav="tree-root"] [role="treeitem"]';

export function getOrbatNavRoot(from: HTMLElement | null | undefined): ParentNode {
  return from?.closest?.('[data-orbat-nav="panel-root"]') ?? document;
}

export function isVisibleOrbatNavTarget(el: HTMLElement): boolean {
  let current: HTMLElement | null = el;
  while (current) {
    if (current.hidden) return false;
    if (typeof window !== "undefined") {
      const style = window.getComputedStyle(current);
      if (style.display === "none" || style.visibility === "hidden") return false;
    }
    current = current.parentElement;
  }
  return true;
}

export function collectOrbatNavTargets(
  root: ParentNode,
  selector: string = ORBAT_NAV_TARGET_SELECTOR,
): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => isVisibleOrbatNavTarget(el) && !el.hasAttribute("disabled"),
  );
}

export function findNearestOrbatNavTarget(
  current: HTMLElement,
  direction: OrbatNavDirection,
  root: ParentNode = getOrbatNavRoot(current),
): HTMLElement | null {
  const navTargets = collectOrbatNavTargets(root).filter((el) => el !== current);
  if (direction === "down") {
    for (const target of navTargets) {
      if (current.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING) {
        return target;
      }
    }
    return null;
  }

  for (let i = navTargets.length - 1; i >= 0; i -= 1) {
    const target = navTargets[i];
    if (current.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_PRECEDING) {
      return target;
    }
  }
  return null;
}

export function moveFocusToNearestOrbatNavTarget(
  current: HTMLElement,
  direction: OrbatNavDirection,
  root?: ParentNode,
): boolean {
  const target = findNearestOrbatNavTarget(current, direction, root);
  if (!target) return false;
  target.focus();
  return true;
}
