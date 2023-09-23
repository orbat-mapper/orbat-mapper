<script setup lang="ts">
import { computed } from "vue";
import { Sidc } from "@/symbology/sidc";

const props = defineProps<{ sidc: string; activePart?: string }>();
const parts = computed(() => {
  const s = new Sidc(props.sidc);
  return [
    ["start", s.version + s.context + s.standardIdentity],
    ["symbolSet", s.symbolSet],
    ["status", s.status],
    ["hqtfd", s.hqtfd],
    ["amp", s.emt],
    ["mainIcon", s.mainIcon],
    ["mod1", s.modifierOne],
    ["mod2", s.modifierTwo],
  ];
});
</script>
<template>
  <p class="font-mono text-base text-gray-700">
    <span
      v-for="[key, part] in parts"
      :key="key"
      :class="['sm:px-0.5', activePart === key ? 'bg-yellow-300 text-red-800' : '']"
      >{{ part }}</span
    >
  </p>
</template>
