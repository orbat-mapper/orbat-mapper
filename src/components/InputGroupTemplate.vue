<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-gray-700">
      <slot name="label">{{ label }}</slot>
    </label>
    <div class="mt-1">
      <slot :id="id"></slot>
    </div>
    <p v-if="description || $slots.description" class="mt-2 text-sm text-gray-500">
      <slot name="description">{{ description }}</slot>
    </p>
  </div>
</template>

<script>
import { computed, defineComponent } from "vue";
import { nanoid } from "nanoid";

export default defineComponent({
  name: "InputGroupTemplate",
  props: {
    label: String,
    description: String,
  },
  setup(props) {
    const id = nanoid();
    return {
      id,
    };
  },
});
</script>
