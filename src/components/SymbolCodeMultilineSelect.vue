<script setup lang="ts">
import { computed, useId } from "vue";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type NullableSymbolItem, type SymbolItem } from "@/types/constants";
import { type UnitSymbolOptions } from "@/types/scenarioModels";
import { Label } from "@/components/ui/label";
import NewMilitarySymbol from "@/components/NewMilitarySymbol.vue";

interface Props {
  label?: string;
  items: NullableSymbolItem[];
  symbolOptions?: UnitSymbolOptions;
  placeholder?: string;
}

const props = defineProps<Props>();
const controlId = useId();

const selectedValue = defineModel<string | null>({ default: "00" });

function mapSymbolItem(item: NullableSymbolItem) {
  return {
    sidc: item.sidc,
    code: item.code,
    label: item.entitySubtype || item.entityType || item.entity,
    subLabel: item.entitySubtype
      ? `${item.entity} / ${item.entityType}`
      : item.entityType
        ? item.entity
        : "",
  };
}

const renderedItems = computed(() => props.items.map(mapSymbolItem));

const selected = computed(() => {
  const v = (renderedItems.value || []).find((i) => i.code === selectedValue.value);
  return v ? v : renderedItems.value[0];
});
</script>
<template>
  <div>
    <Select v-model="selectedValue">
      <Label :for="controlId">{{ label }}</Label>
      <SelectTrigger class="mt-2 w-full" size="lg" :id="controlId">
        <SelectValue>
          <div class="flex items-center" v-if="selected">
            <NewMilitarySymbol
              class="size-8"
              :sidc="selected?.sidc || ''"
              alt=""
              :size="20"
              :options="{ ...symbolOptions, outlineWidth: 4 }"
            />
            <div class="ml-3 max-w-xs text-left sm:max-w-none">
              <div
                v-if="selected?.subLabel"
                class="text-muted-foreground truncate text-xs"
              >
                {{ selected.subLabel }}
              </div>
              <div class="mt-0 truncate text-sm">
                {{ selected?.label }}
              </div>
            </div>
          </div>
          <template v-else>
            <span>{{ placeholder }}</span>
          </template>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem
            v-for="item in renderedItems"
            :key="item.code ?? undefined"
            :value="item.code"
            class="data-[state=checked]:font-semibold"
            ><div class="flex items-center" v-if="selected">
              <NewMilitarySymbol
                class="size-8"
                :sidc="item.sidc || ''"
                alt=""
                :size="20"
                :options="{ ...symbolOptions, outlineWidth: 4 }"
              />
              <div class="ml-3 max-w-xs flex-auto text-left sm:max-w-none">
                <div
                  v-if="selected?.subLabel"
                  class="text-muted-foreground truncate text-xs"
                >
                  {{ item.subLabel }}
                </div>
                <div class="mt-0 truncate">
                  {{ item.label }}
                </div>
              </div>
            </div></SelectItem
          >
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
</template>
