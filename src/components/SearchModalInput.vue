<template>
  <form class="flex w-full md:ml-0" @submit.prevent :class="class">
    <label for="search-field" class="sr-only">Search</label>
    <div class="relative w-full text-gray-400 focus-within:text-gray-600">
      <div
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center"
        aria-hidden="true"
      >
        <SearchIcon class="h-5 w-5" aria-hidden="true" />
      </div>
      <input
        id="search-field"
        :value="inputValue"
        @input="updateValue"
        name="search-field"
        class="block h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-0 sm:text-base"
        autocomplete="off"
        spellcheck="false"
        :placeholder="placeholder"
        type="search"
        @keydown.arrow-down.prevent
        @keydown.arrow-up.prevent
        v-bind="$attrs"
      />
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useVModel } from "@vueuse/core";
import { SearchIcon } from "@heroicons/vue/solid";

export default defineComponent({
  name: "SearchModalInput",
  props: {
    modelValue: String,
    placeholder: { type: String, default: "Search for anything" },
    class: { type: [String, Object, Array] },
  },
  emits: ["update:modelValue"],
  components: { SearchIcon },
  inheritAttrs: false,
  setup(props) {
    const inputValue = useVModel(props, "modelValue");
    const updateValue = (event: Event) => {
      inputValue.value = (<HTMLInputElement>event.target).value;
    };
    return { inputValue, updateValue };
  },
});
</script>
