<script setup lang="ts">
// PROTOTYPE — throwaway (#640). VARIANT B — "native orbat-mapper".
//
// Stance: control measures are not a new tool, they are more shapes. The existing
// Draw sub-toolbar grows a few pinned kinds plus a "More…" button that opens a
// command-palette-style dialog (the same reflex as ⌘K search). There is no floating
// dock: properties land in the right-hand details panel as extra sections, exactly
// where a selected feature's properties already go, and draw progress is a thin
// status strip along the bottom of the map — the place orbat-mapper already puts
// transient tool hints.
import { computed, ref, watch } from "vue";
import type { ControlMeasureKind } from "@orbat-mapper/control-measures";
import {
  IconDotsHorizontal as MoreIcon,
  IconSquareEditOutline as EditIcon,
  IconTrashCanOutline as DeleteIcon,
  IconUndoVariant as UndoIcon,
  IconRedoVariant as RedoIcon,
} from "@iconify-prerendered/vue-mdi";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import FloatingPanel from "@/components/FloatingPanel.vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import CmPreviewSwatch from "./CmPreviewSwatch.vue";
import { DRAWABLE, IDENTITIES, type CmPrototype } from "./useCmPrototype";

const props = defineProps<{ cm: CmPrototype }>();

/** A handful of pinned kinds live directly on the toolbar; everything else is behind "More…". */
const PINNED = [
  "boundary",
  "phase-line",
  "main-attack",
  "assembly-area",
  "objective-area",
];
const pinned = computed(() =>
  PINNED.map((id) => DRAWABLE.find((m) => m.id === id)).filter((m) => !!m),
);

const paletteOpen = ref(false);
const query = ref("");
const cursor = ref(0);

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  const list = q
    ? DRAWABLE.filter((m) =>
        `${m.name} ${m.entity} ${m.entityType}`.toLowerCase().includes(q),
      )
    : DRAWABLE;
  return list.slice(0, 60);
});

watch(query, () => (cursor.value = 0));
watch(paletteOpen, (v) => {
  if (v) query.value = "";
});

function pick(kind: ControlMeasureKind) {
  paletteOpen.value = false;
  props.cm.arm(kind);
}

function onPaletteKey(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    cursor.value = Math.min(cursor.value + 1, results.value.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    cursor.value = Math.max(cursor.value - 1, 0);
  } else if (e.key === "Enter") {
    e.preventDefault();
    const m = results.value[cursor.value];
    if (m) pick(m.id as ControlMeasureKind);
  }
}

const armedMeta = computed(() =>
  DRAWABLE.find((m) => m.id === (props.cm.armedKind.value as string | null)),
);
const panelTarget = computed(() => props.cm.editing.value ?? props.cm.selected.value);
const panelMeta = computed(() =>
  DRAWABLE.find((m) => m.id === (panelTarget.value?.kind as string | undefined)),
);

const drawHint = computed(() => {
  const { drawPoints: n, drawMin, drawMax } = props.cm;
  const need = drawMin.value - n.value;
  if (need > 0)
    return `Click ${need} more point${need === 1 ? "" : "s"} (${drawMin.value} required)`;
  if (drawMax.value && n.value >= drawMax.value)
    return "All points placed — press ↵ to finish";
  return "Press ↵ or double-click to finish";
});
</script>

