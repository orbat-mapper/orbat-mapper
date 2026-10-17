<script setup lang="ts">
import { computed, ref, type Component } from "vue";
import { storeToRefs } from "pinia";
import {
  ArrowUpToLine,
  Blend,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  EyeOff,
  ListX,
  ScanEye,
  X,
} from "@lucide/vue";
import { Button } from "@/components/ui/button";
import ObserverHeightIcon from "@/components/ObserverHeightIcon.vue";
import TargetHeightIcon from "@/components/TargetHeightIcon.vue";
import ReachIcon from "@/components/ReachIcon.vue";
import CellSizeIcon from "@/components/CellSizeIcon.vue";
import SnapGroundIcon from "@/components/SnapGroundIcon.vue";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Rgba } from "@/lib/terrain";
import { formatEyeHeight } from "@/geo/observerPin";
import {
  DEAD_GROUND_COLOR,
  MASKING_BANDS,
  SEEN_BY_BANDS,
  VIEWSHED_COLORS,
} from "@/geo/viewshedImage";
import {
  SNAP_AREA,
  useViewshedStore,
  VIEWSHED_DETAILS,
  VIEWSHED_RADIUS,
  type ViewshedSnap,
} from "@/stores/viewshedStore";

/**
 * The current Viewshed, ported from tactrace, floating at the foot of the map: placing observers,
 * what the image shows (visible ground, dead ground or the masking height map, with its legend),
 * whether a dragged observer snaps to high or low ground, and how much is visible. The settings
 * set once per observer (how high the eyes and the target are, how far to look, the detail, with several for all of them by default, and whether the
 * observer stands up as a pin) sit in a popover behind a button that sums them up, which keeps the
 * deck narrow. With several open, which observer it edits (stepping between them by number, or
 * picking one from a menu that also closes them all), and whether their coverage is combined (with
 * the legend of how many observers see the ground). While placing, a hint says that each click
 * adds another observer. Shown while placing an observer and while a viewshed is open; Labs turns
 * it on.
 */
const viewshed = useViewshedStore();

/** Metrics shared by the deck's controls. */
const motionSafe =
  "active:scale-[0.94] disabled:opacity-35 motion-reduce:transition-none";
const DECK_ICON_CLASS = `size-9 rounded-lg p-0 text-muted-foreground has-[>svg]:p-0 sm:size-8 ${motionSafe}`;
const DECK_LABEL_CLASS = `h-9 gap-1.5 rounded-lg px-3.5 has-[>svg]:px-3.5 sm:h-8 ${motionSafe}`;
const DECK_TOGGLE_CLASS = `size-9 min-w-0 shrink-0 rounded-lg p-0 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground ${motionSafe} data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90 sm:size-8`;
/** A labelled choice in the settings popover: the ones not pressed are muted. */
const DECK_CHOICE_CLASS =
  "flex-1 text-muted-foreground data-[state=on]:border-ring data-[state=on]:bg-primary/10 data-[state=on]:text-foreground data-[state=on]:hover:bg-primary/15 data-[state=on]:hover:text-foreground";
const DECK_SEPARATOR_CLASS = "mx-0.5 data-[orientation=vertical]:h-6";
const FLOATING_SURFACE_CLASS =
  "rounded-lg border bg-background/90 shadow-lg ring-1 ring-black/5 backdrop-blur-md dark:ring-white/10";
const DECK_SHELL_CLASS = `pointer-events-auto [scrollbar-width:none] flex max-w-[calc(100vw-2rem)] items-center gap-1 overflow-x-auto p-1 ${FLOATING_SURFACE_CLASS}`;
const {
  active,
  placing,
  observer,
  currentId,
  observerHeight,
  observerAbove,
  targetHeight,
  slantRange,
  radius,
  detail,
  detailForAll,
  display,
  pin,
  snap,
  snapPixels,
  cellSize,
  status,
  visibleShare,
  combine,
  several,
  combined,
  number,
  viewsheds,
} = storeToRefs(viewshed);

