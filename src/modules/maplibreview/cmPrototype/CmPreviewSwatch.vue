<script setup lang="ts">
// PROTOTYPE — throwaway (#640). Slimmed port of tactrace's `ControlMeasurePreview.vue`.
// Static SVG thumbnail of a control-measure kind, drawn from the library's own
// representative sample so every variant's catalog shows the same picture.
import { computed, useId } from "vue";
import type {
  ControlMeasureId,
  ControlMeasureMetadata,
} from "@orbat-mapper/control-measures";
import {
  PREVIEW_FILL_PATTERNS,
  PREVIEW_PATTERN_DOT_RADIUS,
  PREVIEW_PATTERN_TILE,
  projectRenderToShapes,
  renderRepresentative,
  svgTextTransform,
  viewBoxString,
  type PreviewFillPattern,
  type PreviewShape,
} from "@orbat-mapper/control-measures/preview";

const props = defineProps<{ measure: ControlMeasureMetadata }>();

const VIEW_W = 84;
const VIEW_H = 44;
const PAD = 4;
const TEXT_FALLBACK_PX = 11;

const idBase = useId();
const patternId = (p: PreviewFillPattern) => `${idBase}-${p}`;
const textFontSize = (s: PreviewShape) => s.heightPx ?? TEXT_FALLBACK_PX;

function polygonFill(s: PreviewShape): string {
  if (s.fillPattern) return `url(#${patternId(s.fillPattern)})`;
  return s.filled ? "currentColor" : "none";
}

const result = computed(() =>
  projectRenderToShapes(renderRepresentative(props.measure.id as ControlMeasureId), {
    width: VIEW_W,
    height: VIEW_H,
    pad: PAD,
  }),
);

const usedPatterns = computed(() =>
  PREVIEW_FILL_PATTERNS.filter((p) =>
    result.value.shapes.some((s) => s.fillPattern === p.id),
  ),
);

const viewBox = computed(() =>
  viewBoxString(result.value.shapes, { width: VIEW_W, height: VIEW_H }, textFontSize),
);
</script>

<template>
  <svg
    class="text-foreground block h-full max-h-full w-auto max-w-full"
    :viewBox="viewBox"
    role="img"
    aria-hidden="true"
  >
    <defs v-if="usedPatterns.length">
      <pattern
        v-for="pattern in usedPatterns"
        :id="patternId(pattern.id)"
        :key="pattern.id"
        :width="PREVIEW_PATTERN_TILE"
        :height="PREVIEW_PATTERN_TILE"
        patternUnits="userSpaceOnUse"
      >
        <path
          v-for="(d, i) in pattern.paths"
          :key="i"
          :d="d"
          fill="none"
          stroke="currentColor"
          stroke-width="1.25"
        />
        <circle
          v-for="([cx, cy], i) in pattern.dots ?? []"
          :key="`dot-${i}`"
          :cx="cx"
          :cy="cy"
          :r="PREVIEW_PATTERN_DOT_RADIUS"
          fill="currentColor"
        />
      </pattern>
    </defs>
    <template v-if="result.ok">
      <template v-for="(s, i) in result.shapes" :key="i">
        <path
          v-if="s.type === 'polyline'"
          :d="s.d"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          stroke-linejoin="round"
          stroke-linecap="round"
          vector-effect="non-scaling-stroke"
        />
        <path
          v-else-if="s.type === 'polygon'"
          :d="s.d"
          :fill="polygonFill(s)"
          stroke="currentColor"
          stroke-width="1"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />
        <g v-else-if="s.type === 'text'" :transform="svgTextTransform(s)">
          <text
            :x="s.cx"
            :y="s.cy"
            fill="currentColor"
            :font-size="textFontSize(s)"
            font-weight="600"
            :text-anchor="s.textAnchor ?? 'middle'"
            dominant-baseline="central"
          >
            {{ s.text }}
          </text>
        </g>
        <circle v-else :cx="s.cx" :cy="s.cy" r="1.5" fill="currentColor" />
      </template>
    </template>
    <g v-else stroke="currentColor" stroke-width="1" fill="none" opacity="0.5">
      <circle
        v-if="measure.geometry === 'point'"
        :cx="VIEW_W / 2"
        :cy="VIEW_H / 2"
        r="3"
        fill="currentColor"
      />
      <path
        v-else-if="measure.geometry === 'line'"
        :d="`M${PAD} ${VIEW_H / 2} L${VIEW_W - PAD} ${VIEW_H / 2}`"
        stroke-linecap="round"
      />
      <rect
        v-else
        :x="PAD"
        :y="PAD"
        :width="VIEW_W - PAD * 2"
        :height="VIEW_H - PAD * 2"
        rx="2"
        fill="currentColor"
        fill-opacity="0.1"
      />
    </g>
  </svg>
</template>
