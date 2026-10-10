<script setup lang="ts">
/**
 * The Amplifiers tab for a point symbol — the counterpart to `ControlMeasureAmplifiers`
 * and laid out the same way: a preview, then one field per amplifier the symbol's
 * layout has room for (tactrace's Table VI subset). A field commits on change, so a
 * typed value is one undo step.
 */
import { computed, ref, watch } from "vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import "@/symbology/milsymbolLabelOverrides";
import {
  pointTextAmplifierFields,
  pointTextAmplifierMilsymbolOptions,
} from "@/symbology/pointTextAmplifiers";

const props = defineProps<{
  sidc: string;
  textAmplifiers?: Record<string, string>;
}>();
const emit = defineEmits<{ update: [textAmplifiers: Record<string, string>] }>();

const fields = computed(() => pointTextAmplifierFields(props.sidc));

// Edited locally and committed on change, like the control-measure fields.
const draft = ref<Record<string, string>>({});
watch(
  () => props.textAmplifiers,
  (values) => (draft.value = { ...(values ?? {}) }),
  { immediate: true },
);

const previewOptions = computed(() =>
  pointTextAmplifierMilsymbolOptions({ sidc: props.sidc, textAmplifiers: draft.value }),
);

function setValue(code: string, value: string) {
  draft.value = { ...draft.value, [code]: value };
}

/**
 * Commit one field from its own value over the stored amplifiers. The local draft only
 * drives the preview; reading the committed value from the stored item keeps a
 * re-render between keystroke and change from losing or resurrecting anything.
 */
function commit(code: string, value: string) {
  const current = props.textAmplifiers ?? {};
  const trimmed = value.trim();
  if ((current[code] ?? "") === trimmed) return;
  const next = { ...current };
  if (trimmed) next[code] = trimmed;
  else delete next[code];
  emit("update", next);
}

/** N is a flag on the standard's examples: present as "ENY", or absent. */
function setHostile(enabled: boolean) {
  setValue("N", enabled ? "ENY" : "");
  commit("N", enabled ? "ENY" : "");
}
</script>

<template>
  <div class="space-y-5 pt-4">
    <div class="space-y-2">
      <p class="text-muted-foreground text-xs">
        Preview of the doctrinal field positions.
      </p>
      <div
        class="border-border bg-muted/30 text-foreground flex min-h-36 w-full items-center justify-center overflow-hidden rounded-md border p-3"
      >
        <MilitarySymbol :sidc="sidc" :size="40" :options="previewOptions" />
      </div>
    </div>

    <div v-if="fields.length" class="space-y-4">
      <div v-for="field in fields" :key="field.code" class="space-y-1.5">
        <div class="flex items-baseline justify-between gap-3">
          <Label :for="`point-symbol-amplifier-${field.code}`">{{ field.label }}</Label>
          <span class="text-muted-foreground font-mono text-xs">{{ field.code }}</span>
        </div>
        <Switch
          v-if="field.code === 'N'"
          :id="`point-symbol-amplifier-${field.code}`"
          :model-value="Boolean(draft.N)"
          @update:model-value="setHostile(Boolean($event))"
        />
        <Input
          v-else
          :id="`point-symbol-amplifier-${field.code}`"
          type="text"
          :model-value="draft[field.code] ?? ''"
          @update:model-value="setValue(field.code, String($event))"
          @change="commit(field.code, ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
    <p v-else class="text-muted-foreground text-sm">
      This symbol has no doctrinal amplifier fields.
    </p>
  </div>
</template>
