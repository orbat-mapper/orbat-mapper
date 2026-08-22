<script setup lang="ts">
import { computed, ref, watch } from "vue";
import filenamify from "filenamify/browser";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import InputGroup from "@/components/InputGroup.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DialogFooter } from "@/components/ui/dialog";
import { saveBlobToLocalFile } from "@/utils/files";
import { getErrorMessage } from "@/utils";
import { useNotifications } from "@/composables/notifications";
import {
  prepareOrbatChartExport,
  type ChartExportBounds,
  type ChartExportFormat,
} from "./chartExport";

const props = defineProps<{
  chartId: string;
  paperSize: string;
  defaultFileName: string;
  chartTitle: string;
  description?: string;
}>();

const open = defineModel<boolean>({ default: false });
const format = ref<ChartExportFormat>("png");
const bounds = ref<ChartExportBounds>("page");
const scale = ref(2);
const padding = ref(24);
const background = ref("white");
const customBackground = ref("#ffffff");
const fileName = ref(props.defaultFileName);
const exporting = ref(false);
const exportError = ref<string | null>(null);
const { send } = useNotifications();

watch(open, (isOpen) => {
  if (!isOpen) return;
  fileName.value = props.defaultFileName;
  exportError.value = null;
});

const formatItems = [
  { label: "PNG", value: "png" },
  { label: "SVG", value: "svg" },
];
const boundsItems = [
  { label: "Selected page size", value: "page" },
  { label: "Crop to chart content", value: "content" },
];
const scaleItems = [
  { label: "1×", value: 1 },
  { label: "2×", value: 2 },
  { label: "3×", value: 3 },
];
const backgroundItems = [
  { label: "White", value: "white" },
  { label: "Transparent", value: "transparent" },
  { label: "Custom color", value: "custom" },
];

const backgroundColor = computed(() => {
  if (background.value === "transparent") return null;
  return background.value === "custom" ? customBackground.value : "#ffffff";
});

function getChart() {
  const element = document.getElementById(props.chartId);
  if (!element || element.tagName.toLowerCase() !== "svg") {
    throw new Error("Select a root unit before exporting the chart.");
  }
  return element as unknown as SVGSVGElement;
}

function prepareExport() {
  return prepareOrbatChartExport(getChart(), {
    format: format.value,
    bounds: bounds.value,
    scale: scale.value,
    padding: padding.value,
    backgroundColor: backgroundColor.value,
    pageSize: props.paperSize,
    title: props.chartTitle,
    description: props.description,
  });
}

const exportSummary = computed(() => {
  if (!open.value) return null;
  try {
    const prepared = prepareExport();
    return {
      text: `${prepared.width.toLocaleString()} × ${prepared.height.toLocaleString()} px`,
      memory: prepared.estimatedMemoryBytes
        ? `${Math.ceil(prepared.estimatedMemoryBytes / 1024 / 1024)} MB working memory`
        : "",
      error: null,
    };
  } catch (error) {
    return {
      text: "Export unavailable",
      memory: "",
      error: getErrorMessage(error),
    };
  }
});

function outputFileName() {
  const extension = format.value;
  const withoutKnownExtension = fileName.value.trim().replace(/\.(png|svg)$/i, "");
  return `${filenamify(withoutKnownExtension || props.defaultFileName)}.${extension}`;
}

async function onExport() {
  exportError.value = null;
  exporting.value = true;
  try {
    const prepared = prepareExport();
    const blob = await prepared.render();
    const name = outputFileName();
    await saveBlobToLocalFile(blob, name, {
      extensions: [`.${format.value}`],
      mimeTypes: [blob.type],
    });
    send({ message: `Exported ${name}`, type: "success" });
    open.value = false;
  } catch (error) {
    exportError.value = getErrorMessage(error);
    send({ message: exportError.value, type: "error" });
  } finally {
    exporting.value = false;
  }
}
</script>

<template>
  <NewSimpleModal
    v-model="open"
    dialog-title="Export ORBAT chart"
    description="Create a portable chart image for documents, presentations, or editing."
    class="sm:max-w-xl"
  >
    <form class="space-y-5" @submit.prevent="onExport">
      <div class="grid gap-4 sm:grid-cols-2">
        <SimpleSelect v-model="format" label="Format" :items="formatItems" />
        <SimpleSelect v-model="bounds" label="Export area" :items="boundsItems" />
        <SimpleSelect
          v-if="format === 'png'"
          v-model="scale"
          label="PNG resolution"
          description="Higher scales are sharper but use more memory."
          :items="scaleItems"
        />
        <NumberInputGroup
          v-if="bounds === 'content'"
          v-model="padding"
          label="Content padding"
          :min="0"
          :max="500"
        />
        <SimpleSelect v-model="background" label="Background" :items="backgroundItems" />
        <InputGroup
          v-if="background === 'custom'"
          v-model="customBackground"
          type="color"
          label="Background color"
        />
      </div>

      <InputGroup
        v-model="fileName"
        label="File name"
        :description="`The .${format} extension is added automatically.`"
      />

      <div v-if="exportSummary" class="bg-muted rounded-md px-3 py-2 text-sm">
        <p class="font-medium">{{ exportSummary.text }}</p>
        <p v-if="exportSummary.memory" class="text-muted-foreground">
          {{ exportSummary.memory }}
        </p>
      </div>

      <Alert v-if="exportSummary?.error || exportError" variant="destructive">
        <AlertDescription>{{ exportError || exportSummary?.error }}</AlertDescription>
      </Alert>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          :disabled="exporting"
          @click="open = false"
        >
          Cancel
        </Button>
        <Button type="submit" :disabled="exporting || Boolean(exportSummary?.error)">
          {{ exporting ? "Exporting…" : `Export ${format.toUpperCase()}` }}
        </Button>
      </DialogFooter>
    </form>
  </NewSimpleModal>
</template>
