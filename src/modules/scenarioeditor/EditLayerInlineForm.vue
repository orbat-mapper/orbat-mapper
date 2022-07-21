<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { ScenarioLayerInstance } from "@/types/scenarioGeoModels";
import { useFocusOnMount } from "@/components/helpers";
import InputGroup from "../../components/InputGroup.vue";
import InlineFormPanel from "../../components/InlineFormPanel.vue";
import BaseButton from "../../components/BaseButton.vue";
import { NScenarioLayer } from "@/types/internalModels";
import { formatDateString } from "@/geo/utils";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import DescriptionItem from "@/components/DescriptionItem.vue";
import PlainButton from "@/components/PlainButton.vue";
const InputDateModal = defineAsyncComponent(
  () => import("@/components/InputDateModal.vue")
);

const props = defineProps<{
  layer: ScenarioLayerInstance;
}>();
const emit = defineEmits(["close", "update"]);

const {
  time: { timeZone },
} = injectStrict(activeScenarioKey);

let form = ref<Partial<NScenarioLayer>>({
  name: props.layer.name,
  visibleFromT: props.layer.visibleFromT,
  visibleUntilT: props.layer.visibleUntilT,
  _isNew: false,
});

const showTimeModal = ref(false);

const timeAttributeName = ref<"visibleFromT" | "visibleUntilT">("visibleFromT");
const timeDialogTitle = ref("");

const onFormSubmit = () => {
  emit("update", { ...form.value });
  emit("close");
};

const { focusId } = useFocusOnMount();

function doShowTimeModal(field: "visibleFromT" | "visibleUntilT") {
  timeAttributeName.value = field;
  if (field === "visibleFromT") {
    timeDialogTitle.value = "Visible from";
  } else if (field === "visibleUntilT") {
    timeDialogTitle.value = "Visible until";
  }
  showTimeModal.value = true;
}
</script>

<template>
  <InlineFormPanel @close="$emit('close')" title="Edit layer">
    <form @submit.prevent="onFormSubmit" class="space-y-4">
      <InputGroup
        label="Layer name"
        v-model="form.name"
        :id="focusId"
        @keyup.esc="emit('close')"
      />

      <DescriptionItem label="Visible from"
        >{{ formatDateString(form.visibleFromT, timeZone) }}
        <PlainButton @click="doShowTimeModal('visibleFromT')" class="ml-2"
          >Change</PlainButton
        >
      </DescriptionItem>

      <DescriptionItem label="Visible until"
        >{{ formatDateString(form.visibleUntilT, timeZone) }}
        <PlainButton @click="doShowTimeModal('visibleUntilT')" class="ml-2"
          >Change</PlainButton
        >
      </DescriptionItem>

      <div class="my-4 flex items-center justify-end space-x-2">
        <BaseButton primary small type="submit">Save</BaseButton>
        <BaseButton small @click="emit('close')">Cancel</BaseButton>
      </div>
    </form>
    <InputDateModal
      v-model="showTimeModal"
      :dialog-title="timeDialogTitle"
      v-model:timestamp="form[timeAttributeName]"
      :time-zone="timeZone"
    />
  </InlineFormPanel>
</template>
