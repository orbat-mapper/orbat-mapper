<script setup lang="ts">
import { onMounted, ref } from "vue";
import { type UnitProperty } from "@/types/scenarioModels";
import { type UnitPropertyUpdate } from "@/types/internalModels";

const props = withDefaults(
  defineProps<{
    property?: UnitProperty;
    autoFocus?: boolean;
  }>(),
  { autoFocus: true },
);

const emit = defineEmits<{ (e: "update-value", data: UnitPropertyUpdate): void }>();
const aEle = ref<HTMLInputElement | null>(null);
const bEle = ref(null);

const value = ref(props.property?.value || "");
const uom = ref(props.property?.uom || "km/h");

function onKey(e: KeyboardEvent) {
  (e.target as HTMLInputElement).blur();
}

function onBlur(e: any) {
  if (e.relatedTarget === aEle.value || e.relatedTarget === bEle.value) return;
  emit("update-value", { value: value.value, uom: uom.value });
}

onMounted(() => {
  if (props.autoFocus) {
    aEle.value?.focus();
  }
});
</script>

<template>
  <div class="relative rounded-md shadow-xs">
    <input
      ref="aEle"
      type="text"
      class="border-input text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 block w-full rounded-md bg-transparent py-1.5 pr-16 outline-none focus-visible:ring-[3px] sm:text-sm sm:leading-6"
      v-model.number="value"
      @keyup.esc="onKey"
      @keydown.enter.prevent="onKey"
      @blur="onBlur"
    />
    <div class="absolute inset-y-0 right-0 flex items-center">
      <select
        ref="bEle"
        name="uom"
        v-model="uom"
        class="text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-full rounded-md border-0 bg-transparent py-0 pr-7 pl-2 focus-visible:ring-[3px] sm:text-sm"
        @blur="onBlur"
      >
        <option>m/s</option>
        <option>km/h</option>
        <option>mph</option>
        <option>knots</option>
        <option>ft/s</option>
      </select>
    </div>
  </div>
</template>
