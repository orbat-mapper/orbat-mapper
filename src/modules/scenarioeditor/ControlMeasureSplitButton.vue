<script setup lang="ts">
import { computed } from "vue";
import {
  IconRestore as ResetIcon,
  IconShapePolygonPlus as MoreGraphicsIcon,
} from "@iconify-prerendered/vue-mdi";
import { storeToRefs } from "pinia";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";

import ControlMeasurePreview from "@/modules/scenarioeditor/ControlMeasurePreview.vue";
import { getControlMeasureKindOption } from "@/modules/scenarioeditor/controlMeasurePicker";
import { useControlMeasureToolStore } from "@/stores/controlMeasureToolStore";
import SplitToolbarButton from "@/components/SplitToolbarButton.vue";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

/** The control-measure counterpart of `DrawToolSplitButton`: the main half re-arms the
 *  last-used kind, the chevron menu lists the pinned kinds plus the full catalog. The
 *  remembered kind lives in the control-measure tool store for the same reason the
 *  pins do — the toolbar is `v-if`'d. Gated *disabled, not hidden* on engines without
 *  a tactical-draw surface (ADR-0006). */
const props = defineProps<{
  armedKind: ControlMeasureId | null;
  disabled?: boolean;
}>();
defineEmits<{ select: [kind: ControlMeasureId]; more: [] }>();

const NO_ENGINE_SUPPORT = "Control measures are not supported by this map engine";

const controlMeasureStore = useControlMeasureToolStore();
const { pinnedKinds, lastKind } = storeToRefs(controlMeasureStore);

const active = computed(() => props.armedKind !== null);
// While a kind is armed the pill mirrors it, even if the picker dialog armed it.
const shownKind = computed(() => props.armedKind ?? lastKind.value);
const title = computed(() =>
  props.disabled ? NO_ENGINE_SUPPORT : kindName(shownKind.value),
);
const menuTitle = computed(() =>
  props.disabled ? NO_ENGINE_SUPPORT : "Choose a control measure",
);

function kindName(kind: ControlMeasureId) {
  return getControlMeasureKindOption(kind)?.name ?? kind;
}
</script>

<template>
  <SplitToolbarButton
    :title="title"
    :menu-title="menuTitle"
    :active="active"
    :disabled="disabled"
    @click="$emit('select', shownKind)"
  >
    <template #icon>
      <ControlMeasurePreview :kind="shownKind" class="size-5" />
    </template>
    <template #menu>
      <DropdownMenuItem
        v-for="kind in pinnedKinds"
        :key="kind"
        @select="$emit('select', kind)"
      >
        <ControlMeasurePreview :kind="kind" class="size-5" />
        {{ kindName(kind) }}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @select="$emit('more')">
        <MoreGraphicsIcon class="size-5" />
        More control measures…
      </DropdownMenuItem>
      <DropdownMenuItem @select="controlMeasureStore.resetPinnedKinds()">
        <ResetIcon class="size-5" />
        Reset pinned to defaults
      </DropdownMenuItem>
    </template>
  </SplitToolbarButton>
</template>
