<script setup lang="ts">
import { ref, watchEffect } from "vue";
import Point from "ol/geom/Point";
import { toContext } from "ol/render";
import { Style } from "ol/style";
import { createMarkerSymbol, MarkerSymbol } from "@/geo/simplestyle";

interface Props {
  marker?: MarkerSymbol;
  size?: number;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  marker: "circle",
  size: 10,
  color: "red",
});

const canvasRef = ref();

watchEffect(
  () => {
    drawSymbol(canvasRef.value, props.color);
  },
  { flush: "post" },
);

function drawSymbol(el: HTMLCanvasElement, color: string) {
  if (!el) return;
  const vectorContext = toContext(canvasRef.value.getContext("2d"), {
    size: [props.size * 2, props.size * 2],
  });
  const style = new Style({
    image: createMarkerSymbol(props.marker, "medium", color),
  });
  vectorContext.setStyle(style);
  vectorContext.drawGeometry(new Point([10, 10]));
}
</script>
<template>
  <canvas ref="canvasRef" class="" />
</template>
