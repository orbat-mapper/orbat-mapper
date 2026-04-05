<script lang="ts" setup>
import InputGroup from "@/components/InputGroup.vue";
import { computed, defineAsyncComponent, ref, watch } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { klona } from "klona";
import type { NGeometryLayerItem, NScenarioEvent, NUnit } from "@/types/internalModels";
import { createShortUnitName } from "@/utils/shortUnitName";
import { useTextToOrbatStore } from "@/views/texttoorbat/textToOrbatStore";
import { storeToRefs } from "pinia";
import { WandSparklesIcon, ChevronDownIcon } from "lucide-vue-next";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

const SimpleMarkdownInput = defineAsyncComponent(
  () => import("@/components/SimpleMarkdownInput.vue"),
);

const props = defineProps<{
  item?: NUnit | NGeometryLayerItem | NScenarioEvent | null;
}>();
const emit = defineEmits(["cancel", "update"]);

type ItemMetaForm = {
  name: string;
  shortName?: string;
  description: string;
  externalUrl: string;
  title: string;
  subTitle: string;
};

const form = ref<Partial<ItemMetaForm>>({
  name: "",
  shortName: "",
  description: "",
  externalUrl: "",
  title: "",
  subTitle: "",
});

const isScenarioFeatureType = (
  item: NUnit | NGeometryLayerItem | NScenarioEvent,
): item is NGeometryLayerItem => {
  return "type" in item && item.type == "Feature";
};

const isScenarioEventType = (
  item: NUnit | NGeometryLayerItem | NScenarioEvent,
): item is NScenarioEvent => {
  return "startTime" in item || ("_type" in item && item._type === "scenario");
};

const isUnitType = (item: NUnit | NGeometryLayerItem | NScenarioEvent): item is NUnit => {
  return "sidc" in item;
};

const isUnit = computed(() => {
  return props.item && isUnitType(props.item);
});

const isScenarioEvent = computed(() => {
  return props.item && isScenarioEventType(props.item);
});

watch(
  () => props.item,
  (item) => {
    if (!item) return;
    if (isScenarioFeatureType(item)) {
      form.value = {
        name: item?.meta?.name ?? "",
        description: item?.meta?.description ?? "",
        externalUrl: item?.meta?.externalUrl ?? "",
      };
    } else if (isUnitType(item)) {
      form.value = {
        name: item?.name ?? "",
        shortName: item?.shortName ?? "",
        description: item?.description ?? "",
        externalUrl: item?.externalUrl ?? "",
      };
    } else if (isScenarioEventType(item)) {
      form.value = {
        title: item?.title ?? "",
        subTitle: item?.subTitle ?? "",
        description: item?.description ?? "",
        externalUrl: item?.externalUrl ?? "",
      };
    }
  },
  { immediate: true },
);

const {
  shortNameMaxLength,
  shortNameUppercase,
  shortNameAllowWhitespace,
  shortNameForceLength,
} = storeToRefs(useTextToOrbatStore());

function generateShortName() {
  if (!form.value.name) return;
  const result = createShortUnitName(form.value.name, {
    maxLength: shortNameMaxLength.value,
    uppercase: shortNameUppercase.value,
    allowWhitespace: shortNameAllowWhitespace.value,
    forceLength: shortNameForceLength.value,
  });
  if (result) {
    form.value.shortName = result;
  }
}

const onFormSubmit = () => {
  emit("update", klona(form.value));
};
</script>
<template>
  <form @submit.prevent="onFormSubmit" class="mt-0 mb-6 space-y-4">
    <template v-if="isScenarioEvent">
      <InputGroup label="Title" v-model="form.title" id="title-input" autofocus />
      <!--      <InputGroup label="Sub title" v-model="form.subTitle" />-->
    </template>

    <template v-else>
      <InputGroup label="Name" v-model="form.name" id="name-input" autofocus />
      <Field v-if="isUnit">
        <FieldLabel>Short name</FieldLabel>
        <div class="flex items-center gap-1">
          <Input type="text" v-model="form.shortName" class="flex-1" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            class="shrink-0"
            title="Generate short name"
            @click="generateShortName()"
          >
            <WandSparklesIcon class="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                type="button"
                variant="outline"
                size="icon"
                class="shrink-0"
                title="Short name settings"
              >
                <ChevronDownIcon class="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              class="min-w-56"
              @pointer-down-outside="$event.detail.originalEvent.stopPropagation()"
            >
              <DropdownMenuCheckboxItem v-model="shortNameUppercase" @select.prevent>
                Uppercase output
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                v-model="shortNameAllowWhitespace"
                @select.prevent
              >
                Allow whitespace
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model="shortNameForceLength" @select.prevent>
                Force length
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Max length</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                :model-value="String(shortNameMaxLength)"
                @update:model-value="shortNameMaxLength = Number($event)"
              >
                <DropdownMenuRadioItem value="3" @select.prevent>
                  3
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="4" @select.prevent>
                  4
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="6" @select.prevent>
                  6
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="8" @select.prevent>
                  8
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="10" @select.prevent>
                  10
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="12" @select.prevent>
                  12
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <FieldDescription>Alternative name</FieldDescription>
      </Field>
    </template>
    <SimpleMarkdownInput
      label="Description"
      v-model="form.description"
      description="Use markdown syntax for formatting"
    />
    <InputGroup label="External URL" description="" v-model="form.externalUrl" />

    <div class="flex items-center justify-end space-x-2">
      <BaseButton type="submit" small primary>Save</BaseButton>
      <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
    </div>
  </form>
</template>
