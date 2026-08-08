/** Stop bisecting the gap once the interval is below half a pixel. */
const GAP_PRECISION = 0.5;

export interface HorizontalTreeItem<T> {
  value: T;
  leftExtent: number;
  rightExtent: number;
  children: HorizontalTreeItem<T>[];
}

export interface HorizontalTreeLayoutOptions {
  viewportWidth: number;
  margin: number;
  minimumGap: number;
  uniformNodeSlots: boolean;
}

interface MeasuredChild<T> {
  offset: number;
  tree: MeasuredTree<T>;
}

interface MeasuredTree<T> {
  item: HorizontalTreeItem<T>;
  width: number;
  rootX: number;
  children: MeasuredChild<T>[];
}

function walkItems<T>(
  root: HorizontalTreeItem<T>,
  visit: (item: HorizontalTreeItem<T>) => void,
) {
  visit(root);
  root.children.forEach((child) => walkItems(child, visit));
}

function measureTree<T>(
  item: HorizontalTreeItem<T>,
  gap: number,
  fixedExtents: { left: number; right: number } | null,
): MeasuredTree<T> {
  const leftExtent = fixedExtents?.left ?? item.leftExtent;
  const rightExtent = fixedExtents?.right ?? item.rightExtent;
  if (item.children.length === 0) {
    return {
      item,
      width: leftExtent + rightExtent,
      rootX: leftExtent,
      children: [],
    };
  }

  const measuredChildren = item.children.map((child) =>
    measureTree(child, gap, fixedExtents),
  );
  const children: MeasuredChild<T>[] = [];
  let cursor = 0;
  for (const child of measuredChildren) {
    children.push({ offset: cursor, tree: child });
    cursor += child.width + gap;
  }
  const childrenWidth = cursor - gap;
  const firstChildRoot = children[0].tree.rootX;
  const lastChild = children[children.length - 1];
  const lastChildRoot = lastChild.offset + lastChild.tree.rootX;
  const rootX = (firstChildRoot + lastChildRoot) / 2;
  const minX = Math.min(0, rootX - leftExtent);
  const maxX = Math.max(childrenWidth, rootX + rightExtent);
  const shift = -minX;

  return {
    item,
    width: maxX - minX,
    rootX: rootX + shift,
    children: children.map((child) => ({
      ...child,
      offset: child.offset + shift,
    })),
  };
}

function placeTree<T>(tree: MeasuredTree<T>, left: number, positions: Map<T, number>) {
  positions.set(tree.item.value, left + tree.rootX);
  tree.children.forEach((child) => placeTree(child.tree, left + child.offset, positions));
}

/** Assigns an x coordinate to every item in the tree, keyed by the item's value. */
export function layoutHorizontalTree<T>(
  root: HorizontalTreeItem<T>,
  { viewportWidth, margin, minimumGap, uniformNodeSlots }: HorizontalTreeLayoutOptions,
): Map<T, number> {
  let fixedExtents: { left: number; right: number } | null = null;
  if (uniformNodeSlots) {
    fixedExtents = { left: 0, right: 0 };
    walkItems(root, (item) => {
      fixedExtents!.left = Math.max(fixedExtents!.left, item.leftExtent, 0);
      fixedExtents!.right = Math.max(fixedExtents!.right, item.rightExtent, 0);
    });
  }

  const safeMargin = Math.max(0, margin);
  const safeMinimumGap = Math.max(0, minimumGap);
  const availableWidth = Math.max(0, viewportWidth - safeMargin * 2);
  let measured = measureTree(root, safeMinimumGap, fixedExtents);

  // Widen the gap as much as the viewport allows. The width-to-gap relation is
  // piecewise linear (subtrees clamp), so bisect rather than solve directly.
  if (measured.width < availableWidth) {
    let low = safeMinimumGap;
    let high = Math.max(safeMinimumGap, availableWidth);
    while (high - low > GAP_PRECISION) {
      const candidate = (low + high) / 2;
      const candidateTree = measureTree(root, candidate, fixedExtents);
      if (candidateTree.width <= availableWidth) {
        low = candidate;
        measured = candidateTree;
      } else {
        high = candidate;
      }
    }
  }

  const width = Math.max(viewportWidth, measured.width + safeMargin * 2);
  const positions = new Map<T, number>();
  placeTree(measured, (width - measured.width) / 2, positions);

  return positions;
}
