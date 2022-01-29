<template>
  <div class="relative rounded-md shadow-sm">
    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      <FilterVariantPlus
        v-if="hasFilter"
        class="h-5 w-5 text-gray-400"
        aria-hidden="true"
      />
      <FilterVariant v-else class="h-5 w-5 text-gray-400" aria-hidden="true" />
    </div>
    <input
      v-model="localValue"
      type="text"
      class="block w-full rounded-md border-gray-300 pl-10 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      placeholder="Filter"
      v-bind="$attrs"
    />
    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
      <button
        class="rounded-md text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        type="button"
        @click="localValue = ''"
      >
        <CloseIcon class="h-5 w-5" aria-hidden="true" />
      </button>
      <Switch
        v-model="hasLocationFilter"
        title="Toggle location filter"
        @click="hasLocationFilter = !hasLocationFilter"
        class="rounded-md text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <CrosshairsOff v-if="hasLocationFilter" class="h-5 w-5" aria-hidden="true" />
        <CrosshairsGps v-else class="h-5 w-5" aria-hidden="true" />
      </Switch>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent } from "vue";
import { nanoid } from "nanoid";
import {
  Close as CloseIcon,
  CrosshairsGps,
  CrosshairsOff,
  FilterVariant,
  FilterVariantPlus,
} from "mdue";
import { Switch } from "@headlessui/vue";
import { useVModel } from "@vueuse/core";

export default defineComponent({
  name: "FilterQueryInput",
  props: {
    id: [String],
    label: String,
    description: String,
    modelValue: [String, Number],
    locationFilter: Boolean,
  },
  emits: ["update:modelValue", "update:locationFilter"],
  components: {
    FilterVariant,
    CloseIcon,
    CrosshairsGps,
    CrosshairsOff,
    Switch,
    FilterVariantPlus,
  },
  inheritAttrs: false,
  setup(props, { emit }) {
    const computedId = nanoid();
    const localValue = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });
    const hasLocationFilter = useVModel(props, "locationFilter");
    const hasFilter = computed(() => {
      return !!(hasLocationFilter.value || localValue.value);
    });
    return {
      localValue,
      computedId,
      hasLocationFilter,
      hasFilter,
    };
  },
});
</script>
