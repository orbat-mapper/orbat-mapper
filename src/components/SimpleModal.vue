<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <TransitionRoot as="template" :show="open">
    <Dialog
      as="div"
      static
      class="fixed z-10 inset-0 overflow-y-auto"
      @close="open = false"
      :open="open"
      :initialFocus="initialFocus"
    >
      <div
        class="flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />
        </TransitionChild>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <!--        <span-->
        <!--          class="hidden sm:inline-block sm:align-middle sm:h-screen"-->
        <!--          aria-hidden="true"-->
        <!--          >&#8203;</span-->
        <!--        >-->
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div
            class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 md:my-16 sm:align-middle sm:max-w-lg w-full sm:p-6"
          >
            <div class="">
              <div class="mt-3 text-center sm:mt-0 sm:ml-2 sm:text-left">
                <DialogTitle
                  as="h3"
                  class="text-lg leading-6 font-medium text-gray-900"
                >
                  <slot name="title">{{ dialogTitle }}</slot>
                </DialogTitle>
                <slot></slot>
              </div>
            </div>
            <div class="sm:block absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                @click="open = false"
              >
                <span class="sr-only">Close</span>
                <XIcon class="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, PropType, watch } from "vue";
import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { XIcon } from "@heroicons/vue/outline";
import { useVModel } from "@vueuse/core";
import { useUiStore } from "../stores/uiStore";

export default defineComponent({
  name: "SimpleModal",
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    XIcon,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    dialogTitle: { type: String },
    initialFocus: {
      type: Object as PropType<HTMLElement | null>,
      default: null,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const uiStore = useUiStore();
    const open = useVModel(props, "modelValue");
    uiStore.modalOpen = open.value;
    watch(open, (v) => {
      uiStore.modalOpen = v;
    });

    onUnmounted(() => (uiStore.modalOpen = false));

    return {
      open,
    };
  },
});
</script>
