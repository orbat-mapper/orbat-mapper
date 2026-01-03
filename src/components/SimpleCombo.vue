<script lang="ts">
import { computed, defineComponent, type PropType, ref } from "vue";
import { CheckIcon, ChevronUpDownIcon as SelectorIcon } from "@heroicons/vue/24/solid";
import { type SelectItem } from "./types";
import { useVModel } from "@vueuse/core";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default defineComponent({
  components: {
    CheckIcon,
    SelectorIcon,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Button,
    Input,
  },
  props: {
    label: String,
    description: String,
    modelValue: [String, Number],
    items: { type: Array as PropType<SelectItem[]> },
    values: { type: Array as PropType<(string | number)[]> },
    extraClass: [String, Array, Object, Function, Boolean],
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const query = ref("");
    const open = ref(false);
    const selectedValue = useVModel(props, "modelValue", emit);
    const computedValues = computed(() => {
      if (props.items) return props.items;

      return (props.values || []).map((i) => ({
        label: i,
        value: i,
      }));
    });
    const filteredValues = computed(() =>
      query.value === ""
        ? computedValues.value
        : computedValues.value.filter((item) => {
            return String(item.label).toLowerCase().includes(query.value.toLowerCase());
          }),
    );

    const selectedLabel = computed(() => {
      const found = computedValues.value.find((i) => i.value === selectedValue.value);
      return found ? found.label : "";
    });

    const handleSelect = (value: string | number) => {
      selectedValue.value = value;
      open.value = false;
    };

    return {
      query,
      selectedValue,
      filteredValues,
      computedValues,
      open,
      cn,
      selectedLabel,
      handleSelect,
    };
  },
});
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="label"
      class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >{{ label }}</label
    >
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          class="w-full justify-between"
          :class="extraClass"
        >
          {{ selectedLabel || "Select..." }}
          <SelectorIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[200px] p-0" align="start">
        <div class="flex items-center border-b px-3" cmk-input-wrapper>
          <Input
            v-model="query"
            class="placeholder:text-muted-foreground flex h-11 w-full rounded-md border-none bg-transparent py-3 text-sm outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search..."
          />
        </div>
        <div class="max-h-[300px] overflow-x-hidden overflow-y-auto">
          <div v-if="filteredValues.length === 0" class="py-6 text-center text-sm">
            No value found.
          </div>
          <div
            v-for="item in filteredValues"
            :key="item.value"
            @click="handleSelect(item.value)"
            :class="
              cn(
                'hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                selectedValue === item.value ? 'bg-accent text-accent-foreground' : '',
              )
            "
          >
            <CheckIcon
              :class="
                cn(
                  'mr-2 h-4 w-4',
                  selectedValue === item.value ? 'opacity-100' : 'opacity-0',
                )
              "
            />
            {{ item.label }}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
