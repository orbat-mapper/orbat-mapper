<script setup lang="ts">
import InputGroup from "@/components/InputGroup.vue";
import { useForm } from "@/composables/forms";
import { klona } from "klona";
import FormFooter from "@/modules/scenarioeditor/FormFooter.vue";
import TextAreaGroup from "@/components/TextAreaGroup.vue";
import { symbolSetValues } from "@/symbology/values.ts";
import SimpleSelect from "@/components/SimpleSelect.vue";

interface Form {
  id?: string;
  name: string;
  src: string;
  symbolSet: string;
  anchor?: [number, number];
}

const props = withDefaults(
  defineProps<{ heading?: string; showNextToggle?: boolean }>(),
  {
    heading: "Add new item",
  },
);
const modelValue = defineModel<Form>();
const emit = defineEmits<{ cancel: [void]; submit: [form: Form] }>();

const { form, handleSubmit } = useForm<Form>(
  {
    name: "",
    src: "",
    symbolSet: "10",
  },
  modelValue,
);

const symbolSetItems = symbolSetValues.map((s) => ({
  label: s.text,
  value: s.code,
}));

function onSubmit(e: KeyboardEvent | Event) {
  // prevent double form submission with ctrl/meta+enter
  if (e instanceof KeyboardEvent && e.target instanceof HTMLInputElement) {
    return;
  }
  handleSubmit();
  emit("submit", klona(form.value));
}
</script>

<template>
  <form
    @submit.prevent="onSubmit"
    @keyup.esc.stop="emit('cancel')"
    @keyup.ctrl.enter="onSubmit"
    @keyup.meta.enter="onSubmit"
  >
    <h3 class="text-sm font-semibold">{{ heading }}</h3>
    <section class="mt-4 grid grid-cols-1 gap-6">
      <InputGroup autofocus label="Name" required v-model="form.name" />
      <TextAreaGroup label="URL or URI" required v-model="form.src"></TextAreaGroup>
      <SimpleSelect v-model="form.symbolSet" :items="symbolSetItems" />
    </section>
    <FormFooter @cancel="emit('cancel')" :showNextToggle="showNextToggle" />
  </form>
</template>
