<script setup lang="ts">
// A lucide-styled snap to high or low ground: the observer's dot just above a
// hilltop, or resting in a valley. The dot stands clear of the ground line so
// it reads at deck size, and the two mirror each other so they read as a pair.
defineProps<{ to: "highest" | "lowest" }>();
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
    <template v-if="to === 'highest'">
      <!-- A hill, and the observer above its top. -->
      <path d="M2 21c3.5 0 6-10 10-10s6.5 10 10 10" />
      <circle cx="12" cy="5" r="3.5" fill="currentColor" stroke="none" />
    </template>
    <template v-else>
      <!-- A valley, and the observer down in it. -->
      <path d="M2 3c3.5 0 6 15 10 15s6.5-15 10-15" />
      <circle cx="12" cy="11" r="3.5" fill="currentColor" stroke="none" />
    </template>
  </svg>
</template>
