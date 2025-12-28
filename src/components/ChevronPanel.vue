<script setup lang="ts">
import { type HTMLAttributes, ref, watch } from "vue";
import { ChevronRightIcon } from "@heroicons/vue/24/solid";
import { nanoid } from "@/utils";
import { cn } from "@/lib/utils";

const props = defineProps<{
  label?: string;
  open?: boolean;
  headerClass?: HTMLAttributes["class"];
}>();
const emit = defineEmits(["opened", "closed", "update:open"]);
const headerRef = defineModel<HTMLElement | null>("headerRef");

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
  <div class="border-border border-b py-2">
    <div ref="headerRef" class="">
      <h3
        :class="
          cn(
            'group -my-3 flex w-full items-center justify-between py-3',
            headerClass ?? '',
          )
        "
      >
        <slot name="left" />
        <button
          type="button"
          class="group text-muted-foreground relative flex min-w-0 flex-auto items-center text-sm"
          @click="toggleOpen()"
          :aria-expanded="isOpen"
          :aria-controls="panelId"
        >
          <ChevronRightIcon
            class="text-muted-foreground group-hover:text-foreground size-5 flex-none transform transition-transform"
            :class="{
              'rotate-90': isOpen,
            }"
          />

          <span class="ml-2 min-w-0 flex-auto truncate text-left font-bold">
            <slot name="label">{{ label }}</slot>
          </span>
        </button>
        <span class="relative ml-6 flex shrink-0 items-center">
          <slot name="right" />
        </span>
      </h3>
    </div>
    <div :id="panelId" v-show="isOpen" class="space-y-4 pt-6 pl-6">
      <slot />
    </div>
  </div>
</template>
