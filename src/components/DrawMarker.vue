<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Point } from "ol/geom";
import { toContext } from "ol/render";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { Style } from "ol/style";
import { createMarkerSymbol, MarkerSymbol } from "@/geo/simplestyle";

interface Props {
  marker?: MarkerSymbol;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), { marker: "circle", size: 10 });

const canvasRef = ref();

onMounted(() => {
  const vectorContext = toContext(canvasRef.value.getContext("2d"), {
    size: [props.size * 2, props.size * 2],
  });
  const fill = new Fill({ color: "black" });
  const stroke = new Stroke({ color: "black" });
  const style = new Style({
    fill: fill,
    stroke: stroke,
    image: createMarkerSymbol(props.marker, "medium", fill, stroke),
  });
  vectorContext.setStyle(style);
  vectorContext.drawGeometry(new Point([10, 10]));
});
</script>
<template>
  <canvas ref="canvasRef" class="" />
</template>
