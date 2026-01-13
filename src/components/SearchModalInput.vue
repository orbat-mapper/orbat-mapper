<script setup lang="ts">
import { useFocusOnMount } from "./helpers";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";

defineOptions({
  name: "SearchModalInput",
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    placeholder?: string;
    inputId?: string;
    focus?: boolean;
  }>(),
  {
    placeholder: "Search for anything",
    inputId: "searchField",
    focus: false,
  },
);

const inputValue = defineModel<string>();

const updateValue = (event: Event) => {
  inputValue.value = (<HTMLInputElement>event.target).value;
};
useFocusOnMount(props.inputId);
</script>

<template>
  <form class="flex w-full md:ml-0" @submit.prevent>
    <label :for="inputId" class="sr-only">Search</label>
    <div class="text-muted-foreground focus-within:text-muted-foreground relative w-full">
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
        class="text-foreground block h-full w-full border-transparent py-2 pr-3 pl-8 placeholder-gray-500 focus:border-transparent focus:ring-0 focus:outline-hidden sm:text-base"
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
