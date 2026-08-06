<script setup lang="ts">
import { computed, useId } from "vue";
import {
  previewLabelBackgroundWidth,
  PREVIEW_FILL_PATTERNS,
  PREVIEW_PATTERN_DOT_RADIUS,
  PREVIEW_PATTERN_TILE,
  svgTextTransform,
} from "@orbat-mapper/control-measures/preview";
import type { PreviewShape } from "@orbat-mapper/control-measures/preview";
import { CONTROL_MEASURE_METADATA } from "@orbat-mapper/control-measures";
import type { ControlMeasureId, TextAmplifiers } from "@orbat-mapper/control-measures";
import type { TacticalGraphicOptions } from "@/types/scenarioLayerItems";
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
    options?: TacticalGraphicOptions;
    width?: number;
    height?: number;
    pad?: number;
    fallbackFontSize?: number;
    maxFontSize?: number;
    nonScalingStroke?: boolean;
  }>(),
  { strokeWidth: 4, width: 100, height: 100, pad: 8, fallbackFontSize: 14 },
);

const preview = computed(() =>
  buildControlMeasurePreview(
    props.kind,
    { width: props.width, height: props.height, pad: props.pad },
    props.textAmplifiers,
    props.options,
    {
      fallbackFontSize: props.fallbackFontSize,
      maxFontSize: props.maxFontSize,
    },
  ),
);
const geometry = computed(() => CONTROL_MEASURE_METADATA[props.kind]?.geometry);

// Pattern ids are document-global, so every instance gets its own prefix.
const patternPrefix = useId().replace(/:/g, "-");
const usedPatterns = computed(() =>
  PREVIEW_FILL_PATTERNS.filter((pattern) =>
    preview.value.shapes.some((shape) => shape.fillPattern === pattern.id),
  ),
);

function fillFor(shape: PreviewShape): string {
  if (shape.fillPattern) return `url(#${patternPrefix}-${shape.fillPattern})`;
  return shape.filled ? "currentColor" : "none";
}

function labelFontSize(shape: PreviewShape): number {
  return previewFontSize(shape, {
    fallbackFontSize: props.fallbackFontSize,
    maxFontSize: props.maxFontSize,
  });
}

function textBackgroundWidth(shape: PreviewShape): number {
  return previewLabelBackgroundWidth(shape.text, labelFontSize(shape));
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
        :vector-effect="nonScalingStroke ? 'non-scaling-stroke' : undefined"
      />
      <path
        v-else-if="shape.type === 'polygon'"
        :d="shape.d"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        :fill="fillFor(shape)"
        :vector-effect="nonScalingStroke ? 'non-scaling-stroke' : undefined"
      />
      <circle
        v-else-if="shape.type === 'circle'"
        :cx="shape.cx"
        :cy="shape.cy"
        :r="PREVIEW_VERTEX_RADIUS"
        fill="currentColor"
      />
      <g
        v-else-if="shape.type === 'text' && shape.cx !== undefined"
        :transform="svgTextTransform(shape)"
      >
        <rect
          v-if="shape.textBackground"
          :x="Number(shape.cx) - textBackgroundWidth(shape) / 2"
          :y="Number(shape.cy) - (labelFontSize(shape) + 4) / 2"
          :width="textBackgroundWidth(shape)"
          :height="labelFontSize(shape) + 4"
          rx="1.5"
          fill="var(--background)"
        />
        <text
          :x="shape.cx"
          :y="shape.cy"
          :font-size="labelFontSize(shape)"
          :text-anchor="shape.textAnchor ?? 'middle'"
          :font-style="shape.textStyle === 'italic' ? 'italic' : undefined"
          font-family="sans-serif"
          font-weight="600"
          dominant-baseline="central"
          fill="currentColor"
          stroke="none"
        >
          {{ shape.text }}
        </text>
      </g>
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
        :vector-effect="nonScalingStroke ? 'non-scaling-stroke' : undefined"
      />
      <path
        v-else
        d="M 12 74 L 88 26"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        stroke-dasharray="10 8"
        :vector-effect="nonScalingStroke ? 'non-scaling-stroke' : undefined"
      />
    </template>
  </svg>
</template>
