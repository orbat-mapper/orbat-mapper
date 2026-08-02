<script setup lang="ts">
/**
 * The colour control for control measures: the app's own picker, buffered so it emits
 * **once per gesture, on picker settle**.
 *
 * This is a correctness requirement, not polish (ADR-0006). `PopoverColorPicker`'s
 * custom colour input is a `v-model`'d `<input type="color">`, which the OS picker
 * drives continuously while the user drags — hundreds of intermediate values. Every
 * one of them that reached the store would reach `render()`, and tactical-draw never
 * releases a fill-pattern texture: ~16 kB leaked per distinct (colour, pattern) pair,
 * not reclaimed even when the graphic is deleted.
 *
 * So the model is held locally while the popover is open and emitted when it closes.
 * The visible cost is that the map does not preview the colour mid-gesture; that is
 * the trade the ADR makes, and the same rule already gives commit-on-settle its "one
 * store write per settled interaction".
 */
import { onBeforeUnmount, ref, watch } from "vue";
import PopoverColorPicker from "@/components/PopoverColorPicker.vue";

const props = defineProps<{
  /** The colour to show — the *resolved* one, so an unauthored graphic still shows what it draws as. */
  modelValue: string;
}>();
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const draft = ref(props.modelValue);
watch(
  () => props.modelValue,
  (value) => {
    draft.value = value;
  },
);

function settle() {
  if (draft.value === props.modelValue) return;
  emit("update:modelValue", draft.value);
}

// A selection change can unmount the picker with the popover still open — that gesture
// has settled as far as the user is concerned, so it commits rather than being lost.
onBeforeUnmount(settle);
</script>

<template>
  <PopoverColorPicker v-model="draft" @settle="settle" />
</template>
