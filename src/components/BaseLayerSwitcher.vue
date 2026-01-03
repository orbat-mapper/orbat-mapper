<script setup lang="ts">
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { type LayerInfo } from "./LayersPanel.vue";
import OpacityInput from "./OpacityInput.vue";
import { computed } from "vue";

interface Props {
  settings: LayerInfo<any>[];
  defaultLayerName?: string;
}

const props = defineProps<Props>();
defineEmits(["update:layerOpacity"]);

const selected = defineModel<LayerInfo<any>>();
const nsettings = computed(() => [...props.settings]);

const selectedId = computed({
  get: () => selected.value?.id ?? "__NULL__",
  set: (id) => {
    if (id === "__NULL__") {
      selected.value = props.settings.find((s) => s.id === null);
    } else {
      selected.value = props.settings.find((s) => s.id === id);
    }
  },
});
</script>

<template>
  <RadioGroup v-model="selectedId" class="block">
    <Label class="sr-only">Select base map layer</Label>
    <div
      class="divide-border border-border bg-card divide-y overflow-hidden rounded-md border"
    >
      <div
        v-for="setting in nsettings"
        :key="setting.title"
        class="hover:bg-muted/50 flex items-start gap-3 p-4 transition-colors"
      >
        <RadioGroupItem
          :value="setting.id ?? '__NULL__'"
          :id="`layer-${setting.id ?? 'null'}`"
          class="mt-1"
        />
        <div class="flex min-w-0 flex-auto flex-col text-sm">
          <div class="flex items-center justify-between font-medium">
            <Label
              :for="`layer-${setting.id ?? 'null'}`"
              class="flex-auto truncate font-medium"
            >
              {{ setting.title }}
              <span
                v-if="defaultLayerName && setting.id === defaultLayerName"
                class="border-border/60 bg-muted ml-1 inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-medium"
                >Default</span
              >
            </Label>
            <span v-if="setting.title === 'None'" />
            <OpacityInput
              v-else
              :model-value="setting.opacity"
              @update:model-value="$emit('update:layerOpacity', setting, $event)"
              class="text-foreground shrink-0"
            />
          </div>
          <Label
            :for="`layer-${setting.id ?? 'null'}`"
            class="text-muted-foreground block text-sm font-normal"
          >
            {{ setting.description || "" }}
          </Label>
        </div>
      </div>
    </div>
  </RadioGroup>
</template>
