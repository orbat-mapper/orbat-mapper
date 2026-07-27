<script setup lang="ts">
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { type LayerInfo } from "./LayersPanel.vue";
import OpacityInput from "./OpacityInput.vue";
import { computed } from "vue";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { BASEMAP_FLAVORS } from "@/geo/maplibreLayerConfigTypes";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@heroicons/vue/24/outline";

interface Props {
  settings: LayerInfo[];
  defaultLayerName?: string;
}

const props = defineProps<Props>();
defineEmits([
  "update:layerOpacity",
  "update:layerFlavor",
  "activateLayer",
  "removeLayer",
]);

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
        :key="setting.id"
        class="hover:bg-muted/50 flex items-start gap-3 p-4 transition-colors"
      >
        <RadioGroupItem
          v-if="setting.rowKind !== 'pending-archive'"
          :value="setting.id ?? '__NULL__'"
          :id="`layer-${setting.id ?? 'null'}`"
          class="mt-1"
        />
        <!-- Same-size spacer, so a row without a radio keeps the two-column layout. -->
        <span v-else class="mt-1 size-4 shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-auto flex-col text-sm">
          <div class="flex items-center justify-between font-medium">
            <Label
              :for="
                setting.rowKind === 'pending-archive'
                  ? undefined
                  : `layer-${setting.id ?? 'null'}`
              "
              class="flex-auto truncate font-medium"
            >
              {{ setting.title }}
              <span
                v-if="defaultLayerName && setting.id === defaultLayerName"
                class="border-border/60 bg-muted ml-1 inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-medium"
                >Default</span
              >
            </Label>
            <div class="ml-2 flex shrink-0 items-center gap-1">
              <OpacityInput
                v-if="setting.title !== 'None' && setting.supportsOpacity !== false"
                :model-value="setting.opacity"
                @update:model-value="$emit('update:layerOpacity', setting, $event)"
                class="text-foreground shrink-0"
              />
              <!-- Outside the Label on purpose: inside it, a click would also toggle the radio. -->
              <button
                v-if="setting.removable"
                type="button"
                class="text-muted-foreground hover:text-foreground shrink-0"
                :title="`Remove ${setting.title}`"
                :aria-label="`Remove ${setting.title}`"
                data-test="basemap-archive-remove"
                @click.prevent="$emit('removeLayer', setting)"
              >
                <TrashIcon class="size-4" />
              </button>
            </div>
          </div>
          <Label
            :for="
              setting.rowKind === 'pending-archive'
                ? undefined
                : `layer-${setting.id ?? 'null'}`
            "
            class="text-muted-foreground block text-sm font-normal"
          >
            {{ setting.description || "" }}
          </Label>
          <Button
            v-if="setting.rowKind === 'pending-archive'"
            type="button"
            size="sm"
            variant="secondary"
            class="mt-2 self-start"
            data-test="basemap-archive-activate"
            @click="$emit('activateLayer', setting)"
          >
            {{ setting.actionLabel }}
          </Button>
          <!-- Only a vector archive has flavours, so LayersPanel leaves this unset elsewhere. -->
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
