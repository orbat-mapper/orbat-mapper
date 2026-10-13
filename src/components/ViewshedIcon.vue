<script setup lang="ts">
// A lucide-styled viewshed as it looks on the map: the observer at the center
// of its range disc, with two dead-ground shadows cut out of the disc. Each
// shadow starts at a ridge (an inner arc) and runs out to the range limit
// along radial edges, the signature of terrain masking seen from one point.
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
    <!-- Range disc with a near shadow (upper right) and a far one (lower left). -->
    <path
      d="M19.37 6.84A9 9 0 0 1 8.92 20.46L10.12 17.17A5.5 5.5 0 0 1 7.24 14.75L4.21 16.5A9 9 0 0 1 13.56 3.14L12.69 8.06A4 4 0 0 1 15.28 9.71Z"
    />
    <!-- Observer. -->
    <circle cx="12" cy="12" r="1" />
  </svg>
</template>
