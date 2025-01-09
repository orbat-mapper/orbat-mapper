import { ref } from "vue";
import { ColumnDef } from "@tanstack/vue-table";
import { EUnitEquipment, EUnitPersonnel, EUnitSupply } from "@/types/internalModels";

export function useToeEditableItems<T>() {
  const editMode = ref(false);
  const editedId = ref<string | null>();
  const showAddForm = ref(false);
  const rerender = ref(true);
  const selectedItems = ref<T[]>([]);

  return { editMode, editedId, showAddForm, rerender, selectedItems };
}

export function createToeTableColumns() {
  const columns: ColumnDef<EUnitEquipment | EUnitPersonnel>[] = [
    { id: "name", header: "Name", accessorKey: "name", size: 120 },
    {
      id: "assigned",
      header: "Asgd.",
      accessorKey: "count",
      size: 80,
      meta: { align: "right" },
    },
    {
      id: "onHand",
      header: "Avail.",
      accessorKey: "onHand",
      size: 80,
      meta: { align: "right" },
    },
    {
      id: "percentage",
      header: "%",
      accessorFn: (f) => asPercent(f),
      size: 80,
      meta: { align: "right" },
    },
  ];
  return columns;
}

export function asPercent(item: EUnitSupply | EUnitEquipment | EUnitPersonnel) {
  return Math.floor(((item.onHand ?? 1) / item.count) * 100) + "%";
}
