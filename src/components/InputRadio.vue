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
      class="input-radio focus:ring-ring focus:ring-offset-background size-5 shrink-0 cursor-pointer focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed"
      :disabled="disabled"
    />
    <label :for="_id" class="ml-3 block text-sm leading-6 font-medium"><slot /></label>
  </div>
</template>

<style scoped>
.input-radio {
  appearance: none;
  border: 2px solid var(--muted-foreground);
  border-radius: 9999px;
  background-color: var(--background);
  background-image: none;
}

.input-radio:checked {
  border-color: var(--foreground);
  background-color: var(--background);
  background-image: radial-gradient(
    circle at center,
    var(--foreground) 0 4px,
    transparent 4.5px
  );
}
</style>