<template>
  <!-- Extends the existing Draw sub-toolbar rather than adding a second one. -->
  <FloatingPanel
    class="pointer-events-auto absolute bottom-28 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-md p-1"
  >
    <p class="text-muted-foreground hidden px-2 text-sm font-medium sm:block">Draw</p>
    <div class="border-border mx-1 h-5 border-l" />
    <MainToolbarButton
      v-for="m in pinned"
      :key="m.id"
      :title="m.name"
      :active="cm.armedKind.value === m.id"
      @click="cm.arm(m.id as ControlMeasureKind)"
    >
      <span class="flex h-5 w-6 items-center justify-center">
        <CmPreviewSwatch :measure="m" />
      </span>
    </MainToolbarButton>
    <Dialog v-model:open="paletteOpen">
      <DialogTrigger as-child>
        <MainToolbarButton title="More control measures… (⌘K)">
          <MoreIcon class="size-5" />
        </MainToolbarButton>
      </DialogTrigger>
      <DialogContent class="max-w-[560px] gap-0 p-0">
        <DialogTitle class="sr-only">Pick a control measure</DialogTitle>
        <Input
          v-model="query"
          placeholder="Type a control measure…"
          class="h-11 rounded-b-none border-0 border-b text-base focus-visible:ring-0"
          @keydown="onPaletteKey"
        />
        <div class="max-h-[380px] overflow-y-auto p-1">
          <button
            v-for="(m, i) in results"
            :key="m.id"
            type="button"
            class="flex w-full items-center gap-3 rounded px-2 py-1.5 text-left"
            :class="i === cursor ? 'bg-accent' : ''"
            @mouseenter="cursor = i"
            @click="pick(m.id as ControlMeasureKind)"
          >
            <span class="flex h-6 w-10 shrink-0 items-center justify-center">
              <CmPreviewSwatch :measure="m" />
            </span>
            <span class="truncate text-sm">{{ m.name }}</span>
            <span class="text-muted-foreground ml-auto shrink-0 truncate text-[11px]">{{
              m.entity
            }}</span>
          </button>
          <p
            v-if="!results.length"
            class="text-muted-foreground py-8 text-center text-sm"
          >
            Nothing matches “{{ query }}”.
          </p>
        </div>
        <div
          class="border-border text-muted-foreground flex justify-between border-t px-3 py-2 font-mono text-[10px]"
        >
          <span>↑↓ navigate · ↵ draw</span>
          <span>{{ results.length }} of {{ DRAWABLE.length }}</span>
        </div>
      </DialogContent>
    </Dialog>
    <div class="border-border mx-1 h-5 border-l" />
    <MainToolbarButton
      title="Edit"
      :disabled="!cm.selected.value || cm.mode.value !== 'idle'"
      @click="cm.selected.value && cm.startEdit(cm.selected.value.id)"
    >
      <EditIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Delete"
      :disabled="!cm.selected.value"
      @click="cm.selected.value && cm.remove(cm.selected.value.id)"
    >
      <DeleteIcon class="size-5" />
    </MainToolbarButton>
  </FloatingPanel>

  <!-- Transient tool hint strip, bottom of the map. -->
  <div
    v-if="cm.mode.value === 'drawing'"
    class="bg-foreground text-background pointer-events-none absolute bottom-32 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full px-4 py-1.5 text-xs shadow-lg"
  >
    <span class="font-medium">{{ armedMeta?.name }}</span>
    <span class="opacity-50">|</span>
    <span class="tabular-nums"
      >{{ cm.drawPoints.value }}/{{ cm.drawMin.value
      }}<template v-if="cm.drawMax.value && cm.drawMax.value !== cm.drawMin.value"
        >–{{ cm.drawMax.value }}</template
      ></span
    >
    <span class="opacity-80">{{ drawHint }}</span>
    <span class="opacity-50">|</span>
    <span class="opacity-80">Esc cancels</span>
  </div>

  <!-- Properties as details-panel sections, on the right where feature properties live. -->
  <aside
    v-if="panelTarget"
    class="bg-background border-border pointer-events-auto absolute top-0 right-0 bottom-0 w-72 overflow-y-auto border-l"
  >
    <header class="border-border flex items-center gap-2 border-b px-3 py-2">
      <span class="truncate text-sm font-semibold">{{ panelMeta?.name }}</span>
      <span
        v-if="cm.mode.value === 'editing'"
        class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-[10px] uppercase"
        >editing</span
      >
      <span class="grow" />
      <button class="text-muted-foreground text-xs" @click="cm.cancel()">✕</button>
    </header>

    <section v-if="cm.mode.value === 'editing'" class="border-border border-b px-3 py-2">
      <div class="flex items-center gap-2">
        <button
          class="border-border rounded border p-1 disabled:opacity-30"
          :disabled="!cm.editHistory.value.canUndo"
          :title="cm.editHistory.value.undoLabel ?? 'Undo'"
          @click="cm.undo()"
        >
          <UndoIcon class="size-4" />
        </button>
        <button
          class="border-border rounded border p-1 disabled:opacity-30"
          :disabled="!cm.editHistory.value.canRedo"
          title="Redo"
          @click="cm.redo()"
        >
          <RedoIcon class="size-4" />
        </button>
        <span class="text-muted-foreground text-[11px]">Ctrl+Z within this edit</span>
        <button
          class="bg-primary text-primary-foreground ml-auto rounded px-2 py-1 text-xs"
          @click="cm.closeEdit()"
        >
          Done
        </button>
      </div>
    </section>

    <section class="border-border border-b px-3 py-3">
      <h3 class="text-muted-foreground mb-2 text-[11px] font-semibold uppercase">
        Symbology
      </h3>
      <label class="mb-1 block text-[11px]">Standard identity</label>
      <div class="mb-3 flex gap-1">
        <button
          v-for="i in IDENTITIES"
          :key="i.sid"
          type="button"
          :title="i.label"
          class="h-6 grow rounded border-2 text-[10px]"
          :style="{ background: i.color }"
          :class="
            cm.activeProperties.value.standardIdentity === i.sid
              ? 'border-foreground'
              : 'border-transparent'
          "
          @click="cm.setProperty('standardIdentity', i.sid)"
        />
      </div>
      <label class="mb-1 block text-[11px]">Status</label>
      <div class="flex gap-1">
        <button
          v-for="s in [
            { v: '0', l: 'Present' },
            { v: '1', l: 'Planned' },
          ]"
          :key="s.v"
          type="button"
          class="grow rounded border px-2 py-1 text-[11px]"
          :class="
            cm.activeProperties.value.status === s.v
              ? 'border-ring bg-primary/10'
              : 'border-border text-muted-foreground'
          "
          @click="cm.setProperty('status', s.v as '0' | '1')"
        >
          {{ s.l }}
        </button>
      </div>
    </section>

    <section class="border-border border-b px-3 py-3">
      <h3 class="text-muted-foreground mb-2 text-[11px] font-semibold uppercase">
        Appearance
      </h3>
      <label class="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          :checked="cm.activeProperties.value.colorMode === 'monochrome'"
          @change="
            cm.setProperty(
              'colorMode',
              cm.activeProperties.value.colorMode === 'monochrome'
                ? 'identity'
                : 'monochrome',
            )
          "
        />
        Monochrome
      </label>
    </section>

    <section class="px-3 py-3">
      <h3 class="text-muted-foreground mb-2 text-[11px] font-semibold uppercase">
        Geometry
      </h3>
      <p class="text-muted-foreground font-mono text-[11px]">
        {{ panelTarget.controlPoints.length }} control points
      </p>
      <button
        v-if="cm.mode.value === 'idle'"
        class="border-border mt-2 w-full rounded border px-2 py-1 text-xs"
        @click="cm.startEdit(panelTarget.id)"
      >
        Edit shape
      </button>
    </section>
  </aside>
</template>
