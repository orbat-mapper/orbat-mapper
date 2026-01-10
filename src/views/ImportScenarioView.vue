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
  FileWarningIcon,
  LoaderCircleIcon,
  MoonStarIcon,
  SunIcon,
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

onMounted(async () => {
  const dataParam = route.query.data as string;
  if (!dataParam) {
    error.value = "No scenario data provided in the URL.";
    isLoading.value = false;
    return;
  }

  try {
    scenarioData.value = await loadScenarioFromUrlParam(dataParam);

    // Check if scenario with same ID exists
    const { getScenarioInfo } = await useIndexedDb();
    const existingInfo = await getScenarioInfo(scenarioData.value.id ?? "");
    hasConflict.value = !!existingInfo;
  } catch (e) {
    console.error("Failed to decode scenario from URL", e);
    error.value = "Failed to decode the scenario. The URL may be corrupted or invalid.";
  } finally {
    isLoading.value = false;
  }
});

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
  await router.push({ name: MAP_EDIT_MODE_ROUTE, params: { scenarioId } });
}

async function handleOverwrite() {
  if (!scenarioData.value) return;

  const { putScenario } = await useIndexedDb();
  const plainScenario = toRaw(scenarioData.value);
  const scenarioWithId = { ...plainScenario, id: plainScenario.id ?? nanoid() };
  const scenarioId = await putScenario(scenarioWithId);
  await router.push({ name: MAP_EDIT_MODE_ROUTE, params: { scenarioId } });
}

async function handleCreateCopy() {
  if (!scenarioData.value) return;

  const { addScenario } = await useIndexedDb();
  const plainScenario = toRaw(scenarioData.value);
  const newId = nanoid();
  const scenarioCopy = { ...plainScenario, id: newId };
  const scenarioId = await addScenario(scenarioCopy, newId);
  await router.push({ name: MAP_EDIT_MODE_ROUTE, params: { scenarioId } });
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
          <!-- Loading State -->
          <div v-if="isLoading" class="flex flex-col items-center gap-4 py-8">
            <LoaderCircleIcon class="text-muted-foreground size-8 animate-spin" />
            <p class="text-muted-foreground">Decoding scenario data...</p>
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
