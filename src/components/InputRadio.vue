<script setup lang="ts">
import { nanoid } from "@/utils";
import { inject } from "vue";

const props = defineProps<{
  id?: string;
  value: string;
  disabled?: boolean;
}>();
const v = defineModel<string>();
const _id = props.id ?? nanoid(5);
const name = inject("radioGroupName", "name");
</script>
<template>
  <div class="flex items-center" :class="{ 'opacity-50': disabled }">
    <input
      :id="_id"
      :value="value"
      type="radio"
      v-model="v"
      :name="name"
      class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
      :disabled="disabled"
    />
    <label
      :for="_id"
      class="ml-3 block text-sm leading-6 font-medium text-gray-900 dark:text-gray-300"
      ><slot
    /></label>
  </div>
</template>