const radiusKm = computed({
  get: () => radius.value / 1000,
  set: (value: number) => (radius.value = value * 1000),
});

/** The modifiers that snap one drag, as this platform spells them. */
const isMac = /Mac|iPhone|iPad/.test(globalThis.navigator?.platform ?? "");
const altKey = isMac ? "⌥" : "Alt";
const altShiftKeys = isMac ? "⌥⇧" : "Alt+Shift";

/** The snap as the deck's High/Low pair, where pressing neither is off. */
const snapChoice = computed({
  get: () => (snap.value === "off" ? undefined : snap.value),
  set: (value: string | undefined) => (snap.value = (value as ViewshedSnap) || "off"),
});

/** Whether the range runs along the ground or from the eye, as a choice. */
const rangeFrom = computed({
  get: () => (slantRange.value ? "slant" : "ground"),
  set: (value: string) => (slantRange.value = value === "slant"),
});

/** The snap area as the slider holds it. */
const snapArea = computed({
  get: () => [snapPixels.value],
  set: ([value]) => (snapPixels.value = value ?? SNAP_AREA.fallback),
});

/** The settings changed now and then stay unfolded once unfolded. */
const moreOpen = ref(false);

/** The cell size, which the radius and the elevation data decide as much as the detail does: whole
 *  metres, but a tenth below ten, so a short reach at high detail doesn't read as 0 m. A dash until
 *  the first result. */
const cellText = computed(() => {
  if (cellSize.value === null) return "–";
  return cellSize.value < 10
    ? cellSize.value.toFixed(1)
    : String(Math.round(cellSize.value));
});

/** One value in the settings summary: an icon that says what it is and a name on hover; room held
 *  for its widest text, and where a click on it leads. */
interface SummaryValue {
  key: string;
  icon: Component;
  text: string;
  title: string;
  reserve?: string;
  select?: () => void;
}

/** The settings at a glance: eye height, target height, reach and cell size. */
const settingsSummary = computed((): SummaryValue[] => [
  {
    key: "eye",
    icon: ObserverHeightIcon,
    text: formatEyeHeight(observerHeight.value, observerAbove.value),
    title: `Observer height above ${observerAbove.value === "sea-level" ? "sea level" : "ground"}`,
  },
  {
    key: "target",
    icon: TargetHeightIcon,
    text: `${targetHeight.value} m`,
    title: "Target height",
  },
  {
    key: "reach",
    icon: ReachIcon,
    text: `${radiusKm.value} km${slantRange.value ? " slant" : ""}`,
    title: slantRange.value ? "Slant range" : "Radius",
  },
  {
    key: "cells",
    icon: CellSizeIcon,
    text: `${cellText.value} m`,
    title: "Cell size",
    // Four digits, so neither the first result nor a new detail resizes the centred deck; a click
    // opens the settings with the detail unfolded.
    reserve: "min-w-[6ch]",
    select: () => (moreOpen.value = true),
  },
]);
const settingsTitle = computed(() => {
  const eye =
    observerAbove.value === "sea-level"
      ? `${observerHeight.value} m above sea level`
      : `${observerHeight.value} m`;
  const reach = `${slantRange.value ? "slant range" : "radius"} ${radiusKm.value} km`;
  const cells = cellSize.value === null ? "" : `, ${cellText.value} m cells`;
  return `Viewshed settings: observer ${eye}, target ${targetHeight.value} m, ${reach}${cells}`;
});

/** What the status says, with what it measures apart: the deck shows only the
 *  share, so it stays narrow, and screen readers hear "visible" after it.
 *  Reading is for screen readers alone: the spinner shows it, and the word
 *  would widen the centred deck until the share replaces it. */
const message = computed((): { text: string; suffix?: string } => {
  if (!observer.value) return { text: "Click the map to place the observer" };
  if (status.value === "error") return { text: "Elevation data could not be read" };
  // A drag keeps showing the last result while the next one computes.
  if (visibleShare.value === null)
    return status.value === "loading"
      ? { text: "", suffix: "Reading…" }
      : { text: "No elevation data here" };
  return { text: `${Math.round(visibleShare.value * 100)} %`, suffix: "visible" };
});

