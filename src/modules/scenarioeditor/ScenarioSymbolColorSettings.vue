<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, h, ref, triggerRef } from "vue";
import { useToeEditableItems } from "@/composables/toeUtils.ts";
import { useFillColorTableStore } from "@/stores/tableStores.ts";
import type { ColumnDef } from "@tanstack/vue-table";
import type { SymbolFillColor } from "@/config/colors.ts";
import ToeGridHeader from "@/modules/scenarioeditor/ToeGridHeader.vue";
import InlineFormWrapper from "@/modules/scenarioeditor/InlineFormWrapper.vue";
import ToeGrid from "@/modules/grid/ToeGrid.vue";
import type { NSymbolFillColor } from "@/types/internalModels.ts";
import { useNotifications } from "@/composables/notifications.ts";
import AddSymbolFillColorForm from "@/modules/scenarioeditor/AddSymbolFillColorForm.vue";

const scn = injectStrict(activeScenarioKey);
const { store } = scn;
const {
  editMode,
  editedId,
  showAddForm,
  rerender,
  selectedItems: selectedColors,
} = useToeEditableItems<NSymbolFillColor>();
const { send } = useNotifications();
const tableStore = useFillColorTableStore();
const columns: ColumnDef<SymbolFillColor>[] = [
  { id: "text", header: "Name", accessorKey: "text", size: 200 },
  {
    id: "color",
    header: "Color",
    accessorKey: "code",
    enableSorting: false,
    cell: ({ row, getValue, cell }) => {
      return h("div", {
        class: "size-8  border border-black ",
        style: { backgroundColor: getValue() as string },
      });
    },
    size: 100,
  },
  { id: "code", header: "Value", accessorKey: "code" },
];

const addForm = ref<SymbolFillColor>({
  code: "#ffaabb",
  text: "",
});

const colors = computed(() => {
  store.state.settingsStateCounter && rerender.value;
  return Object.values(store.state.symbolFillColorMap);
});

function onDelete() {
  store.groupUpdate(() => {
    selectedColors.value.forEach((e) => {
      scn.settings.deleteSymbolFillColor(e.id);
    });
  });

  selectedColors.value = [];
}

function onAddSubmit(formData: SymbolFillColor) {
  // check if name exists
  if (colors.value.find((e) => e.code === formData.code)) {
    send({
      type: "error",
      message: "Color with same value already exists.",
    });
    return;
  }
  scn.settings.addSymbolFillColor({ ...formData });
  addForm.value = { ...formData, code: "#ffaabb", text: "" };
}

function cancelEdit() {
  editedId.value = null;
}

function onSubmit(e: NSymbolFillColor) {
  const { id, ...rest } = e;
  scn.settings.updateSymbolFillColor(id, rest);
  cancelEdit();
  triggerRef(rerender);
}
</script>

<template>
  <div>
    <p class="text-muted-foreground text-sm">Additional symbol fill colors</p>
    <ToeGridHeader
      v-model:editMode="editMode"
      v-model:addMode="showAddForm"
      editLabel="Edit Colors"
      :selectedCount="selectedColors.length"
      :hideEdit="colors.length === 0"
      @delete="onDelete()"
    />
    <AddSymbolFillColorForm
      v-if="showAddForm"
      v-model="addForm"
      @cancel="showAddForm = false"
      @submit="onAddSubmit"
      heading="Add new symbol fill color"
    />
    <ToeGrid
      v-if="colors.length"
      :columns="columns"
      :data="colors"
      v-model:editedId="editedId"
      :tableStore="tableStore"
      :select="editMode"
      v-model:selected="selectedColors"
      v-model:editMode="editMode"
    >
      <template #inline-form="{ row }">
        <InlineFormWrapper class="pr-6">
          <AddSymbolFillColorForm
            :model-value="row"
            @submit="onSubmit($event as NSymbolFillColor)"
            @cancel="cancelEdit()"
            heading="Add new symbol fill color"
          />
        </InlineFormWrapper>
      </template>
    </ToeGrid>
    <p v-else class="prose prose-sm dark:prose-invert">
      Use the <kbd>Add</kbd> button to add additional symbol fill colors to this scenario.
    </p>
  </div>
</template>
