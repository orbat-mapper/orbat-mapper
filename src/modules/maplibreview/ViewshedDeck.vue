<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import {
  ArrowUpToLine,
  Blend,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  EyeOff,
  ListX,
  ScanEye,
  Settings2,
  X,
} from "@lucide/vue";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Rgba } from "@/lib/terrain";
import {
  DEAD_GROUND_COLOR,
  MASKING_BANDS,
  SEEN_BY_BANDS,
  VIEWSHED_COLORS,
} from "@/geo/viewshedImage";
import {
  useViewshedStore,
  VIEWSHED_DETAILS,
  VIEWSHED_RADIUS,
} from "@/stores/viewshedStore";

/**
 * The current Viewshed, ported from tactrace, floating at the foot of the map: placing observers,
 * what the image shows (visible ground, dead ground or the masking height map, with its legend),
 * and how much is visible. The settings set once per observer (how high the eyes and the target
 * are, how far to look, the detail, with several for all of them by default, and whether the
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
  targetHeight,
  radius,
  detail,
  detailForAll,
  display,
  pin,
  result,
  status,
  visibleShare,
  combine,
  several,
  coverages,
  number,
  viewsheds,
} = storeToRefs(viewshed);

const radiusKm = computed({
  get: () => radius.value / 1000,
  set: (value: number) => (radius.value = value * 1000),
});

/** The settings at a glance: eye height, target height, and reach. */
const settingsSummary = computed(() => {
  return `${observerHeight.value} m · ${targetHeight.value} m · ${radiusKm.value} km`;
});
const settingsTitle = computed(
  () =>
    `Viewshed settings: observer ${observerHeight.value} m, target ${targetHeight.value} m, ` +
    `radius ${radiusKm.value} km`,
);

/** The cell size the shown result has, which the radius and the elevation
 *  data decide as much as the detail does. */
const cellLabel = computed(() =>
  result.value ? `${Math.round(result.value.grid.cellSize)} m cells` : null,
);

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
  return coverages.value.some((coverage) => coverage.seenBy) ? seenByLegend : null;
});
</script>

<template>
  <div
    class="pointer-events-none absolute inset-x-0 bottom-[calc(1rem+var(--map-bottom-toolbar-inset,0px))] z-20 flex justify-center px-4"
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
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  variant="ghost"
                  :class="`${DECK_LABEL_CLASS} px-2.5 text-xs whitespace-nowrap tabular-nums has-[>svg]:px-2.5`"
                  :title="settingsTitle"
                  :aria-label="settingsTitle"
                  data-test="viewshed-settings"
                >
                  <Settings2 class="text-muted-foreground size-5 sm:size-4" />
                  {{ settingsSummary }}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                :side-offset="8"
                :collision-padding="8"
                class="w-64"
              >
                <FieldGroup class="gap-4">
                  <Field>
                    <FieldLabel for="viewshed-observer-height"
                      >Observer height (m)</FieldLabel
                    >
                    <NumberField
                      id="viewshed-observer-height"
                      v-model="observerHeight"
                      :min="0"
                      :max="1000"
                      :step="1"
                    >
                      <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput aria-label="Observer height in metres" />
                        <NumberFieldIncrement />
                      </NumberFieldContent>
                    </NumberField>
                  </Field>
                  <Field>
                    <FieldLabel for="viewshed-target-height"
                      >Target height (m)</FieldLabel
                    >
                    <NumberField
                      id="viewshed-target-height"
                      v-model="targetHeight"
                      :min="0"
                      :max="1000"
                      :step="1"
                    >
                      <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput aria-label="Target height in metres" />
                        <NumberFieldIncrement />
                      </NumberFieldContent>
                    </NumberField>
                  </Field>
                  <Field>
                    <FieldLabel for="viewshed-radius">Radius (km)</FieldLabel>
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
                  </Field>
                  <Field>
                    <FieldLabel for="viewshed-detail">Detail</FieldLabel>
                    <Select v-model="detail">
                      <SelectTrigger id="viewshed-detail" class="w-full">
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
                    <FieldDescription v-if="cellLabel" class="tabular-nums">
                      {{ cellLabel }}
                    </FieldDescription>
                  </Field>
                  <Field v-if="several" orientation="horizontal">
                    <FieldLabel for="viewshed-detail-for-all" class="font-normal">
                      Use this detail for every viewshed
                    </FieldLabel>
                    <Switch
                      id="viewshed-detail-for-all"
                      v-model="detailForAll"
                      aria-label="Detail for all viewsheds"
                    />
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
