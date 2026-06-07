<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Sidc } from "@/symbology/sidc";
import { useClipboard, useToggle } from "@vueuse/core";
import IconButton from "@/components/IconButton.vue";
import {
  IconCheck,
  IconClipboardTextMultiple as CopyIcon,
  IconClose,
  IconPencil as EditIcon,
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

// Field segmentation per MIL-STD-2525E Appendix A. The SIDC splits into three
// sets of ten positions (A: structure/identity, B: icon/sector modifiers,
// C: operational metadata); `set` drives the visual A | B | C dividers.
const parts = computed(() => {
  const s = new Sidc(props.sidc);
  const sidc = s.toString();
  const setAB = [
    // Set A — structural properties, identity & standard context (pos 1–10)
    { key: "version", activeKey: "start", value: sidc.substring(0, 2), label: "Ver", title: "Version (edition of the standard)", set: "A" },
    { key: "stdId", activeKey: "start", value: sidc.substring(2, 4), label: "ID", title: "Standard identity — context & affiliation", set: "A" },
    { key: "symbolSet", activeKey: "symbolSet", value: sidc.substring(4, 6), label: "Set", title: "Symbol set (operational domain)", set: "A" },
    { key: "status", activeKey: "status", value: sidc.substring(6, 7), label: "St", title: "Status / operational condition", set: "A" },
    { key: "hqtfd", activeKey: "hqtfd", value: sidc.substring(7, 8), label: "HQ", title: "HQ / Task force / Dummy", set: "A" },
    { key: "amp", activeKey: "amp", value: sidc.substring(8, 10), label: "Amp", title: "Amplifying descriptor — echelon / mobility / towed array", set: "A" },
    // Set B — military function hierarchy & sector modifiers (pos 11–20)
    { key: "mainIcon", activeKey: "mainIcon", value: sidc.substring(10, 16), label: "Icon", title: "Main icon — entity / type / subtype hierarchy", set: "B" },
    { key: "mod1", activeKey: "mod1", value: sidc.substring(16, 18), label: "M1", title: "Sector 1 modifier", set: "B" },
    { key: "mod2", activeKey: "mod2", value: sidc.substring(18, 20), label: "M2", title: "Sector 2 modifier", set: "B" },
  ];
  if (!s.isExtended) return setAB;
  return [
    ...setAB,
    // Set C — operational metadata, frame geometry & nationality (pos 21–30)
    { key: "mod1Common", activeKey: "mod1", value: sidc.substring(20, 21), label: "C1", title: "Sector 1 common modifier identifier", set: "C" },
    { key: "mod2Common", activeKey: "mod2", value: sidc.substring(21, 22), label: "C2", title: "Sector 2 common modifier identifier", set: "C" },
    { key: "frame", activeKey: "frame", value: sidc.substring(22, 23), label: "Frame", title: "Frame shape identifier", set: "C" },
    { key: "reserved", activeKey: "reserved", value: sidc.substring(23, 27), label: "Rsvd", title: "Reserved for future use", set: "C" },
    { key: "nationality", activeKey: "nationality", value: sidc.substring(27, 30), label: "Nat", title: "Nationality — GENC country code", set: "C" },
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
  <div class="flex min-w-0 items-center gap-1">
    <template v-if="!isEditMode">
      <div
        class="no-scrollbar border-border/70 bg-muted/40 flex min-w-0 flex-1 items-stretch gap-px overflow-x-auto rounded-md border p-1"
      >
        <template
          v-for="(part, index) in parts"
          :key="part.key"
        >
          <div
            v-if="index > 0 && part.set !== parts[index - 1].set"
            class="bg-border/80 mx-0.5 w-px self-stretch"
            aria-hidden="true"
          />
          <div
            :title="`Set ${part.set} · ${part.title}`"
            :class="[
              'flex flex-col items-center rounded-[3px] px-1.5 py-0.5 transition-colors',
              activePart === part.activeKey
                ? 'bg-amber-200 text-amber-950 ring-1 ring-amber-400 dark:bg-amber-400/20 dark:text-amber-200 dark:ring-amber-400/40'
                : 'hover:bg-foreground/5',
            ]"
          >
            <span class="font-mono text-sm leading-tight tracking-tight tabular-nums">{{
              part.value
            }}</span>
            <span
              class="text-muted-foreground mt-0.5 text-[9px] leading-none font-medium tracking-wide uppercase"
              :class="
                activePart === part.activeKey ? 'text-amber-900 dark:text-amber-300' : ''
              "
              >{{ part.label }}</span
            >
          </div>
        </template>
      </div>
      <IconButton class="shrink-0" @click="toggleEditMode()" title="Edit symbol code">
        <EditIcon class="h-5 w-5" />
      </IconButton>
      <IconButton class="shrink-0" @click="onCopy()" title="Copy symbol code">
        <CopyIcon class="h-5 w-5" />
      </IconButton>
    </template>
    <template v-else>
      <form @submit.prevent="onSubmit" class="ml-2 flex items-end">
        <InputGroup label="Symbol code" v-model="newSidc" autofocus class="font-mono" />
        <IconButton type="submit" class="ml-1" title="Apply">
          <IconCheck class="h-5 w-5" />
        </IconButton>
        <IconButton type="submit" @click="toggleEditMode()" title="Cancel">
          <IconClose class="h-5 w-5" />
        </IconButton>
      </form>
    </template>
  </div>
</template>
