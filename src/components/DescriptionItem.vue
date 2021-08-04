<template>
  <div>
    <dt class="text-sm font-medium text-gray-500">
      <slot name="label">{{ label }}</slot>
    </dt>
    <dd class="mt-1 text-sm text-gray-900">
      <slot />
    </dd>
  </div>
</template>

<script>
export default {
  name: "DescriptionItem",
  props: {
    label: { type: String },
  },
};
</script>
