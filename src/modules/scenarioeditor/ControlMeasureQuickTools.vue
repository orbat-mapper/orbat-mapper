<script setup lang="ts">
import { computed } from "vue";
import { IconMagnify as SearchIcon } from "@iconify-prerendered/vue-mdi";
import { storeToRefs } from "pinia";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";

import MainToolbarButton from "@/components/MainToolbarButton.vue";
import ControlMeasurePreview from "@/modules/scenarioeditor/ControlMeasurePreview.vue";
import { getControlMeasureKindOption } from "@/modules/scenarioeditor/controlMeasurePicker";
import { useControlMeasureToolStore } from "@/stores/controlMeasureToolStore";

/** The pinned control-measure kinds as one-click toolbar buttons, plus a labelled
 *  "All…" button into the full picker. Inline rather than behind a split button's
 *  chevron: behind it the kinds read as one more shape tool and went unnoticed.
 *  Arming stays with the toolbar; this component only emits. Gated *disabled, not
 *  hidden* on engines without a tactical-draw surface (ADR-0006). */
const props = defineProps<{
  armedKind: ControlMeasureId | null;
  disabled?: boolean;
  /** The toolbar row also holds the selection actions, so compact at wider sizes. */
  crowded?: boolean;
}>();
defineEmits<{ select: [kind: ControlMeasureId]; more: [] }>();

const NO_ENGINE_SUPPORT = "Control measures are not supported by this map engine";

/**
 * Pins drop out of a narrow toolbar area from the end. Each rule hides the pins from
 * `fromIndex` on until the `toolbar` container reaches a width, and while hidden an
 * armed pin hands its highlight to All. The full toolbar needs 43rem, or 53rem with the
 * selection actions in the row; crowded below 40rem, only one pin is left.
 */
type PinRule = { fromIndex: number; hidden: string; highlight: string };
const TIERS: Record<"roomy" | "crowded", { pins: PinRule[]; allLabel: string }> = {
  roomy: {
    pins: [
      {
        fromIndex: 2,
        hidden: "hidden @min-[43rem]/toolbar:inline-flex",
        highlight: "bg-army2 @min-[43rem]/toolbar:bg-transparent",
      },
    ],
    allLabel: "hidden text-sm @min-[38rem]/toolbar:inline",
  },
  crowded: {
    pins: [
      {
        fromIndex: 2,
        hidden: "hidden @min-[53rem]/toolbar:inline-flex",
        highlight: "bg-army2 @min-[53rem]/toolbar:bg-transparent",
      },
      {
        fromIndex: 1,
        hidden: "hidden @min-[40rem]/toolbar:inline-flex",
        highlight: "bg-army2 @min-[40rem]/toolbar:bg-transparent",
      },
    ],
    allLabel: "hidden text-sm @min-[46rem]/toolbar:inline",
  },
};
const tier = computed(() => (props.crowded ? TIERS.crowded : TIERS.roomy));

function pinRule(index: number) {
  return tier.value.pins.find((rule) => index >= rule.fromIndex);
}

const { pinnedKinds } = storeToRefs(useControlMeasureToolStore());

const armedIndex = computed(() =>
  props.armedKind === null ? -1 : pinnedKinds.value.indexOf(props.armedKind),
);
// A kind armed from outside the strip lights up the button it came from.
const armedElsewhere = computed(
  () => props.armedKind !== null && armedIndex.value === -1,
);
// A pin hidden in a narrow toolbar hands its highlight to All while it is hidden.
const allHighlight = computed(() =>
  armedIndex.value === -1 ? undefined : pinRule(armedIndex.value)?.highlight,
);

function kindTitle(kind: ControlMeasureId) {
  if (props.disabled) return NO_ENGINE_SUPPORT;
  return getControlMeasureKindOption(kind)?.name ?? kind;
}
</script>

<template>
  <MainToolbarButton
    v-for="(kind, index) in pinnedKinds"
    :key="kind"
    :title="kindTitle(kind)"
    :active="armedKind === kind"
    :disabled="disabled"
    :class="pinRule(index)?.hidden"
    @click="$emit('select', kind)"
  >
    <!-- The search palette's preview, at its 32 px once the toolbar has room. -->
    <ControlMeasurePreview :kind="kind" class="size-5 @min-[36rem]/toolbar:size-8" />
  </MainToolbarButton>
  <MainToolbarButton
    :title="disabled ? NO_ENGINE_SUPPORT : 'Search all control measures'"
    :active="armedElsewhere"
    :disabled="disabled"
    class="ring-border w-auto gap-1 px-2 ring-1 ring-inset"
    :class="allHighlight"
    @click="$emit('more')"
  >
    <SearchIcon class="size-5" />
    <span :class="tier.allLabel">All…</span>
  </MainToolbarButton>
</template>
