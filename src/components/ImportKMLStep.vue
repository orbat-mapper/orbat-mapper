<script setup lang="ts">
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey, searchActionsKey } from "@/components/injects";
import { onMounted, ref, shallowRef, triggerRef } from "vue";
import { ChevronRightIcon } from "lucide-vue-next";
import { stripFileExtension } from "@/utils/files";
import AlertWarning from "@/components/AlertWarning.vue";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import ImportedFileList from "@/components/ImportedFileList.vue";
import type { KmlImportData } from "@/types/importExport.ts";
import { Spinner } from "@/components/ui/spinner";
import {
  getAllChildFoldersFromElement,
  getKmlAsDom,
  getKmlFolders,
} from "@/importexport/kml";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import InputCheckbox from "@/components/InputCheckbox.vue";

interface Props {
  loadedData: KmlImportData;
}

const { loadedData } = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { geo } = injectStrict(activeScenarioKey);
const { onImageLayerSelectHook } = injectStrict(searchActionsKey);

const isProcessing = ref(true);

interface ParsedKmlData {
  kmlDom: Document;
  folders: Map<Element, string>;
}
const parsedDataMap = shallowRef<Map<string, ParsedKmlData>>(new Map());

type FileImportOptions = {
  layerName: string;
  selectedFolders: Set<Element>;
  indeterminateFolders: Set<Element>;
};

type ImportKmlForm = {
  fileOptions: FileImportOptions[];
  layerNames: string[];
  extractStyles: boolean;
  showPointNames: boolean;
};

const form = ref<ImportKmlForm>({
  fileOptions: [],
  layerNames: loadedData.fileInfo.map((f) => stripFileExtension(f.fileName)),
  extractStyles: true,
  showPointNames: true,
});

async function onLoad(e: Event) {
  for (const blobUrl of loadedData.data) {
    const index = loadedData.data.indexOf(blobUrl);
    const { layerName, selectedFolders, indeterminateFolders } =
      form.value.fileOptions[index];
    const parsedKmlData = parsedDataMap.value.get(blobUrl);
    if (!parsedKmlData) continue;
    const { kmlDom, folders } = parsedKmlData;

    // remove unselected folders from the DOM
    for (const [folderElement] of folders) {
      if (
        !selectedFolders.has(folderElement) &&
        !indeterminateFolders.has(folderElement)
      ) {
        folderElement.parentElement?.removeChild(folderElement);
      }
    }

    // serialize back to string
    const xmlAsString = new XMLSerializer().serializeToString(kmlDom);
    const kmlBlob = new Blob([xmlAsString], {
      type: "application/vnd.google-earth.kml+xml",
    });
    const newBlobUrl = URL.createObjectURL(kmlBlob);
    URL.revokeObjectURL(blobUrl);

    const newLayer = geo.addMapLayer({
      url: newBlobUrl,
      name: layerName || `KML Layer ${index + 1}`,
      extractStyles: form.value.extractStyles,
      showPointNames: form.value.showPointNames,
      id: nanoid(),
      type: "KMLLayer",
    });

    await onImageLayerSelectHook.trigger({ layerId: newLayer.id });
  }

  emit("loaded");
}

function onCancel() {
  emit("cancel");
}

onMounted(async () => {
  isProcessing.value = true;
  const fileInfoArray: FileImportOptions[] = [];
  for (const [index, blobUrl] of loadedData.data.entries()) {
    const kmlDom = await getKmlAsDom(blobUrl);
    const folders = new Map(getKmlFolders(kmlDom));
    parsedDataMap.value.set(blobUrl, {
      folders,
      kmlDom,
    });

    fileInfoArray.push({
      layerName: stripFileExtension(
        loadedData.fileInfo[index]?.fileName ?? `KML Layer ${index + 1}`,
      ),
      selectedFolders: new Set([...folders.keys()]),
      indeterminateFolders: new Set(),
    });
  }
  form.value.fileOptions = fileInfoArray;
  isProcessing.value = false;
  triggerRef(parsedDataMap);
});

function toggleSelectedFolders(fileImportOptions: FileImportOptions) {
  const { selectedFolders, indeterminateFolders } = fileImportOptions;
  if (selectedFolders.size) {
    selectedFolders.clear();
    indeterminateFolders.clear();
    return;
  }
  const index = form.value.fileOptions.indexOf(fileImportOptions);
  for (const [k] of parsedDataMap.value.get(loadedData.data[index])?.folders || []) {
    selectedFolders.add(k);
  }
}

