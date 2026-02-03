<script setup lang="ts">
import { readSpreadsheet } from "@/extlib/xlsx-read-lazy";

import type { ImportedFileInfo } from "@/importexport/fileHandling";
import { detectSpreadsheetDialect } from "@/importexport/spreadsheets/utils";
import ImportOdinStep from "@/components/ImportOdinStep.vue";
import ImportGenericStep from "@/components/ImportGenericStep.vue";

interface Props {
  fileInfo: ImportedFileInfo;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);

const workbook = readSpreadsheet(
  props.fileInfo.dataAsArrayBuffer || props.fileInfo.dataAsString,
  props.fileInfo.dataAsArrayBuffer ? undefined : { type: "string" },
);
const dialect = detectSpreadsheetDialect(workbook);
</script>

<template>
  <div class="">
    <ImportOdinStep
      v-if="dialect === 'ODIN_DRAGON'"
      :workbook="workbook"
      @cancel="emit('cancel')"
      @loaded="emit('loaded')"
    />
    <ImportGenericStep
      v-else-if="dialect === 'generic'"
      :workbook="workbook"
      @cancel="emit('cancel')"
      @loaded="emit('loaded')"
    />
    <div v-else class="p-4 text-center">
      <p class="text-red-500">Unsupported spreadsheet format.</p>
    </div>
  </div>
</template>
