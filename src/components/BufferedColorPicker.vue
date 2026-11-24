<script setup lang="ts">
/**
 * The app's color picker, buffered so it emits **once per gesture, on picker settle**.
 *
 * `PopoverColorPicker`'s custom color input is a `v-model`'d `<input type="color">`,
 * which the OS picker drives continuously while the user drags: hundreds of
 * intermediate values. Writing each one to the scenario store would record an undo
 * step and redraw the map for every frame. For control measures it is a correctness
 * requirement (ADR-0006): tactical-draw never releases a fill-pattern texture, so
 * ~16 kB leaks per distinct (color, pattern) pair, not reclaimed even when the graphic
 * is deleted.
 *
 * So the model is held locally while the popover is open and emitted when it closes.
 * The visible cost is that the map does not preview the color mid-gesture; that is
 * the trade the ADR makes, and the same rule already gives commit-on-settle its "one
 * store write per settled interaction".
 */
import { onBeforeUnmount, ref, watch } from "vue";
import PopoverColorPicker from "@/components/PopoverColorPicker.vue";

const props = defineProps<{
  /** The color to show: the *resolved* one, so an unset value still shows what it draws as. */
  modelValue?: string;
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
  if (!draft.value || draft.value === props.modelValue) return;
  emit("update:modelValue", draft.value);
}

// A selection change can unmount the picker with the popover still open: that gesture
// has settled as far as the user is concerned, so it commits rather than being lost.
onBeforeUnmount(settle);
</script>

<template>
  <PopoverColorPicker v-model="draft" @settle="settle">
    <template v-if="$slots.trigger" #trigger><slot name="trigger" /></template>
  </PopoverColorPicker>
</template>
