<script setup lang="ts">
import InputGroup from "@/components/InputGroup.vue";
import { useForm } from "@/composables/forms";
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, ref, watch } from "vue";
import { klona } from "klona";
import { EUnitSupply, NUnitSupply } from "@/types/internalModels";
import FormFooter from "@/modules/scenarioeditor/FormFooter.vue";
import InputCheckbox from "@/components/InputCheckbox.vue";
import { useSuppliesEditStore } from "@/stores/toeStore";
import { useTimeFormatStore } from "@/stores/timeFormatStore";

interface Form extends NUnitSupply {}

const props = withDefaults(defineProps<{ itemData: EUnitSupply }>(), {});

const emit = defineEmits<{
  cancel: [void];
  diffOnHand: [id: string, form: Form];
  updateOnHand: [id: string, form: Form];
  updateCount: [id: string, form: Form];
}>();
const modelValue = defineModel<Form>();

watch(
  () => props.itemData,
  () => {
    modelValue.value = klona(props.itemData);
  },
  { immediate: true },
);

const { time } = injectStrict(activeScenarioKey);
const editStore = useSuppliesEditStore();

const fmt = useTimeFormatStore();

const formattedTime = computed(() =>
  fmt.scenarioFormatter.format(+time.scenarioTime.value),
);

const { form, handleSubmit } = useForm<Form>(
  {
    id: "",
    count: 1,
  },
  modelValue,
);

function resetForm() {
  modelValue.value = klona(props.itemData);
}

function onSubmit(e: KeyboardEvent | Event) {
  // prevent double form submission with ctrl/meta+enter
  if (e instanceof KeyboardEvent && e.target instanceof HTMLInputElement) {
    return;
  }

  if (editStore.isOnHandMode) {
    if (editStore.isDiffMode) {
      emit("diffOnHand", form.value.id, {
        id: form.value.id,
        onHand: editStore.diffValue,
        count: -1,
      });
    } else {
      emit("updateOnHand", form.value.id, {
        id: form.value.id,
        onHand: form.value.onHand,
        count: -1,
      });
    }
  } else {
    emit("updateCount", form.value.id, { id: form.value.id, count: form.value.count });
  }
}

watch([() => editStore.isOnHandMode, () => editStore.isDiffMode], () => {
  resetForm();
});
</script>

<template>
  <form
    @submit.prevent="onSubmit"
    @keyup.esc.stop="emit('cancel')"
    @keyup.ctrl.enter="onSubmit"
    @keyup.meta.enter="onSubmit"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">{{ itemData.name }}</h3>
      <div class="flex items-center gap-1">
        <span class="badge" v-if="itemData.supplyClass">{{ itemData.supplyClass }}</span>
        <span class="badge" v-if="itemData.uom">{{ itemData.uom }}</span>
      </div>
    </div>
    <div class="mt-4">
      <InputCheckbox
        v-model="editStore.isOnHandMode"
        :label="`Edit supplies at ${formattedTime}`"
        description=""
      />
    </div>
    <section class="mt-4 grid grid-cols-2 items-start gap-6">
      <InputGroup
        label="Initial value"
        type="number"
        :disabled="editStore.isOnHandMode"
        v-model="form.count"
        :autofocus="!editStore.isOnHandMode"
      />
      <InputGroup
        label="Available / On hand"
        type="number"
        :disabled="!editStore.isOnHandMode || editStore.isDiffMode"
        v-model="form.onHand"
        min="0"
        :autofocus="editStore.isOnHandMode && !editStore.isDiffMode"
      />
      <template v-if="editStore.isOnHandMode">
        <InputCheckbox
          label="Add/subtract mode"
          description=""
          v-model="editStore.isDiffMode"
        />
        <InputGroup
          v-if="editStore.isDiffMode"
          label="Add/subtract"
          type="number"
          :autofocus="editStore.isDiffMode"
          v-model="editStore.diffValue"
        />
      </template>
    </section>

    <FormFooter @cancel="emit('cancel')" showNextToggle />
  </form>
</template>
