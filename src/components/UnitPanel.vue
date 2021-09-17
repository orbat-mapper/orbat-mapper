<template>
  <div v-if="unit" class="">
    <header class="flex">
      <div class="flex-shrink-0 w-16 h-20">
        <MilSymbol :sidc="form.sidc" :size="34" />
      </div>
      <p class="font-medium pt-2">{{ unit.name }}</p>
    </header>
    <form
      v-if="isEditMode"
      @submit.prevent="onFormSubmit"
      class="mt-0 space-y-4"
    >
      <InputGroup label="Name" v-model="form.name" id="name-input" />
      <InputGroup
        label="Short name"
        description="Alternative name"
        v-model="form.shortName"
      />
      <InputGroup
        label="External URL"
        description=""
        v-model="form.externalUrl"
      />
      <div class="w-full">
        <SymbolPickerInput v-model="form.sidc" />
      </div>
      <SimpleMarkdownInput
        label="Description"
        v-model="form.description"
        description="Use markdown syntax for formatting"
      />

      <div class="flex justify-end space-x-2">
        <PlainButton>Reset</PlainButton>
        <PrimaryButton type="submit">Update</PrimaryButton>
      </div>
    </form>
    <div v-else class="space-y-4 mb-4">
      <DescriptionItem label="Name">{{ unit.name }}</DescriptionItem>
      <DescriptionItem v-if="unit.shortName" label="Short name"
        >{{ unit.shortName }}
      </DescriptionItem>
      <DescriptionItem v-if="unit.externalUrl" label="External URL"
        ><a
          target="_blank"
          class="underline text-sm"
          :href="unit.externalUrl"
          >{{ unit.externalUrl }}</a
        ></DescriptionItem
      >
      <DescriptionItem v-if="unit.description" label="Description">
        <div class="prose prose-sm" v-html="hDescription"></div>
      </DescriptionItem>
    </div>
    <div class="flex">
      <PlainButton @click="toggleEditMode">Edit</PlainButton>
      <SplitButton class="ml-2" :items="buttonItems" />
    </div>
    <UnitPanelState v-if="unit?.state?.length" :unit="unit" />
    <GlobalEvents :filter="eventFilter" @keyup.e="doFormFocus" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, PropType, ref, watch } from "vue";
import { Unit } from "../types/models";
import InputGroup from "./InputGroup.vue";
import PrimaryButton from "./PrimaryButton.vue";
import PlainButton from "./PlainButton.vue";
import { formatDateString, formatPosition } from "../geo/utils";
import { useGeoStore } from "../stores/geoStore";
import MilSymbol from "./MilSymbol.vue";
import { GlobalEvents } from "vue-global-events";
import { inputEventFilter } from "./helpers";
import TextAreaGroup from "./TextAreaGroup.vue";
import SimpleMarkdownInput from "./SimpleMarkdownInput.vue";
import DescriptionItem from "./DescriptionItem.vue";
import { useToggle } from "@vueuse/core";
import { renderMarkdown } from "../composables/formatting";
import UnitPanelState from "./UnitPanelState.vue";
import ButtonGroup from "./ButtonGroup.vue";
import { useUnitActions } from "../composables/scenarioActions";
import { UnitActions } from "../types/constants";
import SymbolPickerInput from "./SymbolPickerInput.vue";
import SplitButton from "./SplitButton.vue";

export default defineComponent({
  name: "UnitPanel",
  components: {
    SplitButton,
    SymbolPickerInput,
    ButtonGroup,
    UnitPanelState,
    DescriptionItem,
    SimpleMarkdownInput,
    TextAreaGroup,
    MilSymbol,
    PlainButton,
    PrimaryButton,
    InputGroup,
    GlobalEvents,
  },
  props: {
    unit: { type: Object as PropType<Unit> },
  },
  setup(props) {
    let form = ref<Partial<Unit>>({
      name: "",
      shortName: "",
      sidc: "",
      description: "",
      externalUrl: "",
    });
    const geoStore = useGeoStore();
    const onFormSubmit = () => {
      console.log("Submit", form.value);
      Object.assign(props.unit, form.value);
    };

    const isEditMode = ref(false);
    const toggleEditMode = useToggle(isEditMode);
    const showSymbolPicker = ref(false);

    const doFormFocus = async () => {
      isEditMode.value = true;
      await nextTick();
      const inputElement = document.getElementById("name-input");
      inputElement && inputElement.focus();
    };

    const hDescription = computed(() =>
      renderMarkdown(props.unit?.description || "")
    );

    const hasPosition = computed(() => Boolean(props.unit?._state?.location));

    watch(
      () => props.unit,
      (updatedUnit, oldValue) => {
        if (updatedUnit) {
          const { name, shortName, sidc, description, externalUrl } =
            updatedUnit;
          form.value = { name, shortName, sidc, description, externalUrl };
        }
        if (isEditMode.value) nextTick(() => doFormFocus());
      },
      { immediate: true }
    );

    const { onUnitAction } = useUnitActions();

    const buttonItems = computed(() => [
      {
        label: "Duplicate",
        onClick: () => onUnitAction(props.unit, UnitActions.Clone),
      },
      {
        label: "Move up",
        onClick: () => onUnitAction(props.unit, UnitActions.MoveUp),
      },
      {
        label: "Move down",
        onClick: () => onUnitAction(props.unit, UnitActions.MoveDown),
      },
      {
        label: "Create subordinate",
        onClick: () => onUnitAction(props.unit, UnitActions.AddSubordinate),
      },
      {
        label: "Zoom",
        onClick: () => onUnitAction(props.unit, UnitActions.Zoom),
        disabled: !hasPosition.value,
      },
      {
        label: "Pan",
        onClick: () => onUnitAction(props.unit, UnitActions.Pan),
        disabled: !hasPosition.value,
      },
    ]);

    return {
      onFormSubmit,
      form,
      formatPosition,
      formatDateString,
      doFormFocus,
      eventFilter: inputEventFilter,
      showSymbolPicker,
      isEditMode,
      hDescription,
      buttonItems,
      toggleEditMode,
    };
  },
});
</script>
