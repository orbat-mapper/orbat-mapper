<template>
  <form class="w-full flex md:ml-0" @submit.prevent>
    <label for="search-field" class="sr-only">Search</label>
    <div class="relative w-full text-gray-400 focus-within:text-gray-600">
      <div
        class="absolute inset-y-0 left-0 flex items-center pointer-events-none"
        aria-hidden="true"
      >
        <SearchIcon class="h-5 w-5" aria-hidden="true" />
      </div>
      <input
        id="search-field"
        :value="inputValue"
        @input="updateValue"
        name="search-field"
        class="
          block
          w-full
          h-full
          pl-8
          pr-3
          py-2
          border-transparent
          text-gray-900
          placeholder-gray-500
          focus:outline-none focus:ring-0 focus:border-transparent
          sm:text-base
        "
        autocomplete="off"
        spellcheck="false"
        placeholder="Search for anything"
        type="search"
        @keydown.arrow-down.prevent
        @keydown.arrow-up.prevent
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
  props: { modelValue: String },
  emits: ["update:modelValue"],
  components: { SearchIcon },
  setup(props) {
    const inputValue = useVModel(props, "modelValue");
    const updateValue = (event: Event) => {
      inputValue.value = (<HTMLInputElement>event.target).value;
    };
    return { inputValue, updateValue };
  },
});
</script>
