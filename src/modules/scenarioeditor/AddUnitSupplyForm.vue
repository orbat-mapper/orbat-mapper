<script setup lang="ts">
import InputGroup from "@/components/InputGroup.vue";
import { useForm } from "@/composables/forms";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { activeScenarioKey } from "@/components/injects";
import { injectStrict, sortBy } from "@/utils";
import { computed, watch } from "vue";
import { klona } from "klona";
import type { EUnitSupply, NUnitSupply } from "@/types/internalModels";
import FormFooter from "@/modules/scenarioeditor/FormFooter.vue";

interface Form extends NUnitSupply {}

const props = withDefaults(
  defineProps<{ heading?: string; usedSupplies?: EUnitSupply[] }>(),
  {
    heading: "Add unit supply",
  },
);

const { store } = injectStrict(activeScenarioKey);
const modelValue = defineModel<Form>();
const emit = defineEmits<{ cancel: [void]; submit: [form: Form] }>();

const usedItems = computed(() => (props.usedSupplies ?? []).map((i) => i.id));
const { supplyClassMap, supplyUomMap } = store.state;

const supplyCategories = computed(() => {
  const sc = Object.values(store.state.supplyCategoryMap)
    .filter((v) => !usedItems.value.includes(v.id))
    .map((sc) => {
      const supplyClass = supplyClassMap[sc?.supplyClass ?? ""]?.name ?? "";
      const uomObj = supplyUomMap[sc?.uom ?? ""];
      const uom = uomObj?.code ?? uomObj?.name ?? "";
      return {
        label: `${sc.name}`,
        value: sc.id,
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
  supplyCategories,
  () => {
    if (supplyCategories.value.length) {
      form.value.id = supplyCategories.value[0].value;
    }
  },
  { immediate: true },
);
</script>

<template>
  <form @submit.prevent="onSubmit" class="" @keyup.esc.stop="emit('cancel')">
    <h3 class="text-sm font-semibold">{{ heading }}</h3>
    <section v-if="supplyCategories.length" class="mt-4 grid grid-cols-2 gap-6">
      <SimpleSelect label="Supply category" v-model="form.id" :items="supplyCategories" />
      <InputGroup label="Initial value" type="number" v-model="form.count" />
    </section>
    <section v-else class="mt-4">
      <p class="text-muted-foreground text-sm">No more supplies to add</p>
    </section>
    <FormFooter @cancel="emit('cancel')" submitLabel="Add" />
  </form>
</template>
