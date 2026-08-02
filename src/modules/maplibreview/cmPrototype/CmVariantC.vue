<script setup lang="ts">
// PROTOTYPE — throwaway (#640). VARIANT C — "panel-first".
//
// Stance: the segregated control-measure section #639 decided *is* the primary
// surface, not an afterthought in the layer tree. A left panel holds the catalog
// (top) and the drawn measures (bottom); arming, selecting, editing, and property
// changes all happen there, in one place, with the row itself expanding to hold
// properties. The map carries almost no chrome — only a small inline progress
// badge on the armed catalog row, so the panel never loses the user's eye.
import { computed, ref } from "vue";
import type { ControlMeasureKind } from "@orbat-mapper/control-measures";
import {
  IconChevronDown,
  IconChevronRight,
  IconTrashCanOutline as DeleteIcon,
  IconUndoVariant as UndoIcon,
  IconRedoVariant as RedoIcon,
} from "@iconify-prerendered/vue-mdi";
import { Input } from "@/components/ui/input";
import { DRAWABLE, IDENTITIES, type CmPrototype } from "./useCmPrototype";
import CmPreviewSwatch from "./CmPreviewSwatch.vue";

const props = defineProps<{ cm: CmPrototype }>();

const search = ref("");
const catalogOpen = ref(true);
const expandedId = ref<string | null>(null);

const results = computed(() => {
  const q = search.value.trim().toLowerCase();
  const list = q
    ? DRAWABLE.filter((m) =>
        `${m.name} ${m.entity} ${m.entityType}`.toLowerCase().includes(q),
      )
    : DRAWABLE;
  return list.slice(0, 200);
});

const metaOf = (kind: string) => DRAWABLE.find((m) => m.id === kind);

function rowClick(id: string) {
  props.cm.select(id);
  expandedId.value = expandedId.value === id ? null : id;
}

const drawProgress = computed(() => {
  const { drawPoints: n, drawMin, drawMax } = props.cm;
  return { n: n.value, min: drawMin.value, max: drawMax.value };
});
</script>

