<script setup lang="ts">
import { computed, useId } from "vue";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type NullableSymbolItem, type SymbolItem } from "@/types/constants";
import { type UnitSymbolOptions } from "@/types/scenarioModels";
import { Label } from "@/components/ui/label";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
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
const selected = computed(() =>
  (props.items || []).find((i) => i.code === selectedValue.value),
);
</script>
<template>
  <div>
    <Select v-model="selectedValue">
      <Label :for="controlId">{{ label }}</Label>
      <SelectTrigger class="mt-2 w-full" size="lg" :id="controlId">
        <SelectValue>
          <template v-if="selected"
            ><NewMilitarySymbol
              class="size-8"
              :sidc="selected?.sidc || ''"
              alt=""
              :size="20"
              :options="{ ...symbolOptions, ...selected?.symbolOptions }"
            />
            <span class="truncate">{{ selected?.text }}</span>
          </template>
          <template v-else>
            <span>{{ placeholder }}</span>
          </template>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem
            v-for="item in items"
            :key="item.code ?? undefined"
            :value="item.code"
          >
            <NewMilitarySymbol
              :size="20"
              class="size-8"
              :sidc="item.sidc"
              :options="{ ...symbolOptions, ...item.symbolOptions, outlineWidth: 4 }"
            />
            {{ item.text }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
</template>
