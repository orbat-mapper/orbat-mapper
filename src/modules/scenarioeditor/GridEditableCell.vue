<script setup lang="ts">
import { computed, ref } from "vue";
import { doFocus } from "@/composables/utils";
import { isTypedCharValid } from "@/components/helpers";
import { type CellType } from "@/modules/scenarioeditor/types";

interface Props {
  value?: string | number;
  rowIndex: number;
  colIndex: number;
  cellType?: CellType;
}

const props = withDefaults(defineProps<Props>(), { cellType: "text" });

const emit = defineEmits(["update", "nextCell", "active", "edit"]);

const editMode = ref(false);
const selected = ref(false);
const root = ref<HTMLElement | null>(null);

let timeoutId = -1;
let justFocused = false;

let valueCopy: string | number | undefined = "";
const iValue = ref<string | number>("");

const externalEdit = computed(() => ["sidc", "markdown"].includes(props.cellType));

function enterEditMode(initialValue?: string | number) {
  if (editMode.value) return;
  valueCopy = props.value;
  iValue.value = initialValue ?? (props.value || "");
  editMode.value = true;
}

function doCancel() {
  iValue.value = valueCopy || "";
  editMode.value = false;
  root.value?.focus();
}

function onFocus() {
  justFocused = true;
  selected.value = true;
  timeoutId = window.setTimeout(() => (justFocused = false), 500);
  emit("active");
}

function onBlur() {
  clearTimeout(timeoutId);
  selected.value = false;
}

function onEnter() {
  if (externalEdit.value) {
    handleExternalEdit();
    return;
  }

  if (!editMode.value) {
    enterEditMode();
  } else {
    root.value?.focus();
    emit("nextCell", root.value);
  }
}

function onEditBlur() {
  selected.value = false;
  editMode.value = false;
  if (iValue.value !== valueCopy) emit("update", iValue.value);
}

function onClick(e: any) {
  if (!justFocused) {
    if (externalEdit.value) {
      handleExternalEdit();
    } else {
      enterEditMode();
    }
  }
}

function onKeydown(event: KeyboardEvent) {
  if (editMode.value) return;
  if (["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)) return;
  if (isTypedCharValid(event)) {
    enterEditMode("");
  }
}

function handleExternalEdit() {
  emit("edit", props.value);
}
</script>
<template>
  <div
    ref="root"
    class="editable-cell truncate border-2 border-white px-3 py-3 text-sm whitespace-nowrap text-gray-500 outline-0 focus-within:border-red-800"
    tabindex="0"
    :id="`cell-${rowIndex}-${colIndex}`"
    @keydown="onKeydown"
    @keydown.enter.exact="onEnter"
    @keydown.esc="doCancel"
    @click="onClick"
    @focus="onFocus"
    @blur="onBlur"
  >
    <form v-if="editMode" @submit.prevent="">
      <input
        type="text"
        class="m-0 -my-3 w-full border-none p-0 focus:ring-0"
        v-model="iValue"
        @vue:mounted="doFocus"
        @focus="selected = true"
        @blur="onEditBlur"
      />
    </form>
    <span v-else :class="{ 'cursor-pointer': externalEdit }">{{ value }}&nbsp;</span>
  </div>
</template>
