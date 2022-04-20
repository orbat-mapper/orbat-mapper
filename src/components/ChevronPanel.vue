<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { ChevronRightIcon } from "@heroicons/vue/solid";

const props = defineProps({ label: String });
const emit = defineEmits(["opened", "closed"]);
</script>

<template>
  <Disclosure as="div" class="border-b border-gray-200 py-6" v-slot="{ open }">
    <h3 class="-my-3 flex w-full items-center justify-between py-3">
      <DisclosureButton
        class="group flex min-w-0 flex-auto items-center text-sm text-gray-400"
        @click="open ? emit('closed') : emit('opened')"
      >
        <ChevronRightIcon
          class="h-6 w-6 flex-none transform text-gray-500 transition-transform group-hover:text-gray-900"
          :class="{
            'rotate-90': open,
          }"
        />

        <span class="ml-2 min-w-0 flex-auto truncate text-left font-bold text-gray-900">
          <slot name="label">{{ label }}</slot>
        </span>
      </DisclosureButton>
      <span class="relative ml-6 flex flex-shrink-0 items-center">
        <slot name="right"></slot>
      </span>
    </h3>
    <DisclosurePanel class="space-y-4 pt-6 pl-6">
      <slot></slot>
    </DisclosurePanel>
  </Disclosure>
</template>
