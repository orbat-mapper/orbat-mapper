<script setup lang="ts">
/**
 * The styling controls for a control measure, as rows of a `PanelDataGrid` — the same
 * shape as the plain-feature `Scenario*Settings` components, and used both by the
 * details panel (editing one stored graphic) and by the draw toolbar's defaults
 * popover (editing the session-sticky defaults for the next one).
 *
 * Two things it does *not* do, both deliberate:
 *
 * - **No preview/rollback dance.** The feature panel writes non-undoably while a
 *   slider drags and rolls back on commit; nothing here ever writes mid-gesture, so
 *   every emit is already one settled change and the host can write it undoably once.
 * - **No gating anywhere but here.** Colour and fill pattern are offered only for the
 *   7 Generic Graphics kinds (ADR-0006), while stroke width follows the registry's
 *   paint capability. Those are UI judgements — the model and `toControlMeasure` stay
 *   uniform, so imported styling still renders.
 *
 * Defaults are edited for the toolbar's currently chosen kind, so the same capability
 * gate applies before and after a graphic is born.
 */
import { computed, toRaw } from "vue";
import type {
  ControlMeasureKind,
  ControlMeasureStyle,
} from "@orbat-mapper/control-measures";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { standardIdentityValues } from "@/symbology/values";
import type { SidValue } from "@/symbology/values";
import type {
  TacticalGraphicColorMode,
  TacticalGraphicOptions,
  TacticalGraphicStatus,
} from "@/types/scenarioLayerItems";
import { resolveControlMeasureColorFrom } from "@/geo/controlMeasures";
import ControlMeasureColorPicker from "@/modules/scenarioeditor/ControlMeasureColorPicker.vue";
import ControlMeasureStrokeWidthChoices from "@/modules/scenarioeditor/ControlMeasureStrokeWidthChoices.vue";
import {
  CONTROL_MEASURE_FILL_PATTERNS,
  CONTROL_MEASURE_STROKE_WIDTH_DEFAULT,
  type ControlMeasureFillPattern,
  type ControlMeasureStyleUpdate,
  canAuthorFillPattern,
  canAuthorStrokeWidth,
  canSmoothControlMeasureKind,
  fillPatternLabel,
  isControlMeasureSmoothed,
  isStyleableControlMeasureKind,
} from "@/modules/scenarioeditor/controlMeasureStyleOptions";

const props = defineProps<{
  /** The edited item kind, or the kind that the toolbar defaults will create. */
  graphicKind?: ControlMeasureKind;
  /** All edited kinds, when the host applies one control to a multi-selection. */
  graphicKinds?: ControlMeasureKind[];
  /** Identifies toolbar-default mode for its explanatory copy. */
  editingDefaults?: boolean;
  /** Named `measureStyle`, not `style`: Vue reserves `style` for the fallthrough attribute. */
  measureStyle?: ControlMeasureStyle;
  standardIdentity?: SidValue;
  colorMode?: TacticalGraphicColorMode;
  status?: TacticalGraphicStatus;
  /** The stored generator options — the source of the smoothing state. */
  options?: TacticalGraphicOptions;
  showHeading?: boolean;
}>();

const emit = defineEmits<{ (e: "update", value: ControlMeasureStyleUpdate): void }>();

const isDefaults = computed(() => {
  if (props.editingDefaults !== undefined) return props.editingDefaults;
  return props.graphicKind === undefined;
});
const editedKinds = computed(() =>
  props.graphicKinds?.length
    ? props.graphicKinds
    : props.graphicKind !== undefined
      ? [props.graphicKind]
      : [],
);
/**
 * A control is offered only when every kind in the (possibly multi-) selection can
 * author it — one gating rule, so a new control cannot pick up a different one.
 */
function gatedOnEveryKind(canAuthor: (kind: ControlMeasureKind) => boolean) {
  return computed(
    () => editedKinds.value.length > 0 && editedKinds.value.every(canAuthor),
  );
}

const showColor = gatedOnEveryKind(isStyleableControlMeasureKind);
const showFillPattern = gatedOnEveryKind(canAuthorFillPattern);
const showStrokeWidth = gatedOnEveryKind(canAuthorStrokeWidth);

/** What the graphic actually draws as, authored colour or identity projection. */
const resolvedColor = computed(() =>
  resolveControlMeasureColorFrom({
    style: props.measureStyle,
    colorMode: props.colorMode,
    standardIdentity: props.standardIdentity,
  }),
);

const hasAuthoredColor = computed(() => props.measureStyle?.color !== undefined);

/**
 * The style field is replaced wholesale, so every write starts from a copy of the
 * stored one. `toRaw` first: the item is `reactive()`, and a reactive proxy must not
 * end up back in the store where `toControlMeasure` could hand it to the engine.
 * A raw object's own values are themselves raw, so the spread is raw all the way down.
 */
function nextStyle(patch: Partial<ControlMeasureStyle>): ControlMeasureStyle {
  const style: ControlMeasureStyle = { ...toRaw(props.measureStyle) };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete style[key as keyof ControlMeasureStyle];
    else (style as Record<string, unknown>)[key] = value;
  }
  return style;
}

