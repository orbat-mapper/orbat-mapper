<template>
  <Disclosure as="div" class="border-b border-gray-200 py-6" v-slot="{ open }">
    <h3 class="-my-3 flow-root">
      <DisclosureButton
        class="py-3 w-full flex items-center justify-between text-sm text-gray-400 hover:text-gray-500"
      >
        <span class="font-bold text-gray-900">
          <slot name="label">{{ label }}</slot>
        </span>
        <span class="ml-6 flex items-center">
          <PlusSmIcon v-if="!open" class="h-5 w-5" aria-hidden="true" />
          <MinusSmIcon v-else class="h-5 w-5" aria-hidden="true" />
        </span>
      </DisclosureButton>
    </h3>
    <DisclosurePanel class="pt-6 space-y-4">
      <slot></slot>
    </DisclosurePanel>
  </Disclosure>
</template>

<script>
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { XIcon } from "@heroicons/vue/outline";
import {
  ChevronDownIcon,
  FilterIcon,
  MinusSmIcon,
  PlusSmIcon,
  ViewGridIcon,
} from "@heroicons/vue/solid";

export default {
  name: "AccordionPanel",
  components: {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    ChevronDownIcon,
    FilterIcon,
    MinusSmIcon,
    PlusSmIcon,
    ViewGridIcon,
    XIcon,
  },
  props: ["label"],
  setup() {
    return {};
  },
};
</script>
