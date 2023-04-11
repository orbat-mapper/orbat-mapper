<template>
  <div v-if="unit" class="">
    <header v-if="!isMultiMode" class="flex">
      <div class="h-20 w-16 flex-shrink-0">
        <MilitarySymbol :sidc="unit.sidc" :size="34" :options="combinedSymbolOptions" />
      </div>
      <p class="pt-2 font-medium">{{ unit.name }}</p>
    </header>
    <header v-else>
      <div class="flex items-center justify-between">
        <p class="font-medium">{{ selectedUnitIds.size }} units selected</p>
        <button @click="clearSelection()" class="text-indigo-600 hover:text-indigo-900">
          Clear
        </button>
      </div>
      <ul class="my-4 flex w-full flex-wrap gap-1">
        <li v-for="sUnit in selectedUnits" class="relative flex">
          <MilitarySymbol
            :sidc="sUnit.sidc"
            :size="24"
            class="block"
            :options="getCombinedSymbolOptions(sUnit)"
          />
          <span v-if="sUnit._state?.location" class="text-red-700">&deg;</span>
        </li>
      </ul>
    </header>
    <div class="mb-4 flex">
      <BaseButton end @click="handleChangeSymbol()">Edit symbol</BaseButton>

      <SplitButton
        class="ml-1"
        :items="buttonItems"
        v-model:active-item="uiStore.activeItem"
      />
    </div>

    <section class="relative">
      <BaseButton
        v-if="!isMultiMode && !isEditMode"
        small
        class="absolute right-1"
        :class="isEditMode && 'bg-gray-100 text-black'"
        @click="toggleEditMode()"
        >Edit
      </BaseButton>
      <form v-if="isEditMode" @submit.prevent="onFormSubmit" class="mb-6 mt-0 space-y-4">
        <InputGroup label="Name" v-model="form.name" id="name-input" />
        <InputGroup
          label="Short name"
          description="Alternative name"
          v-model="form.shortName"
        />
        <InputGroup label="External URL" description="" v-model="form.externalUrl" />
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
      <div v-else-if="!isMultiMode" class="mb-4 space-y-4">
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
              <IconCrosshairsGps class="h-5 w-5" />
            </IconButton>
          </div>
        </DescriptionItem>
      </div>
    </section>
    <BaseButton @click="startGetLocation()" :disabled="isMultiMode">
      <IconCrosshairsGps class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
      {{ isGetLocationActive ? "Select on map" : "Set location" }}
    </BaseButton>
    <div class="mt-4 space-y-2">
      <ToggleField v-model="unitSettings.showHistory">Show unit track on map</ToggleField>
      <ToggleField v-model="unitSettings.editHistory">Edit unit track on map</ToggleField>
    </div>
    <UnitPanelState v-if="!isMultiMode && unit?.state?.length" :unit="unit" />
    <GlobalEvents
      v-if="uiStore.shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.e="doFormFocus"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref, watch } from "vue";
import { IconCrosshairsGps } from "@iconify-prerendered/vue-mdi";
import InputGroup from "@/components/InputGroup.vue";
import { useGeoStore, useUnitSettingsStore } from "@/stores/geoStore";
import { GlobalEvents } from "vue-global-events";
import { inputEventFilter, setCharAt } from "@/components/helpers";
import DescriptionItem from "@/components/DescriptionItem.vue";
import { useToggle } from "@vueuse/core";
import { renderMarkdown } from "@/composables/formatting";
import UnitPanelState from "./UnitPanelState.vue";
import { useUnitActions } from "@/composables/scenarioActions";
import { UnitAction, UnitActions } from "@/types/constants";
import SplitButton from "@/components/SplitButton.vue";
import BaseButton from "@/components/BaseButton.vue";
import { EntityId } from "@/types/base";
import { injectStrict } from "@/utils";
import { activeScenarioKey, sidcModalKey } from "@/components/injects";
import { NUnit, UnitUpdate } from "@/types/internalModels";
import { formatPosition } from "@/geo/utils";
import IconButton from "@/components/IconButton.vue";
import { useGetMapLocation } from "@/composables/geoMapLocation";
import OLMap from "ol/Map";
import { useUiStore } from "@/stores/uiStore";
import ToggleField from "@/components/ToggleField.vue";
import { useSelectedUnits } from "@/stores/dragStore";
import { SID_INDEX } from "@/symbology/sidc";
import MilitarySymbol from "@/components/MilitarySymbol.vue";

