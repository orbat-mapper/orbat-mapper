<script setup lang="ts">
import InputGroup from "@/components/InputGroup.vue";
import { useForm } from "@/composables/forms";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed } from "vue";
import { klona } from "klona";
import FormFooter from "@/modules/scenarioeditor/FormFooter.vue";

interface Form {
  name: string;
  description?: string;
  supplyClass?: string;
  uom?: string;
}

const props = withDefaults(
  defineProps<{ heading?: string; showNextToggle?: boolean }>(),
  {
    heading: "Add new supply category",
  },
);
const modelValue = defineModel<Form>();
const emit = defineEmits<{ cancel: [void]; submit: [form: Form] }>();

const { store } = injectStrict(activeScenarioKey);

const { form, handleSubmit } = useForm<Form>(
  {
    name: "",
    description: "",
    supplyClass: "",
    uom: "",
  },
  modelValue,
);

const supplyClasses = computed(() => {
  const classes = Object.values(store.state.supplyClassMap).map((sc) => ({
    label: sc.description ? `${sc.name} (${sc.description})` : sc.name,
    value: sc.id,
  }));

  return [{ label: "Unspecified", value: "" }, ...classes];
});

const supplyUnits = computed(() => {
  const classes = Object.values(store.state.supplyUomMap).map((sc) => ({
    label: sc.code ? `${sc.name} (${sc.code})` : sc.name,
    value: sc.id,
  }));

  return [{ label: "Unspecified", value: "" }, ...classes];
});

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
    @keyup.ctrl.enter="onSubmit"
    @keyup.meta.enter="onSubmit"
    @submit.prevent="onSubmit"
    @keyup.esc.stop="emit('cancel')"
  >
    <h3 class="text-sm font-semibold">{{ heading }}</h3>
    <section class="mt-4 grid grid-cols-2 gap-6">
      <InputGroup autofocus label="Name" required v-model="form.name" />
      <SimpleSelect label="Class" v-model="form.supplyClass" :items="supplyClasses" />
      <InputGroup class="" label="Description" v-model="form.description" />
      <SimpleSelect
        label="Unit of measure/issue"
        v-model="form.uom"
        :items="supplyUnits"
      />
    </section>
    <FormFooter @cancel="emit('cancel')" :showNextToggle="showNextToggle" />
  </form>
</template>
