<script setup lang="ts">
import InputGroup from "@/components/InputGroup.vue";
import { useForm } from "@/composables/forms";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { klona } from "klona";
import type { UnitOfMeasure, UoMType } from "@/types/scenarioModels";
import { type SelectItem } from "@/components/types";
import FormFooter from "@/modules/scenarioeditor/FormFooter.vue";

interface Form extends UnitOfMeasure {
  id?: string;
}

const props = withDefaults(defineProps<{ heading?: string }>(), {
  heading: "Add new supply category",
});
const modelValue = defineModel<Form>();
const emit = defineEmits<{ cancel: [void]; submit: [form: Form] }>();

const uomTypes: SelectItem<UoMType | "">[] = [
  { label: "Unspecified", value: "" },
  { value: "quantity", label: "Quantity" },
  { value: "volume", label: "Volume" },
  { value: "weight", label: "Weight" },
  { value: "distance", label: "Distance" },
];
const { form, handleSubmit } = useForm<Form>(
  {
    name: "",
    code: "",
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
      <InputGroup label="Abbreviation" v-model="form.code" />
      <SimpleSelect label="Type" v-model="form.type" :items="uomTypes" />
      <InputGroup class="" label="Description" v-model="form.description" />
    </section>
    <FormFooter @cancel="emit('cancel')" />
  </form>
</template>
