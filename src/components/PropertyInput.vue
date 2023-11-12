<script setup lang="ts">
import { onMounted, ref } from "vue";
import { UnitProperty } from "@/types/scenarioModels";
import { UnitPropertyUpdate } from "@/types/internalModels";

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
  <div class="relative rounded-md shadow-sm">
    <input
      ref="aEle"
      type="text"
      class="block w-full rounded-md border-0 py-1.5 pr-16 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
        class="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
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
