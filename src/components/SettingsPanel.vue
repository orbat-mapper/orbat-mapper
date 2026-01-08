<script setup lang="ts">
import { ChevronDownIcon } from "@heroicons/vue/24/solid";
import { ref, watch } from "vue";
import { nanoid } from "@/utils";

interface Props {
  label: string;
  open?: boolean;
}
const props = withDefaults(defineProps<Props>(), { open: true });
const emit = defineEmits(["opened", "closed", "update:open"]);

const isOpen = ref(props.open);

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
    isOpen.value = !!v;
    v ? emit("opened") : emit("closed");
  },
);

const panelId = nanoid(5);
</script>

<template>
  <div class="px-6 py-4">
    <h3 class="-my-3 flex w-full items-center justify-between py-3">
      <button
        type="button"
        class="group text-muted-foreground flex min-w-0 flex-auto items-center text-sm"
        @click="toggleOpen()"
        :aria-expanded="isOpen"
        :aria-controls="panelId"
      >
        <span class="text-foreground min-w-0 flex-auto truncate text-left font-bold">
          <slot name="label" :open="isOpen">{{ label }}</slot>
        </span>
      </button>
      <span class="relative ml-6 flex shrink-0 items-center">
        <slot name="right" :open="isOpen"></slot>
        <ChevronDownIcon
          class="text-muted-foreground group-hover:text-foreground ml-2 h-6 w-6 flex-none rotate-180 transform transition-transform"
          :class="{
            'rotate-0': isOpen,
          }"
        />
      </span>
    </h3>
    <div :id="panelId" v-show="isOpen" class="space-y-4 pt-6">
      <slot :open="isOpen"></slot>
    </div>
  </div>
</template>
