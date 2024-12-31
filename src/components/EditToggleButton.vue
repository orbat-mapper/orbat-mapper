<script setup lang="ts">
import SecondaryButton from "@/components/SecondaryButton.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
const props = withDefaults(defineProps<{ primary?: boolean; activeLabel?: string }>(), {
  activeLabel: "Done editing",
});
const editMode = defineModel<boolean>();
</script>

<template>
  <component :is="primary ? PrimaryButton : SecondaryButton" @click="editMode = !editMode"
    ><span v-if="editMode">{{ activeLabel }}</span
    ><span v-else><slot>Edit</slot></span></component
  >
</template>
