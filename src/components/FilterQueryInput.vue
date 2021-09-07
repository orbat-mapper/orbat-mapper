<template>
  <div class="relative rounded-md shadow-sm">
    <div
      class="
        absolute
        inset-y-0
        left-0
        pl-3
        flex
        items-center
        pointer-events-none
      "
    >
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
      class="
        focus:ring-indigo-500 focus:border-indigo-500
        block
        w-full
        pl-10
        pr-10
        sm:text-sm
        border-gray-300
        rounded-md
      "
      placeholder="Filter"
      v-bind="$attrs"
    />
    <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
      <button
        class="
          rounded-md
          text-gray-400
          hover:text-gray-700
          focus:outline-none
          focus:ring-2
          focus:ring-offset-2
          focus:ring-indigo-500
        "
        type="button"
        @click="localValue = ''"
      >
        <CloseIcon class="h-5 w-5" aria-hidden="true" />
      </button>
      <Switch
        v-model="hasLocationFilter"
        title="Toggle location filter"
        @click="hasLocationFilter = !hasLocationFilter"
        class="
          rounded-md
          text-gray-400
          hover:text-gray-700
          focus:outline-none
          focus:ring-2
          focus:ring-offset-2
          focus:ring-indigo-500
        "
      >
        <CrosshairsOff
          v-if="hasLocationFilter"
          class="h-5 w-5"
          aria-hidden="true"
        />
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
