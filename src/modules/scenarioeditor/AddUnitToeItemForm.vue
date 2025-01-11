<script setup lang="ts">
import InputGroup from "@/components/InputGroup.vue";
import { useForm } from "@/composables/forms";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { activeScenarioKey } from "@/components/injects";
import { injectStrict, sortBy } from "@/utils";
import { computed, watch } from "vue";
import { klona } from "klona";
import {
  EUnitEquipment,
  EUnitPersonnel,
  NUnitEquipment,
  NUnitPersonnel,
  ToeMode,
} from "@/types/internalModels";
import FormFooter from "@/modules/scenarioeditor/FormFooter.vue";

type Form = NUnitEquipment | NUnitPersonnel;

const props = withDefaults(
  defineProps<{
    heading?: string;
    usedItems?: EUnitEquipment[] | EUnitPersonnel[];
    mode: ToeMode;
  }>(),
  {
    heading: "Add item",
  },
);

const { store } = injectStrict(activeScenarioKey);
const modelValue = defineModel<Form>();
const emit = defineEmits<{ cancel: [void]; submit: [form: Form] }>();

const usedItems = computed(() => (props.usedItems ?? []).map((i) => i.id));

const itemCategories = computed(() => {
  const c =
    props.mode === "equipment" ? store.state.equipmentMap : store.state.personnelMap;
  const sc = Object.values(c)
    .filter((v) => !usedItems.value.includes(v.id))
    .map((ic) => {
      return {
        label: ic.name,
        value: ic.id,
      };
    });

  return sortBy(sc, "label");
});

const { form, handleSubmit } = useForm<Form>(
  {
    id: "",
    count: 1,
  },
  modelValue,
);

function onSubmit() {
  handleSubmit();
  emit("submit", klona(form.value));
}

watch(
  itemCategories,
  () => {
    if (itemCategories.value.length) {
      form.value.id = itemCategories.value[0].value;
    }
  },
  { immediate: true },
);
</script>

<template>
  <form @submit.prevent="onSubmit" class="" @keyup.esc.stop="emit('cancel')">
    <h3 class="text-sm font-semibold">{{ heading }}</h3>
    <section v-if="itemCategories.length" class="mt-4 grid grid-cols-2 gap-6">
      <SimpleSelect label="Supply category" v-model="form.id" :items="itemCategories" />
      <InputGroup label="Initial value" type="number" v-model="form.count" />
    </section>
    <section v-else class="mt-4">
      <p class="text-sm text-gray-500">No items to add</p>
    </section>
    <FormFooter @cancel="emit('cancel')" submitLabel="Add" />
  </form>
</template>