function updateStyle(patch: Partial<ControlMeasureStyle>) {
  emit("update", { style: nextStyle(patch) });
}

// Bound with `v-model` rather than a change handler: the native select's own
// `update:modelValue` is typed without arguments, so a handler cannot read the value.
const identityModel = computed({
  get: () => props.standardIdentity ?? "",
  set: (value: string) => emit("update", { standardIdentity: value as SidValue }),
});

const colorModeModel = computed({
  get: () => props.colorMode ?? "identity",
  set: (value: string) =>
    emit("update", { colorMode: value as TacticalGraphicColorMode }),
});

const statusModel = computed({
  get: () => props.status ?? "present",
  set: (value: string) => emit("update", { status: value as TacticalGraphicStatus }),
});

const strokeWidthModel = computed({
  get: () => props.measureStyle?.strokeWidth ?? CONTROL_MEASURE_STROKE_WIDTH_DEFAULT,
  set: (value: number) => updateStyle({ strokeWidth: value }),
});

/**
 * Smoothing is a generator *option*, not a style — the emit carries `options`, and the
 * whole object is replaced from a raw copy for the same reason `nextStyle` does it.
 * Offered only for kinds whose registry entry declares a `smooth` param. Toolbar
 * defaults now belong to the currently chosen kind, so smoothing can be sticky too.
 */
const showSmooth = gatedOnEveryKind(canSmoothControlMeasureKind);

const smoothModel = computed({
  get: () => isControlMeasureSmoothed(props.graphicKind, props.options),
  set: (value: boolean) =>
    emit("update", {
      options: { ...toRaw(props.options), smooth: value } as TacticalGraphicOptions,
    }),
});

/** `""` is the "no authored pattern" option — the library's own default then applies. */
const fillPatternModel = computed({
  get: () => props.measureStyle?.fillPattern ?? "",
  set: (value: string) =>
    updateStyle({ fillPattern: (value || undefined) as ControlMeasureFillPattern }),
});
</script>

<template>
  <div v-if="showHeading !== false" class="col-span-2 mt-2 -mb-1 font-semibold">
    Style
  </div>

  <label for="cm-identity" class="self-center">Identity</label>
  <NativeSelect
    id="cm-identity"
    class="w-full"
    wrapper-class="w-full"
    v-model="identityModel"
  >
    <NativeSelectOption
      v-for="identity in standardIdentityValues"
      :key="identity.code"
      :value="identity.code"
    >
      {{ identity.text }}
    </NativeSelectOption>
  </NativeSelect>

  <label for="cm-color-mode" class="self-center">Colors</label>
  <NativeSelect
    id="cm-color-mode"
    class="w-full"
    wrapper-class="w-full"
    v-model="colorModeModel"
  >
    <NativeSelectOption value="identity">Identity</NativeSelectOption>
    <NativeSelectOption value="monochrome">Monochrome</NativeSelectOption>
  </NativeSelect>

  <label for="cm-status" class="self-center">Status</label>
  <NativeSelect
    id="cm-status"
    class="w-full"
    wrapper-class="w-full"
    v-model="statusModel"
  >
    <NativeSelectOption value="present">Present</NativeSelectOption>
    <NativeSelectOption value="planned">Planned</NativeSelectOption>
  </NativeSelect>

  <template v-if="showStrokeWidth">
    <div class="self-center">Stroke width</div>
    <ControlMeasureStrokeWidthChoices v-model="strokeWidthModel" />
  </template>

  <template v-if="showColor">
    <div class="self-center">Color</div>
    <div class="flex items-center gap-1">
      <ControlMeasureColorPicker
        :model-value="resolvedColor"
        @update:model-value="updateStyle({ color: $event })"
      />
      <Button
        v-if="hasAuthoredColor"
        type="button"
        variant="ghost"
        size="sm"
        title="Use the color the standard identity resolves to"
        @click="updateStyle({ color: undefined })"
      >
        Auto
      </Button>
    </div>
  </template>

  <template v-if="showFillPattern">
    <label for="cm-fill-pattern" class="self-center">Fill</label>
    <NativeSelect
      id="cm-fill-pattern"
      class="w-full"
      wrapper-class="w-full"
      v-model="fillPatternModel"
    >
      <NativeSelectOption value="">Default</NativeSelectOption>
      <NativeSelectOption
        v-for="pattern in CONTROL_MEASURE_FILL_PATTERNS"
        :key="pattern"
        :value="pattern"
      >
        {{ fillPatternLabel(pattern) }}
      </NativeSelectOption>
    </NativeSelect>
  </template>

  <template v-if="showSmooth">
    <label for="cm-smooth" class="self-center">Smooth</label>
    <div>
      <Switch
        id="cm-smooth"
        v-model="smoothModel"
        title="Round the corners by curving through the control points"
      />
    </div>
  </template>

  <p v-if="isDefaults" class="text-muted-foreground col-span-2 text-xs">
    These settings apply to new {{ graphicKind ? "graphics of this kind" : "graphics" }}.
  </p>
</template>
