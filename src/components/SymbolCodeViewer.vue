<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Sidc } from "@/symbology/sidc";
import { useClipboard, useToggle } from "@vueuse/core";
import IconButton from "@/components/IconButton.vue";
import {
  IconPencil as EditIcon,
  IconCheck,
  IconClose,
  IconClipboardTextMultiple as CopyIcon,
} from "@iconify-prerendered/vue-mdi";
import InputGroup from "@/components/InputGroup.vue";
import { useNotifications } from "@/composables/notifications";

const props = defineProps<{ sidc: string; activePart?: string }>();
const emit = defineEmits(["update"]);

const { send } = useNotifications();
const { copy: copyToClipboard } = useClipboard();

const [isEditMode, toggleEditMode] = useToggle(false);
const newSidc = ref("");

watch(
  () => props.sidc,
  (value) => {
    newSidc.value = value;
  },
  { immediate: true },
);

const parts = computed(() => {
  const s = new Sidc(props.sidc);
  return [
    ["start", s.version + s.context + s.standardIdentity],
    ["symbolSet", s.symbolSet],
    ["status", s.status],
    ["hqtfd", s.hqtfd],
    ["amp", s.emt],
    ["mainIcon", s.mainIcon],
    ["mod1", s.modifierOne],
    ["mod2", s.modifierTwo],
  ];
});

function onSubmit() {
  emit("update", newSidc.value);
  newSidc.value = props.sidc;
  toggleEditMode();
}

async function onCopy() {
  await copyToClipboard(props.sidc);
  send({
    message: `Copied ${props.sidc} to the clipboard`,
  });
}
</script>
<template>
  <div class="flex items-center">
    <template v-if="!isEditMode">
      <div
        class="rounded border border-transparent p-1 font-mono text-base text-gray-700 hover:border-gray-200"
      >
        <span
          v-for="[key, part] in parts"
          :key="key"
          :class="['sm:px-0.5', activePart === key ? 'bg-yellow-300 text-red-800' : '']"
          >{{ part }}</span
        >
      </div>
      <IconButton @click="toggleEditMode()">
        <EditIcon class="h-5 w-5" />
      </IconButton>
      <IconButton @click="onCopy()">
        <CopyIcon class="h-5 w-5" />
      </IconButton>
    </template>
    <template v-else>
      <form @submit.prevent="onSubmit" class="ml-2 flex items-end">
        <InputGroup label="Symbol code" v-model="newSidc" autofocus />
        <IconButton type="submit" class="ml-1">
          <IconCheck class="h-5 w-5" />
        </IconButton>
        <IconButton type="submit" @click="toggleEditMode()">
          <IconClose class="h-5 w-5" />
        </IconButton>
      </form>
    </template>
  </div>
</template>
