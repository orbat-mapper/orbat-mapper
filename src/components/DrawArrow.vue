<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { getArrowSvgDataUri } from "@/geo/arrowSymbols";
import type { ArrowType } from "@/geo/simplestyle";

interface Props {
  arrowType?: ArrowType;
  size?: number;
  color?: string;
  rotation?: number;
}

const props = withDefaults(defineProps<Props>(), {
  arrowType: "arrow",
  size: 24,
  color: "currentColor",
  rotation: 0,
});

const canvasRef = ref<HTMLCanvasElement>();

watchEffect(
  () => {
    if (canvasRef.value) {
      drawSymbol(canvasRef.value, props.color);
    }
  },
  { flush: "post" },
);

function drawSymbol(el: HTMLCanvasElement, color: string) {
  const ctx = el.getContext("2d");
  if (!ctx) return;

  // Resolve currentColor
  if (color === "currentColor") {
    const style = getComputedStyle(el);
    color = style.color || "black";
    // If the color is transparent (e.g. during fade-in animation), retry
    if (color === "rgba(0, 0, 0, 0)" || color === "transparent") {
      requestAnimationFrame(() => drawSymbol(el, "currentColor"));
      return;
    }
  }

  const ratio = window.devicePixelRatio || 1;
  el.width = props.size * ratio;
  el.height = props.size * ratio;
  el.style.width = `${props.size}px`;
  el.style.height = `${props.size}px`;

  const svgDataUri = getArrowSvgDataUri(props.arrowType, color);
  if (!svgDataUri) return;

  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, el.width, el.height);
    ctx.save();
    ctx.translate(el.width / 2, el.height / 2);
    ctx.rotate(-props.rotation);
    ctx.drawImage(img, -el.width / 2, -el.height / 2, el.width, el.height);
    ctx.restore();
  };
  img.src = svgDataUri;
}
</script>

<template>
  <canvas
    ref="canvasRef"
    :width="size"
    :height="size"
    class="inline-block align-middle"
  />
</template>
