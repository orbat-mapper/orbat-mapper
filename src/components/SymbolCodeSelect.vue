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
import { type NullableSymbolItem, type SymbolGroup } from "@/types/constants";
import { type UnitSymbolOptions } from "@/types/scenarioModels";
import NewMilitarySymbol from "@/components/NewMilitarySymbol.vue";
import { Field, FieldLabel } from "@/components/ui/field";

interface Props {
  label?: string;
  items?: NullableSymbolItem[];
  groups?: SymbolGroup[];
  symbolOptions?: UnitSymbolOptions;
  placeholder?: string;
}

const props = defineProps<Props>();
const controlId = useId();

const selectedValue = defineModel<string | null>({ default: "00" });
const selected = computed(() => {
  if (props.groups) {
    for (const group of props.groups) {
      const found = group.items.find((i) => i.code === selectedValue.value);
      if (found) return found;
    }
    return null;
  }
  return (props.items || []).find((i) => i.code === selectedValue.value);
});
</script>
<template>
  <Field>
    <FieldLabel :for="controlId">{{ label }}</FieldLabel>
    <Select v-model="selectedValue">
      <SelectTrigger class="w-full data-[size=default]:h-10" :id="controlId">
        <SelectValue class="">
          <template v-if="selected"
            ><NewMilitarySymbol
              class="size-8"
              :sidc="selected?.sidc || ''"
              alt=""
              :size="20"
              :options="{
                outlineWidth: 8,
                ...symbolOptions,
                ...selected?.symbolOptions,
              }"
            />
            <span class="truncate">{{ selected?.text }}</span>
          </template>
          <template v-else>
            <span>{{ placeholder }}</span>
          </template>
        </SelectValue>
      </SelectTrigger>
      <SelectContent class="border-border max-h-[400px]">
        <template v-if="groups">
          <SelectGroup v-for="group in groups" :key="group.name">
            <SelectLabel>{{ group.name }}</SelectLabel>
            <SelectItem
              v-for="item in group.items"
              :key="item.code ?? undefined"
              :value="item.code"
              class="data-[state=checked]:font-semibold"
            >
              <NewMilitarySymbol
                :size="20"
                class="size-8"
                :sidc="item.sidc"
                :options="{
                  outlineWidth: 8,
                  ...symbolOptions,
                  ...item.symbolOptions,
                }"
              />
              {{ item.text }}
            </SelectItem>
          </SelectGroup>
        </template>
        <SelectGroup v-else>
          <SelectItem
            v-for="item in items"
            :key="item.code ?? undefined"
            :value="item.code"
            class="data-[state=checked]:font-semibold"
          >
            <NewMilitarySymbol
              :size="20"
              class="size-8"
              :sidc="item.sidc"
              :options="{
                outlineWidth: 8,
                ...symbolOptions,
                ...item.symbolOptions,
              }"
            />
            {{ item.text }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </Field>
</template>
