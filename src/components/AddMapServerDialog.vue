<script setup lang="ts">
import { computed, ref, watch } from "vue";
import InputCheckbox from "@/components/InputCheckbox.vue";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomBasemaps } from "@/composables/customBasemaps";
import { useElevationArchive } from "@/composables/elevationArchive";
import { customBasemapSourceType } from "@/geo/customBasemap";

// One dialog for both entry points — the Layers panel button and the map context menu — so the
// wording, the examples and what counts as a valid address are defined once.
const open = defineModel<boolean>({ default: false });

const { addCustomBasemap } = useCustomBasemaps();
const { addElevationArchiveUrl } = useElevationArchive();
const url = ref("");
// An elevation archive looks like imagery, thus the user has to say what the archive holds.
const isElevation = ref(false);
const isArchiveAddress = computed(() => customBasemapSourceType(url.value) === "pmtiles");

watch(open, (isOpen) => {
  if (isOpen) {
    url.value = "";
    isElevation.value = false;
  }
});

async function onSubmit() {
  // The composables report a bad address themselves, and leave the dialog open with the text in it.
  const added =
    isArchiveAddress.value && isElevation.value
      ? await addElevationArchiveUrl(url.value)
      : await addCustomBasemap(url.value);
  if (added) open.value = false;
}
</script>

<template>
  <NewSimpleModal v-model="open" dialog-title="Add map server">
    <template #description>
      Type the address of a map server. ORBAT Mapper keeps it in this browser and offers
      it as a base layer.
    </template>
    <form class="space-y-4" @submit.prevent="onSubmit()">
      <Input
        v-model="url"
        type="text"
        autofocus
        aria-label="Address of the map server"
        placeholder="https://tiles.example.lan/style.json"
        data-test="map-server-url"
      />
      <dl class="text-muted-foreground space-y-1 text-xs">
        <div class="flex gap-2">
          <dt class="w-28 shrink-0">Style</dt>
          <dd class="truncate">https://tiles.example.lan/style.json</dd>
        </div>
        <div class="flex gap-2">
          <dt class="w-28 shrink-0">Raster tiles</dt>
          <dd class="truncate">https://tiles.example.lan/{z}/{x}/{y}.png</dd>
        </div>
        <div class="flex gap-2">
          <dt class="w-28 shrink-0">PMTiles</dt>
          <dd class="truncate">https://tiles.example.lan/denmark.pmtiles</dd>
        </div>
      </dl>
      <InputCheckbox
        v-if="isArchiveAddress"
        v-model="isElevation"
        label="Elevation archive"
        description="Use the archive for 3D terrain and hillshading, not as a base layer."
        data-test="map-server-elevation"
      />
      <div class="flex justify-end gap-2">
        <Button type="button" variant="ghost" @click="open = false">Cancel</Button>
        <Button type="submit" data-test="add-map-server-submit">Add</Button>
      </div>
    </form>
  </NewSimpleModal>
</template>
