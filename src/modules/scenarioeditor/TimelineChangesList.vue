<script setup lang="ts">
import { computed, nextTick, ref, watch, type ComponentPublicInstance } from "vue";
import { CrosshairIcon } from "@lucide/vue";
import { useVirtualizer } from "@tanstack/vue-virtual";
import { storeToRefs } from "pinia";
import { useActiveScenario } from "@/composables/scenarioUtils";
import GridHeaderResizeHandle from "@/modules/grid/GridHeaderResizeHandle.vue";
import {
  timelineChangesColumnLabels,
  useTimelineChangesStore,
  type TimelineChangesResizableColumn,
} from "@/stores/timelineChangesStore";
import type { NScenarioEvent } from "@/types/internalModels";
import TimelineChangeEntity from "./TimelineChangeEntity.vue";
import { changeKindDotClasses, changeKindLabels } from "./timelineChangeFormat";
import {
  atStart,
  findChangeIndex,
  isUnderWay,
  type TimelineChange,
} from "./timelineChanges";
import { DATE_TIME_PATTERN, useTimelineChangeNames } from "./useTimelineChanges";

const props = defineProps<{
  changes: TimelineChange[];
  /** Scenario events, oldest first, listed among the changes. */
  events?: NScenarioEvent[];
  now: number;
  /** A time range to mark and scroll to, such as the timeline bin the list is centred
   * on. */
  highlight?: [number, number] | null;
}>();
const emit = defineEmits<{
  select: [change: TimelineChange];
  jump: [change: TimelineChange];
  go: [change: TimelineChange];
  selectEvent: [event: NScenarioEvent];
  jumpEvent: [event: NScenarioEvent];
  goEvent: [event: NScenarioEvent];
}>();

const ROW_HEIGHT = 25;
const ACTIONS_WIDTH = 40;
/** Room kept for "What changed", which takes what the other columns leave. */
const MIN_CHANGES_WIDTH = 200;

const resizableColumns: {
  key: TimelineChangesResizableColumn;
  label: string;
  class: string;
}[] = [
  { key: "time", label: timelineChangesColumnLabels.time, class: "px-3" },
  { key: "unit", label: timelineChangesColumnLabels.unit, class: "px-2" },
  { key: "side", label: timelineChangesColumnLabels.side, class: "px-2" },
];

const { time } = useActiveScenario();
const { sideName, details, formatTime } = useTimelineChangeNames();
const changesStore = useTimelineChangesStore();
const { listColumns: shown, columnWidths } = storeToRefs(changesStore);

const columns = computed(() => resizableColumns.filter(({ key }) => shown.value[key]));
/** Every column shown, actions included, for cells that span the table. */
const columnCount = computed(() => columns.value.length + (shown.value.changes ? 2 : 1));
/** Changes when columns are shown or hidden, so memoized rows are redrawn. */
const columnsKey = computed(() => JSON.stringify(shown.value));

// Fixed layout, so column widths don't follow the rows that happen to be rendered.
// Wide columns scroll the table sideways rather than squeezing "What changed" away.
const tableMinWidth = computed(
  () =>
    columns.value.reduce((sum, { key }) => sum + columnWidths.value[key], 0) +
    (shown.value.changes ? MIN_CHANGES_WIDTH : 0) +
    ACTIONS_WIDTH,
);

/** A row of the list: a change or a scenario event. */
type ListItem =
  | { t: number; key: string; change: TimelineChange; event?: undefined }
  | { t: number; key: string; event: NScenarioEvent; change?: undefined };

/** Changes and events in time order. An event comes before changes at the same time. */
const items = computed(() => {
  const { changes, events = [] } = props;
  const out: ListItem[] = [];
  let i = 0;
  for (const event of events) {
    while (i < changes.length && changes[i].t < event.startTime) {
      out.push({ t: changes[i].t, key: changes[i].id, change: changes[i++] });
    }
    out.push({ t: event.startTime, key: `event:${event.id}`, event });
  }
  for (; i < changes.length; i++) {
    out.push({ t: changes[i].t, key: changes[i].id, change: changes[i] });
  }
  return out;
});

/** Where the divider at the current time goes. */
const nowIndex = computed(() => findChangeIndex(items.value, props.now, true));
/** The item in a row of the list, or undefined for the divider at the current time. */
function itemAt(row: number): ListItem | undefined {
  const i = nowIndex.value;
  if (row < i) return items.value[row];
  return row === i ? undefined : items.value[row - 1];
}

