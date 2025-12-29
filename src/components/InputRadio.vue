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
      class="border-border text-primary focus:ring-primary-foreground size-4"
      :disabled="disabled"
    />
    <label :for="_id" class="ml-3 block text-sm leading-6 font-medium"><slot /></label>
  </div>
</template>
