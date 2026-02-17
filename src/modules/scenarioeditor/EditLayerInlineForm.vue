<script setup lang="ts">
import { ref } from "vue";
import { type ScenarioLayerInstance } from "@/types/scenarioGeoModels";
import { useFocusOnMount } from "@/components/helpers";
import InputGroup from "../../components/InputGroup.vue";
import InlineFormPanel from "../../components/InlineFormPanel.vue";
import BaseButton from "../../components/BaseButton.vue";
import { type NScenarioLayer } from "@/types/internalModels";
import { formatDateString } from "@/geo/utils";
import { injectStrict } from "@/utils";
import { activeScenarioKey, timeModalKey } from "@/components/injects";
import DescriptionItem from "@/components/DescriptionItem.vue";
import PlainButton from "@/components/PlainButton.vue";

const props = defineProps<{
  layer: ScenarioLayerInstance | NScenarioLayer;
}>();
const emit = defineEmits(["close", "update"]);

const {
  time: { timeZone },
} = injectStrict(activeScenarioKey);

const { getModalTimestamp } = injectStrict(timeModalKey);

const form = ref<Partial<NScenarioLayer>>({
  name: props.layer.name,
  visibleFromT: props.layer.visibleFromT,
  visibleUntilT: props.layer.visibleUntilT,
  _isNew: false,
});

const onFormSubmit = () => {
  emit("update", { ...form.value });
  emit("close");
};

const { focusId } = useFocusOnMount();

async function doShowTimeModal(field: "visibleFromT" | "visibleUntilT") {
  const newTimestamp = await getModalTimestamp(form.value[field]!, {
    timeZone: timeZone.value,
    title: field === "visibleFromT" ? "Visible from" : "Visible until",
  });
  if (newTimestamp !== undefined) {
    form.value[field] = newTimestamp;
  }
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
        ><PlainButton v-if="form.visibleFromT" @click="form.visibleFromT = undefined"
          >X</PlainButton
        >
      </DescriptionItem>

      <DescriptionItem label="Visible until"
        >{{ formatDateString(form.visibleUntilT, timeZone) }}
        <PlainButton @click="doShowTimeModal('visibleUntilT')" class="ml-2"
          >Change</PlainButton
        >
        <PlainButton v-if="form.visibleUntilT" @click="form.visibleUntilT = undefined"
          >X</PlainButton
        >
      </DescriptionItem>

      <div class="my-4 flex items-center justify-end space-x-2">
        <BaseButton primary small type="submit">Save</BaseButton>
        <BaseButton small @click="emit('close')">Cancel</BaseButton>
      </div>
    </form>
  </InlineFormPanel>
</template>
