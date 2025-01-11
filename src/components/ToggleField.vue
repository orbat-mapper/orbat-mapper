<script setup lang="ts">
import { Switch, SwitchGroup, SwitchLabel } from "@headlessui/vue";
const props = defineProps<{ disabled?: boolean }>();

const enabled = defineModel({ default: true });
</script>
<template>
  <SwitchGroup as="div" class="flex items-center" :class="disabled ? 'opacity-50' : ''">
    <Switch
      v-model="enabled"
      :disabled="disabled"
      :class="[
        enabled ? 'bg-slate-600' : 'bg-slate-200',
        'flex w-8 cursor-pointer rounded-full p-px ring-1 ring-inset ring-slate-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
      ]"
    >
      <span
        aria-hidden="true"
        :class="[
          enabled ? 'translate-x-3.5' : 'translate-x-0',
          'h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition duration-200 ease-in-out',
        ]"
      />
    </Switch>
    <SwitchLabel as="span" class="ml-3 text-sm" v-if="$slots.default">
      <span class="cursor-pointer font-medium text-slate-700 dark:text-slate-300"
        ><slot
      /></span>
    </SwitchLabel>
  </SwitchGroup>
</template>
