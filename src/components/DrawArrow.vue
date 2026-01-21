<script setup lang="ts">
import { ref, watchEffect } from "vue";
import Point from "ol/geom/Point";
import { toContext } from "ol/render";
import { Style } from "ol/style";
import { createArrowMarkerImage, getArrowSvgDataUri } from "@/geo/arrowStyles";
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

  // Check if this arrow type uses SVG (returns a data URI)
  const svgDataUri = getArrowSvgDataUri(props.arrowType, color);

  if (svgDataUri) {
    // For SVG-based arrows, use direct Image API (simpler and more reliable)
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, el.width, el.height);
      // Apply rotation around center
      ctx.save();
      ctx.translate(el.width / 2, el.height / 2);
      ctx.rotate(-props.rotation);
      ctx.drawImage(img, -el.width / 2, -el.height / 2, el.width, el.height);
      ctx.restore();
    };
    img.src = svgDataUri;
  } else if (props.arrowType !== "none") {
    // For shape-based arrows (RegularShape, CircleStyle), use OpenLayers
    const image = createArrowMarkerImage(props.arrowType, color, props.rotation, 1);
    if (image) {
      const style = new Style({ image });
      const vectorContext = toContext(ctx, {
        size: [props.size, props.size],
        pixelRatio: ratio,
      });
      ctx.clearRect(0, 0, el.width, el.height);
      vectorContext.setStyle(style);
      vectorContext.drawGeometry(new Point([props.size / 2, props.size / 2]));
    }
  }
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
