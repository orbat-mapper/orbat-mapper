<script setup lang="ts">
import { computed, onMounted, ref, toRaw } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useScenarioShare } from "@/composables/scenarioShare";
import { useIndexedDb } from "@/scenariostore/localdb";
import { MAP_EDIT_MODE_ROUTE, LANDING_PAGE_ROUTE } from "@/router/names";
import { nanoid } from "@/utils";
import type { Scenario, Unit } from "@/types/scenarioModels";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangleIcon,
  ExternalLinkIcon,
  FileWarningIcon,
  LoaderCircleIcon,
  MoonStarIcon,
  SunIcon,
  Download as DownloadIcon,
} from "lucide-vue-next";
import { UseDark } from "@vueuse/components";
import { IconGithub as GithubIcon } from "@iconify-prerendered/vue-mdi";

const route = useRoute();
const router = useRouter();
const { loadScenarioFromUrlParam } = useScenarioShare();

const isLoading = ref(true);
const error = ref<string | null>(null);
const scenarioData = ref<Scenario | null>(null);
const hasConflict = ref(false);
const isWaitingForDownload = ref(false);

onMounted(async () => {
  const dataParam = route.query.data as string;
  const idParam = route.query.id as string;

  if (!dataParam && !idParam) {
    error.value = "No scenario data provided in the URL.";
    isLoading.value = false;
    return;
  }

  isWaitingForDownload.value = true;
  isLoading.value = false;
});

