<template>
  <transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="ring-opacity-5 pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex w-0 flex-1 justify-between">
            <p class="w-0 flex-1 text-sm font-medium text-gray-900">
              {{ message }}
            </p>
          </div>

          <div class="ml-4 flex shrink-0">
            <button
              @click="close()"
              class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
            >
              <span class="sr-only">Close</span>
              <XIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { InboxIcon } from "@heroicons/vue/24/outline";
import { XMarkIcon as XIcon } from "@heroicons/vue/24/solid";
import { useTimer } from "../composables/timing";

export default defineComponent({
  name: "NotificationItem",
  components: {
    InboxIcon,
    XIcon,
  },
  props: {
    title: { type: String, default: "Title" },
    message: { type: String, default: "Message" },
    duration: { type: Number, default: 4000 },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const show = ref(true);

    useTimer(close, props.duration);

    function close() {
      show.value = false;
      setTimeout(() => emit("close"), 150);
    }

    return {
      show,
      close,
    };
  },
});
</script>
