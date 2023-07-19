<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { toContext } from "ol/render";
import { createSimpleStyle } from "@/geo/simplestyle";
import Circle from "ol/geom/Circle";
import { RangeRingStyle } from "@/types/scenarioGeoModels";

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
    drawRing(canvasRef.value, props.color);
  },
  { flush: "post" },
);

function drawRing(el: HTMLCanvasElement, color: string) {
  if (!el) return;
  const vectorContext = toContext(canvasRef.value.getContext("2d"), {
    size: [props.size * 2, props.size * 2],
  });

  const style = createSimpleStyle(props.styling);
  vectorContext.setStyle(style);
  vectorContext.drawGeometry(new Circle([20, 20], 10));
}
</script>
<template>
  <canvas ref="canvasRef" />
</template>
