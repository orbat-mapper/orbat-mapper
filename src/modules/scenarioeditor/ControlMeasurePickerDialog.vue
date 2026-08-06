<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  ListboxContent,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxRoot,
} from "reka-ui";
import { IconPin, IconPinOutline } from "@iconify-prerendered/vue-mdi";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import CommandPaletteDialog from "@/components/commandPalette/CommandPaletteDialog.vue";
import CommandPaletteInput from "@/components/commandPalette/CommandPaletteInput.vue";
import ControlMeasurePreview from "@/modules/scenarioeditor/ControlMeasurePreview.vue";
import {
  groupControlMeasureKinds,
  searchControlMeasureKinds,
  type ControlMeasureKindOption,
} from "@/modules/scenarioeditor/controlMeasurePicker";
import { useControlMeasureToolStore } from "@/stores/controlMeasureToolStore";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";

/**
 * The full control-measure registry as a command palette.
 *
 * Keyboard-first: the filter takes focus on open, arrow keys walk the list and Enter
 * arms the highlighted kind. It reuses the app's own palette chrome rather than
 * porting tactrace's picker, so it inherits the dialog, filter and item behaviour the
 * rest of the app already has.
 */
const emit = defineEmits<{ (e: "select", kind: ControlMeasureId): void }>();

const open = defineModel<boolean>({ default: false });

const toolStore = useControlMeasureToolStore();
const query = ref("");
const hits = computed(() => searchControlMeasureKinds(query.value));
const groupedHits = computed(() => groupControlMeasureKinds(hits.value));

watch(open, (isOpen) => {
  if (isOpen) query.value = "";
});

function onSelect(value: unknown) {
  const option = value as ControlMeasureKindOption | null;
  if (!option) return;
  // Picking is also what fills the pinned strip: the kinds a user actually draws end
  // up one click away without any explicit pinning.
  toolStore.pinKind(option.id);
  emit("select", option.id);
  open.value = false;
}
</script>

<template>
  <CommandPaletteDialog
    v-model:open="open"
    title="Control measures"
    description="Search for a control measure to draw..."
  >
    <ListboxRoot
      data-slot="command"
      class="bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md"
      @update:modelValue="onSelect"
    >
      <CommandPaletteInput v-model="query" placeholder="Search control measures..." />
      <ListboxContent
        data-slot="command-list"
        class="max-h-[60vh] scroll-py-1 overflow-x-hidden overflow-y-auto"
      >
        <div role="presentation">
          <ListboxGroup
            v-for="[entity, options] in groupedHits"
            :key="entity"
            :id="entity"
            data-slot="command-group"
            class="text-foreground overflow-hidden p-1"
          >
            <ListboxGroupLabel
              data-slot="command-group-heading"
              class="text-muted-foreground px-2 py-1.5 text-xs font-medium"
            >
              {{ entity }}
            </ListboxGroupLabel>
            <ListboxItem
              v-for="option in options"
              :key="option.id"
              data-slot="command-item"
              :value="option"
              class="data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex cursor-default items-center gap-3 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none"
            >
              <ControlMeasurePreview :kind="option.id" class="size-8 shrink-0" />
              <span class="min-w-0 flex-auto">
                <span class="block truncate">{{ option.name }}</span>
                <span
                  v-if="option.qualifier"
                  class="text-muted-foreground block truncate text-xs"
                >
                  {{ option.qualifier }}
                </span>
              </span>
              <button
                type="button"
                class="text-muted-foreground hover:text-foreground shrink-0"
                :title="
                  toolStore.pinnedKinds.includes(option.id)
                    ? 'Remove from toolbar'
                    : 'Add to toolbar'
                "
                @click.stop="toolStore.togglePinnedKind(option.id)"
              >
                <IconPin
                  v-if="toolStore.pinnedKinds.includes(option.id)"
                  class="size-4"
                />
                <IconPinOutline v-else class="size-4" />
              </button>
            </ListboxItem>
          </ListboxGroup>
        </div>
      </ListboxContent>
    </ListboxRoot>
    <div v-if="!hits.length" class="px-6 py-14 text-center text-sm sm:px-14">
      <ExclamationTriangleIcon
        class="text-muted-foreground mx-auto size-6"
        aria-hidden="true"
      />
      <p class="mt-4">No control measures found</p>
    </div>
  </CommandPaletteDialog>
</template>