/** Swatches, opaque so they read against the deck; or as translucent as on
 *  the map, where the shades differ as much by how much they cover. */
const swatches = (
  bands: readonly { label: string; color: Rgba }[],
  translucent = false,
) =>
  bands.map(({ label, color: [r, g, b, a] }) => ({
    label,
    color: translucent
      ? `rgb(${r} ${g} ${b} / ${(a / 255).toFixed(2)})`
      : `rgb(${r} ${g} ${b})`,
  }));
const maskingLegend = {
  test: "masking-legend",
  bands: swatches(MASKING_BANDS),
  unit: "m",
  label: `Masking height bands, metres: ${MASKING_BANDS.map((band) => band.label).join(", ")}`,
};
const seenByBands = swatches(
  [{ label: "none", color: VIEWSHED_COLORS.hidden }, ...SEEN_BY_BANDS],
  true,
);
const seenByLegend = {
  test: "seen-by-legend",
  bands: seenByBands,
  unit: "seen",
  label: `Seen by observers: ${seenByBands.map((band) => band.label).join(", ")}`,
};

const deadGroundLegend = {
  test: "dead-ground-legend",
  bands: swatches([{ label: "dead ground", color: DEAD_GROUND_COLOR }], true),
  unit: "",
  label: "Dead ground: seen by no observer",
};

/** The legend of the image shown: masking heights, dead ground, or how many
 *  observers see the ground once an image combines several. */
const legend = computed(() => {
  if (!observer.value) return null;
  if (display.value === "masking") return maskingLegend;
  if (display.value === "dead") return deadGroundLegend;
  return combined.value ? seenByLegend : null;
});
</script>