<template>
  <aside
    class="bg-background border-border pointer-events-auto absolute top-0 bottom-0 left-0 flex w-80 flex-col border-r"
  >
    <header class="border-border border-b px-3 py-2">
      <h2 class="text-sm font-semibold">Control measures</h2>
      <p class="text-muted-foreground text-[11px]">
        {{ cm.graphics.value.length }} on this scenario
      </p>
    </header>

    <!-- Catalog: flat searchable rows, click to arm. -->
    <section
      class="border-border flex min-h-0 flex-col border-b"
      :class="catalogOpen ? 'grow' : ''"
    >
      <button
        class="text-muted-foreground flex w-full items-center gap-1 px-3 py-1.5 text-[11px] font-semibold uppercase"
        @click="catalogOpen = !catalogOpen"
      >
        <component
          :is="catalogOpen ? IconChevronDown : IconChevronRight"
          class="size-3.5"
        />
        Catalog
        <span class="ml-auto tabular-nums">{{ DRAWABLE.length }}</span>
      </button>
      <template v-if="catalogOpen">
        <div class="px-2 pb-2">
          <Input v-model="search" placeholder="Search…" class="h-7 text-xs" />
        </div>
        <div class="min-h-0 grow overflow-y-auto px-1 pb-2">
          <button
            v-for="m in results"
            :key="m.id"
            type="button"
            :title="m.description"
            class="hover:bg-accent flex w-full items-center gap-2 rounded px-2 py-1 text-left"
            :class="cm.armedKind.value === m.id ? 'bg-primary/10 ring-ring ring-1' : ''"
            @click="cm.arm(m.id as ControlMeasureKind)"
          >
            <span class="flex h-5 w-8 shrink-0 items-center justify-center">
              <CmPreviewSwatch :measure="m" />
            </span>
            <span class="truncate text-xs">{{ m.name }}</span>

            <!-- Progress rides on the armed row itself — no map chrome. -->
            <span
              v-if="cm.armedKind.value === m.id"
              class="text-primary ml-auto shrink-0 font-mono text-[10px] tabular-nums"
            >
              {{ drawProgress.n }}/{{ drawProgress.min
              }}<template v-if="drawProgress.max && drawProgress.max !== drawProgress.min"
                >–{{ drawProgress.max }}</template
              >
              <span v-if="cm.drawCanCommit.value"> ↵</span>
            </span>
          </button>
        </div>
      </template>
    </section>

    <!-- Drawn measures: rows expand in place to hold properties. -->
    <section class="flex min-h-0 shrink-0 grow flex-col">
      <div class="text-muted-foreground px-3 py-1.5 text-[11px] font-semibold uppercase">
        On the map
      </div>
      <div class="min-h-0 grow overflow-y-auto px-1 pb-2">
        <p
          v-if="!cm.graphics.value.length"
          class="text-muted-foreground px-2 py-4 text-center text-xs"
        >
          Pick a measure above to draw one.
        </p>
        <div v-for="g in cm.graphics.value" :key="g.id" class="mb-0.5">
          <div
            class="hover:bg-accent flex w-full items-center gap-2 rounded px-2 py-1"
            :class="cm.selectedId.value === g.id ? 'bg-accent' : ''"
          >
            <button
              type="button"
              class="flex min-w-0 grow items-center gap-2 text-left"
              @click="rowClick(g.id)"
            >
              <span
                class="size-2.5 shrink-0 rounded-sm"
                :style="{ background: (g.style as { color?: string })?.color ?? '#000' }"
              />
              <span class="truncate text-xs">{{ metaOf(g.kind)?.name ?? g.kind }}</span>
              <span
                v-if="cm.editing.value?.id === g.id"
                class="text-primary shrink-0 font-mono text-[9px] uppercase"
                >editing</span
              >
            </button>
            <button
              class="text-muted-foreground hover:text-foreground shrink-0"
              title="Delete"
              @click="cm.remove(g.id)"
            >
              <DeleteIcon class="size-3.5" />
            </button>
          </div>

          <!-- Inline properties, in the panel, no separate details surface. -->
          <div
            v-if="expandedId === g.id"
            class="border-border/60 mx-2 mb-2 border-l pl-3"
          >
            <div class="flex items-center gap-1 py-2">
              <button
                v-if="cm.editing.value?.id !== g.id"
                class="border-border rounded border px-2 py-0.5 text-[11px]"
                @click="cm.startEdit(g.id)"
              >
                Edit shape
              </button>
              <template v-else>
                <button
                  class="border-border rounded border p-1 disabled:opacity-30"
                  :disabled="!cm.editHistory.value.canUndo"
                  :title="cm.editHistory.value.undoLabel ?? 'Undo'"
                  @click="cm.undo()"
                >
                  <UndoIcon class="size-3.5" />
                </button>
                <button
                  class="border-border rounded border p-1 disabled:opacity-30"
                  :disabled="!cm.editHistory.value.canRedo"
                  title="Redo"
                  @click="cm.redo()"
                >
                  <RedoIcon class="size-3.5" />
                </button>
                <button
                  class="bg-primary text-primary-foreground ml-auto rounded px-2 py-0.5 text-[11px]"
                  @click="cm.closeEdit()"
                >
                  Done
                </button>
              </template>
            </div>

            <label class="text-muted-foreground mb-1 block text-[10px] uppercase"
              >Identity</label
            >
            <div class="mb-2 flex gap-1">
              <button
                v-for="i in IDENTITIES"
                :key="i.sid"
                type="button"
                :title="i.label"
                class="h-5 grow rounded border-2"
                :style="{ background: i.color }"
                :class="
                  cm.activeProperties.value.standardIdentity === i.sid
                    ? 'border-foreground'
                    : 'border-transparent'
                "
                @click="cm.setProperty('standardIdentity', i.sid)"
              />
            </div>

            <label class="text-muted-foreground mb-1 block text-[10px] uppercase"
              >Status</label
            >
            <div class="mb-2 flex gap-1">
              <button
                v-for="s in [
                  { v: '0', l: 'Present' },
                  { v: '1', l: 'Planned' },
                ]"
                :key="s.v"
                type="button"
                class="grow rounded border px-2 py-0.5 text-[11px]"
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

            <label class="flex items-center gap-2 pb-2 text-[11px]">
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

            <p class="text-muted-foreground pb-2 font-mono text-[10px]">
              {{ g.controlPoints.length }} control points
            </p>
          </div>
        </div>
      </div>
    </section>

    <footer
      v-if="cm.mode.value !== 'idle'"
      class="border-border text-muted-foreground border-t px-3 py-2 text-[11px]"
    >
      <template v-if="cm.mode.value === 'drawing'">
        Click on the map to place points · ↵ finish · Esc cancel
      </template>
      <template v-else>
        Drag handles on the map · Ctrl+Z undoes within this edit
      </template>
    </footer>
  </aside>
</template>
