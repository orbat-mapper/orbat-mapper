<script setup lang="ts">
/**
 * The draw toolbar's compact control-measure style panel. With a control measure
 * selection it edits that selection; otherwise it edits the defaults a newly drawn
 * measure is born with.
 *
 * Defaults remain session-sticky Pinia UI state (ADR-0006), while selection edits go
 * through the scenario draw owner so they retain the normal settle and undo behavior.
 * The controls are the same component the details panel uses, so "what a new graphic
 * looks like" and "what this graphic looks like" cannot drift apart.
 */
import { IconPaletteOutline as DefaultsIcon } from "@iconify-prerendered/vue-mdi";
import { storeToRefs } from "pinia";
import { computed, inject } from "vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import PanelDataGrid from "@/components/PanelDataGrid.vue";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useControlMeasureToolStore } from "@/stores/controlMeasureToolStore";
import ControlMeasureStyleSettings from "@/modules/scenarioeditor/ControlMeasureStyleSettings.vue";
import type { ControlMeasureStyleUpdate } from "@/modules/scenarioeditor/controlMeasureStyleOptions";
import { activeScenarioKey, scenarioDrawKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";
import {
  isNTacticalGraphicLayerItem,
  type NTacticalGraphicLayerItem,
  type TacticalGraphicLayerItemUpdate,
} from "@/types/scenarioLayerItems";
import { resolveControlMeasureOptions } from "@/geo/controlMeasures";

withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false });

const store = useControlMeasureToolStore();
const { defaults, lastKind } = storeToRefs(store);
const { selectedFeatureIds } = useSelectedItems();
// Optional keeps the component independently mountable; both are present in the
// scenario editor where the toolbar is rendered.
const scenario = inject(activeScenarioKey, null);
const scenarioDraw = inject(scenarioDrawKey, null);

const selectedItems = computed<NTacticalGraphicLayerItem[]>(() => {
  if (!scenario || selectedFeatureIds.value.size === 0) return [];
  const items = [...selectedFeatureIds.value].map(
    (id) => scenario.geo.getLayerItemById(id).layerItem,
  );
  // Mixed selections follow the ordinary feature path, just like the details panel.
  if (!items.every(isNTacticalGraphicLayerItem)) return [];
  return items;
});

const primaryItem = computed(() => selectedItems.value[0]);
const editsSelection = computed(() => selectedItems.value.length > 0);

function changedFields(
  before: Record<string, unknown> | undefined,
  after: Record<string, unknown>,
) {
  return [...new Set([...Object.keys(before ?? {}), ...Object.keys(after)])].filter(
    (key) => before?.[key] !== after[key],
  );
}

/**
 * The settings component emits a complete style/options object for its primary item.
 * For a multi-selection, carry only the fields that actually changed onto every other
 * item so their unrelated authored styling and generator options are preserved.
 */
function updateForItem(
  item: NTacticalGraphicLayerItem,
  data: ControlMeasureStyleUpdate,
  primaryStyle: Record<string, unknown>,
  primaryOptions: Record<string, unknown> | undefined,
): TacticalGraphicLayerItemUpdate {
  const update: TacticalGraphicLayerItemUpdate = { ...data };
  if (data.style) {
    const style = { ...item.style } as Record<string, unknown>;
    for (const key of changedFields(primaryStyle, data.style)) {
      const value = (data.style as Record<string, unknown>)[key];
      if (value === undefined) delete style[key];
      else style[key] = value;
    }
    update.style = style;
  }
  if (data.options) {
    const options = { ...resolveControlMeasureOptions(item) } as Record<string, unknown>;
    for (const key of changedFields(primaryOptions, data.options)) {
      const value = (data.options as Record<string, unknown>)[key];
      if (value === undefined) delete options[key];
      else options[key] = value;
    }
    update.options = options;
  }
  return update;
}

function updateSettings(data: ControlMeasureStyleUpdate) {
  const primary = primaryItem.value;
  if (!primary) {
    store.setDefaults(data);
    return;
  }

  // Every settled toolbar choice becomes the starting point for the next graphic.
  // Merge only the field changed on the selected primary, preserving sticky settings
  // that this kind cannot display (for example a polygon fill while editing a line).
  const sticky: ControlMeasureStyleUpdate = { ...data };
  if (data.style) {
    const style = { ...defaults.value.style } as Record<string, unknown>;
    for (const key of changedFields(primary.style, data.style)) {
      const value = (data.style as Record<string, unknown>)[key];
      if (value === undefined) delete style[key];
      else style[key] = value;
    }
    sticky.style = style;
  }
  if (data.options) {
    const primaryOptions = resolveControlMeasureOptions(primary);
    const options = { ...defaults.value.options } as Record<string, unknown>;
    for (const key of changedFields(primaryOptions, data.options)) {
      const value = (data.options as Record<string, unknown>)[key];
      if (value === undefined) delete options[key];
      else options[key] = value;
    }
    sticky.options = options;
  }
  store.setDefaults(sticky);

  if (!scenarioDraw) return;
  // Snapshot before the first synchronous store write mutates the primary proxy.
  const primaryStyle = { ...primary.style } as Record<string, unknown>;
  const primaryOptions = data.options
    ? ({ ...resolveControlMeasureOptions(primary) } as Record<string, unknown>)
    : undefined;
  const apply = () => {
    for (const item of selectedItems.value) {
      scenarioDraw.updateControlMeasure(
        item.id,
        updateForItem(item, data, primaryStyle, primaryOptions),
      );
    }
  };
  if (selectedItems.value.length > 1 && scenario) {
    scenario.store.groupUpdate(apply, {
      label: "updateFeature",
      value: primary.id,
    });
  } else {
    apply();
  }
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <MainToolbarButton
        :title="
          disabled
            ? 'Control measures are not supported by this map engine'
            : editsSelection
              ? 'Style selected control measures'
              : 'Control measure defaults'
        "
        :disabled="disabled"
      >
        <DefaultsIcon class="size-5" />
      </MainToolbarButton>
    </PopoverTrigger>
    <PopoverContent :avoid-collisions="true">
      <header class="text-sm font-bold">
        {{
          editsSelection
            ? selectedItems.length === 1
              ? "Selected control measure"
              : `${selectedItems.length} selected control measures`
            : "New control measures"
        }}
      </header>
      <PanelDataGrid class="mt-4">
        <ControlMeasureStyleSettings
          :graphic-kind="primaryItem?.graphicKind ?? lastKind"
          :graphic-kinds="selectedItems.map((item) => item.graphicKind)"
          :editing-defaults="!editsSelection"
          :measure-style="editsSelection ? primaryItem?.style : defaults.style"
          :standard-identity="
            editsSelection ? primaryItem?.standardIdentity : defaults.standardIdentity
          "
          :color-mode="editsSelection ? primaryItem?.colorMode : defaults.colorMode"
          :status="editsSelection ? primaryItem?.status : defaults.status"
          :options="
            primaryItem ? resolveControlMeasureOptions(primaryItem) : defaults.options
          "
          @update="updateSettings"
        />
      </PanelDataGrid>
    </PopoverContent>
  </Popover>
</template>
