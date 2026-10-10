<script setup lang="ts">
import {
  IconContentCopy as DuplicateIcon,
  IconCursorMove as MoveIcon,
  IconSquareEditOutline as EditIcon,
  IconTrashCanOutline as DeleteIcon,
} from "@iconify-prerendered/vue-mdi";
import { computed } from "vue";
import { useToggle } from "@vueuse/core";

import MainToolbarButton from "@/components/MainToolbarButton.vue";
import ToolbarGroup from "@/components/ToolbarGroup.vue";
import { scenarioDrawKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { useSelectedItems } from "@/stores/selectedStore";

/**
 * The draw toolbar's selection actions: a group in the toolbar's own row, which the
 * toolbar shows only while map items are selected so it costs width only when it
 * applies. Edit and Move are modes that outlive a selection (Edit waits for the next
 * item to be picked; Move drags whatever is selected), so the group also stays while
 * either is on, offering just that mode to turn it off.
 */
const {
  startModify,
  isModifying,
  translate,
  controlMeasureArmed,
  duplicateSelected,
  deleteSelected,
} = injectStrict(scenarioDrawKey);
const { selectedFeatureIds } = useSelectedItems();

const toggleTranslate = useToggle(translate);

const hasSelection = computed(() => selectedFeatureIds.value.size > 0);

// Move drags plain geometry only; a control measure has its own edit session.
const moveTitle = computed(() =>
  controlMeasureArmed.value
    ? "Moving is not available for control measures yet"
    : translate.value && !hasSelection.value
      ? "Move: select items to drag"
      : "Move selected items",
);
</script>

<template>
  <div class="border-border mx-1 h-5 border-l" />
  <ToolbarGroup label="Selection">
    <MainToolbarButton
      v-if="hasSelection || isModifying"
      :title="hasSelection ? 'Edit the selected item' : 'Edit: select an item to edit'"
      :active="isModifying"
      @click="startModify()"
    >
      <EditIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      v-if="hasSelection || translate"
      :title="moveTitle"
      :active="translate"
      :disabled="controlMeasureArmed"
      @click="toggleTranslate()"
    >
      <MoveIcon class="size-5" />
    </MainToolbarButton>
    <template v-if="hasSelection">
      <MainToolbarButton title="Duplicate selected" @click="duplicateSelected()">
        <DuplicateIcon class="size-5" />
      </MainToolbarButton>
      <MainToolbarButton title="Delete selected" @click="deleteSelected()">
        <DeleteIcon class="size-5" />
      </MainToolbarButton>
    </template>
  </ToolbarGroup>
</template>
