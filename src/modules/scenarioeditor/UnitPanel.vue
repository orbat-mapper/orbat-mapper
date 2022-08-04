<template>
  <div v-if="unit" class="">
    <header class="flex">
      <div class="h-20 w-16 flex-shrink-0">
        <MilSymbol :sidc="form.sidc" :size="34" />
      </div>
      <p class="pt-2 font-medium">{{ unit.name }}</p>
    </header>
    <div class="mb-4 flex">
      <BaseButton
        :class="isEditMode && 'bg-gray-100 text-black'"
        @click="toggleEditMode()"
        >Edit
      </BaseButton>
      <SplitButton class="ml-2" :items="buttonItems" />
    </div>

    <form v-if="isEditMode" @submit.prevent="onFormSubmit" class="mt-0 space-y-4">
      <InputGroup label="Name" v-model="form.name" id="name-input" />
      <InputGroup
        label="Short name"
        description="Alternative name"
        v-model="form.shortName"
      />
      <InputGroup label="External URL" description="" v-model="form.externalUrl" />
      <div class="w-full">
        <SymbolPickerInput v-model="form.sidc" />
      </div>
      <SimpleMarkdownInput
        label="Description"
        v-model="form.description"
        description="Use markdown syntax for formatting"
      />

      <div class="flex items-center justify-end space-x-2">
        <BaseButton type="submit" small primary>Save</BaseButton>
        <BaseButton small @click="toggleEditMode()">Cancel</BaseButton>
      </div>
    </form>
    <div v-else class="mb-4 space-y-4">
      <DescriptionItem label="Name">{{ unit.name }}</DescriptionItem>
      <DescriptionItem v-if="unit.shortName" label="Short name"
        >{{ unit.shortName }}
      </DescriptionItem>
      <DescriptionItem v-if="unit.externalUrl" label="External URL" dd-class="truncate"
        ><a target="_blank" class="underline" :href="unit.externalUrl">{{
          unit.externalUrl
        }}</a></DescriptionItem
      >
      <DescriptionItem v-if="unit.description" label="Description">
        <div class="prose prose-sm dark:prose-invert" v-html="hDescription"></div>
      </DescriptionItem>

      <DescriptionItem v-if="unit.location" label="Initial location">
        <div class="flex items-center justify-between">
          <p>{{ formatPosition(unit.location) }}</p>
          <IconButton @click="geoStore.panToLocation(unit.location)">
            <CrosshairsGps class="h-5 w-5" />
          </IconButton>
        </div>
      </DescriptionItem>
    </div>
    <BaseButton @click="startGetLocation()"
      ><CrosshairsGps class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />{{
        isGetLocationActive ? "Select on map" : "Set location"
      }}
    </BaseButton>
    <UnitPanelState v-if="unit?.state?.length" :unit="unit" />
    <GlobalEvents :filter="inputEventFilter" @keyup.e="doFormFocus" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref, watch } from "vue";
import { CrosshairsGps } from "mdue";
import InputGroup from "@/components/InputGroup.vue";
import { useGeoStore } from "@/stores/geoStore";
import MilSymbol from "@/components/MilSymbol.vue";
import { GlobalEvents } from "vue-global-events";
import { inputEventFilter } from "@/components/helpers";
import DescriptionItem from "@/components/DescriptionItem.vue";
import { useToggle } from "@vueuse/core";
import { renderMarkdown } from "@/composables/formatting";
import UnitPanelState from "./UnitPanelState.vue";
import { useUnitActionsN } from "@/composables/scenarioActions";
import { UnitActions } from "@/types/constants";
import SymbolPickerInput from "@/components/SymbolPickerInput.vue";
import SplitButton from "@/components/SplitButton.vue";
import BaseButton from "@/components/BaseButton.vue";
import { EntityId } from "@/types/base";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { UnitUpdate } from "@/types/internalModels";
import { formatPosition } from "@/geo/utils";
import IconButton from "@/components/IconButton.vue";
import { useGetMapLocation } from "@/composables/geoMapLocation";
import OLMap from "ol/Map";
import { useUiStore } from "@/stores/uiStore";

const SimpleMarkdownInput = defineAsyncComponent(
  () => import("@/components/SimpleMarkdownInput.vue")
);

const props = defineProps<{ unitId: EntityId }>();
const activeScenario = injectStrict(activeScenarioKey);
const {
  store,
  geo: { addUnitPosition },
  unitActions: { updateUnit },
} = activeScenario;

let form = ref<UnitUpdate>({
  name: "",
  shortName: "",
  sidc: "",
  description: "",
  externalUrl: "",
});
const geoStore = useGeoStore();

const {
  start: startGetLocation,
  isActive: isGetLocationActive,
  onGetLocation,
} = useGetMapLocation(geoStore.olMap as OLMap);
const uiStore = useUiStore();

onGetLocation((location) => addUnitPosition(props.unitId, location));
const isEditMode = ref(false);
const toggleEditMode = useToggle(isEditMode);
const unit = computed(() => {
  return store.state.unitMap[props.unitId];
});

const onFormSubmit = () => {
  updateUnit(props.unitId, form.value);
  toggleEditMode();
};

const doFormFocus = async () => {
  isEditMode.value = true;
  await nextTick();
  const inputElement = document.getElementById("name-input");
  inputElement && inputElement.focus();
};

const hDescription = computed(() => renderMarkdown(unit.value.description || ""));

const hasPosition = computed(() => Boolean(unit.value._state?.location));

function updateForm() {
  const { name, shortName, sidc, description, externalUrl } = unit.value;
  form.value = { name, shortName, sidc, description, externalUrl };
}

updateForm();

watch(
  isEditMode,
  (v) => {
    if (!v) return;
    updateForm();
    if (v) nextTick(() => doFormFocus());
  },
  { immediate: true }
);

watch(
  () => props.unitId,
  () => updateForm()
);

watch(
  isGetLocationActive,
  (isActive) => {
    uiStore.getLocationActive = isActive;
  },
  { immediate: true }
);

const { onUnitAction } = useUnitActionsN();

const buttonItems = computed(() => [
  {
    label: "Duplicate",
    onClick: () => onUnitAction(unit.value, UnitActions.Clone),
  },
  {
    label: "Move up",
    onClick: () => onUnitAction(unit.value, UnitActions.MoveUp),
  },
  {
    label: "Move down",
    onClick: () => onUnitAction(unit.value, UnitActions.MoveDown),
  },
  {
    label: "Create subordinate",
    onClick: () => onUnitAction(unit.value, UnitActions.AddSubordinate),
  },
  {
    label: "Zoom",
    onClick: () => onUnitAction(unit.value, UnitActions.Zoom),
  },
  {
    label: "Pan",
    onClick: () => onUnitAction(unit.value, UnitActions.Pan),
    disabled: !hasPosition.value,
  },
  {
    label: "Delete",
    onClick: () => onUnitAction(unit.value, UnitActions.Delete),
  },
]);
</script>
