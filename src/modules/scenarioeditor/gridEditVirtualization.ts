import type { EntityId } from "@/types/base";
import type { TableItem } from "@/modules/scenarioeditor/types";

export type GridEditNavigationDirection = "up" | "down";

export function isCellFocusable(
  itemType: TableItem["type"],
  colIndex: number,
  selectedColumnCount: number,
): boolean {
  if (!Number.isInteger(colIndex) || colIndex < 0) return false;

  if (itemType === "unit") {
    const maxUnitColumnIndex = Math.max(0, selectedColumnCount);
    return colIndex <= maxUnitColumnIndex;
  }

  return colIndex === 0 || colIndex === 1;
}

export function findNextFocusableRowIndex(
  items: readonly Pick<TableItem, "type">[],
  startRow: number,
  colIndex: number,
  direction: GridEditNavigationDirection,
  selectedColumnCount: number,
): number | null {
  const delta = direction === "down" ? 1 : -1;

  for (
    let rowIndex = startRow + delta;
    rowIndex >= 0 && rowIndex < items.length;
    rowIndex += delta
  ) {
    if (isCellFocusable(items[rowIndex].type, colIndex, selectedColumnCount)) {
      return rowIndex;
    }
  }

  return null;
}

export function getRowIndexByEntityId(
  items: readonly Pick<TableItem, "id">[],
): Map<EntityId, number> {
  const rowIndexById = new Map<EntityId, number>();

  items.forEach((item, rowIndex) => {
    rowIndexById.set(item.id, rowIndex);
  });

  return rowIndexById;
}
