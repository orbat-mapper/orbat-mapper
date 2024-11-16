<template>
  <div class="bg-white px-4 py-5 shadow dark:bg-slate-800/30 sm:rounded-lg sm:p-6">
    <div class="md:grid md:grid-cols-3 md:gap-6">
      <div class="md:col-span-1">
        <h3 class="text-lg font-medium leading-6 text-heading">{{ label }}</h3>
        <div class="mt-1 text-sm text-gray-500 dark:text-slate-400">
          <slot name="description">
            <p v-if="description">{{ description }}</p>
          </slot>
        </div>
      </div>
      <div class="mt-5 md:col-span-2 md:mt-0">
        <div class="space-y-6">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "FormCard",
  props: {
    label: String,
    description: String,
  },
};
</script>
