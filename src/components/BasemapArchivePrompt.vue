<script setup lang="ts">
/**
 * Startup prompt for a basemap archive the user opened in an earlier session.
 *
 * The archive is a file on disk that only the user can hand us again, so the prompt asks for it
 * rather than pretending the basemap is still there. Dismissible, and it never comes back in the
 * same session.
 */
import { Button } from "@/components/ui/button";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { useBasemapArchives } from "@/composables/basemapArchives";

const { archiveToReselect, dismissArchivePrompt, openBasemapArchivePicker } =
  useBasemapArchives();
</script>

<template>
  <div
    v-if="archiveToReselect"
    class="border-border bg-background/95 pointer-events-auto flex max-w-sm items-start gap-3 rounded-md border p-3 shadow-md backdrop-blur-sm"
    role="status"
    data-test="basemap-archive-prompt"
  >
    <div class="min-w-0 flex-auto text-sm">
      <p class="font-medium">
        Basemap {{ archiveToReselect.fileName }} needs to be selected again
      </p>
      <p class="text-muted-foreground mt-1">
        Map files stay on your computer, so the browser cannot open this one again by
        itself.
      </p>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        class="mt-2"
        data-test="basemap-archive-prompt-select"
        @click="openBasemapArchivePicker()"
      >
        Select map file…
      </Button>
    </div>
    <button
      type="button"
      class="text-muted-foreground hover:text-foreground shrink-0"
      title="Dismiss"
      data-test="basemap-archive-prompt-dismiss"
      @click="dismissArchivePrompt()"
    >
      <XMarkIcon class="size-4" />
    </button>
  </div>
</template>
