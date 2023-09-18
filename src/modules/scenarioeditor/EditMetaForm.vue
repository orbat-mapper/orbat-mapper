<script lang="ts" setup>
import InputGroup from "@/components/InputGroup.vue";
import { computed, defineAsyncComponent, ref, watch } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { klona } from "klona";
import { NScenarioFeature, NUnit } from "@/types/internalModels";
import { ScenarioFeature } from "@/types/scenarioGeoModels";

const SimpleMarkdownInput = defineAsyncComponent(
  () => import("@/components/SimpleMarkdownInput.vue"),
);

const props = defineProps<{ item?: NUnit | NScenarioFeature | null }>();
const emit = defineEmits(["cancel", "update"]);

type ItemMetaForm = {
  name: string;
  shortName?: string;
  description: string;
  externalUrl: string;
};

const isScenarioFeature = (item: NUnit | ScenarioFeature): item is ScenarioFeature => {
  return "type" in item && item.type == "Feature";
};

const isUnit = computed(() => {
  return props.item && !isScenarioFeature(props.item);
});

const form = ref<ItemMetaForm>({
  name: "",
  shortName: "",
  description: "",
  externalUrl: "",
});

watch(
  () => props.item,
  (item) => {
    if (!item) return;
    if (isScenarioFeature(item)) {
      form.value = {
        name: item?.properties?.name ?? "",
        description: item?.properties?.description ?? "",
        externalUrl: item?.properties?.externalUrl ?? "",
      };
    } else {
      form.value = {
        name: item?.name ?? "",
        shortName: item?.shortName ?? "",
        description: item?.description ?? "",
        externalUrl: item?.externalUrl ?? "",
      };
    }
  },
  { immediate: true },
);

const onFormSubmit = () => {
  emit("update", klona(form.value));
};
</script>
<template>
  <form @submit.prevent="onFormSubmit" class="mb-6 mt-0 space-y-4">
    <InputGroup label="Name" v-model="form.name" id="name-input" autofocus />
    <InputGroup
      v-if="isUnit"
      label="Short name"
      description="Alternative name"
      v-model="form.shortName"
    />
    <InputGroup label="External URL" description="" v-model="form.externalUrl" />
    <SimpleMarkdownInput
      label="Description"
      v-model="form.description"
      description="Use markdown syntax for formatting"
    />

    <div class="flex items-center justify-end space-x-2">
      <BaseButton type="submit" small primary>Save</BaseButton>
      <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
    </div>
  </form>
</template>
