<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import { useLocalStorage } from "@vueuse/core";
import NewMilitarySymbol from "@/components/NewMilitarySymbol.vue";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { getFullUnitSidc, updateSidc } from "@/symbology/helpers";
import { echelonValues } from "@/symbology/values";
import {
  echelonRatio,
  echelonSizeKey,
  isPositiveNumber,
  MAX_MAP_SYMBOL_SIZE,
  MIN_MAP_SYMBOL_SIZE,
  NO_ECHELON,
  ratioForSize,
  roundRatio,
  sizeForRatio,
} from "@/symbology/echelonSize";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";
import { Button } from "@/components/ui/button";

/** The echelon sizes, after tactrace's dialog (its ADR-0063). Edits a draft that
 *  Apply writes to the map settings. Sizes are typed in px by default, or as
 *  ratios; each is stored as a ratio of the map symbol size, so changing that
 *  size moves every echelon at once. */
const props = defineProps<{
  /** The unit whose echelon the dialog picks out, and whose symbol the previews
   *  draw. */
  sidc?: string;
}>();
const open = defineModel<boolean>("open", { default: false });

type Draft = { basePx: number; ratios: Record<string, number> };

const mapSettings = useMapSettingsStore();
// Shallow, and only ever replaced, so Apply hands plain data to local storage.
const draft = shallowRef<Draft>(currentSettings());

function currentSettings(): Draft {
  return {
    basePx: mapSettings.mapIconSize,
    ratios: { ...mapSettings.mapEchelonSizeRatios },
  };
}

watch(open, (isOpen) => {
  if (isOpen) draft.value = currentSettings();
});

// Biggest first, like an ORBAT read top-down; No echelon last.
const echelons = echelonValues.filter((v) => v.code !== NO_ECHELON).reverse();
const rows = [...echelons, { code: NO_ECHELON, text: "No echelon" }];
// Two columns on a wide screen, read down the first then the second.
const half = Math.ceil(rows.length / 2);
const columns = [rows.slice(0, half), rows.slice(half)];

// Previews draw the unit's own symbol, or Friend infantry when it has no echelon
// to vary.
const previewBase = computed(() => {
  const sidc = props.sidc ? getFullUnitSidc(props.sidc) : undefined;
  return sidc && echelonSizeKey(sidc) !== NO_ECHELON ? sidc : "10031000161211000000";
});

const previewSidcs = computed(
  () =>
    new Map(
      echelons.map(({ code }) => [
        code,
        updateSidc(previewBase.value, (sidc) => (sidc.emt = code)),
      ]),
    ),
);

const RATIO_FORMAT = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

const ratioOf = (code: string) => echelonRatio(draft.value.ratios, code);
const sizePx = (code: string) => sizeForRatio(ratioOf(code), draft.value.basePx);
const ratioText = (code: string) => `×${RATIO_FORMAT.format(ratioOf(code))}`;

/** Which number a row edits: its size in px, or its ratio of the map symbol
 *  size. Remembered per browser. */
const sizeUnit = useLocalStorage<"px" | "ratio">("echelonSizeUnit", "px");
const UNITS = [
  { value: "px", text: "px", label: "Edit sizes in px" },
  { value: "ratio", text: "×", label: "Edit sizes as ratios" },
] as const;

function setSizeUnit(value: unknown) {
  if (value === "px" || value === "ratio") sizeUnit.value = value;
}

/** The row's field and the column headings for the chosen unit. Ratio steps
 *  don't snap, so a typed ratio such as 1.27 is kept as typed. */
const rowField = computed(() =>
  sizeUnit.value === "px"
    ? {
        heading: "Size (px)",
        otherHeading: "Ratio",
        props: { min: MIN_MAP_SYMBOL_SIZE, max: MAX_MAP_SYMBOL_SIZE },
        inputLabel: "size, in px",
        value: sizePx,
        other: ratioText,
        set: (code: string, px: number) =>
          patchRatio(code, ratioForSize(px, draft.value.basePx)),
      }
    : {
        heading: "Ratio",
        otherHeading: "Size",
        props: {
          min: 0.01,
          max: 20,
          step: 0.05,
          stepSnapping: false,
          formatOptions: { maximumFractionDigits: 3 },
        },
        inputLabel: "ratio of the map symbol size",
        value: ratioOf,
        other: (code: string) => `${sizePx(code)} px`,
        set: (code: string, ratio: number) => patchRatio(code, roundRatio(ratio)),
      },
);

/** The unit's own echelon, which the table and lineup pick out. */
const highlight = computed(() => (props.sidc ? echelonSizeKey(props.sidc) : undefined));

/** The row under the pointer or focus, whose symbol the lineup picks out. */
const hovered = ref<string>();
const active = computed(() => hovered.value ?? highlight.value);

function patchRatio(code: string, ratio: number) {
  draft.value = { ...draft.value, ratios: { ...draft.value.ratios, [code]: ratio } };
}

