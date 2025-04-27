<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects.ts";
import { onMounted } from "vue";
import type { FeatureId } from "@/types/scenarioGeoModels.ts";
import { getGeometryIcon } from "@/modules/scenarioeditor/featureLayerUtils.ts";

const props = withDefaults(defineProps<{ layerMode?: boolean }>(), { layerMode: false });

const {
  geo: { layers },
} = injectStrict(activeScenarioKey);

const selectedValue = defineModel<string | FeatureId>({
  required: false,
});
</script>

<template>
  <Select v-model="selectedValue">
    <SelectTrigger class="w-full"
      ><SelectValue :placeholder="layerMode ? 'Select layer' : 'Select feature'"
    /></SelectTrigger>
    <SelectContent class="border-border">
      <template v-if="props.layerMode">
        <SelectGroup>
          <SelectLabel>Layers</SelectLabel>
          <SelectItem v-for="layer in layers" :key="layer.id" :value="layer.id">{{
            layer.name
          }}</SelectItem>
        </SelectGroup>
      </template>
      <template v-else>
        <SelectGroup v-for="layer in layers" :key="layer.id">
          <SelectLabel>{{ layer.name }}</SelectLabel>
          <SelectItem
            v-for="feature in layer.features"
            :key="feature.id"
            :value="feature.id"
          >
            <component :is="getGeometryIcon(feature)" />
            {{ feature.meta.name || feature.type || feature.geometry.type }}
          </SelectItem>
        </SelectGroup>
      </template>
    </SelectContent>
  </Select>
</template>
