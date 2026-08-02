<script setup lang="ts">
// PROTOTYPE — throwaway (#640). VARIANT A — "tactrace port".
//
// Stance: control measures are their own tool with their own chrome. A dedicated
// sub-toolbar carries one CM button that opens a popover catalog (family chips +
// preview grid), and a floating quick-properties dock hovers over the map for the
// whole life of a session — draw progress, in-session undo, symbology, all in one
// place, never in the details panel.
import { computed, ref } from "vue";
import type { ControlMeasureKind } from "@orbat-mapper/control-measures";
import {
  IconUndoVariant as UndoIcon,
  IconRedoVariant as RedoIcon,
  IconVectorPolyline as CmIcon,
  IconCheck as CheckIcon,
  IconClose as CloseIcon,
  IconSquareEditOutline as EditIcon,
  IconTrashCanOutline as DeleteIcon,
} from "@iconify-prerendered/vue-mdi";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import FloatingPanel from "@/components/FloatingPanel.vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import CmPreviewSwatch from "./CmPreviewSwatch.vue";
import { BY_ENTITY, DRAWABLE, IDENTITIES, type CmPrototype } from "./useCmPrototype";

const props = defineProps<{ cm: CmPrototype }>();

const open = ref(false);
const search = ref("");
const family = ref("all");

const FAMILIES = [
  { id: "all", label: "All", match: () => true },
  { id: "maneuver", label: "Maneuver", match: (e: string) => e.startsWith("Maneuver") },
  {
    id: "protection",
    label: "Protection",
    match: (e: string) => e.startsWith("Protection"),
  },
  { id: "tasks", label: "Tasks", match: (e: string) => e === "Mission Tasks" },
  { id: "graphics", label: "Graphics", match: (e: string) => e === "Generic Graphics" },
  { id: "c2", label: "C2", match: (e: string) => e.startsWith("Command and Control") },
];

const groups = computed(() => {
  const f = FAMILIES.find((x) => x.id === family.value)!;
  const q = search.value.trim().toLowerCase();
  return BY_ENTITY.filter((g) => f.match(g.entity))
    .map((g) => ({
      entity: g.entity,
      items: q
        ? g.items.filter((m) => `${m.name} ${m.entityType}`.toLowerCase().includes(q))
        : g.items,
    }))
    .filter((g) => g.items.length);
});

const armedMeta = computed(() =>
  DRAWABLE.find((m) => m.id === (props.cm.armedKind.value as string | null)),
);
const editingMeta = computed(() =>
  DRAWABLE.find((m) => m.id === (props.cm.editing.value?.kind as string | undefined)),
);

function pick(kind: ControlMeasureKind) {
  open.value = false;
  props.cm.arm(kind);
}

const pointHint = computed(() => {
  const { drawPoints, drawMin, drawMax } = props.cm;
  const n = drawPoints.value;
  if (drawMax.value && drawMax.value === drawMin.value)
    return `${n} of ${drawMin.value} points`;
  if (n < drawMin.value)
    return `${n} of ${drawMin.value} points — ${drawMin.value - n} more`;
  return drawMax.value
    ? `${n} points (max ${drawMax.value})`
    : `${n} points — ↵ to finish`;
});
</script>

