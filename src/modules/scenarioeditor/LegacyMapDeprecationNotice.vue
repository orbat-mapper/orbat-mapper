<script setup lang="ts">
import { TriangleAlertIcon, XIcon } from "@lucide/vue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/index";
import {
  LEGACY_MAP_CONTACT_EMAIL,
  LEGACY_MAP_REMOVAL_DATE,
  useLegacyMapDeprecationNotice,
} from "@/composables/legacyMapDeprecation";

const { isVisible, dismiss } = useLegacyMapDeprecationNotice();
</script>

<template>
  <div
    v-if="isVisible"
    aria-live="polite"
    class="pointer-events-none fixed inset-x-0 top-2 z-[9998] flex justify-center px-2 sm:top-4"
  >
    <Alert variant="destructive" class="pointer-events-auto max-w-md shadow-lg">
      <TriangleAlertIcon />
      <AlertTitle>Legacy map mode is deprecated</AlertTitle>
      <AlertDescription>
        <p>
          The legacy OpenLayers map mode will be removed on
          {{ LEGACY_MAP_REMOVAL_DATE }}. If you rely on functionality only available in
          legacy mode, please contact
          <a class="underline" :href="`mailto:${LEGACY_MAP_CONTACT_EMAIL}`">{{
            LEGACY_MAP_CONTACT_EMAIL
          }}</a
          >.
        </p>
      </AlertDescription>
      <Button
        class="absolute top-1 right-1"
        size="icon"
        variant="ghost"
        @click="dismiss()"
      >
        <span class="sr-only">Dismiss</span>
        <XIcon aria-hidden="true" />
      </Button>
    </Alert>
  </div>
</template>
