<script setup lang="ts">
import { computed, triggerRef } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";
import { storeToRefs } from "pinia";
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import TableHeader from "@/components/TableHeader.vue";
import type { NRangeRingGroup } from "@/types/internalModels";
import { useNotifications } from "@/composables/notifications";
import ToeGridHeader from "@/modules/scenarioeditor/ToeGridHeader.vue";
import ToeGrid from "@/modules/grid/ToeGrid.vue";
import InlineFormWrapper from "@/modules/scenarioeditor/InlineFormWrapper.vue";
import SettingsItemForm, {
  type SettingsItem,
} from "@/modules/scenarioeditor/SettingsItemForm.vue";
import { useRangeRingGroupTableStore } from "@/stores/tableStores";
import { useToeEditableItems } from "@/composables/toeUtils";
import { useScenarioInfoPanelStore } from "@/stores/scenarioInfoPanelStore";

const scn = injectStrict(activeScenarioKey);
const { send } = useNotifications();

const { editMode, editedId, rerender, selectedItems } =
  useToeEditableItems<NRangeRingGroup>();
// Shared with goToAddGroup in useToeActions, which opens this form from unit details
const { showAddGroup: showAddForm } = storeToRefs(useScenarioInfoPanelStore());
const tableStore = useRangeRingGroupTableStore();

const groups = computed(() => {
  // Track both so the grid refreshes after undo/redo and after an inline edit
  void scn.store.state.settingsStateCounter;
  void rerender.value;
  return Object.values(scn.store.state.rangeRingGroupMap);
});

const columns: ColumnDef<NRangeRingGroup>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
];

function namesExcept(id?: string) {
  return groups.value.filter((g) => g.id !== id).map((g) => g.name);
}

function onSubmit(id: string, data: SettingsItem) {
  scn.unitActions.updateRangeRingGroup(id, data);
  editedId.value = null;
  triggerRef(rerender);
}

function onAddSubmit(data: SettingsItem) {
  scn.unitActions.addRangeRingGroup(data);
  showAddForm.value = false;
}

function onDelete() {
  const notDeletedItems: NRangeRingGroup[] = [];
  scn.store.groupUpdate(() => {
    selectedItems.value.forEach((e) => {
      const success = scn.unitActions.deleteRangeRingGroup(e.id);
      if (!success) {
        send({
          type: "error",
          message: `${e.name}: Cannot delete a range ring group that is in use.`,
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
    <TableHeader description="Range ring groups available in this scenario." />
    <ToeGridHeader
      v-model:editMode="editMode"
      v-model:addMode="showAddForm"
      editLabel="Edit groups"
      :selected-count="selectedItems.length"
      :hideEdit="groups.length === 0"
      @delete="onDelete()"
    />
    <SettingsItemForm
      v-if="showAddForm"
      class="mb-4"
      heading="Add new range ring group"
      submit-label="Add group"
      :taken-names="namesExcept()"
      @submit="onAddSubmit"
      @cancel="showAddForm = false"
    />
    <ToeGrid
      v-if="groups.length"
      :columns="columns"
      :data="groups"
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
            heading="Edit range ring group"
            :taken-names="namesExcept(row.id)"
            @submit="onSubmit(row.id, $event)"
            @cancel="editedId = null"
          />
        </InlineFormWrapper>
      </template>
    </ToeGrid>
    <p v-else class="prose prose-sm dark:prose-invert">
      Use the <kbd>Add</kbd> button to add range ring groups to this scenario.
    </p>
  </div>
</template>
