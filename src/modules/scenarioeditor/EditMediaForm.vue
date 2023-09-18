<script lang="ts" setup>
import { Media } from "@/types/scenarioModels";
import InputGroup from "@/components/InputGroup.vue";
import { ref, watch } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { klona } from "klona";

const props = defineProps<{ media?: Media | null }>();
const emit = defineEmits(["cancel", "update"]);
const form = ref<Media>({
  url: "",
  caption: "",
  credits: "",
  creditsUrl: "",
});

watch(
  () => props.media,
  (media) => {
    form.value = {
      url: media?.url ?? "",
      caption: media?.caption ?? "",
      credits: media?.credits ?? "",
      creditsUrl: media?.creditsUrl ?? "",
    };
  },
  { immediate: true },
);

const onFormSubmit = () => {
  emit("update", klona(form.value));
};
</script>
<template>
  <form @submit.prevent="onFormSubmit" class="mb-6 mt-0 space-y-4">
    <InputGroup label="Image URL" v-model="form.url" autofocus />
    <InputGroup label="Caption" v-model="form.caption" />
    <InputGroup label="Credits" v-model="form.credits" />
    <InputGroup label="Credits URL" v-model="form.creditsUrl" />
    <div class="flex items-center justify-end space-x-2">
      <BaseButton type="submit" small primary>Save</BaseButton>
      <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
    </div>
  </form>
</template>
