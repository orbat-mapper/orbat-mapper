<script setup lang="ts">
import {
  RadioGroup,
  RadioGroupDescription,
  RadioGroupLabel,
  RadioGroupOption,
} from "@headlessui/vue";
import { type LayerInfo } from "./LayersPanel.vue";
import OpacityInput from "./OpacityInput.vue";
import { computed } from "vue";

interface Props {
  settings: LayerInfo<any>[];
  defaultLayerName?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:layerOpacity"]);

const selected = defineModel<LayerInfo<any>>();
const nsettings = computed(() => [...props.settings]);
</script>

<template>
  <RadioGroup v-model="selected">
    <RadioGroupLabel class="sr-only">Select base map layer</RadioGroupLabel>
    <div
      class="divide-border border-border bg-card divide-y overflow-hidden rounded-md border"
    >
      <RadioGroupOption
        as="template"
        v-for="(setting, settingIdx) in nsettings"
        :key="setting.title"
        :value="setting"
        v-slot="{ checked, active }"
      >
        <div
          :class="[
            checked ? 'bg-primary/10' : 'bg-transparent',
            active ? 'ring-ring ring-offset-background ring-2 ring-offset-2' : '',
            'focus-visible:ring-ring focus-visible:ring-offset-background relative flex cursor-pointer items-start gap-3 p-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            settingIdx === 0 ? 'rounded-t-md' : '',
            settingIdx === nsettings.length - 1 ? 'rounded-b-md' : '',
          ]"
        >
          <span
            class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition"
            :class="[
              checked ? 'border-primary bg-primary' : 'border-input bg-background',
              active ? 'ring-ring ring-offset-background ring-2 ring-offset-1' : '',
            ]"
            aria-hidden="true"
          >
            <span
              class="h-1.5 w-1.5 rounded-full transition"
              :class="checked ? 'bg-primary-foreground' : 'bg-transparent'"
            />
          </span>
          <div class="flex min-w-0 flex-auto flex-col">
            <RadioGroupLabel
              as="div"
              :class="['flex items-center justify-between text-sm font-medium']"
            >
              <div>
                <span class="flex-auto truncate">{{ setting.title }}</span>
                <span
                  v-if="defaultLayerName && setting.id === defaultLayerName"
                  class="border-border/60 bg-muted ml-1 inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-medium"
                  >Default</span
                >
              </div>
              <span v-if="setting.title === 'None'" />
              <OpacityInput
                v-else
                :model-value="setting.opacity"
                @update:model-value="$emit('update:layerOpacity', setting, $event)"
                class="text-foreground shrink-0"
              />
            </RadioGroupLabel>
            <RadioGroupDescription
              as="span"
              :class="[
                checked ? 'text-foreground/80' : 'text-muted-foreground',
                'block text-sm',
              ]"
            >
              {{ setting.description || "" }}
            </RadioGroupDescription>
          </div>
        </div>
      </RadioGroupOption>
    </div>
  </RadioGroup>
</template>
