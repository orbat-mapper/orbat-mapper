<script setup lang="ts">
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects.ts";
import { computed, h, ref, triggerRef } from "vue";
import { useToeEditableItems } from "@/composables/toeUtils.ts";
import type { NPersonnelData, NSymbolFillColor } from "@/types/internalModels.ts";
import { useNotifications } from "@/composables/notifications.ts";
import { useFillColorTableStore } from "@/stores/tableStores.ts";
import type { ColumnDef } from "@tanstack/vue-table";
import type { SymbolFillColor } from "@/config/colors.ts";
import type { CustomSymbol } from "@/types/scenarioModels.ts";
import ToeGridHeader from "@/modules/scenarioeditor/ToeGridHeader.vue";
import InlineFormWrapper from "@/modules/scenarioeditor/InlineFormWrapper.vue";
import AddSymbolFillColorForm from "@/modules/scenarioeditor/AddSymbolFillColorForm.vue";
import ToeGrid from "@/modules/grid/ToeGrid.vue";
import AddCustomSymbolForm from "@/modules/scenarioeditor/AddCustomSymbolForm.vue";
import { clearUnitStyleCache } from "@/geo/unitStyles.ts";
import { symbolSetMap, symbolSetValues } from "@/symbology/values.ts";

const scn = injectStrict(activeScenarioKey);
const icons = computed(() => {
  scn.store.state.settingsStateCounter && rerender.value;
  return Object.values(scn.store.state.customSymbolMap) ?? [];
});

const { editMode, editedId, showAddForm, rerender, selectedItems } =
  useToeEditableItems<CustomSymbol>();
const { send } = useNotifications();
const tableStore = useFillColorTableStore();
const columns: ColumnDef<CustomSymbol>[] = [
  {
    id: "src",
    header: "Icon",
    accessorKey: "src",
    enableSorting: false,
    cell: ({ row, getValue, cell }) => {
      return h("img", {
        class: "w-full contain-content",
        src: getValue() as string,
      });
    },
    size: 100,
  },
  { id: "name", header: "Name", accessorKey: "name", size: 200 },
  {
    id: "symbolSet",
    header: "Domain",
    accessorFn: (f) => symbolSetMap[f.symbolSet]?.text ?? f.symbolSet,
    size: 200,
  },
];

const addForm = ref<Omit<CustomSymbol, "id">>({
  name: "Name",
  src: "",
  symbolSet: "10",
});

function cancelEdit() {
  editedId.value = null;
}

function onSubmit(e: CustomSymbol) {
  const { id, ...rest } = e;
  scn.settings.updateCustomSymbol(id, rest);
  cancelEdit();
  triggerRef(rerender);
  clearUnitStyleCache();
}

function onDelete() {
  const notDeletedItems: CustomSymbol[] = [];
  scn.store.groupUpdate(() => {
    selectedItems.value.forEach((e) => {
      const success = scn.settings.deleteCustomSymbol(e.id);
      if (!success) {
        send({
          type: "error",
          message: `${e.name}: Cannot delete a symbol that is in use.`,
        });
        notDeletedItems.push(e);
      }
    });
  });

  triggerRef(editMode);
  selectedItems.value = notDeletedItems;
}

function onAddSubmit(formData: Omit<CustomSymbol, "id">) {
  // check if name exists
  if (icons.value.find((e) => e.name === formData.name)) {
    send({
      type: "error",
      message: "Custom symbol with this name already exists.",
    });
    return;
  }
  scn.settings.addCustomSymbol({ ...formData });
  addForm.value = { name: "Name", src: "", symbolSet: "10" };
  clearUnitStyleCache();
}
</script>
<template>
  <div>
    <ToeGridHeader
      v-model:editMode="editMode"
      v-model:addMode="showAddForm"
      editLabel="Edit symbols"
      :selectedCount="selectedItems.length"
      :hideEdit="icons.length === 0"
      @delete="onDelete"
    />
    <AddCustomSymbolForm
      v-if="showAddForm"
      v-model="addForm"
      @cancel="showAddForm = false"
      @submit="onAddSubmit"
      heading="Add new symbol"
    />
    <ToeGrid
      v-if="icons.length"
      :columns="columns"
      :data="icons"
      v-model:editedId="editedId"
      :tableStore="tableStore"
      :select="editMode"
      v-model:selected="selectedItems"
      v-model:editMode="editMode"
    >
      <template #inline-form="{ row }">
        <InlineFormWrapper class="pr-6">
          <AddCustomSymbolForm
            :model-value="row"
            @submit="onSubmit($event as CustomSymbol)"
            @cancel="cancelEdit()"
            heading="Edit custom symbol"
          />
        </InlineFormWrapper>
      </template>
    </ToeGrid>
    <p v-else class="prose prose-sm dark:prose-invert">
      Use the <kbd>Add</kbd> button to add additional symbols to this scenario.
    </p>
  </div>
</template>
