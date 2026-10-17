<script setup lang="ts">
// A lucide-styled reach: the dashed range ring a viewshed is drawn in on the
// map, with the observer at its center and a radius out to its edge. The
// radius lies level so the glyph doesn't read as a gauge's needle.
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
    <!-- Range ring, dashed as on the map: 12 dashes round it. -->
    <circle cx="12" cy="12" r="9" stroke-dasharray="2.36 2.36" />
    <!-- Radius, from the observer to the ring. -->
    <path d="M13.5 12H21" />
    <!-- Observer. -->
    <circle cx="12" cy="12" r="1" />
  </svg>
</template>
