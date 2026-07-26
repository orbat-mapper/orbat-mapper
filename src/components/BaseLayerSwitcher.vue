<script setup lang="ts">
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { type LayerInfo } from "./LayersPanel.vue";
import OpacityInput from "./OpacityInput.vue";
import { computed } from "vue";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { BASEMAP_FLAVORS } from "@/geo/maplibreLayerConfigTypes";

interface Props {
  settings: LayerInfo[];
  defaultLayerName?: string;
}

const props = defineProps<Props>();
defineEmits(["update:layerOpacity", "update:layerFlavor"]);

const selected = defineModel<LayerInfo>();
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
            <span v-if="setting.title === 'None' || setting.supportsOpacity === false" />
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
          <!-- Only a vector map file has flavours, so LayersPanel leaves this unset elsewhere. -->
          <div v-if="setting.flavor" class="mt-2 flex items-center gap-2">
            <Label :for="`flavor-${setting.id}`" class="text-muted-foreground text-xs">
              Flavour
            </Label>
            <NativeSelect
              :id="`flavor-${setting.id}`"
              :model-value="setting.flavor"
              data-test="basemap-flavor-select"
              class="h-7 py-0 text-xs"
              @update:model-value="$emit('update:layerFlavor', setting, $event)"
            >
              <NativeSelectOption v-for="f in BASEMAP_FLAVORS" :key="f" :value="f">
                {{ f }}
              </NativeSelectOption>
            </NativeSelect>
          </div>
        </div>
      </div>
    </div>
  </RadioGroup>
</template>
