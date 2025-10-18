<script setup lang="ts">
import InputGroup from "@/components/InputGroup.vue";
import { useForm } from "@/composables/forms";
import { klona } from "klona";
import FormFooter from "@/modules/scenarioeditor/FormFooter.vue";
import PopoverColorPicker from "@/components/PopoverColorPicker.vue";

interface Form {
  id?: string;
  code: string;
  text: string;
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
    text: "",
    code: "",
  },
  modelValue,
);

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
    <section class="mt-4 grid grid-cols-2 gap-6">
      <InputGroup autofocus label="Name" required v-model="form.text" />
      <div class="flex w-full self-end">
        <PopoverColorPicker label="Fill Color" v-model="form.code" />
      </div>
    </section>
    <FormFooter @cancel="emit('cancel')" :showNextToggle="showNextToggle" />
  </form>
</template>
