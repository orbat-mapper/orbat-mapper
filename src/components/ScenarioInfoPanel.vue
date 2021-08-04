<template>
  <div>
    <form
      v-if="isEditMode"
      @submit.prevent="onFormSubmit"
      class="p-6 space-y-4"
    >
      <InputGroup label="Name" v-model="form.name" id="name-input" />
      <SimpleMarkdownInput
        label="Description"
        v-model="form.description"
        description="Use markdown syntax for formatting"
      />
      <DescriptionItem label="Start time"
        >{{ computedStartTime.format() }}
        <PlainButton @click="showTimeModal = true" class="ml-2"
          >Change
        </PlainButton>
      </DescriptionItem>
      <InputGroup label="Time zone" v-model="form.timeZone" />
      <div class="flex justify-end space-x-2">
        <PlainButton type="button" @click="toggleEditMode()"
          >Cancel</PlainButton
        >
        <PrimaryButton type="submit">Update</PrimaryButton>
      </div>
      <InputDateModal
        v-model="showTimeModal"
        dialog-title="Set scenario start time"
        v-model:timestamp="form.startTime"
      />
    </form>
    <div v-else class="p-6 space-y-4">
      <DescriptionItem label="Title">{{ scenario.name }}</DescriptionItem>

      <DescriptionItem label="Description">
        <div class="prose prose-esm" v-html="hDescription"></div>
      </DescriptionItem>

      <DescriptionItem label="Start time"
        >{{ computedStartTime.format() }}
      </DescriptionItem>
      <DescriptionItem label="Time zone name"
        >{{ scenario.timeZone }}
      </DescriptionItem>
      <div class="flex space-x-2">
        <PlainButton @click="toggleEditMode()">Edit mode</PlainButton>
        <SecondaryButton @click="onDownload">Download</SecondaryButton>
        <PrimaryButton @click="onSave">Save</PrimaryButton>
        <PrimaryButton @click="onLoad">Load</PrimaryButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useScenarioStore } from "../stores/scenarioStore";
import DescriptionItem from "./DescriptionItem.vue";
import { formatDateString } from "../geo/utils";
import * as FileSaver from "file-saver";
import PrimaryButton from "./PrimaryButton.vue";
import SecondaryButton from "./SecondaryButton.vue";
import { renderMarkdown } from "../composables/formatting";
import { useScenarioIO } from "../stores/scenarioIO";
import { toRefs, useToggle } from "@vueuse/core";
import PlainButton from "./PlainButton.vue";
import { ScenarioInfo } from "../types/models";
import InputGroup from "./InputGroup.vue";
import SimpleMarkdownInput from "./SimpleMarkdownInput.vue";
import dayjs from "dayjs";
import InputDateModal from "./InputDateModal.vue";

export default defineComponent({
  name: "ScenarioInfoPanel",
  components: {
    InputDateModal,
    SimpleMarkdownInput,
    InputGroup,
    PlainButton,
    SecondaryButton,
    PrimaryButton,
    DescriptionItem,
  },
  setup() {
    const scenarioStore = useScenarioStore();
    const scenarioIO = useScenarioIO();
    const { scenario } = toRefs(scenarioStore);
    const { description, startTime } = toRefs(scenario);

    const isEditMode = ref(false);
    const toggleEditMode = useToggle(isEditMode);

    const showTimeModal = ref(false);

    const hDescription = computed(() =>
      renderMarkdown(description!.value || "")
    );

    let form = ref<ScenarioInfo>({
      name: "",
      description: "",
      startTime: 0,
      timeZone: "UTC",
    });

    watch(
      scenario,
      (scn) => {
        const { name, description, startTime, timeZone } = scn;
        form.value = { name, description, startTime, timeZone };
      },
      { immediate: true }
    );

    const computedStartTime = computed(() => {
      try {
        return dayjs(form.value.startTime).tz(form.value.timeZone);
      } catch (e) {
        return dayjs(form.value.startTime);
      }
    });

    function onDownload() {
      FileSaver.saveAs(
        new Blob([scenarioStore.stringify()], {
          type: "application/json",
        }),
        "scenario.json"
      );
    }

    function onSave() {
      scenarioIO.saveToLocalStorage();
    }

    function onLoad() {
      scenarioIO.loadFromLocalStorage();
    }

    function onFormSubmit() {
      Object.assign(scenario.value, form.value);
      isEditMode.value = false;
    }

    return {
      hDescription,
      scenarioStore,
      scenario,
      onLoad,
      onDownload,
      onSave,
      isEditMode,
      toggleEditMode,
      form,
      onFormSubmit,
      computedStartTime,
      showTimeModal,
    };
  },
});
</script>
