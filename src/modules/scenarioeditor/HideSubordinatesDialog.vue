<script setup lang="ts">
import { ref } from "vue";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import NewSelect from "@/components/NewSelect.vue";
import { Button } from "@/components/ui/button";
import { ECHELONS_BIG_FIRST } from "@/symbology/echelonSize";
import type { NewSelectItem } from "@/components/types";
import type { SubordinateCutoff } from "@/scenariostore/subordinateVisibility";

/** Asks which part of a unit's branch stays on the map: a depth below the unit
 *  and/or a smallest echelon. */
defineProps<{ unitLabel: string }>();
const emit = defineEmits<{
  confirm: [cutoff: SubordinateCutoff];
  cancel: [];
}>();

const open = ref(true);
const maxDepth = ref<number | null>(1);
const minEchelon = ref<string | null>(null);

const depthItems: NewSelectItem<number>[] = [1, 2, 3, 4, 5].map((depth) => ({
  label: depth === 1 ? "1 level" : `${depth} levels`,
  value: depth,
}));

const echelonItems: NewSelectItem<string>[] = ECHELONS_BIG_FIRST.map((v) => ({
  label: v.text,
  value: v.code,
}));

function onApply() {
  emit("confirm", {
    maxDepth: maxDepth.value ?? undefined,
    minEchelon: minEchelon.value ?? undefined,
  });
}
</script>

<template>
  <NewSimpleModal
    v-model="open"
    dialog-title="Hide subordinates below"
    @cancel="emit('cancel')"
  >
    <template #description>
      Choose which subordinates of {{ unitLabel }} stay on the map. A unit deeper or
      smaller than the limits is hidden together with its own subordinates; the rest of
      the branch is shown.
    </template>
    <form class="space-y-4" @submit.prevent="onApply">
      <NewSelect
        v-model="maxDepth"
        label="Levels below"
        description="Direct subordinates count as 1 level, attached units included."
        :items="depthItems"
        add-none
        placeholder="Any depth"
      />
      <NewSelect
        v-model="minEchelon"
        label="Smallest echelon"
        description="Units without an echelon, such as equipment, follow their superior."
        :items="echelonItems"
        add-none
        placeholder="Any echelon"
      />
      <div class="flex justify-end gap-2">
        <Button type="button" variant="outline" @click="emit('cancel')">Cancel</Button>
        <Button type="submit">Apply</Button>
      </div>
    </form>
  </NewSimpleModal>
</template>