function setRow(code: string, value: number | undefined) {
  // A NumberField reads NaN while cleared; keep the last valid value.
  if (isPositiveNumber(value)) rowField.value.set(code, value);
}

function setBase(px: number | undefined) {
  if (isPositiveNumber(px)) draft.value = { ...draft.value, basePx: px };
}

function resetSizes() {
  draft.value = { ...draft.value, ratios: {} };
}

function apply() {
  mapSettings.mapIconSize = draft.value.basePx;
  mapSettings.mapEchelonSizeRatios = draft.value.ratios;
  open.value = false;
}

const NUMBER_INPUT = "w-28 shrink-0";
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg lg:max-w-4xl"
    >
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle>Echelon sizes</DialogTitle>
        <DialogDescription>
          Units without a map symbol size of their own are drawn at their echelon's size.
        </DialogDescription>
      </DialogHeader>

      <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 pb-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 class="text-muted-foreground text-xs font-medium">Sizes</h3>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              aria-label="Edit sizes as"
              :model-value="sizeUnit"
              @update:model-value="setSizeUnit"
            >
              <ToggleGroupItem
                v-for="unit in UNITS"
                :key="unit.value"
                :value="unit.value"
                :aria-label="unit.label"
                :title="unit.label"
                class="px-3"
              >
                {{ unit.text }}
              </ToggleGroupItem>
            </ToggleGroup>
            <Field orientation="horizontal" class="w-auto gap-2">
              <FieldLabel for="echelon-sizes-base" class="font-normal"
                >Map symbol size (px)</FieldLabel
              >
              <NumberField
                id="echelon-sizes-base"
                :class="NUMBER_INPUT"
                :model-value="draft.basePx"
                :min="MIN_MAP_SYMBOL_SIZE"
                :max="MAX_MAP_SYMBOL_SIZE"
                @update:model-value="setBase"
              >
                <NumberFieldContent>
                  <NumberFieldDecrement />
                  <NumberFieldInput aria-label="Map symbol size, in px" />
                  <NumberFieldIncrement />
                </NumberFieldContent>
              </NumberField>
            </Field>
          </div>
        </div>

        <!-- The sizes side by side at true size, bottom-aligned like a row of
             stencils, so the weight of each echelon reads at a glance. -->
        <div
          class="bg-muted/40 flex flex-wrap items-end gap-x-2 gap-y-3 rounded-md px-3 py-2"
          aria-hidden="true"
        >
          <span
            v-for="echelon in echelons"
            :key="echelon.code"
            :title="echelon.text"
            class="shrink-0 transition-opacity"
            :class="active && active !== echelon.code ? 'opacity-35' : ''"
          >
            <NewMilitarySymbol
              :sidc="previewSidcs.get(echelon.code)!"
              :size="sizePx(echelon.code)"
            />
          </span>
        </div>

        <div class="grid gap-x-8 lg:grid-cols-2">
          <table v-for="(column, index) in columns" :key="index" class="w-full text-sm">
            <thead :class="index > 0 ? 'max-lg:hidden' : ''">
              <tr class="border-b">
                <th
                  v-for="(heading, i) in [
                    'Echelon',
                    rowField.heading,
                    rowField.otherHeading,
                  ]"
                  :key="i"
                  class="text-muted-foreground h-10 px-2 text-left font-medium last:text-right"
                >
                  {{ heading }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in column"
                :key="row.code"
                class="hover:bg-muted/50 h-11 border-b"
                @mouseenter="hovered = row.code"
                @mouseleave="hovered = undefined"
                @focusin="hovered = row.code"
                @focusout="hovered = undefined"
              >
                <td class="w-full px-2 py-1">
                  <label
                    :for="`echelon-size-${row.code}`"
                    :class="row.code === highlight ? 'font-semibold' : ''"
                  >
                    {{ row.text }}
                  </label>
                </td>
                <td class="px-2 py-1">
                  <NumberField
                    :id="`echelon-size-${row.code}`"
                    :key="sizeUnit"
                    :class="NUMBER_INPUT"
                    v-bind="rowField.props"
                    :model-value="rowField.value(row.code)"
                    @update:model-value="setRow(row.code, $event)"
                  >
                    <NumberFieldContent>
                      <NumberFieldDecrement />
                      <NumberFieldInput
                        :aria-label="`${row.text} ${rowField.inputLabel}`"
                      />
                      <NumberFieldIncrement />
                    </NumberFieldContent>
                  </NumberField>
                </td>
                <td
                  class="text-muted-foreground px-2 py-1 text-right text-xs whitespace-nowrap tabular-nums"
                >
                  {{ rowField.other(row.code) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <DialogFooter
        class="flex-row justify-between border-t px-6 py-4 sm:justify-between"
      >
        <Button variant="ghost" size="sm" @click="resetSizes">Reset sizes</Button>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="open = false">Cancel</Button>
          <Button size="sm" @click="apply">Apply</Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
