<script setup lang="ts">
import { ref, watch } from "vue";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomBasemaps } from "@/composables/customBasemaps";

// One dialog for both entry points — the Layers panel button and the map context menu — so the
// wording, the examples and what counts as a valid address are defined once.
const open = defineModel<boolean>({ default: false });

const { addCustomBasemap } = useCustomBasemaps();
const url = ref("");

watch(open, (isOpen) => {
  if (isOpen) url.value = "";
});

async function onSubmit() {
  // The composable reports a bad address itself, and leaves the dialog open with the text in it.
  if (await addCustomBasemap(url.value)) open.value = false;
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
      <div class="flex justify-end gap-2">
        <Button type="button" variant="ghost" @click="open = false">Cancel</Button>
        <Button type="submit" data-test="add-map-server-submit">Add</Button>
      </div>
    </form>
  </NewSimpleModal>
</template>