<template>
  <div
    class="pointer-events-none absolute inset-x-0 bottom-[calc(0.25rem+var(--map-bottom-toolbar-inset,0px))] z-20 flex justify-center px-4"
  >
    <Transition name="deck">
      <div v-if="active" class="flex max-w-full flex-col items-center gap-2">
        <p
          v-if="placing && observer"
          data-test="viewshed-hint"
          :class="`text-muted-foreground px-2.5 py-1 text-xs ${FLOATING_SURFACE_CLASS}`"
        >
          Click to add another observer · drag one to move it
        </p>
        <div
          v-if="legend"
          role="img"
          :aria-label="legend.label"
          :data-test="legend.test"
          :class="`flex items-end gap-px px-2 py-1.5 ${FLOATING_SURFACE_CLASS}`"
        >
          <div
            v-for="band in legend.bands"
            :key="band.label"
            class="text-muted-foreground flex min-w-8 flex-col items-center gap-1 text-[10px] leading-none whitespace-nowrap tabular-nums"
          >
            <span class="h-2 w-full" :style="{ backgroundColor: band.color }" />
            {{ band.label }}
          </div>
          <span
            v-if="legend.unit"
            class="text-muted-foreground pl-1 text-[10px] leading-none"
            >{{ legend.unit }}</span
          >
        </div>
        <div
          role="toolbar"
          aria-label="Viewshed"
          data-test="viewshed-deck"
          :class="DECK_SHELL_CLASS"
        >
          <Toggle
            v-model="placing"
            :class="DECK_TOGGLE_CLASS"
            title="Place observer"
            aria-label="Place observer"
          >
            <Crosshair class="size-5 sm:size-4" />
          </Toggle>
          <template v-if="observer && several">
            <Separator orientation="vertical" :class="DECK_SEPARATOR_CLASS" />
            <Button
              variant="ghost"
              :class="DECK_ICON_CLASS"
              title="Previous observer"
              aria-label="Previous observer"
              @click="viewshed.step(-1)"
            >
              <ChevronLeft class="size-5 sm:size-4" />
            </Button>
            <!-- The number opens a menu to jump to any observer, and holds the
                 "close all" that would sit too near closing one beside ✕. -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  :class="`${DECK_LABEL_CLASS} px-2 text-xs font-medium tabular-nums has-[>svg]:px-2`"
                  :aria-label="`Observer ${number} of ${viewsheds.length}`"
                  title="Observers"
                  data-test="viewshed-number"
                >
                  <span aria-live="polite">{{ number }}/{{ viewsheds.length }}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" side="top">
                <DropdownMenuRadioGroup v-model="currentId">
                  <DropdownMenuRadioItem
                    v-for="view in viewsheds"
                    :key="view.id"
                    :value="view.id"
                  >
                    Observer {{ view.number }}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" @select="viewshed.closeAll()">
                  <ListX />
                  Close all viewsheds
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              :class="DECK_ICON_CLASS"
              title="Next observer"
              aria-label="Next observer"
              @click="viewshed.step(1)"
            >
              <ChevronRight class="size-5 sm:size-4" />
            </Button>
          </template>
          <template v-if="observer">
            <Separator orientation="vertical" :class="DECK_SEPARATOR_CLASS" />
            <ToggleGroup
              v-model="display"
              type="single"
              disable-deselection
              :spacing="0"
              aria-label="Show"
              class="shrink-0"
            >
              <ToggleGroupItem
                value="visible"
                :class="DECK_TOGGLE_CLASS"
                title="Show the ground the target can be seen on"
                aria-label="Visible ground"
              >
                <ScanEye class="size-5 sm:size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="dead"
                :class="DECK_TOGGLE_CLASS"
                title="Highlight dead ground: ground no observer can see"
                aria-label="Dead ground"
              >
                <EyeOff class="size-5 sm:size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="masking"
                :class="DECK_TOGGLE_CLASS"
                title="Show how high a target must rise to be seen"
                aria-label="Masking height"
              >
                <ArrowUpToLine class="size-5 sm:size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Toggle
              v-if="several"
              v-model="combine"
              :class="DECK_TOGGLE_CLASS"
              title="Combine coverage: shade ground seen from any observer as one"
              aria-label="Combine coverage"
            >
              <Blend class="size-5 sm:size-4" />
            </Toggle>
            <Separator orientation="vertical" :class="DECK_SEPARATOR_CLASS" />
            <ToggleGroup
              v-model="snapChoice"
              type="single"
              :spacing="0"
              aria-label="Snap a dragged observer to"
              class="shrink-0"
            >
              <ToggleGroupItem
                value="highest"
                :class="DECK_TOGGLE_CLASS"
                title="Snap a dragged observer to the highest ground near the pointer, e.g. a summit"
                aria-label="Snap to the highest ground"
              >
                <SnapGroundIcon to="highest" class="size-5 sm:size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="lowest"
                :class="DECK_TOGGLE_CLASS"
                title="Snap a dragged observer to the lowest ground near the pointer, e.g. a valley floor"
                aria-label="Snap to the lowest ground"
              >
                <SnapGroundIcon to="lowest" class="size-5 sm:size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Separator orientation="vertical" :class="DECK_SEPARATOR_CLASS" />
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  variant="ghost"
                  :class="`${DECK_LABEL_CLASS} gap-2.5 px-2.5 text-xs whitespace-nowrap tabular-nums has-[>svg]:px-2.5`"
                  :title="settingsTitle"
                  :aria-label="settingsTitle"
                  data-test="viewshed-settings"
                >
                  <span
                    v-for="value in settingsSummary"
                    :key="value.key"
                    class="flex items-center gap-1"
                    :title="value.title"
                    :data-test="`viewshed-summary-${value.key}`"
                    @click="value.select?.()"
                  >
                    <component
                      :is="value.icon"
                      class="text-muted-foreground size-4 shrink-0"
                    />
                    <span :class="value.reserve">{{ value.text }}</span>
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                :side-offset="8"
                :collision-padding="8"
                class="flex w-88 max-w-[calc(100vw-2rem)] flex-col gap-3 sm:w-100"
              >
                <!-- What each observer sets: a label, its value and how it is measured, one row
                     each. -->
                <div
                  class="grid grid-cols-[minmax(0,1fr)_6rem_auto] items-center gap-x-2 gap-y-3"
                >
                  <Label for="viewshed-observer-height" class="leading-tight text-balance"
                    >Observer height (m)</Label
                  >
                  <NumberField
                    id="viewshed-observer-height"
                    v-model="observerHeight"
                    :min="0"
                    :max="observerAbove === 'sea-level' ? 9000 : 1000"
                    :step="1"
                    :format-options="{ useGrouping: false }"
                  >
                    <NumberFieldContent>
                      <NumberFieldDecrement />
                      <NumberFieldInput aria-label="Observer height in metres" />
                      <NumberFieldIncrement />
                    </NumberFieldContent>
                  </NumberField>
                  <ToggleGroup
                    v-model="observerAbove"
                    type="single"
                    variant="outline"
                    size="sm"
                    disable-deselection
                    aria-label="Observer height measured from"
                  >
                    <ToggleGroupItem
                      value="ground"
                      :class="DECK_CHOICE_CLASS"
                      title="Above the ground, e.g. someone standing or a mast"
                      aria-label="Height above ground"
                    >
                      AGL
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="sea-level"
                      :class="DECK_CHOICE_CLASS"
                      title="Above sea level, e.g. a drone or aircraft holding an altitude"
                      aria-label="Height above sea level"
                    >
                      MSL
                    </ToggleGroupItem>
                  </ToggleGroup>

                  <Label for="viewshed-target-height" class="leading-tight text-balance"
                    >Target height (m)</Label
                  >
                  <NumberField
                    id="viewshed-target-height"
                    v-model="targetHeight"
                    :min="0"
                    :max="1000"
                    :step="1"
                    class="col-span-2"
                  >
                    <NumberFieldContent>
                      <NumberFieldDecrement />
                      <NumberFieldInput aria-label="Target height in metres" />
                      <NumberFieldIncrement />
                    </NumberFieldContent>
                  </NumberField>

                  <Label for="viewshed-radius" class="leading-tight text-balance"
                    >Radius (km)</Label
                  >
                  <NumberField
                    id="viewshed-radius"
                    v-model="radiusKm"
                    :min="VIEWSHED_RADIUS.min / 1000"
                    :max="VIEWSHED_RADIUS.max / 1000"
                    :step="VIEWSHED_RADIUS.step / 1000"
                  >
                    <NumberFieldContent>
                      <NumberFieldDecrement />
                      <NumberFieldInput aria-label="Radius in kilometres" />
                      <NumberFieldIncrement />
                    </NumberFieldContent>
                  </NumberField>
                  <ToggleGroup
                    v-model="rangeFrom"
                    type="single"
                    variant="outline"
                    size="sm"
                    disable-deselection
                    aria-label="Range measured"
                  >
                    <ToggleGroupItem
                      value="ground"
                      :class="DECK_CHOICE_CLASS"
                      title="Along the ground from the observer's foot"
                      aria-label="Radius along the ground"
                    >
                      Flat
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="slant"
                      :class="DECK_CHOICE_CLASS"
                      title="From the eye, as a sensor or radio reaches from height"
                      aria-label="Radius as slant range"
                    >
                      Slant
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <!-- Set once and left: folded away, but stays open once unfolded. -->
                <Collapsible v-model:open="moreOpen" class="flex flex-col gap-3">
                  <CollapsibleTrigger as-child>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="text-muted-foreground -mx-2 justify-start gap-1 px-2 has-[>svg]:px-2"
                      data-test="viewshed-more"
                    >
                      <ChevronDown
                        :class="[
                          'size-4 transition-transform',
                          { '-rotate-90': !moreOpen },
                        ]"
                      />
                      Detail, snapping and pin
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <FieldGroup class="gap-3">
                      <Field orientation="horizontal">
                        <FieldLabel
                          for="viewshed-detail"
                          class="flex-col items-start gap-0.5"
                        >
                          Detail
                          <span
                            class="text-muted-foreground text-xs font-normal tabular-nums"
                          >
                            {{ cellText }} m cells
                          </span>
                        </FieldLabel>
                        <Select v-model="detail">
                          <SelectTrigger id="viewshed-detail" size="sm" class="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              v-for="(option, value) in VIEWSHED_DETAILS"
                              :key="value"
                              :value="value"
                            >
                              {{ option.label }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field v-if="several" orientation="horizontal">
                        <FieldLabel for="viewshed-detail-for-all" class="font-normal">
                          Same detail for every viewshed
                        </FieldLabel>
                        <Switch
                          id="viewshed-detail-for-all"
                          v-model="detailForAll"
                          aria-label="Detail for all viewsheds"
                        />
                      </Field>
                      <Field class="gap-1.5">
                        <div class="flex items-center justify-between gap-2">
                          <Label
                            for="viewshed-snap-area"
                            title="How far round the pointer a snap looks"
                            >Snap area</Label
                          >
                          <span class="text-muted-foreground text-xs tabular-nums"
                            >{{ snapPixels }} px</span
                          >
                        </div>
                        <Slider
                          id="viewshed-snap-area"
                          v-model="snapArea"
                          :min="SNAP_AREA.min"
                          :max="SNAP_AREA.max"
                          :step="SNAP_AREA.step"
                          aria-label="Snap area in pixels"
                        />
                        <!-- Modifier keys need a keyboard, so phones are spared the hint. -->
                        <FieldDescription
                          data-test="viewshed-snap-hint"
                          class="hidden text-xs pointer-fine:block"
                        >
                          Hold {{ altKey }} while dragging to snap that drag to high
                          ground, {{ altShiftKeys }} to low.
                        </FieldDescription>
                      </Field>
                      <Field orientation="horizontal">
                        <FieldLabel for="viewshed-pin" class="font-normal">
                          Show observer as a pin at eye height
                        </FieldLabel>
                        <Switch
                          id="viewshed-pin"
                          v-model="pin"
                          aria-label="Show observer as a pin"
                        />
                      </Field>
                    </FieldGroup>
                  </CollapsibleContent>
                </Collapsible>
              </PopoverContent>
            </Popover>
            <Separator orientation="vertical" :class="DECK_SEPARATOR_CLASS" />
            <!-- A recompute keeps the last result's status, so the spinner is what
                 says a new one is on its way. It holds its place while hidden, so
                 the status beside it never shifts. -->
            <Spinner
              :class="[
                'text-muted-foreground ml-1 shrink-0',
                { 'invisible animate-none': status !== 'loading' },
              ]"
              data-test="viewshed-spinner"
            />
          </template>
          <!-- Room for "100 %", so a new result or another digit doesn't resize
               the centred deck. -->
          <span
            class="min-w-12 shrink-0 px-1.5 text-xs whitespace-nowrap tabular-nums"
            aria-live="polite"
            :title="
              message.text && message.suffix
                ? `${message.text} ${message.suffix}`
                : undefined
            "
            data-test="viewshed-status"
          >
            {{ message.text
            }}<span v-if="message.suffix" class="sr-only">{{
              message.text ? ` ${message.suffix}` : message.suffix
            }}</span>
          </span>
          <Button
            variant="ghost"
            :class="DECK_ICON_CLASS"
            title="Close viewshed"
            aria-label="Close viewshed"
            @click="viewshed.close()"
          >
            <X class="size-5 sm:size-4" />
          </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* The deck slides up and fades in as it opens. */
.deck-enter-active,
.deck-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.deck-enter-from,
.deck-leave-to {
  opacity: 0;
  transform: translateY(0.75rem) scale(0.97);
}
@media (prefers-reduced-motion: reduce) {
  .deck-enter-active,
  .deck-leave-active {
    transition: none;
  }
}
</style>