// Only the rows in view are rendered. Rows can wrap, so each is measured.
const scrollEl = ref<HTMLElement | null>(null);
const virtualizer = useVirtualizer(
  computed(() => ({
    count: items.value.length + 1,
    getScrollElement: () => scrollEl.value,
    estimateSize: () => ROW_HEIGHT,
    getItemKey: (i: number) => itemAt(i)?.key ?? "now",
    overscan: 10,
  })),
);
const visibleRows = computed(() =>
  virtualizer.value.getVirtualItems().map(({ index, start, end }) => {
    const item = itemAt(index);
    const change = item?.change;
    // Whether the item is before, at or after the current time, which styles its row.
    const phase = item ? Math.sign(item.t - props.now) : 0;
    // Read here rather than cached with the row text: a timed transfer moves a unit to
    // another side without changing the list.
    const side = change && shown.value.side ? sideName(change) : "";
    const [from, to] = props.highlight ?? [0, 0];
    const highlighted = !!item && item.t >= from && item.t < to;
    return {
      index,
      start,
      end,
      key: item?.key ?? "now",
      item,
      change,
      event: item?.event,
      phase,
      side,
      highlighted,
    };
  }),
);
// Brings the highlighted range into view when it is set or moves, and the divider at the
// current time when there is none. Waits a tick: on mount the virtualizer only picks up
// its scroll element after this runs, and scrolling before that does nothing.
watch(
  () => props.highlight,
  async (highlight) => {
    await nextTick();
    let row = nowIndex.value;
    if (highlight) {
      const i = findChangeIndex(items.value, highlight[0]);
      row = i < nowIndex.value ? i : i + 1;
    }
    virtualizer.value.scrollToIndex(row, { align: "center" });
  },
  { immediate: true, flush: "post" },
);
const padding = computed(() => {
  const rows = visibleRows.value;
  if (!rows.length) return { top: 0, bottom: 0 };
  return {
    top: rows[0].start,
    bottom: virtualizer.value.getTotalSize() - rows[rows.length - 1].end,
  };
});
function measureRow(el: Element | ComponentPublicInstance | null) {
  if (el instanceof Element) virtualizer.value.measureElement(el);
}

interface RowText {
  time: string;
  details: string[];
}

// Row text, formatted as rows come into view. Starts over when the changes or the time
// zone change.
const rowTextCache = computed(() => {
  void props.changes;
  void props.events;
  void time.timeZone.value;
  return new Map<string, RowText>();
});
function rowText({ key, t, change }: ListItem): RowText {
  let text = rowTextCache.value.get(key);
  if (!text) {
    text = {
      time: formatTime(change ? atStart(change).t : t, DATE_TIME_PATTERN),
      details: change ? details(change, DATE_TIME_PATTERN) : [],
    };
    rowTextCache.value.set(key, text);
  }
  return text;
}
</script>

