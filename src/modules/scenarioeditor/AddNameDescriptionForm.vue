<script setup lang="ts">
import InputGroup from "@/components/InputGroup.vue";
import { useForm } from "@/composables/forms";
import { klona } from "klona";
import FormFooter from "@/modules/scenarioeditor/FormFooter.vue";

interface Form {
  id?: string;
  name: string;
  description?: string;
}

const props = withDefaults(defineProps<{ heading?: string }>(), {
  heading: "Add new item",
});
const modelValue = defineModel<Form>();
const emit = defineEmits<{ cancel: [void]; submit: [form: Form] }>();

const { form, handleSubmit } = useForm<Form>(
  {
    name: "",
    description: "",
  },
  modelValue,
);

function onSubmit() {
  handleSubmit();
  emit("submit", klona(form.value));
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="" @keyup.esc.stop="emit('cancel')">
    <h3 class="text-sm font-semibold">{{ heading }}</h3>
    <section class="mt-4 grid grid-cols-2 gap-6">
      <InputGroup autofocus label="Name" required v-model="form.name" />
      <InputGroup class="" label="Description" v-model="form.description" />
    </section>
    <FormFooter @cancel="emit('cancel')" />
  </form>
</template>
