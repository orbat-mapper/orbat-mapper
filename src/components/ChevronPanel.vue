<script setup>
import { ChevronRightIcon } from "@heroicons/vue/24/solid";
import { ref, watch } from "vue";
import { nanoid } from "../utils";

const props = defineProps({ label: String, open: Boolean });
const emit = defineEmits(["opened", "closed", "update:open"]);

const isOpen = ref(props.open ?? true);

function toggleOpen() {
  if (isOpen.value) {
    isOpen.value = false;
    emit("update:open", false);
    emit("closed");
  } else {
    isOpen.value = true;
    emit("update:open", true);
    emit("opened");
  }
}

watch(
  () => props.open,
  (v) => {
    isOpen.value = v;
    v ? emit("opened") : emit("closed");
  },
);

const panelId = nanoid(5);
</script>

<template>
  <div as="div" class="border-b border-gray-200 py-2">
    <h3 class="group -my-3 flex w-full items-center justify-between py-3">
      <button
        type="button"
        class="group relative flex min-w-0 flex-auto items-center text-sm text-gray-400"
        @click="toggleOpen()"
        :aria-expanded="isOpen"
        :aria-controls="panelId"
      >
        <ChevronRightIcon
          class="h-5 w-5 flex-none transform text-gray-500 transition-transform group-hover:text-gray-900"
          :class="{
            'rotate-90': isOpen,
          }"
        />

        <span class="ml-2 min-w-0 flex-auto truncate text-left font-bold text-gray-900">
          <slot name="label">{{ label }}</slot>
        </span>
      </button>
      <span class="relative ml-6 flex flex-shrink-0 items-center">
        <slot name="right"></slot>
      </span>
    </h3>
    <div :id="panelId" v-show="isOpen" class="space-y-4 pl-6 pt-6">
      <slot></slot>
    </div>
  </div>
</template>
