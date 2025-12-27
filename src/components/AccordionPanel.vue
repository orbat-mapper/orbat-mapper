<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { MinusSmallIcon, PlusSmallIcon } from "@heroicons/vue/24/solid";

const props = defineProps(["label"]);
const emit = defineEmits(["opened", "closed"]);
</script>

<template>
  <Disclosure as="div" class="border-border border-b py-6" v-slot="{ open }">
    <h3 class="-my-3 flow-root">
      <DisclosureButton
        @click="open ? emit('closed') : emit('opened')"
        class="group flex w-full items-center justify-between py-3 text-sm"
      >
        <span class="text-heading font-bold">
          <slot name="label">{{ label }}</slot>
        </span>
        <span class="ml-6 flex items-center">
          <slot name="right"></slot>
          <PlusSmallIcon
            v-if="!open"
            class="group-hover:text-muted-foreground size-5"
            aria-hidden="true"
          />
          <MinusSmallIcon
            v-else
            class="group-hover:text-muted-foreground size-5"
            aria-hidden="true"
          />
        </span>
      </DisclosureButton>
    </h3>
    <slot v-if="!open" name="closedContent" />
    <DisclosurePanel class="space-y-4 pt-6">
      <slot></slot>
    </DisclosurePanel>
  </Disclosure>
</template>
