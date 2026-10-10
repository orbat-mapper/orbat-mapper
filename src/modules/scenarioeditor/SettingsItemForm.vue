<script setup lang="ts">
import { computed, ref } from "vue";
import ColorDot from "@/components/ColorDot.vue";
import LabeledInput from "@/components/InputGroup.vue";
import PopoverColorPicker from "@/components/PopoverColorPicker.vue";
import { useFocusOnMount } from "@/components/helpers";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import FormFooter from "@/modules/scenarioeditor/FormFooter.vue";

export interface SettingsItem {
  name: string;
  description?: string;
  color?: string;
}

/**
 * Name form for scenario settings lists (unit statuses, range ring groups). Colour and
 * description are opt-in; only the enabled fields are emitted, so hosts can merge the
 * result into items that carry other data.
 */
const props = withDefaults(
  defineProps<{
    item?: SettingsItem;
    heading?: string;
    withColor?: boolean;
    withDescription?: boolean;
    /** Names used by other items in the list; the form rejects them. */
    takenNames?: string[];
    submitLabel?: string;
  }>(),
  { takenNames: () => [], submitLabel: "Save" },
);

const emit = defineEmits<{
  submit: [item: SettingsItem];
  cancel: [];
}>();

const name = ref(props.item?.name ?? "");
const description = ref(props.item?.description ?? "");
const color = ref<string | undefined>(props.item?.color);
const submitted = ref(false);

const { focusId: nameId } = useFocusOnMount();

const nameError = computed(() => {
  if (!submitted.value) return undefined;
  const trimmed = name.value.trim();
  if (!trimmed) return "Enter a name.";
  if (props.takenNames.includes(trimmed)) return "This name is already in use.";
  return undefined;
});

// The picker falls back to a default colour when given undefined, so pass null to show "None"
const pickerValue = computed(() => (color.value ?? null) as unknown as string);
const colorLabel = computed(() =>
  color.value ? `Color ${color.value.toUpperCase()}` : "No color",
);

function onSubmit() {
  submitted.value = true;
  if (nameError.value) return;
  const item: SettingsItem = { name: name.value.trim() };
  if (props.withDescription) item.description = description.value.trim();
  if (props.withColor) item.color = color.value;
  emit("submit", item);
}
</script>

<template>
  <form
    class="flex flex-col gap-4"
    novalidate
    @submit.prevent="onSubmit"
    @keydown.esc.stop="emit('cancel')"
  >
    <h3 v-if="heading" class="text-sm font-semibold">{{ heading }}</h3>
    <FieldGroup class="gap-3">
      <Field :data-invalid="!!nameError || undefined">
        <FieldLabel :for="nameId">Name</FieldLabel>
        <InputGroup>
          <InputGroupAddon v-if="withColor">
            <PopoverColorPicker
              show-none
              :model-value="pickerValue"
              @update:model-value="color = $event || undefined"
            >
              <template #trigger>
                <InputGroupButton
                  size="icon-xs"
                  :aria-label="colorLabel"
                  :title="colorLabel"
                >
                  <ColorDot :color="color" class="size-3.5" />
                </InputGroupButton>
              </template>
            </PopoverColorPicker>
          </InputGroupAddon>
          <InputGroupInput
            :id="nameId"
            v-model="name"
            autocomplete="off"
            :aria-invalid="!!nameError || undefined"
          />
        </InputGroup>
        <FieldError v-if="nameError">{{ nameError }}</FieldError>
      </Field>
      <LabeledInput
        v-if="withDescription"
        v-model="description"
        label="Description"
        autocomplete="off"
        placeholder="Optional"
      />
    </FieldGroup>
    <FormFooter :submit-label="submitLabel" @cancel="emit('cancel')" />
  </form>
</template>