<template>
  <!-- Own sub-toolbar, sitting where MapEditorDrawToolbar sits. -->
  <FloatingPanel
    class="pointer-events-auto absolute bottom-28 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-md p-1"
  >
    <p class="text-muted-foreground hidden px-2 text-sm font-medium sm:block">
      Control measures
    </p>
    <div class="border-border mx-1 h-5 border-l" />
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <MainToolbarButton
          title="Pick a control measure"
          :active="open || !!cm.armedKind.value"
        >
          <CmIcon class="size-5" />
        </MainToolbarButton>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" class="w-[420px] p-0">
        <div class="border-border border-b p-2">
          <Input v-model="search" placeholder="Search control measures…" class="h-8" />
          <div class="mt-2 flex flex-wrap gap-1">
            <button
              v-for="f in FAMILIES"
              :key="f.id"
              type="button"
              class="rounded-full border px-2.5 py-0.5 font-mono text-[11px]"
              :class="
                family === f.id
                  ? 'border-ring bg-primary/10 text-foreground'
                  : 'text-muted-foreground border-transparent'
              "
              @click="family = f.id"
            >
              {{ f.label }}
            </button>
          </div>
        </div>
        <div class="max-h-[360px] overflow-y-auto p-1">
          <div v-for="g in groups" :key="g.entity">
            <div
              class="bg-popover text-muted-foreground sticky top-0 z-10 px-1.5 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase"
            >
              {{ g.entity }}
            </div>
            <div class="grid grid-cols-2 gap-1.5 pb-2">
              <button
                v-for="m in g.items"
                :key="m.id"
                type="button"
                :title="m.description"
                class="border-border/70 hover:border-ring hover:bg-primary/5 overflow-hidden rounded-md border text-left"
                @click="pick(m.id as ControlMeasureKind)"
              >
                <div class="flex h-[80px] items-center justify-center px-2">
                  <CmPreviewSwatch :measure="m" />
                </div>
                <div
                  class="border-border/60 flex items-center justify-between border-t px-2 py-1.5"
                >
                  <span class="truncate text-xs">{{ m.name }}</span>
                  <span
                    class="text-muted-foreground/70 ml-1 font-mono text-[8px] uppercase"
                    >{{ m.geometry }}</span
                  >
                </div>
              </button>
            </div>
          </div>
          <p v-if="!groups.length" class="text-muted-foreground py-8 text-center text-sm">
            No control measures found.
          </p>
        </div>
      </PopoverContent>
    </Popover>
    <div class="border-border mx-1 h-5 border-l" />
    <MainToolbarButton
      title="Edit selected"
      :disabled="!cm.selected.value || cm.mode.value !== 'idle'"
      @click="cm.selected.value && cm.startEdit(cm.selected.value.id)"
    >
      <EditIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Delete selected"
      :disabled="!cm.selected.value"
      @click="cm.selected.value && cm.remove(cm.selected.value.id)"
    >
      <DeleteIcon class="size-5" />
    </MainToolbarButton>
    <span class="text-muted-foreground px-2 text-xs tabular-nums"
      >{{ cm.graphics.value.length }} drawn</span
    >
  </FloatingPanel>

  <!-- Floating quick-properties dock — the whole session lives here. -->
  <FloatingPanel
    v-if="cm.mode.value !== 'idle'"
    class="pointer-events-auto absolute top-16 left-1/2 w-[420px] -translate-x-1/2 rounded-lg p-0"
  >
    <header class="border-border flex items-center gap-2 border-b px-3 py-2">
      <span class="text-sm font-semibold">
        {{ cm.mode.value === "drawing" ? armedMeta?.name : editingMeta?.name }}
      </span>
      <span class="text-muted-foreground font-mono text-[10px] uppercase">{{
        cm.mode.value
      }}</span>
      <span class="grow" />
      <template v-if="cm.mode.value === 'editing'">
        <button
          class="disabled:opacity-30"
          :disabled="!cm.editHistory.value.canUndo"
          :title="cm.editHistory.value.undoLabel ?? 'Undo'"
          @click="cm.undo()"
        >
          <UndoIcon class="size-4" />
        </button>
        <button
          class="disabled:opacity-30"
          :disabled="!cm.editHistory.value.canRedo"
          title="Redo"
          @click="cm.redo()"
        >
          <RedoIcon class="size-4" />
        </button>
      </template>
      <button title="Cancel (Esc)" @click="cm.cancel()">
        <CloseIcon class="size-4" />
      </button>
    </header>

    <div class="flex items-center gap-3 px-3 py-2">
      <template v-if="cm.mode.value === 'drawing'">
        <div class="flex gap-1">
          <span
            v-for="i in Math.max(cm.drawMin.value, cm.drawPoints.value)"
            :key="i"
            class="size-2 rounded-full"
            :class="i <= cm.drawPoints.value ? 'bg-primary' : 'bg-muted-foreground/30'"
          />
        </div>
        <span class="text-muted-foreground text-xs">{{ pointHint }}</span>
        <span class="grow" />
        <button
          class="bg-primary text-primary-foreground flex items-center gap-1 rounded px-2 py-1 text-xs disabled:opacity-40"
          :disabled="!cm.drawCanCommit.value"
          @click="cm.commitDraw()"
        >
          <CheckIcon class="size-3.5" /> Finish ↵
        </button>
      </template>
      <template v-else>
        <span class="text-muted-foreground text-xs">
          Drag vertices or the transform box. Ctrl+Z undoes within this edit.
        </span>
        <span class="grow" />
        <button
          class="bg-primary text-primary-foreground rounded px-2 py-1 text-xs"
          @click="cm.closeEdit()"
        >
          Done
        </button>
      </template>
    </div>

    <div class="border-border flex items-center gap-4 border-t px-3 py-2">
      <div class="flex items-center gap-1">
        <button
          v-for="i in IDENTITIES"
          :key="i.sid"
          type="button"
          :title="i.label"
          class="size-5 rounded border-2"
          :style="{ background: i.color }"
          :class="
            cm.activeProperties.value.standardIdentity === i.sid
              ? 'border-foreground'
              : 'border-transparent'
          "
          @click="cm.setProperty('standardIdentity', i.sid)"
        />
      </div>
      <div class="border-border h-5 border-l" />
      <div class="flex gap-1">
        <button
          v-for="s in [
            { v: '0', l: 'Present' },
            { v: '1', l: 'Planned' },
          ]"
          :key="s.v"
          type="button"
          class="rounded border px-2 py-0.5 text-[11px]"
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
      <div class="border-border h-5 border-l" />
      <button
        type="button"
        class="rounded border px-2 py-0.5 text-[11px]"
        :class="
          cm.activeProperties.value.colorMode === 'monochrome'
            ? 'border-ring bg-primary/10'
            : 'border-border text-muted-foreground'
        "
        @click="
          cm.setProperty(
            'colorMode',
            cm.activeProperties.value.colorMode === 'monochrome'
              ? 'identity'
              : 'monochrome',
          )
        "
      >
        Monochrome
      </button>
    </div>
  </FloatingPanel>
</template>
