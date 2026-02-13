<template>
  <transition
    enter-active-class="transition-all duration-300"
    leave-active-class="transition-all duration-300"
    enter-from-class="opacity-0 translate-y-full"
    leave-to-class="opacity-0 translate-y-full"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 flex flex-col"
      @click.self="close"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" @click="close" />

      <!-- Bottom Sheet -->
      <div class="relative ml-auto mr-auto mt-auto w-full max-w-lg rounded-t-xl bg-popover shadow-xl">
        <!-- Handle -->
        <div class="flex justify-center px-4 pt-3">
          <div class="h-1 w-12 rounded-full bg-muted" />
        </div>

        <!-- Header -->
        <div class="border-border flex items-center justify-between border-b px-4 py-3">
          <h2 class="text-lg font-semibold">{{ title }}</h2>
          <button
            @click="close"
            class="text-muted-foreground hover:text-foreground p-1"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="max-h-[70vh] overflow-y-auto px-4 py-4">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean;
  title: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

function close() {
  emit("close");
}
</script>
