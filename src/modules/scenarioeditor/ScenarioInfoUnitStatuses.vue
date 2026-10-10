<script setup lang="ts">
import { computed, h, triggerRef } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import ColorDot from "@/components/ColorDot.vue";
import TableHeader from "@/components/TableHeader.vue";
import type { NUnitStatus } from "@/types/internalModels";
import { useNotifications } from "@/composables/notifications";
import ToeGridHeader from "@/modules/scenarioeditor/ToeGridHeader.vue";
import ToeGrid from "@/modules/grid/ToeGrid.vue";
import InlineFormWrapper from "@/modules/scenarioeditor/InlineFormWrapper.vue";
import SettingsItemForm, {
  type SettingsItem,
} from "@/modules/scenarioeditor/SettingsItemForm.vue";
import { useUnitStatusTableStore } from "@/stores/tableStores";
import { useToeEditableItems } from "@/composables/toeUtils";

const scn = injectStrict(activeScenarioKey);
const { send } = useNotifications();

const { editMode, editedId, showAddForm, rerender, selectedItems } =
  useToeEditableItems<NUnitStatus>();
const tableStore = useUnitStatusTableStore();

const statuses = computed(() => {
  // Track both so the grid refreshes after undo/redo and after an inline edit
  void scn.store.state.settingsStateCounter;
  void rerender.value;
  return Object.values(scn.store.state.unitStatusMap);
});

const columns: ColumnDef<NUnitStatus>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    size: 200,
    cell: ({ row }) =>
      h("span", { class: "inline-flex items-center gap-2" }, [
        h(ColorDot, { color: row.original.color }),
        row.original.name,
      ]),
  },
  { id: "description", header: "Description", accessorKey: "description" },
];

function namesExcept(id?: string) {
  return statuses.value.filter((s) => s.id !== id).map((s) => s.name);
}

function onSubmit(id: string, data: SettingsItem) {
  scn.unitActions.updateUnitStatus(id, data);
  editedId.value = null;
  triggerRef(rerender);
}

function onAddSubmit(data: SettingsItem) {
  scn.unitActions.addUnitStatus(data);
  showAddForm.value = false;
}

function onDelete() {
  const notDeletedItems: NUnitStatus[] = [];
  scn.store.groupUpdate(() => {
    selectedItems.value.forEach((e) => {
      const success = scn.unitActions.deleteUnitStatus(e.id);
      if (!success) {
        send({
          type: "error",
          message: `${e.name}: Cannot delete a unit status that is in use.`,
        });
        notDeletedItems.push(e);
      }
    });
  });
  triggerRef(editMode);
  selectedItems.value = notDeletedItems;
}
</script>

<template>
  <div>
    <TableHeader description="Unit statuses available in this scenario." />
    <ToeGridHeader
      v-model:editMode="editMode"
      v-model:addMode="showAddForm"
      editLabel="Edit statuses"
      :selected-count="selectedItems.length"
      :hideEdit="statuses.length === 0"
      @delete="onDelete()"
    />
    <SettingsItemForm
      v-if="showAddForm"
      class="mb-4"
      heading="Add new unit status"
      submit-label="Add status"
      with-color
      with-description
      :taken-names="namesExcept()"
      @submit="onAddSubmit"
      @cancel="showAddForm = false"
    />
    <ToeGrid
      v-if="statuses.length"
      :columns="columns"
      :data="statuses"
      v-model:editedId="editedId"
      :select="editMode"
      v-model:selected="selectedItems"
      v-model:editMode="editMode"
      :tableStore="tableStore"
    >
      <template #inline-form="{ row }">
        <InlineFormWrapper class="pr-6">
          <SettingsItemForm
            :item="row"
            heading="Edit unit status"
            with-color
            with-description
            :taken-names="namesExcept(row.id)"
            @submit="onSubmit(row.id, $event)"
            @cancel="editedId = null"
          />
        </InlineFormWrapper>
      </template>
    </ToeGrid>
    <p v-else class="prose prose-sm dark:prose-invert">
      Use the <kbd>Add</kbd> button to add unit statuses to this scenario.
    </p>
  </div>
</template>