const SimpleMarkdownInput = defineAsyncComponent(
  () => import("@/components/SimpleMarkdownInput.vue")
);

const props = defineProps<{ unitId: EntityId }>();
const activeScenario = injectStrict(activeScenarioKey);
const {
  store,
  geo: { addUnitPosition },
  unitActions: { updateUnit, getUnitHierarchy, getCombinedSymbolOptions },
} = activeScenario;

const unit = computed(() => {
  return store.state.unitMap[props.unitId];
});

const combinedSymbolOptions = computed(() => {
  return getCombinedSymbolOptions(unit.value);
});

let form = ref<UnitUpdate>({
  name: "",
  shortName: "",
  sidc: "",
  description: "",
  externalUrl: "",
});
const geoStore = useGeoStore();
const unitSettings = useUnitSettingsStore();
const { getModalSidc } = injectStrict(sidcModalKey);

const {
  start: startGetLocation,
  isActive: isGetLocationActive,
  onGetLocation,
} = useGetMapLocation(geoStore.olMap as OLMap);
const uiStore = useUiStore();
const { selectedUnitIds, clear: clearSelection } = useSelectedUnits();
const isMultiMode = computed(() => selectedUnitIds.value.size > 1);
const selectedUnits = computed(() =>
  [...selectedUnitIds.value].map((id) => store.state.getUnitById(id))
);
onGetLocation((location) => addUnitPosition(props.unitId, location));
const isEditMode = ref(false);
const toggleEditMode = useToggle(isEditMode);

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
  const { name, shortName, description, externalUrl } = unit.value;
  form.value = { name, shortName, description, externalUrl };
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

const { onUnitAction } = useUnitActions();

function actionWrapper(action: UnitAction) {
  if (isMultiMode.value) {
    onUnitAction(selectedUnits.value, action);
    return;
  }
  onUnitAction(unit.value, action);
}

const buttonItems = computed(() => [
  {
    label: "Duplicate",
    onClick: () => actionWrapper(UnitActions.Clone),
  },
  {
    label: "Duplicate hierarchy",
    onClick: () => actionWrapper(UnitActions.CloneWithSubordinates),
  },
  {
    label: "Move up",
    onClick: () => actionWrapper(UnitActions.MoveUp),
  },
  {
    label: "Move down",
    onClick: () => actionWrapper(UnitActions.MoveDown),
  },
  {
    label: "Create subordinate",
    onClick: () => actionWrapper(UnitActions.AddSubordinate),
  },
  {
    label: "Zoom",
    onClick: () => actionWrapper(UnitActions.Zoom),
  },
  {
    label: "Pan",
    onClick: () => actionWrapper(UnitActions.Pan),
    disabled: !hasPosition.value,
  },
  {
    label: "Delete",
    onClick: () => actionWrapper(UnitActions.Delete),
  },
]);

async function handleChangeSymbol() {
  const newSidcValue = await getModalSidc(unit.value.sidc, {
    symbolOptions: unit.value.symbolOptions,
    inheritedSymbolOptions: getCombinedSymbolOptions(unit.value, true),
  });
  if (newSidcValue !== undefined) {
    const { sidc, symbolOptions = {} } = newSidcValue;
    if (isMultiMode.value) {
      store.groupUpdate(() =>
        selectedUnitIds.value.forEach((unitId) => {
          const { side } = getUnitHierarchy(unitId);
          const nsidc = setCharAt(sidc, SID_INDEX, side.standardIdentity);
          updateUnit(unitId, { sidc: nsidc });
        })
      );
    } else updateUnit(props.unitId, { sidc, symbolOptions });
  }
}
</script>
