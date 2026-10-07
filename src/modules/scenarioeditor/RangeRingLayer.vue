<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { IconDrag, IconEye, IconEyeOff, IconPlus } from "@iconify-prerendered/vue-mdi";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import ChevronPanel from "@/components/ChevronPanel.vue";
import DropIndicator from "@/components/DropIndicator.vue";
import LayerHeaderActions from "@/modules/scenarioeditor/LayerHeaderActions.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotifications } from "@/composables/notifications";
import RangeRingGroupRow from "@/modules/scenarioeditor/RangeRingGroupRow.vue";
import RingStylePopover from "@/modules/scenarioeditor/RingStylePopover.vue";
import RangeRingListItem from "@/modules/scenarioeditor/RangeRingListItem.vue";
import {
  getRangeRingLayerEntries,
  type RangeRingEntry,
} from "@/modules/scenarioeditor/rangeRingLayerEntries";
import type { NRangeRingGroup } from "@/types/internalModels";
import type { RangeRingStyle } from "@/types/scenarioGeoModels";
import { activeScenarioKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";
import { injectStrict } from "@/utils";
import {
  getScenarioRangeRingsDragItem,
  idle,
  isScenarioFeatureLayerDragItem,
  isScenarioMapLayerDragItem,
  type ItemState,
} from "@/types/draggables";
import { isControlMeasureLayer } from "@/modules/scenarioeditor/controlMeasureLayers";
import type { NScenarioOverlayLayer } from "@/types/scenarioStackLayers";

const {
  geo,
  store: { state },
  unitActions,
} = injectStrict(activeScenarioKey);
const { activeUnitId } = useSelectedItems();
const { send } = useNotifications();

// A stable fallback, so rows without a style keep the same prop between renders.
const EMPTY_STYLE: Partial<RangeRingStyle> = Object.freeze({});

const entries = computed(() => getRangeRingLayerEntries(state));
const ungroupedDimmed = computed(
  () => !!(state.rangeRingVisibility.hidden || state.rangeRingVisibility.ungroupedHidden),
);

const isOpen = ref(false);
const isUngroupedOpen = ref(false);
const openGroupIds = reactive(new Set<string>());

function setGroupOpen(groupId: string, open: boolean) {
  if (open) openGroupIds.add(groupId);
  else openGroupIds.delete(groupId);
}

function plural(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function toggleAll() {
  unitActions.updateRangeRingVisibility({ hidden: !state.rangeRingVisibility.hidden });
}

function toggleUngrouped() {
  unitActions.updateRangeRingVisibility({
    ungroupedHidden: !state.rangeRingVisibility.ungroupedHidden,
  });
}

function toggleGroup({ id, hidden }: NRangeRingGroup) {
  unitActions.updateRangeRingGroup(id, { hidden: !hidden });
}

const isAddingGroup = ref(false);
const newGroupName = ref("");

function startAddGroup() {
  isOpen.value = true;
  newGroupName.value = "";
  isAddingGroup.value = true;
}

function isValidGroupName(name: string, ignoreId?: string) {
  if (!name) return false;
  if (
    Object.values(state.rangeRingGroupMap).some(
      (g) => g.name === name && g.id !== ignoreId,
    )
  ) {
    send({ type: "error", message: "A group with this name already exists." });
    return false;
  }
  return true;
}

function renameGroup(name: string) {
  if (styleGroupId.value && isValidGroupName(name, styleGroupId.value)) {
    unitActions.updateRangeRingGroup(styleGroupId.value, { name });
  }
}

function addGroup() {
  const name = newGroupName.value.trim();
  if (!isValidGroupName(name)) return;
  setGroupOpen(unitActions.addRangeRingGroup({ name }), true);
  isAddingGroup.value = false;
}

// One style popover is shared by all group rows and moved to the clicked row.
const styleGroupId = ref<string | null>(null);
const styleAnchor = ref<HTMLElement | null>(null);
const isStyleOpen = ref(false);
const styleGroup = computed(() =>
  styleGroupId.value ? state.rangeRingGroupMap[styleGroupId.value] : undefined,
);

function editGroupStyle(groupId: string, anchor: HTMLElement) {
  styleGroupId.value = groupId;
  styleAnchor.value = anchor;
  isStyleOpen.value = true;
}

function updateGroupStyle(style: Partial<RangeRingStyle>) {
  if (styleGroupId.value) {
    unitActions.updateRangeRingGroup(styleGroupId.value, { style });
  }
}

function toggleRing({ unitId, index, ring }: RangeRingEntry) {
  unitActions.updateRangeRing(unitId, index, { hidden: !ring.hidden });
}

const elRef = ref<HTMLElement | null>(null);
const handleRef = ref<HTMLElement | null>(null);
const itemState = ref<ItemState>(idle);
const isDragging = ref(false);

let dndCleanup = () => {};
onMounted(() => {
  if (!elRef.value) return;
  dndCleanup = combine(
    draggable({
      element: elRef.value,
      dragHandle: handleRef.value!,
      getInitialData: () => getScenarioRangeRingsDragItem(),
      onDragStart: () => (isDragging.value = true),
      onDrop: () => (isDragging.value = false),
    }),
    // Feature and reference layers can be dropped around the rings while they are in
    // the stack. Over the control measures there is nothing to place them between.
    dropTargetForElements({
      element: elRef.value,
      canDrop: ({ source }) =>
        !geo.rangeRingsLayer.value?.aboveControlMeasures &&
        (isScenarioMapLayerDragItem(source.data) ||
          (isScenarioFeatureLayerDragItem(source.data) &&
            !isControlMeasureLayer(
              source.data.layer as unknown as NScenarioOverlayLayer,
            ))),
      getData: ({ input, element }) =>
        attachClosestEdge(getScenarioRangeRingsDragItem(), {
          input,
          element,
          allowedEdges: ["top", "bottom"],
        }),
      onDrag: ({ self }) =>
        (itemState.value = {
          type: "drag-over",
          closestEdge: extractClosestEdge(self.data),
        }),
      onDragLeave: () => (itemState.value = idle),
      onDrop: () => (itemState.value = idle),
    }),
  );
});
onUnmounted(() => dndCleanup());
</script>

<template>
  <ChevronPanel
    label="Range rings"
    v-model:open="isOpen"
    :header-class="['-ml-2', isDragging ? 'opacity-20' : '']"
    v-model:header-ref="elRef"
    :data-layer-id="geo.rangeRingsLayer.value?.id"
  >
    <template #left>
      <span ref="handleRef">
        <IconDrag
          class="text-muted-foreground h-6 w-6 cursor-move group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0"
        />
      </span>
    </template>
    <template #label>
      <div
        class="flex items-center gap-2"
        :class="{ 'opacity-50': state.rangeRingVisibility.hidden }"
      >
        Range rings
        <span class="text-muted-foreground text-xs font-normal">
          {{ entries.ringCount }}
        </span>
      </div>
      <DropIndicator
        v-if="itemState.type === 'drag-over' && itemState.closestEdge"
        :edge="itemState.closestEdge"
        gap="0px"
        class="-m-2"
      />
    </template>
    <template #right>
      <LayerHeaderActions>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          @click="startAddGroup()"
          @keydown.stop
          title="Add range ring group"
        >
          <IconPlus class="size-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          @click="toggleAll()"
          @keydown.stop
          title="Toggle all range rings"
        >
          <IconEyeOff v-if="state.rangeRingVisibility.hidden" class="size-5" />
          <IconEye v-else class="size-5" />
        </Button>
      </LayerHeaderActions>
    </template>
    <ul class="-mt-6 -ml-1">
      <li v-if="isAddingGroup" class="py-2 pr-2 pl-6">
        <form class="flex items-center gap-2" @submit.prevent="addGroup()">
          <Input
            v-model="newGroupName"
            placeholder="Group name"
            aria-label="New group name"
            @vue:mounted="({ el }: any) => el.focus()"
            @keydown.esc="isAddingGroup = false"
            @blur="!newGroupName.trim() && (isAddingGroup = false)"
          />
          <Button type="submit" size="sm" :disabled="!newGroupName.trim()">Add</Button>
        </form>
      </li>
      <template v-for="{ group, rings, unitCount } in entries.groups" :key="group.id">
        <RangeRingGroupRow
          :open="openGroupIds.has(group.id)"
          @update:open="setGroupOpen(group.id, $event)"
          :label="group.name"
          :count-label="plural(unitCount, 'unit')"
          :styling="group.style ?? EMPTY_STYLE"
          :hidden="!!group.hidden"
          :dimmed="!!(state.rangeRingVisibility.hidden || group.hidden)"
          toggle-title="Toggle group visibility"
          editable
          @edit-style="editGroupStyle(group.id, $event)"
          @toggle-visibility="toggleGroup(group)"
        />
        <template v-if="openGroupIds.has(group.id)">
          <RangeRingListItem
            v-for="entry in rings"
            :key="entry.key"
            :entry="entry"
            :styling="group.style ?? EMPTY_STYLE"
            :dimmed="!!(state.rangeRingVisibility.hidden || group.hidden)"
            @select="activeUnitId = entry.unitId"
            @toggle-visibility="toggleRing(entry)"
          />
          <li
            v-if="!rings.length"
            class="text-muted-foreground py-2 pl-13 text-xs italic"
          >
            No units use this group.
          </li>
        </template>
      </template>
      <template v-if="entries.ungrouped.length">
        <RangeRingGroupRow
          v-model:open="isUngroupedOpen"
          label="Ungrouped"
          :count-label="plural(entries.ungrouped.length, 'ring')"
          :hidden="!!state.rangeRingVisibility.ungroupedHidden"
          :dimmed="ungroupedDimmed"
          toggle-title="Toggle ungrouped rings"
          @toggle-visibility="toggleUngrouped()"
        />
        <template v-if="isUngroupedOpen">
          <RangeRingListItem
            v-for="entry in entries.ungrouped"
            :key="entry.key"
            :entry="entry"
            :styling="entry.ring.style ?? EMPTY_STYLE"
            :dimmed="ungroupedDimmed"
            @select="activeUnitId = entry.unitId"
            @toggle-visibility="toggleRing(entry)"
          />
        </template>
      </template>
    </ul>
    <RingStylePopover
      v-if="styleAnchor"
      v-model:open="isStyleOpen"
      :anchor="styleAnchor"
      :ring-style="styleGroup?.style ?? {}"
      :name="styleGroup?.name ?? ''"
      @update="updateGroupStyle"
      @rename="renameGroup"
    />
  </ChevronPanel>
</template>
