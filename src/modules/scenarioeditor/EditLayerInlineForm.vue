<script setup lang="ts">
import { ref } from "vue";
import { type ScenarioLayerInstance } from "@/types/scenarioGeoModels";
import { useFocusOnMount } from "@/components/helpers";
import InlineFormPanel from "../../components/InlineFormPanel.vue";
import BaseButton from "../../components/BaseButton.vue";
import { type NScenarioLayer } from "@/types/internalModels";
import { formatDateString } from "@/geo/utils";
import { injectStrict } from "@/utils";
import { activeScenarioKey, timeModalKey } from "@/components/injects";
import PlainButton from "@/components/PlainButton.vue";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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
      <Field>
        <FieldLabel :for="focusId">Layer name</FieldLabel>
        <Input v-model="form.name" :id="focusId" type="text" @keyup.esc="emit('close')" />
      </Field>

      <Field orientation="horizontal" class="items-start">
        <FieldContent>
          <FieldLabel>Visible from</FieldLabel>
          <FieldDescription>{{
            formatDateString(form.visibleFromT, timeZone)
          }}</FieldDescription>
        </FieldContent>
        <div class="flex items-center gap-2">
          <PlainButton type="button" @click="doShowTimeModal('visibleFromT')">
            Change
          </PlainButton>
          <PlainButton
            type="button"
            v-if="form.visibleFromT !== undefined"
            @click="form.visibleFromT = undefined"
          >
            X
          </PlainButton>
        </div>
      </Field>

      <Field orientation="horizontal" class="items-start">
        <FieldContent>
          <FieldLabel>Visible until</FieldLabel>
          <FieldDescription>
            {{ formatDateString(form.visibleUntilT, timeZone) }}
          </FieldDescription>
        </FieldContent>
        <div class="flex items-center gap-2">
          <PlainButton type="button" @click="doShowTimeModal('visibleUntilT')">
            Change
          </PlainButton>
          <PlainButton
            type="button"
            v-if="form.visibleUntilT !== undefined"
            @click="form.visibleUntilT = undefined"
          >
            X
          </PlainButton>
        </div>
      </Field>

      <div class="my-4 flex items-center justify-end space-x-2">
        <BaseButton primary small type="submit">Save</BaseButton>
        <BaseButton small type="button" @click="emit('close')">Cancel</BaseButton>
      </div>
    </form>
  </InlineFormPanel>
</template>
