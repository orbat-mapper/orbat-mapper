<template>
  <form class="flex w-full md:ml-0" @submit.prevent>
    <label :for="inputId" class="sr-only">Search</label>
    <div class="relative w-full text-gray-400 focus-within:text-gray-600">
      <div
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center"
        aria-hidden="true"
      >
        <MagnifyingGlassIcon class="h-5 w-5" aria-hidden="true" />
      </div>
      <input
        :id="inputId"
        :value="inputValue"
        @input="updateValue"
        name="search-field"
        class="block h-full w-full border-transparent py-2 pr-3 pl-8 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-0 focus:outline-hidden sm:text-base"
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
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import { useFocusOnMount } from "./helpers";

export default defineComponent({
  name: "SearchModalInput",
  props: {
    modelValue: String,
    placeholder: { type: String, default: "Search for anything" },
    inputId: { type: String, default: "searchField" },
    focus: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
  components: { MagnifyingGlassIcon },
  inheritAttrs: false,
  setup(props) {
    const inputValue = useVModel(props, "modelValue");
    const updateValue = (event: Event) => {
      inputValue.value = (<HTMLInputElement>event.target).value;
    };
    useFocusOnMount(props.inputId);
    return { inputValue, updateValue };
  },
});
</script>
