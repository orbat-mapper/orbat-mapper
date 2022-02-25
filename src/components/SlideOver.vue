<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <TransitionRoot as="template" :show="open">
    <Dialog
      as="div"
      static
      class="fixed inset-0 z-40 overflow-hidden"
      @close="open = false"
      :open="open"
    >
      <div class="absolute inset-0 overflow-hidden">
        <DialogOverlay class="absolute inset-0" />

        <div
          class="fixed inset-y-0 flex max-w-full sm:pl-16"
          :class="left ? 'left-0' : 'right-0'"
        >
          <TransitionChild
            as="template"
            enter="transform transition ease-in-out duration-500 sm:duration-500"
            :enter-from="left ? '-translate-x-full' : 'translate-x-full'"
            enter-to="translate-x-0"
            leave="transform transition ease-in-out duration-500 sm:duration-500"
            leave-from="translate-x-0"
            :leave-to="left ? '-translate-x-full' : 'translate-x-full'"
          >
            <div class="w-screen max-w-xs sm:max-w-md">
              <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                <div class="px-4 sm:px-6">
                  <div class="flex items-start justify-between">
                    <DialogTitle class="text-lg font-medium text-gray-900">
                      <slot name="title">{{ title }}</slot>
                    </DialogTitle>
                    <div class="ml-3 flex h-7 items-center">
                      <CloseButton @click="open = false" />
                    </div>
                  </div>
                </div>
                <div class="relative mt-6 flex-1 px-4 sm:px-6">
                  <slot />
                </div>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { XIcon } from "@heroicons/vue/outline";
import CloseButton from "./CloseButton.vue";

export default defineComponent({
  components: {
    CloseButton,
    Dialog,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    XIcon,
  },
  props: { modelValue: { type: Boolean, default: false }, title: String, left: Boolean },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const open = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit("update:modelValue", val);
      },
    });

    return {
      open,
    };
  },
});
</script>
