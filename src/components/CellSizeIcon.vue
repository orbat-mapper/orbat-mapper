<script setup lang="ts">
// A lucide-styled cell size: the raster a viewshed is computed on, with the
// width of one cell marked off above it as on a drawing.
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- One cell's width, with its end ticks. -->
    <path d="M3 2.5v4M12 2.5v4M3 4.5h9" />
    <!-- Raster, two cells a side. -->
    <rect x="3" y="9" width="18" height="12" rx="1.5" />
    <path d="M12 9v12M3 15h18" />
  </svg>
</template>
