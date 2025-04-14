<script lang="ts" setup>
import { type Media } from "@/types/scenarioModels";
import InputGroup from "@/components/InputGroup.vue";
import { ref, watch } from "vue";
import { klona } from "klona";
import { Button } from "@/components/ui/button";

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
  <form @submit.prevent="onFormSubmit" class="mt-0 mb-6 space-y-4">
    <InputGroup label="Image URL" v-model="form.url" autofocus />
    <InputGroup label="Caption" v-model="form.caption" />
    <InputGroup label="Credits" v-model="form.credits" />
    <InputGroup label="Credits URL" v-model="form.creditsUrl" />
    <div class="flex items-center justify-end space-x-2">
      <Button type="submit" size="sm">Save</Button>
      <Button variant="outline" size="sm" @click="emit('cancel')">Cancel</Button>
    </div>
  </form>
</template>
