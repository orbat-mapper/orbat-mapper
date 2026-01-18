<script setup lang="ts">
import type { ScenarioTileJSONLayer, ScenarioXYZLayer } from "@/types/scenarioGeoModels";
import InputGroup from "@/components/InputGroup.vue";
import { computed, ref, watch } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { getChangedValues, sanitizeHTML } from "@/utils";
import { useFocusOnMount } from "@/components/helpers";
import { type ScenarioImageLayerUpdate } from "@/types/internalModels";
import { useToggle } from "@vueuse/core";
import TextAreaGroup from "@/components/TextAreaGroup.vue";
import { toLonLat } from "ol/proj";
import { Button } from "@/components/ui/button";

interface Props {
  layer: ScenarioTileJSONLayer | ScenarioXYZLayer | ScenarioImageLayerUpdate;
}
const props = defineProps<Props>();
const emit = defineEmits(["update", "action", "cancel"]);

const [showAdvanced, toggleAdvanced] = useToggle(false);
const advancedSettings = ref("");

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
  { immediate: true },
);

const status = computed(() => props.layer._status);
const urlLabel = computed(() => {
  if (props.layer.type === "TileJSONLayer") {
    return "TileJSON URL";
  } else if (props.layer.type === "ImageLayer") {
    return "Image URL";
  } else {
    return "XYZ tile URL template";
  }
});

function updateData() {
  if (advancedSettings.value) {
    loadAdvanced();
    return;
  }
  const diff = getChangedValues({ ...formData.value }, props.layer);
  if (diff.attributions) {
    diff.attributions = sanitizeHTML(diff.attributions);
  }
  emit("update", diff);
}

//check if string is a valid JSON
function isValidJSONString(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function loadAdvanced() {
  const s = advancedSettings.value;
  const isValidData =
    s.includes("imageCenter") && s.includes("imageScale") && s.includes("imageRotate");

  if (isValidData) {
    const rawData = isValidJSONString(s)
      ? JSON.parse(s)
      : isValidJSONString(`{${s}}`)
        ? JSON.parse(`{${s}}`)
        : null;
    if (rawData) {
      const { imageCenter, imageScale, imageRotate, url = "" } = rawData;
      const data = {
        imageCenter: toLonLat(imageCenter),
        imageRotate,
        imageScale,
      } as ScenarioImageLayerUpdate;
      if (url) {
        data.url = url.replace(" ", "");
      }
      emit("update", data);
    }
  }
}
</script>

<template>
  <form @submit.prevent="updateData" class="p-1">
    <div class="space-y-4">
      <template v-if="!showAdvanced">
        <InputGroup
          :id="focusId"
          :label="urlLabel"
          type="text"
          class=""
          v-model="formData.url"
          required
        />
        <InputGroup
          v-if="layer.type === 'XYZLayer' || layer.type === 'ImageLayer'"
          label="Attributions"
          type="text"
          class=""
          v-model="formData.attributions"
        />
        <p class="flex justify-end" v-if="layer.type === 'ImageLayer'">
          <Button type="button" variant="link" size="sm" @click="toggleAdvanced()">
            + Add image from Map-georeferencer
          </Button>
        </p>
      </template>
      <template v-else>
        <div>
          <TextAreaGroup
            label="Map-georeferencer settings"
            v-model="advancedSettings"
            description="Paste map settings from Map-georeferencer here."
          />
          <div class="prose prose-sm dark:prose-invert mt-4">
            <p>
              <a target="_blank" href="http://viglino.github.io/Map-georeferencer/"
                >Map-georeferencer</a
              >
              is an online tool for georeferencing images using control points. You can
              get the transformation parameters by clicking the
              <span class="rounded border border-gray-600 bg-blue-100 p-1">φ</span> button
              at the bottom of the screen and copy the settings from the dialog.
            </p>
          </div>
        </div>
      </template>
    </div>
    <footer class="mt-4 flex justify-end space-x-2">
      <BaseButton small primary type="submit">Update</BaseButton>
      <BaseButton small type="button" @click="emit('cancel')">Cancel</BaseButton>
    </footer>
  </form>
</template>
