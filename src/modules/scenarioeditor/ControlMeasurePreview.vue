<script setup lang="ts">
import { computed, useId } from "vue";
import {
  PREVIEW_FILL_PATTERNS,
  PREVIEW_PATTERN_DOT_RADIUS,
  PREVIEW_PATTERN_TILE,
  svgTextTransform,
} from "@orbat-mapper/control-measures/preview";
import type { PreviewShape } from "@orbat-mapper/control-measures/preview";
import { CONTROL_MEASURE_METADATA } from "@orbat-mapper/control-measures";
import type { ControlMeasureId, TextAmplifiers } from "@orbat-mapper/control-measures";
import {
  PREVIEW_VERTEX_RADIUS,
  buildControlMeasurePreview,
  previewFontSize,
} from "@/modules/scenarioeditor/controlMeasurePreview";

/**
 * A kind's representative sample, drawn as a monochrome SVG glyph.
 *
 * Everything paints in `currentColor`, so the button or list row it sits in owns the
 * colour the same way an icon component does.
 */
const props = withDefaults(
  defineProps<{
    kind: ControlMeasureId;
    strokeWidth?: number;
    textAmplifiers?: TextAmplifiers;
    width?: number;
    height?: number;
    pad?: number;
  }>(),
  { strokeWidth: 4, width: 100, height: 100, pad: 8 },
);

const preview = computed(() =>
  buildControlMeasurePreview(
    props.kind,
    { width: props.width, height: props.height, pad: props.pad },
    props.textAmplifiers,
  ),
);
const geometry = computed(() => CONTROL_MEASURE_METADATA[props.kind]?.geometry);

// Pattern ids are document-global, so every instance gets its own prefix.
const patternPrefix = useId();
const usedPatterns = computed(() =>
  PREVIEW_FILL_PATTERNS.filter((pattern) =>
    preview.value.shapes.some((shape) => shape.fillPattern === pattern.id),
  ),
);

function fillFor(shape: PreviewShape): string {
  if (shape.fillPattern) return `url(#${patternPrefix}-${shape.fillPattern})`;
  return shape.filled ? "currentColor" : "none";
}
</script>

<template>
  <svg
    :viewBox="preview.viewBox"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <defs v-if="usedPatterns.length">
      <pattern
        v-for="pattern in usedPatterns"
        :key="pattern.id"
        :id="`${patternPrefix}-${pattern.id}`"
        :width="PREVIEW_PATTERN_TILE"
        :height="PREVIEW_PATTERN_TILE"
        patternUnits="userSpaceOnUse"
      >
        <path
          v-for="(d, index) in pattern.paths"
          :key="index"
          :d="d"
          stroke="currentColor"
          stroke-width="1"
        />
        <circle
          v-for="([cx, cy], index) in pattern.dots ?? []"
          :key="`dot-${index}`"
          :cx="cx"
          :cy="cy"
          :r="PREVIEW_PATTERN_DOT_RADIUS"
          fill="currentColor"
        />
      </pattern>
    </defs>

    <template v-for="(shape, index) in preview.shapes" :key="index">
      <path
        v-if="shape.type === 'polyline'"
        :d="shape.d"
        stroke="currentColor"
        :stroke-width="strokeWidth"
      />
      <path
        v-else-if="shape.type === 'polygon'"
        :d="shape.d"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        :fill="fillFor(shape)"
      />
      <circle
        v-else-if="shape.type === 'circle'"
        :cx="shape.cx"
        :cy="shape.cy"
        :r="PREVIEW_VERTEX_RADIUS"
        fill="currentColor"
      />
      <text
        v-else-if="shape.type === 'text' && shape.cx !== undefined"
        :x="shape.cx"
        :y="shape.cy"
        :font-size="previewFontSize(shape)"
        :text-anchor="shape.textAnchor ?? 'middle'"
        :transform="svgTextTransform(shape)"
        :font-style="shape.textStyle === 'italic' ? 'italic' : undefined"
        dominant-baseline="central"
        fill="currentColor"
        stroke="none"
      >
        {{ shape.text }}
      </text>
    </template>

    <!-- Degenerate render (an empty sample, or a kind the library could not draw):
         a geometry-typed stand-in rather than a blank button. -->
    <template v-if="!preview.ok">
      <circle
        v-if="geometry === 'point'"
        cx="50"
        cy="50"
        :r="PREVIEW_VERTEX_RADIUS * 3"
        fill="currentColor"
      />
      <path
        v-else-if="geometry === 'area'"
        d="M 12 12 H 88 V 88 H 12 Z"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        stroke-dasharray="10 8"
      />
      <path
        v-else
        d="M 12 74 L 88 26"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        stroke-dasharray="10 8"
      />
    </template>
  </svg>
</template>
