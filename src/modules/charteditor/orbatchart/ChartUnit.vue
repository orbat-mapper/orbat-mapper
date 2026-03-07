<template>
  <g
    class="o-unit"
    :transform="`translate(${unitNode.x}, ${unitNode.y})`"
    @click="$emit('unitclick', unitNode)"
  >
    <g
      :transform="`translate(${-unitNode.octagonAnchor.x}, ${-unitNode.octagonAnchor.y})`"
      v-html="unitNode.symb.asSVG()"
    ></g>

    <text
      v-if="!options.hideLabel"
      :x="labelX"
      :y="labelY"
      :dy="labelDy"
      :dx="labelDx"
      :class="labelClasses"
      :font-size="options.fontSize ? options.fontSize + 'pt' : undefined"
      :font-weight="options.fontWeight"
      :font-style="options.fontStyle"
      :fill="options.fontColor || 'currentColor'"
    >
      {{ unitLabel }}
    </text>

    <!-- Personnel -->
    <template v-if="aggregatedPersonnel">
      <text
        :x="labelX"
        :y="personnelLabelY"
        :dy="labelDy"
        :dx="labelDx"
        :class="labelClasses"
        :font-size="options.fontSize ? options.fontSize + 'pt' : undefined"
        :font-weight="options.fontWeight"
        :font-style="options.fontStyle"
        :fill="options.fontColor || 'currentColor'"
      >
        {{ aggregatedPersonnel.map((p) => p.count).join("/") }} ({{
          aggregatedPersonnel.reduce((a, b) => a + b.count, 0)
        }})
      </text>
    </template>

    <!-- Equipment -->
    <template v-if="aggregatedEquipment">
      <text
        v-for="(equip, idx) in aggregatedEquipment"
        :key="equip.name"
        :x="labelX"
        :y="equipmentLabelY(idx)"
        :dy="labelDy"
        :dx="labelDx"
        :class="labelClasses"
        :font-size="options.fontSize ? options.fontSize * 0.9 + 'pt' : undefined"
        :font-weight="options.fontWeight"
        :font-style="options.fontStyle"
        :fill="options.fontColor || 'currentColor'"
      >
        {{ equip.count }} x {{ equip.name }}
      </text>
    </template>

    <!-- Debugging -->
    <g v-if="options.debug" class="debug-info pointer-events-none">
      <!-- Full Bounding Box -->
      <rect
        :x="-unitNode.boundingBox.width / 2"
        :y="unitNode.ty - unitNode.y"
        :width="unitNode.boundingBox.width"
        :height="unitNode.boundingBox.height"
        fill="none"
        stroke="red"
        stroke-width="1"
        stroke-dasharray="2,2"
      />
      <!-- Symbol Box -->
      <rect
        :x="-unitNode.symbolBoxSize.width / 2"
        :y="unitNode.st - unitNode.y"
        :width="unitNode.symbolBoxSize.width"
        :height="unitNode.symbolBoxSize.height"
        fill="none"
        stroke="blue"
        stroke-width="1"
      />
      <!-- Octagon Anchors -->
      <line
        :x1="-unitNode.symbolBoxSize.width / 2"
        :y1="unitNode.ot - unitNode.y"
        :x2="unitNode.symbolBoxSize.width / 2"
        :y2="unitNode.ot - unitNode.y"
        stroke="orange"
        stroke-width="1"
      />
      <line
        :x1="-unitNode.symbolBoxSize.width / 2"
        :y1="unitNode.ob - unitNode.y"
        :x2="unitNode.symbolBoxSize.width / 2"
        :y2="unitNode.ob - unitNode.y"
        stroke="orange"
        stroke-width="1"
      />
      <!-- Octagon Center -->
      <circle cx="0" cy="0" r="3" fill="green" />
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { OrbChartOptions, RenderedUnitNode } from "./types";
import { aggregateData } from "./svgRender";

const props = defineProps<{
  unitNode: RenderedUnitNode;
}>();

defineEmits(["unitclick"]);

const options = computed(() => props.unitNode.options as OrbChartOptions);

const unitLabel = computed(() => {
  return options.value.useShortName
    ? props.unitNode.unit.shortName || props.unitNode.unit.name
    : props.unitNode.unit.name;
});

const isRightLabel = computed(() => options.value.labelPlacement === "right");

const labelX = computed(() => {
  if (isRightLabel.value) {
    return props.unitNode.symbolBoxSize.width - props.unitNode.octagonAnchor.x;
  }
  return 0;
});

const labelY = computed(() => {
  if (isRightLabel.value) {
    return 0;
  }
  return props.unitNode.symbolBoxSize.height - props.unitNode.octagonAnchor.y;
});

const labelDx = computed(() =>
  isRightLabel.value ? `${options.value.labelOffset}pt` : "0",
);
const labelDy = computed(() =>
  isRightLabel.value ? "0" : `${options.value.labelOffset}pt`,
);
const labelClasses = computed(() => (isRightLabel.value ? "o-label-right" : "o-label"));

const aggData = computed(() => {
  if (options.value.showPersonnel || options.value.showEquipment) {
    return aggregateData(props.unitNode.unit);
  }
  return null;
});

const isLastLevel = computed(() => props.unitNode.level === options.value.maxLevels! - 1);

const aggregatedPersonnel = computed(() => {
  if (!options.value.showPersonnel || !aggData.value?.aggregatedPersonnel.length)
    return null;
  return aggData.value.aggregatedPersonnel;
});

const aggregatedEquipment = computed(() => {
  const equipment = aggData.value?.aggregatedEquipment;
  if (!options.value.showEquipment || !equipment?.length) return null;
  if (isLastLevel.value || !props.unitNode.unit.subUnits?.length) {
    return equipment;
  }
  return null;
});

const personnelLabelY = computed(() => labelY.value + 25);
const equipmentLabelY = (idx: number) => {
  let base = labelY.value;
  if (aggregatedPersonnel.value) base += 25;
  base += 25;
  return base + idx * 20;
};
</script>
