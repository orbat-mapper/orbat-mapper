<script setup lang="ts">
import InputGroup from "@/components/InputGroup.vue";
import { useForm } from "@/composables/forms";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed } from "vue";
import { klona } from "klona";

interface Form {
  name: string;
  description?: string;
  supplyClass?: string;
  uom?: string;
}

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

  return [{ label: "None", value: "" }, ...classes];
});

const supplyUnits = computed(() => {
  const classes = Object.values(store.state.supplyUomMap).map((sc) => ({
    label: sc.code ? `${sc.name} (${sc.code})` : sc.name,
    value: sc.id,
  }));

  return [{ label: "None", value: "" }, ...classes];
});

function onSubmit() {
  handleSubmit();
  emit("submit", klona(form.value));
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="mt-4 border-t-2 py-4">
    <h3 class="text-sm font-semibold">Add new supply category</h3>
    <section class="grid grid-cols-2 gap-6">
      <InputGroup autofocus label="Name" required v-model="form.name" />
      <SimpleSelect label="Class" v-model="form.supplyClass" :items="supplyClasses" />
      <InputGroup class="" label="Description" v-model="form.description" />
      <SimpleSelect
        label="Unit of measure/issue"
        v-model="form.uom"
        :items="supplyUnits"
      />
    </section>
    <div class="mt-6 flex items-center justify-end gap-x-6">
      <button
        type="button"
        class="text-sm/6 font-semibold text-gray-900"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="shadow-xs rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Save
      </button>
    </div>
  </form>
</template>
