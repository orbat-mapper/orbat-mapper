<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview";
import { cn } from "@/lib/utils";
import ControlMeasurePreview from "@/modules/scenarioeditor/ControlMeasurePreview.vue";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import {
  CONTROL_MEASURE_CELL_SIZES,
  type ControlMeasureCatalogueEntry,
  type ControlMeasureCellSize,
} from "@/modules/scenarioeditor/controlMeasureCatalogue";
import {
  getControlMeasureKindDragItem,
  type CataloguePlacement,
} from "@/types/draggables";

const props = defineProps<{
  option: ControlMeasureCatalogueEntry;
  /** Resolved by the panel, so a symbol carries the current authoring identity. */
  placement: CataloguePlacement;
  cellSize: ControlMeasureCellSize;
  descriptionsVisible: boolean;
  disabled: boolean;
  armed: boolean;
}>();
const emit = defineEmits<{ arm: []; hover: [name: string | null] }>();

/**
 * milsymbol draws Friend, Neutral, Unknown and Civilian point symbols in plain black,
 * which vanishes on a dark sidebar. Follow the tile's text colour instead, as the
 * line and area previews do; Hostile and Suspect keep their red.
 */
const SYMBOL_OPTIONS = {
  iconColor: {
    Civilian: "currentColor",
    Friend: "currentColor",
    Neutral: "currentColor",
    Unknown: "currentColor",
  },
};

const dimensions = computed(() => CONTROL_MEASURE_CELL_SIZES[props.cellSize]);
const hasDescription = computed(
  () => props.descriptionsVisible && Boolean(props.option.description),
);

const element = useTemplateRef("element");
const isDragged = ref(false);
let release = () => {};

/** The card that follows the pointer: the tile's own preview and name. */
function renderDragPreview(container: HTMLElement) {
  const card = document.createElement("div");
  card.className =
    "bg-background text-foreground flex max-w-40 items-center gap-1.5 rounded-md border px-1.5 py-1 shadow-md";
  const svg = element.value?.querySelector("svg")?.cloneNode(true) as SVGElement | null;
  if (svg) {
    svg.removeAttribute("class");
    Object.assign(svg.style, { height: "40px", width: "auto", maxWidth: "80px" });
    card.append(svg);
  }
  const label = document.createElement("span");
  label.className = "truncate text-xs font-medium";
  label.textContent = props.option.name;
  card.append(label);
  container.append(card);
}

onMounted(() => {
  if (!element.value) return;
  release = draggable({
    element: element.value,
    canDrag: () => !props.disabled,
    getInitialData: () => getControlMeasureKindDragItem({ placement: props.placement }),
    onGenerateDragPreview: ({ nativeSetDragImage }) => {
      setCustomNativeDragPreview({
        nativeSetDragImage,
        getOffset: pointerOutsideOfPreview({ x: "12px", y: "8px" }),
        render: ({ container }) => renderDragPreview(container),
      });
    },
    onDragStart: () => {
      isDragged.value = true;
      emit("hover", null);
    },
    onDrop: () => (isDragged.value = false),
  });
});
onBeforeUnmount(() => release());
</script>

<template>
  <button
    ref="element"
    type="button"
    :class="
      cn(
        'group text-foreground hover:border-ring hover:bg-accent/50 focus-visible:ring-ring/50 flex w-full min-w-0 flex-col items-center gap-1 rounded-md border border-transparent p-1.5 outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50',
        armed && 'border-primary bg-accent',
        isDragged && 'opacity-50',
      )
    "
    :style="{ minHeight: `${dimensions.height}px` }"
    :aria-label="option.name"
    :aria-pressed="armed"
    :title="option.qualifier ? `${option.name} (${option.qualifier})` : option.name"
    :disabled="disabled"
    @click="emit('arm')"
    @mouseenter="emit('hover', option.name)"
    @mouseleave="emit('hover', null)"
    @focus="emit('hover', option.name)"
    @blur="emit('hover', null)"
  >
    <span
      class="flex w-full flex-none items-center justify-center"
      :style="{ height: `${dimensions.previewHeight}px` }"
    >
      <MilitarySymbol
        v-if="placement.type === 'symbol'"
        :sidc="placement.sidc"
        :size="Math.round(dimensions.previewHeight * 0.55)"
        :options="SYMBOL_OPTIONS"
        class="flex max-h-full items-center"
      />
      <ControlMeasurePreview
        v-else-if="option.type === 'measure'"
        :kind="option.id"
        :stroke-width="1.5"
        non-scaling-stroke
        class="h-full w-auto max-w-full"
      />
    </span>
    <span
      :class="
        cn(
          'w-full text-center text-[13px] leading-snug font-medium [overflow-wrap:anywhere]',
          hasDescription && 'text-left',
        )
      "
      >{{ option.name }}</span
    >
    <span
      v-if="hasDescription"
      class="text-muted-foreground w-full text-left text-xs leading-5"
      >{{ option.description }}</span
    >
  </button>
</template>
