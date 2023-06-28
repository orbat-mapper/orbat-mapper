<script setup lang="ts">
import { ScenarioTileJSONLayer, ScenarioXYZLayer } from "@/types/scenarioGeoModels";
import InputGroup from "@/components/InputGroup.vue";
import { computed, ref, watch } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { getChangedValues, nanoid } from "@/utils";
import { useFocusOnMount } from "@/components/helpers";

interface Props {
  layer: ScenarioTileJSONLayer | ScenarioXYZLayer;
}
const props = defineProps<Props>();
const emit = defineEmits(["update", "action", "cancel"]);

const { focusId } = useFocusOnMount();

const formData = ref({
  url: props.layer.url,
  attributions: props.layer.attributions,
  _isNew: false,
});

watch(
  () => props.layer,
  (v) => {
    formData.value = { url: v.url, attributions: v.attributions, _isNew: false };
  },
  { immediate: true }
);

const status = computed(() => props.layer._status);
const urlLabel = computed(() => {
  if (props.layer.type === "TileJSONLayer") {
    return "TileJSON URL";
  } else {
    return "XYZ tile URL template";
  }
});

watch(status, (v) => {
  if (v === "initialized") {
    emit("action", "zoom");
  }
});

function updateData() {
  const diff = getChangedValues({ ...formData.value }, props.layer);
  emit("update", diff);
}
</script>

<template>
  <form @submit.prevent="updateData" class="p-1">
    <div class="space-y-4">
      <InputGroup
        :id="focusId"
        :label="urlLabel"
        type="text"
        class=""
        v-model="formData.url"
        required
      />
      <InputGroup
        v-if="layer.type === 'XYZLayer'"
        label="Attributions"
        type="text"
        class=""
        v-model="formData.attributions"
      />
    </div>
    <footer class="mt-4 flex justify-end space-x-2">
      <BaseButton small primary type="submit">Update</BaseButton>
      <BaseButton small type="button" @click="emit('cancel')">Cancel</BaseButton>
    </footer>
  </form>
</template>
