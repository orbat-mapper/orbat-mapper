<script setup lang="ts">
import { useStorage } from "@vueuse/core";
import { computed } from "vue";
import { type ScenarioFeature, VisibilityInfo } from "@/types/scenarioGeoModels";
import SettingsPanel from "@/components/SettingsPanel.vue";
import DescriptionItem from "@/components/DescriptionItem.vue";
import PlainButton from "@/components/PlainButton.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey, timeModalKey } from "@/components/injects";
import { formatDateString } from "@/geo/utils";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{ (e: "update", value: Partial<VisibilityInfo>): void }>();

const {
  store,
  time: { timeZone },
} = injectStrict(activeScenarioKey);

const { getModalTimestamp } = injectStrict(timeModalKey);

const open = useStorage("visibility-panel", true);

const data = computed(() => props.feature.properties);

async function doShowTimeModal(field: "visibleFromT" | "visibleUntilT") {
  const newTimestamp = await getModalTimestamp(
    data.value[field] ?? store.state.currentTime,
    {
      timeZone: timeZone.value,
      title: field === "visibleFromT" ? "Visible from" : "Visible until",
    }
  );
  if (newTimestamp !== undefined) {
    emit("update", { [field]: newTimestamp });
  }
}

function clearValue(name: keyof VisibilityInfo) {
  emit("update", { [name]: null });
}
</script>

<template>
  <SettingsPanel label="Visibility" v-model:open="open">
    <template #right> </template>

    <DescriptionItem label="Visible from"
      >{{ formatDateString(data.visibleFromT, timeZone) }}
      <PlainButton @click="doShowTimeModal('visibleFromT')" class="ml-2">
        Change
      </PlainButton>
      <PlainButton
        v-if="data.visibleFromT ?? false"
        class="ml-2"
        @click="clearValue('visibleFromT')"
        >Clear</PlainButton
      >
    </DescriptionItem>

    <DescriptionItem label="Visible until"
      >{{ formatDateString(data.visibleUntilT, timeZone) }}
      <PlainButton @click="doShowTimeModal('visibleUntilT')" class="ml-2">
        Change
      </PlainButton>
      <PlainButton
        v-if="data.visibleUntilT ?? false"
        class="ml-2"
        @click="clearValue('visibleUntilT')"
        >Clear</PlainButton
      >
    </DescriptionItem>
  </SettingsPanel>
</template>