<template>
  <div ref="scrollEl" class="min-h-0 flex-1 overflow-y-auto">
    <table class="w-full table-fixed text-xs" :style="{ minWidth: `${tableMinWidth}px` }">
      <colgroup>
        <col
          v-for="{ key } in columns"
          :key="key"
          :style="{ width: `${columnWidths[key]}px` }"
        />
        <col v-if="shown.changes" />
        <col :style="{ width: `${ACTIONS_WIDTH}px` }" />
      </colgroup>
      <thead class="bg-muted text-muted-foreground sticky top-0 z-10 text-left">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            class="relative py-1 font-medium"
            :class="column.class"
          >
            {{ column.label }}
            <GridHeaderResizeHandle
              :width="columnWidths[column.key]"
              :aria-label="`Resize ${column.label} column`"
              @update="changesStore.resizeColumn(column.key, $event)"
            />
          </th>
          <th v-if="shown.changes" class="px-2 py-1 font-medium">
            {{ timelineChangesColumnLabels.changes }}
          </th>
          <th><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="padding.top" aria-hidden="true" :style="{ height: `${padding.top}px` }">
          <td :colspan="columnCount" class="p-0" />
        </tr>
        <tr
          v-for="row in visibleRows"
          :key="row.key"
          v-memo="[
            row.index,
            row.item,
            row.phase,
            row.side,
            row.highlighted,
            time.timeZone.value,
            columnsKey,
          ]"
          :ref="measureRow"
          :data-index="row.index"
          :aria-hidden="row.item ? undefined : 'true'"
          :class="
            row.item && [
              'group hover:bg-accent/60 cursor-pointer border-b',
              row.phase === 0 ? 'bg-primary/10' : row.phase > 0 ? 'opacity-60' : '',
              row.highlighted && 'shadow-[inset_3px_0_0_var(--color-amber-400)]',
              row.highlighted && row.phase !== 0 && 'bg-amber-400/15',
            ]
          "
          :title="row.item ? `Go to ${rowText(row.item).time}` : undefined"
          @click="
            row.change
              ? emit('jump', atStart(row.change))
              : row.event && emit('jumpEvent', row.event)
          "
        >
          <td v-if="!row.item" :colspan="columnCount" class="p-0">
            <div class="flex items-center gap-2 px-3 text-[10px] text-red-700">
              <div class="h-px flex-1 bg-red-700/60" />
              now
              <div class="h-px flex-1 bg-red-700/60" />
            </div>
          </td>
          <template v-else-if="row.event">
            <td v-if="shown.time" class="px-3 py-1 whitespace-nowrap tabular-nums">
              {{ rowText(row.item).time }}
            </td>
            <td :colspan="columnCount - (shown.time ? 2 : 1)" class="max-w-0 px-2 py-1">
              <span class="flex items-center gap-1.5">
                <span
                  class="size-2.5 flex-none rounded-full border border-gray-500 bg-amber-500"
                  aria-hidden="true"
                />
                <button
                  type="button"
                  class="truncate font-medium hover:underline"
                  title="Show event details"
                  @click.stop="emit('selectEvent', row.event!)"
                >
                  {{ row.event.title }}
                </button>
                <span v-if="row.event.subTitle" class="text-muted-foreground truncate">
                  {{ row.event.subTitle }}
                </span>
              </span>
            </td>
            <td class="px-1">
              <button
                type="button"
                class="hover:bg-accent rounded p-0.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                title="Go to event"
                @click.stop="emit('goEvent', row.event!)"
              >
                <CrosshairIcon class="size-3.5" />
              </button>
            </td>
          </template>
          <template v-else-if="row.change">
            <td
              v-if="shown.time"
              class="px-3 py-1 whitespace-nowrap tabular-nums"
              :class="isUnderWay(row.change) && 'text-muted-foreground'"
              :title="
                isUnderWay(row.change) ? 'Under way before this time range' : undefined
              "
            >
              {{ rowText(row.item).time }}
            </td>
            <td v-if="shown.unit" class="max-w-0 px-2 py-1">
              <button
                type="button"
                class="flex max-w-full items-center hover:underline"
                @click.stop="emit('select', row.change!)"
              >
                <TimelineChangeEntity
                  :entity-type="row.change.entityType"
                  :entity-id="row.change.entityId"
                />
              </button>
            </td>
            <td v-if="shown.side" class="text-muted-foreground truncate px-2 py-1">
              {{ row.side }}
            </td>
            <td v-if="shown.changes" class="px-2 py-1">
              <span class="flex flex-wrap items-center gap-1">
                <span
                  v-for="kind in row.change.kinds"
                  :key="kind"
                  class="inline-flex items-center gap-1 rounded-full border px-1.5"
                >
                  <span
                    class="size-1.5 rounded-full"
                    :class="changeKindDotClasses[kind]"
                  />
                  {{ changeKindLabels[kind] }}
                </span>
                <span
                  v-if="isUnderWay(row.change)"
                  class="bg-muted text-muted-foreground rounded px-1.5"
                  title="Set off before this time range"
                  >under way</span
                >
                <span v-if="row.change.title" class="text-muted-foreground italic">
                  “{{ row.change.title }}”
                </span>
                <span
                  v-for="detail in rowText(row.item).details"
                  :key="detail"
                  class="text-muted-foreground"
                  >{{ detail }}</span
                >
              </span>
            </td>
            <td class="px-1">
              <button
                type="button"
                class="hover:bg-accent rounded p-0.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                title="Go to time, select and zoom"
                @click.stop="emit('go', atStart(row.change!))"
              >
                <CrosshairIcon class="size-3.5" />
              </button>
            </td>
          </template>
        </tr>
        <tr
          v-if="padding.bottom"
          aria-hidden="true"
          :style="{ height: `${padding.bottom}px` }"
        >
          <td :colspan="columnCount" class="p-0" />
        </tr>
      </tbody>
    </table>
    <!-- After the rows, such as what to show when there are none. -->
    <slot />
  </div>
</template>
