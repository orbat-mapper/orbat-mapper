<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { TimedHierarchyMove } from "@/types/scenarioModels";
import type { NUnit } from "@/types/internalModels";
import type { DropTarget, EntityId } from "@/types/base";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { formatDateString } from "@/geo/utils";
import SimpleModal from "@/components/SimpleModal.vue";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Field, FieldLabel } from "@/components/ui/field";

interface Props {
  modelValue: boolean;
  unit: NUnit;
  timestamp: number;
  initialHierarchy?: TimedHierarchyMove;
}

type HierarchyTargetOption = {
  id: EntityId;
  label: string;
};

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  save: [value: TimedHierarchyMove];
}>();

const { store, unitActions } = injectStrict(activeScenarioKey);

const hierarchyTargetId = ref<EntityId | null>(null);
const hierarchyPlacement = ref<DropTarget>("on");

const excludedHierarchyTargetIds = computed(() => {
  const excluded = new Set<EntityId>([props.unit.id]);
  const stack = [...props.unit.subUnits];
  while (stack.length) {
    const currentId = stack.pop()!;
    excluded.add(currentId);
    const current = store.state.unitMap[currentId];
    if (current) stack.push(...current.subUnits);
  }
  return excluded;
});

const hierarchyTargetOptions = computed((): HierarchyTargetOption[] => {
  const options: HierarchyTargetOption[] = [];
  const excluded = excludedHierarchyTargetIds.value;

  store.state.sides.forEach((sideId) => {
    const side = store.state.sideMap[sideId];
    if (!side) return;
    if (hierarchyPlacement.value === "on") {
      options.push({ id: side.id, label: `Side: ${side.name}` });
    }

    side.groups.forEach((groupId) => {
      const group = store.state.sideGroupMap[groupId];
      if (!group) return;
      if (hierarchyPlacement.value === "on") {
        options.push({ id: group.id, label: `Group: ${side.name} / ${group.name}` });
      }
    });

    unitActions.walkSide(side.id, (unit, level) => {
      if (excluded.has(unit.id)) return;
      const prefix = "  ".repeat(level);
      options.push({
        id: unit.id,
        label: `Unit: ${prefix}${unit.shortName || unit.name}`,
      });
    });
  });

  return options;
});

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return;
    hierarchyPlacement.value = props.initialHierarchy?.placement ?? "on";
    hierarchyTargetId.value = props.initialHierarchy?.targetId ?? null;
  },
  { immediate: true },
);

watch(hierarchyTargetOptions, (options) => {
  if (!options.length) {
    hierarchyTargetId.value = null;
    return;
  }
  if (
    !hierarchyTargetId.value ||
    !options.some((option) => option.id === hierarchyTargetId.value)
  ) {
    hierarchyTargetId.value = options[0].id;
  }
});

function close() {
  emit("update:modelValue", false);
}

function save() {
  if (!hierarchyTargetId.value) return;
  const move: TimedHierarchyMove = {
    targetId: hierarchyTargetId.value,
    placement: hierarchyPlacement.value,
  };
  if (hierarchyPlacement.value === "above" || hierarchyPlacement.value === "below") {
    const targetUnit = store.state.unitMap[hierarchyTargetId.value];
    const targetSideGroup = store.state.sideGroupMap[hierarchyTargetId.value];
    move.parentId =
      targetUnit?._basePid ?? targetUnit?._pid ?? targetSideGroup?._pid ?? "";
  }
  emit("save", move);
  close();
}
</script>

<template>
  <SimpleModal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    dialog-title="Reposition in ORBAT"
  >
    <div class="space-y-4">
      <p class="text-muted-foreground text-sm">
        {{ formatDateString(timestamp, store.state.info.timeZone) }}
      </p>
      <Field>
        <FieldLabel>Placement</FieldLabel>
        <NativeSelect v-model="hierarchyPlacement" class="w-full">
          <NativeSelectOption value="on">on</NativeSelectOption>
          <NativeSelectOption value="above">above</NativeSelectOption>
          <NativeSelectOption value="below">below</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel>Target</FieldLabel>
        <NativeSelect v-model="hierarchyTargetId" class="w-full">
          <NativeSelectOption
            v-for="option in hierarchyTargetOptions"
            :key="option.id"
            :value="option.id"
          >
            {{ option.label }}
          </NativeSelectOption>
        </NativeSelect>
      </Field>
      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="close()">Cancel</Button>
        <Button
          :disabled="!hierarchyTargetId || !hierarchyTargetOptions.length"
          @click="save()"
        >
          Save
        </Button>
      </div>
    </div>
  </SimpleModal>
</template>
