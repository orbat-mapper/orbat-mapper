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
      class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="w-0 flex-1 flex justify-between">
            <p class="w-0 flex-1 text-sm font-medium text-gray-900">
              {{ message }}
            </p>
          </div>

          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="close()"
              class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
import { InboxIcon } from "@heroicons/vue/outline";
import { XIcon } from "@heroicons/vue/solid";
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
