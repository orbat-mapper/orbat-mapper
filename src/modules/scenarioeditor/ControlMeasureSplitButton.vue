<script setup lang="ts">
import { computed } from "vue";
import { ChevronDown } from "@lucide/vue";
import {
  IconRestore as ResetIcon,
  IconShapePolygonPlus as MoreGraphicsIcon,
} from "@iconify-prerendered/vue-mdi";
import { storeToRefs } from "pinia";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";

import ControlMeasurePreview from "@/modules/scenarioeditor/ControlMeasurePreview.vue";
import { getControlMeasureKindOption } from "@/modules/scenarioeditor/controlMeasurePicker";
import { useControlMeasureToolStore } from "@/stores/controlMeasureToolStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** The control-measure counterpart of `DrawToolSplitButton`: the main half re-arms the
 *  last-used kind, the chevron menu lists the pinned kinds plus the full catalog. The
 *  remembered kind lives in the control-measure tool store for the same reason the
 *  pins do — the toolbar is `v-if`'d. Gated *disabled, not hidden* on engines without
 *  a tactical-draw surface (ADR-0006). */
const props = defineProps<{
  armedKind: ControlMeasureId | null;
  disabled?: boolean;
}>();
const emit = defineEmits<{ select: [kind: ControlMeasureId]; more: [] }>();

const NO_ENGINE_SUPPORT = "Control measures are not supported by this map engine";

const controlMeasureStore = useControlMeasureToolStore();
const { pinnedKinds, lastKind } = storeToRefs(controlMeasureStore);

const active = computed(() => props.armedKind !== null);
// While a kind is armed the pill mirrors it, even if the picker dialog armed it.
const shownKind = computed(() => props.armedKind ?? lastKind.value);
const shownName = computed(
  () => getControlMeasureKindOption(shownKind.value)?.name ?? shownKind.value,
);

function kindName(kind: ControlMeasureId) {
  return getControlMeasureKindOption(kind)?.name ?? kind;
}
</script>

<template>
  <div class="ring-border flex items-center rounded-md ring-1 ring-inset">
    <Button
      type="button"
      variant="ghost"
      size="icon"
      :title="disabled ? NO_ENGINE_SUPPORT : shownName"
      :disabled="disabled"
      :class="[
        'rounded-r-none',
        active ? 'bg-army2 hover:bg-army2/90!' : 'hover:bg-army2/50!',
      ]"
      @click="emit('select', shownKind)"
    >
      <ControlMeasurePreview :kind="shownKind" class="size-5" />
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          :title="disabled ? NO_ENGINE_SUPPORT : 'Choose a control measure'"
          :disabled="disabled"
          :class="[
            'border-border w-5 rounded-l-none border-l',
            active ? 'bg-army2 hover:bg-army2/90!' : 'hover:bg-army2/50!',
          ]"
        >
          <ChevronDown class="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          v-for="kind in pinnedKinds"
          :key="kind"
          @select="emit('select', kind)"
        >
          <ControlMeasurePreview :kind="kind" class="size-5" />
          {{ kindName(kind) }}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @select="emit('more')">
          <MoreGraphicsIcon class="size-5" />
          More control measures…
        </DropdownMenuItem>
        <DropdownMenuItem @select="controlMeasureStore.resetPinnedKinds()">
          <ResetIcon class="size-5" />
          Reset pinned to defaults
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