async function handleDownload() {
  isWaitingForDownload.value = false;
  isLoading.value = true;
  const dataParam = route.query.data as string;
  const idParam = route.query.id as string;

  try {
    if (idParam) {
      const response = await fetch(`/share?id=${idParam}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Scenario not found.");
        throw new Error("Failed to load scenario.");
      }
      scenarioData.value = await response.json();
    } else {
      scenarioData.value = await loadScenarioFromUrlParam(dataParam);
    }

    // Remove the data from the URL so it's not stored in history
    // await router.replace({ query: {} });

    // Check if scenario with same ID exists
    if (scenarioData.value && scenarioData.value.id) {
      const { getScenarioInfo } = await useIndexedDb();
      const existingInfo = await getScenarioInfo(scenarioData.value.id);
      hasConflict.value = !!existingInfo;
    }
  } catch (e: any) {
    console.error("Failed to load scenario", e);
    error.value =
      e.message || "Failed to decode the scenario. The URL may be corrupted or invalid.";
  } finally {
    isLoading.value = false;
  }
}

const scenarioName = computed(() => scenarioData.value?.name ?? "Unnamed Scenario");
const scenarioDescription = computed(() => scenarioData.value?.description ?? "");

const unitCount = computed(() => {
  if (!scenarioData.value) return 0;
  let count = 0;

  function countUnits(units?: Unit[]): number {
    if (!units) return 0;
    return units.reduce((acc, unit) => acc + 1 + countUnits(unit.subUnits), 0);
  }

  scenarioData.value.sides.forEach((side) => {
    count += countUnits(side.subUnits);
    side.groups.forEach((group) => {
      count += countUnits(group.subUnits);
    });
  });
  return count;
});

const sideCount = computed(() => scenarioData.value?.sides.length ?? 0);

async function handleCancel() {
  await router.push({ name: LANDING_PAGE_ROUTE });
}

async function handleLoad() {
  if (!scenarioData.value) return;

  const { addScenario } = await useIndexedDb();
  const plainScenario = toRaw(scenarioData.value);
  const scenarioId = await addScenario(plainScenario);
  await router.replace({ name: MAP_EDIT_MODE_ROUTE, params: { scenarioId } });
}

async function handleOverwrite() {
  if (!scenarioData.value) return;

  const { putScenario } = await useIndexedDb();
  const plainScenario = toRaw(scenarioData.value);
  const scenarioWithId = { ...plainScenario, id: plainScenario.id ?? nanoid() };
  const scenarioId = await putScenario(scenarioWithId);
  await router.replace({ name: MAP_EDIT_MODE_ROUTE, params: { scenarioId } });
}

async function handleCreateCopy() {
  if (!scenarioData.value) return;

  const { addScenario } = await useIndexedDb();
  const plainScenario = toRaw(scenarioData.value);
  const newId = nanoid();
  // Create a copy with the new ID and updated name
  const scenarioCopy = {
    ...plainScenario,
    id: newId,
    name: `${plainScenario.name} (copy)`,
  };
  const scenarioId = await addScenario(scenarioCopy, newId);
  await router.replace({ name: MAP_EDIT_MODE_ROUTE, params: { scenarioId } });
}
</script>

<template>
  <div class="bg-background flex min-h-screen flex-col items-center">
    <header
      class="bg-muted relative top-0 right-0 left-0 flex w-full items-center justify-center gap-8 p-1 text-center"
    >
      <p>
        This is a work in progress prototype. Follow the
        <a href="https://github.com/orbat-mapper/orbat-mapper" class="underline"
          >development on GitHub <GithubIcon class="inline size-6 sm:size-8" />
        </a>
        |
        <a href="https://docs.orbat-mapper.app" class="underline" target="_blank"
          >Documentation <ExternalLinkIcon class="inline size-4" />
        </a>
      </p>
      <UseDark v-slot="{ isDark, toggleDark }">
        <Button
          variant="ghost"
          size="icon"
          @click="toggleDark()"
          title="Toggle dark mode"
        >
          <SunIcon v-if="isDark" /><MoonStarIcon v-else />
        </Button>
      </UseDark>
    </header>

    <main class="flex w-full max-w-lg flex-1 flex-col items-center justify-center p-4">
      <div class="mb-8 text-center">
        <h1 class="text-heading text-4xl font-bold tracking-tight">
          <span class="text-red-900 dark:text-red-900/90">ORBAT</span>
          Mapper
        </h1>
      </div>

      <Card class="w-full">
        <CardHeader>
          <CardTitle class="text-2xl">Import Scenario</CardTitle>
          <CardDescription>
            A scenario has been shared with you via URL.
          </CardDescription>
        </CardHeader>

        <CardContent class="space-y-6">
          <!-- Waiting for Download State -->
          <div
            v-if="isWaitingForDownload"
            class="flex flex-col items-center gap-4 py-8 text-center"
          >
            <div class="bg-muted rounded-full p-4">
              <DownloadIcon class="text-primary size-8" />
            </div>
            <div class="space-y-2">
              <h3 class="text-lg font-semibold">Ready to Import</h3>
              <p class="text-muted-foreground text-sm">
                Click the button below to download and preview the shared scenario.
              </p>
            </div>
            <Button @click="handleDownload">Download Scenario</Button>
          </div>

          <!-- Loading State -->
          <div v-else-if="isLoading" class="flex flex-col items-center gap-4 py-8">
            <LoaderCircleIcon class="text-muted-foreground size-8 animate-spin" />
            <p class="text-muted-foreground">
              {{
                route.query.id ? "Downloading scenario..." : "Decoding scenario data..."
              }}
            </p>
          </div>

          <!-- Error State -->
          <template v-else-if="error">
            <Alert variant="destructive">
              <FileWarningIcon class="size-4" />
              <AlertTitle>Import Failed</AlertTitle>
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>
            <div class="flex justify-end">
              <Button @click="handleCancel">Go Back</Button>
            </div>
          </template>

          <!-- Success State -->
          <template v-else-if="scenarioData">
            <!-- Scenario Info -->
            <div class="space-y-2">
              <h3 class="text-lg font-semibold">{{ scenarioName }}</h3>
              <p v-if="scenarioDescription" class="text-muted-foreground text-sm">
                {{ scenarioDescription }}
              </p>
              <p class="text-muted-foreground text-sm font-medium">
                Sides: {{ sideCount }} | Units: {{ unitCount }}
              </p>
            </div>

            <!-- Conflict Warning -->
            <Alert v-if="hasConflict">
              <AlertTriangleIcon class="size-4" />
              <AlertTitle>Scenario Already Exists</AlertTitle>
              <AlertDescription>
                A scenario with the same ID is already stored in your browser. You can
                overwrite it or create a copy.
              </AlertDescription>
            </Alert>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-3">
              <Button variant="outline" @click="handleCancel">Cancel</Button>

              <template v-if="hasConflict">
                <Button variant="destructive" @click="handleOverwrite">Overwrite</Button>
                <Button @click="handleCreateCopy">Create Copy</Button>
              </template>
              <template v-else>
                <Button @click="handleLoad">Load Scenario</Button>
              </template>
            </div>
          </template>
        </CardContent>
      </Card>
    </main>
  </div>
</template>