function updateSelectedFolders(
  element: Element,
  { selectedFolders, indeterminateFolders }: FileImportOptions,
  value: boolean | "indeterminate" | unknown[],
) {
  const parentFolder = element.parentElement;
  if (value === true) {
    selectedFolders.add(element);
    indeterminateFolders.delete(element);
    const childFolders = getAllChildFoldersFromElement(element);
    for (const child of childFolders) {
      selectedFolders.add(child);
      indeterminateFolders.delete(child);
    }
  } else if (value === false) {
    selectedFolders.delete(element);
    const childFolders = getAllChildFoldersFromElement(element);
    for (const child of childFolders) {
      selectedFolders.delete(child);
      indeterminateFolders.delete(child);
    }
  }

  if (parentFolder) {
    indeterminateFolders.add(parentFolder);
  } else {
  }
}
</script>

<template>
  <div class="">
    <form @submit.prevent="onLoad" class="flex max-h-[80vh] flex-col">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>KML import</FieldLegend>
          <ImportedFileList :importData="loadedData" />
          <AlertWarning title="Warning"
            >KML layers are currently only visible while the scenario is open. They are
            not saved as part of the scenario.
          </AlertWarning>

          <FieldGroup v-if="!isProcessing">
            <template v-for="(fileFormData, index) in form.fileOptions" :key="index">
              <Field>
                <FieldLabel for="layerName-0">Vector layer name</FieldLabel>
                <Input :id="`layerName-${index}`" v-model="fileFormData.layerName" />
                <FieldDescription
                  >{{ loadedData.fileInfo[index]?.fileName }}
                </FieldDescription>
                <Collapsible v-slot="{ open }">
                  <div class="flex items-center gap-2">
                    <CollapsibleTrigger asChild class="group">
                      <Button type="button" variant="outline" size="sm"
                        >Select/toggle folders to import
                        <ChevronRightIcon
                          class="transition-transform group-data-[state=open]:rotate-90"
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <Button
                      v-if="open"
                      @click="toggleSelectedFolders(fileFormData)"
                      type="button"
                      variant="outline"
                      size="sm"
                      >Toggle all</Button
                    >
                  </div>
                  <CollapsibleContent class="mt-4 grid grid-cols-1 gap-2">
                    <InputCheckbox
                      v-for="([k, v], i) in parsedDataMap.get(loadedData.data[index])
                        ?.folders"
                      :label="v"
                      :key="i"
                      :modelValue="
                        fileFormData.indeterminateFolders.has(k)
                          ? 'indeterminate'
                          : fileFormData.selectedFolders.has(k)
                      "
                      @update:modelValue="
                        (val) => {
                          updateSelectedFolders(k, fileFormData, val!);
                        }
                      "
                    />
                  </CollapsibleContent>
                </Collapsible>
              </Field>
              <FieldSeparator />
            </template>
          </FieldGroup>

          <div class="grid grid-cols-1 sm:grid-cols-2">
            <Field orientation="horizontal" class="">
              <Checkbox v-model="form.extractStyles" id="extractStyles" />
              <FieldContent>
                <FieldLabel for="extractStyles">Extract styles from KML</FieldLabel>
                <FieldDescription>Apply KML styling to features</FieldDescription>
              </FieldContent>
            </Field>
            <Field orientation="horizontal" class="">
              <Checkbox v-model="form.showPointNames" id="showPointNames" />
              <FieldContent>
                <FieldLabel for="showPointNames">Show names as labels</FieldLabel>
                <FieldDescription
                  >Show names as labels for placemarks which contain
                  points.</FieldDescription
                >
              </FieldContent>
            </Field>
          </div>

          <Field orientation="horizontal" class="justify-between">
            <div
              v-if="isProcessing"
              class="text-muted-foreground flex items-center gap-2 text-sm"
            >
              <Spinner v-if="isProcessing" /> Processing data
            </div>
            <div v-else />
            <div class="flex items-center gap-2">
              <Button type="submit"> Import</Button>
              <Button variant="outline" type="button" @click="onCancel"> Cancel</Button>
            </div>
          </Field>
        </FieldSet>
      </FieldGroup>
    </form>
  </div>
</template>
