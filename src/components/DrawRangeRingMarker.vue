<script setup lang="ts">
import { ref, watchEffect } from "vue";
import {
  defaultFillColor,
  defaultFillOpacity,
  defaultStrokeColor,
  defaultStrokeWidth,
  strokeStyleDashed,
  strokeStyleDotted,
} from "@/geo/simplestyle";
import { type RangeRingStyle } from "@/types/scenarioGeoModels";

interface Props {
  styling: RangeRingStyle;
  size?: number;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  marker: "circle",
  size: 20,
  color: "red",
});

const canvasRef = ref();

watchEffect(
  () => {
    drawRing(canvasRef.value);
  },
  { flush: "post" },
);

function toRgba(ctx: CanvasRenderingContext2D, color: string, opacity: number): string {
  ctx.fillStyle = "#000000";
  ctx.fillStyle = color;
  const normalized = ctx.fillStyle as string;
  let r = 0;
  let g = 0;
  let b = 0;
  if (normalized.startsWith("#")) {
    r = parseInt(normalized.slice(1, 3), 16);
    g = parseInt(normalized.slice(3, 5), 16);
    b = parseInt(normalized.slice(5, 7), 16);
  } else {
    const parts = normalized.match(/[\d.]+/g) ?? [];
    r = Number(parts[0] ?? 0);
    g = Number(parts[1] ?? 0);
    b = Number(parts[2] ?? 0);
  }
  return `rgba(${r},${g},${b},${opacity})`;
}

function drawRing(el: HTMLCanvasElement) {
  if (!el) return;
  const ctx = el.getContext("2d");
  if (!ctx) return;
  const pixelRatio = window.devicePixelRatio || 1;
  const size = props.size * 2;
  el.width = size * pixelRatio;
  el.height = size * pixelRatio;
  el.style.width = size + "px";
  el.style.height = size + "px";

  const opts = props.styling;

  let strokeColor: string | undefined = defaultStrokeColor;
  let strokeWidth = defaultStrokeWidth;
  let lineDash: number[] = [];
  if (
    opts.stroke ||
    opts["stroke-width"] ||
    opts["stroke-opacity"] ||
    opts["stroke-style"]
  ) {
    strokeColor = toRgba(ctx, opts.stroke || "#555555", opts["stroke-opacity"] || 1);
    strokeWidth = opts["stroke-width"] || 2;
    if (opts["stroke-style"] === "dashed") {
      lineDash = strokeStyleDashed;
    } else if (opts["stroke-style"] === "dotted") {
      lineDash = strokeStyleDotted;
    }
  } else if (opts.stroke === null) {
    strokeColor = undefined;
  }
  if (opts["stroke-opacity"] === 0) strokeColor = undefined;

  let fillColor: string | undefined = toRgba(ctx, defaultFillColor, defaultFillOpacity);
  if (opts.fill || opts["fill-opacity"] !== undefined) {
    fillColor = toRgba(ctx, opts.fill || defaultFillColor, opts["fill-opacity"] ?? 0.5);
  } else if (opts.fill === null) {
    fillColor = undefined;
  }
  if (opts["fill-opacity"] === 0) fillColor = undefined;

  ctx.save();
  ctx.scale(pixelRatio, pixelRatio);
  ctx.beginPath();
  ctx.arc(20, 20, 10, 0, 2 * Math.PI);
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash(lineDash);
    ctx.stroke();
  }
  ctx.restore();
}
</script>
<template>
  <canvas ref="canvasRef" />
</template>
