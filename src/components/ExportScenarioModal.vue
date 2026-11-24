<script setup lang="ts">
import { computed, ref } from "vue";
import NProgress from "nprogress";
import { useClipboard } from "@vueuse/core";
import { ClipboardCopyIcon, CheckIcon } from "@lucide/vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { type SelectItem } from "@/components/types";
import type { ExportFormat } from "@/types/importExport.ts";
import {
  exporters,
  findExporter,
  type ExportFile,
} from "@/importexport/export/exporters";
import { useExporterSettings } from "@/importexport/export/exporters/settings";
import { useNotifications } from "@/composables/notifications";
import ToggleField from "@/components/ToggleField.vue";
import { useExportStore } from "@/stores/importExportStore";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import ImportStepLayout from "@/components/ImportStepLayout.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { saveBlobToLocalFile } from "@/utils/files";

const open = defineModel<boolean>({ default: false });
const emit = defineEmits(["cancel"]);

const scenario = injectStrict(activeScenarioKey);
const store = useExportStore();
const settingsFor = useExporterSettings();

const formatItems: (SelectItem<ExportFormat> & { description: string })[] = exporters.map(
  ({ id, label, description }) => ({ label, value: id, description }),
);

const format = ref<ExportFormat>(findExporter(store.currentFormat).id);
const exporter = computed(() => findExporter(format.value));
const settings = computed({
  get: () => settingsFor(exporter.value).value,
  set: (value) => (settingsFor(exporter.value).value = value),
});

const { send } = useNotifications();
const { copy } = useClipboard();
const justCopied = ref(false);

async function generate(): Promise<ExportFile | undefined> {
  NProgress.start();
  try {
    return await exporter.value.generate({ scenario }, settings.value);
  } catch (error) {
    console.error(error);
    send({
      type: "error",
      message: `Could not export the scenario as ${exporter.value.label}`,
    });
  } finally {
    NProgress.done();
  }
}

async function onExport() {
  const file = await generate();
  if (!file) return;
  const blob =
    file.content instanceof Blob
      ? file.content
      : new Blob([file.content], { type: file.mimeType });
  await saveBlobToLocalFile(blob, file.fileName, {
    mimeTypes: [file.mimeType],
    extensions: [file.extension],
  });
  if (!store.keepOpen) open.value = false;
  store.currentFormat = format.value;
  send({ message: `Exported scenario as ${format.value}` });
  if (file.warnings?.length) {
    const warningExamples = file.warnings.slice(0, 2).join(" ");
    const andMore =
      file.warnings.length > 2 ? ` (+${file.warnings.length - 2} more)` : "";
    send({
      type: "warning",
      title: "Export used compatibility fallbacks",
      message: `${warningExamples}${andMore}`,
      duration: 10000,
    });
  }
}

async function onCopyToClipboard() {
  const file = await generate();
  if (typeof file?.content !== "string" || !file.content) return;
  await copy(file.content);
  justCopied.value = true;
  setTimeout(() => (justCopied.value = false), 2000);
  send({ message: "Copied to clipboard" });
}

function onCancel() {
  open.value = false;
  store.currentFormat = format.value;
  emit("cancel");
}
</script>

<template>
  <NewSimpleModal
    v-model="open"
    fixed-height
    @cancel="onCancel"
    class="grid h-[90vh] grid-rows-[auto_1fr] sm:max-w-xl md:max-w-4xl lg:max-w-[95vw]"
  >
    <div class="-mx-6 flex h-full flex-col overflow-hidden px-0">
      <DialogTitle class="sr-only">Export scenario</DialogTitle>
      <DialogDescription class="sr-only">
        Export scenario data for use with other software applications and tools
      </DialogDescription>
      <form class="min-h-0 flex-1 overflow-hidden" @submit.prevent="onExport">
        <ImportStepLayout
          title="Export scenario"
          subtitle="Export scenario data for use with other software applications and tools"
          help-url="https://docs.orbat-mapper.app/guide/export-data"
          has-sidebar
        >
          <template #actions>
            <Button variant="outline" type="button" size="sm" @click="onCancel">
              Cancel
            </Button>
            <Button
              v-if="exporter.canCopyToClipboard"
              variant="outline"
              type="button"
              size="sm"
              @click="onCopyToClipboard"
            >
              <component
                :is="justCopied ? CheckIcon : ClipboardCopyIcon"
                class="mr-1 h-4 w-4"
              />
              {{ justCopied ? "Copied!" : "Copy" }}
            </Button>
            <Button type="submit" size="sm">Export</Button>
          </template>

          <template #sidebar>
            <SimpleSelect
              class="lg:hidden"
              label="Export format"
              :items="formatItems"
              v-model="format"
            />

            <FieldSet class="hidden lg:block">
              <FieldLabel>Export Format</FieldLabel>
              <FieldDescription
                >Select the format for your exported data</FieldDescription
              >
              <RadioGroup v-model="format" class="mt-3 flex flex-col gap-2">
                <FieldLabel
                  v-for="item in formatItems"
                  :key="item.value"
                  :for="`export-format-${item.value}`"
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>{{ item.label }}</FieldTitle>
                      <FieldDescription>{{ item.description }}</FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      :id="`export-format-${item.value}`"
                      :value="item.value"
                    />
                  </Field>
                </FieldLabel>
              </RadioGroup>
            </FieldSet>

            <p v-if="exporter.hint" class="text-muted-foreground text-sm lg:hidden">
              {{ exporter.hint }}
            </p>

            <ToggleField v-model="store.keepOpen">
              Keep dialog open on export
            </ToggleField>
          </template>

          <div class="min-h-0 flex-1 overflow-y-auto p-6">
            <div class="space-y-6">
              <component
                :is="exporter.settingsComponent"
                :key="exporter.id"
                v-model="settings"
              />
              <p v-if="exporter.note" class="text-sm">{{ exporter.note }}</p>
            </div>
          </div>
        </ImportStepLayout>
      </form>
    </div>
  </NewSimpleModal>
</template>
