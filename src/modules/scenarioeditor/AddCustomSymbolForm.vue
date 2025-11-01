<script setup lang="ts">
import { useForm } from "@/composables/forms";
import { klona } from "klona";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { injectStrict } from "@/utils";
import { sidcModalKey } from "@/components/injects.ts";
import NewMilitarySymbol from "@/components/NewMilitarySymbol.vue";

interface Form {
  id?: string;
  name: string;
  src: string;
  sidc: string;
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

const { getModalSidc } = injectStrict(sidcModalKey);

const { form, handleSubmit } = useForm<Form>(
  {
    name: "",
    src: "",
    sidc: "10031000001100000000",
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

async function openSymbolPicker() {
  const newSidcValue = await getModalSidc(form.value.sidc, {
    hideSymbolColor: true,
    hideCustomSymbols: true,
    symbolOptions: { fillColor: "#f7f7f7" },
  });
  if (newSidcValue) {
    const { sidc } = newSidcValue;
    form.value.sidc = sidc;
  }
}
</script>

<template>
  <form
    @submit.prevent="onSubmit"
    @keyup.esc.stop="emit('cancel')"
    @keyup.ctrl.enter="onSubmit"
    @keyup.meta.enter="onSubmit"
  >
    <FieldGroup class="mb-4">
      <FieldSet>
        <FieldLegend>Add custom symbol</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel for="symbol-name">Name</FieldLabel>
            <Input id="symbol-name" required v-model="form.name" />
          </Field>
        </FieldGroup>
        <Field>
          <FieldLabel for="uri">URL/URI </FieldLabel>
          <Textarea
            id="uri"
            v-model="form.src"
            required
            placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
            :rows="2"
            class="h-16 wrap-anywhere"
          />
          <FieldDescription>Data URIs are supported</FieldDescription>
        </Field>
        <Field>
          <FieldLabel for="symbol-sidc">Corresponding SIDC</FieldLabel>
          <div class="flex items-center gap-2">
            <NewMilitarySymbol
              :sidc="form.sidc"
              :size="32"
              :options="{ fillColor: '#f7f7f7' }"
            />
            <Input id="symbol-sidc" v-model="form.sidc" required />
            <Button type="button" variant="outline" @click="openSymbolPicker"
              >Open picker</Button
            >
          </div>
          <FieldDescription
            >Pick a symbol identification code that matches your custom symbol.
          </FieldDescription>
        </Field>
      </FieldSet>
      <Field orientation="horizontal">
        <Button type="submit"> Save </Button>
        <Button variant="outline" type="button" @click="emit('cancel')"> Cancel </Button>
      </Field>
    </FieldGroup>
  </form>
</template>
