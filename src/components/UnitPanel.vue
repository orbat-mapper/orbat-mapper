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
      <div class="flex w-full space-x-1">
        <div class="flex-auto">
          <InputGroup label="SIDC" v-model="form.sidc" />
        </div>

        <div class="flex-shrink-0 self-end">
          <PlainButton
            @click="showSymbolPicker = true"
            class="flex-shrink-0 h-10"
            >edit
          </PlainButton>
        </div>
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
    <PlainButton @click="onZoom" class="">Zoom to</PlainButton>
    <PlainButton @click="toggleEditMode()" class=""
      >Toggle edit mode</PlainButton
    >

    <UnitPanelState v-if="unit.state" :state="unit.state" />

    <GlobalEvents :filter="eventFilter" @keyup.e="doFormFocus" />
    <SymbolPickerModal
      v-model:is-visible="showSymbolPicker"
      v-model:sidc="form.sidc"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  watch,
  ref,
  defineAsyncComponent,
  nextTick,
  computed,
} from "vue";
import { Unit } from "../types/models";
import InputGroup from "./InputGroup.vue";
import PrimaryButton from "./PrimaryButton.vue";
import PlainButton from "./PlainButton.vue";
import { formatDateString, formatPosition } from "../geo/utils";
import { useScenarioStore } from "../stores/scenarioStore";
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
// import SymbolPickerModal from "./SymbolPickerModal.vue";

export default defineComponent({
  name: "UnitPanel",
  components: {
    UnitPanelState,
    DescriptionItem,
    SimpleMarkdownInput,
    TextAreaGroup,
    SymbolPickerModal: defineAsyncComponent(
      () => import("./SymbolPickerModal.vue")
    ),
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

    const onZoom = () => geoStore.zoomToUnit(props.unit, 500);
    const doFormFocus = async () => {
      isEditMode.value = true;
      await nextTick();
      const inputElement = document.getElementById("name-input");
      inputElement && inputElement.focus();
    };

    const hDescription = computed(() =>
      renderMarkdown(props.unit?.description || "")
    );

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

    return {
      onFormSubmit,
      form,
      formatPosition,
      formatDateString,
      onZoom,
      doFormFocus,
      eventFilter: inputEventFilter,
      showSymbolPicker,
      isEditMode,
      toggleEditMode,
      hDescription,
    };
  },
});
</script>
