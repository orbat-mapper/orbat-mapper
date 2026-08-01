<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { type MarkerSymbol } from "@/geo/simplestyle";

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

interface ShapeSpec {
  points: number;
  radius: number;
  radius2?: number;
  angle: number;
}

const shapeMap: Partial<Record<MarkerSymbol, ShapeSpec>> = {
  square: { points: 4, radius: 10, angle: Math.PI / 4 },
  pentagon: { points: 5, radius: 10, angle: 0 },
  hexagon: { points: 6, radius: 10, angle: Math.PI / 2 },
  triangle: { points: 3, radius: 10, angle: 0 },
  star: { points: 5, radius: 10, radius2: 4, angle: 0 },
  cross: { points: 4, radius: 10, radius2: 0, angle: 0 },
  x: { points: 4, radius: 10, radius2: 0, angle: Math.PI / 4 },
};

function drawSymbol(el: HTMLCanvasElement, color: string) {
  if (!el) return;
  const ctx = el.getContext("2d");
  if (!ctx) return;
  const pixelRatio = window.devicePixelRatio || 1;
  const size = props.size * 2;
  el.width = size * pixelRatio;
  el.height = size * pixelRatio;
  el.style.width = size + "px";
  el.style.height = size + "px";

  ctx.save();
  ctx.scale(pixelRatio, pixelRatio);
  ctx.translate(10, 10);
  ctx.beginPath();
  const shape = shapeMap[props.marker];
  if (shape) {
    const innerRadius = shape.radius2 ?? shape.radius;
    const points = shape.radius2 === undefined ? shape.points : shape.points * 2;
    const startAngle = shape.angle - Math.PI / 2;
    const step = (2 * Math.PI) / points;
    for (let i = 0; i < points; i++) {
      const angle = startAngle + i * step;
      const radius = i % 2 === 0 ? shape.radius : innerRadius;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else {
    ctx.arc(0, 0, 5, 0, 2 * Math.PI);
  }
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = ["cross", "x"].includes(props.marker) ? color : "#fafafa";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.restore();
}
</script>
<template>
  <canvas ref="canvasRef" class="" />
</template>
