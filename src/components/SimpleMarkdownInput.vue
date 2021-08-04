<template>
  <div>
    <div class="flex items-end justify-between">
      <label
        :for="id || computedId"
        class="block text-sm font-medium text-gray-700"
      >
        <slot name="label">{{ label }}</slot>
      </label>
      <nav class="flex space-x-3" aria-label="Tabs">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.name"
          type="button"
          @click="currentTab = index"
          :class="[
            tab.current
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-500 hover:text-gray-700',
            'px-3 py-1.5 font-medium text-sm rounded-md',
          ]"
          :aria-current="tab.current ? 'page' : undefined"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>
    <div class="mt-1">
      <textarea
        v-show="!isPreview"
        v-model="localValue"
        :id="id || computedId"
        class="
          shadow-sm
          focus:ring-indigo-500 focus:border-indigo-500
          block
          w-full
          sm:text-sm
          border-gray-300
          rounded-md
        "
        v-bind="$attrs"
      />
      <div
        v-if="isPreview"
        class="mt-4 prose prose-sm"
        v-html="renderedMarkdown"
      ></div>
    </div>
    <p
      v-if="!isPreview && (description || $slots.description)"
      class="mt-2 text-sm text-gray-500"
    >
      <slot name="description">{{ description }}</slot>
    </p>
    <GlobalEvents @keyup.alt.p="togglePreview"></GlobalEvents>
  </div>
</template>

<script>
import { computed, defineComponent, ref } from "vue";
import { nanoid } from "nanoid";
import { renderMarkdown } from "../composables/formatting";
import { GlobalEvents } from "vue-global-events";

const dtabs = [
  { name: "Write", href: "#", current: true },
  { name: "Preview", href: "#", current: false },
];

export default defineComponent({
  name: "SimpleMarkdownInput",
  props: {
    id: [String],
    label: String,
    description: String,
    modelValue: [String, Number],
  },
  emits: ["update:modelValue"],
  inheritAttrs: false,
  components: { GlobalEvents },
  setup(props, { emit }) {
    const computedId = nanoid();
    const localValue = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });

    const currentTab = ref(0);
    const isPreview = computed(() => currentTab.value === 1);
    const tabs = computed(() =>
      [{ name: "Write" }, { name: "Preview" }].map((item, index) => ({
        ...item,
        current: index === currentTab.value,
      }))
    );

    const renderedMarkdown = computed(() => {
      if (!isPreview) return "";
      return renderMarkdown(localValue.value || "");
    });

    const togglePreview = () => {
      if (currentTab.value === 0) currentTab.value = 1;
      else currentTab.value = 0;
    };

    return {
      localValue,
      computedId,
      tabs,
      currentTab,
      isPreview,
      renderedMarkdown,
      togglePreview,
    };
  },
});
</script>
