import { computed, onMounted, ref } from "vue";
import { type ScenarioMetadata, useIndexedDb } from "@/scenariostore/localdb";
import type { MenuItemData } from "@/components/types";
import type { StoredScenarioAction, StoredScenarioBulkAction } from "@/types/constants";
import { MAP_EDIT_MODE_ROUTE } from "@/router/names";
import type { Scenario } from "@/types/scenarioModels";
import { nanoid } from "@/utils";
import { useRouter } from "vue-router";
import { useClipboard } from "@vueuse/core";
import { useNotifications } from "@/composables/notifications";

interface UseBrowserScenariosOptions {
  routeName?: string;
}

export const DEMO_SCENARIOS = [
  {
    name: "The Falklands War 1982",
    id: "falkland82",
    summary:
      "The Falklands War was a military conflict that took place in 1982 between Argentina and the United Kingdom. Argentina invaded the Falkland Islands on April 2, 1982, and the UK responded by sending a task force to retake the islands.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/8b/HMS_Broadsword_and_Hermes%2C_1982_%28IWM%29.jpg",
  },
  {
    name: "Battles of Narvik 1940",
    id: "narvik40",
    summary:
      "A series of naval and land engagements fought between German and Allied forces from April to June 1940. The battles marked the first Allied victory against Germany in the war.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/5f/Norwegian_Army_Colt_heavy_machine_gun_at_the_Narvik_front.jpg",
  },
];

export function useBrowserScenarios(options: UseBrowserScenariosOptions = {}) {
  const router = useRouter();
  const { copy: copyToClipboard } = useClipboard();
  const { send } = useNotifications();
  const storedScenarios = ref<ScenarioMetadata[]>([]);
  const activeSort = ref<"name" | "lastModified" | "created">("lastModified");
  const activeSortDirection = ref<"asc" | "desc">("desc");
  const routeName = options.routeName ?? MAP_EDIT_MODE_ROUTE;

  function getDefaultSortDirection(sort: "name" | "lastModified" | "created") {
    return sort === "name" ? "asc" : "desc";
  }

  function applySort(
    sort: "name" | "lastModified" | "created",
    direction: "asc" | "desc" = activeSortDirection.value,
  ) {
    const directionMultiplier = direction === "asc" ? 1 : -1;

    switch (sort) {
      case "name":
        storedScenarios.value.sort(
          (a, b) => a.name.localeCompare(b.name) * directionMultiplier,
        );
        break;
      case "created":
        storedScenarios.value.sort(
          (a, b) => (+a.created - +b.created) * directionMultiplier,
        );
        break;
      case "lastModified":
      default:
        storedScenarios.value.sort(
          (a, b) => (+a.modified - +b.modified) * directionMultiplier,
        );
        break;
    }
  }

  const sortOptions = computed<MenuItemData[]>(() => [
    {
      label: "Name",
      action: () => {
        activeSort.value = "name";
        activeSortDirection.value = getDefaultSortDirection(activeSort.value);
        applySort(activeSort.value, activeSortDirection.value);
      },
      active: activeSort.value === "name",
    },
    {
      label: "Last modified",
      action: () => {
        activeSort.value = "lastModified";
        activeSortDirection.value = getDefaultSortDirection(activeSort.value);
        applySort(activeSort.value, activeSortDirection.value);
      },
      active: activeSort.value === "lastModified",
    },
    {
      label: "Created",
      action: () => {
        activeSort.value = "created";
        activeSortDirection.value = getDefaultSortDirection(activeSort.value);
        applySort(activeSort.value, activeSortDirection.value);
      },
      active: activeSort.value === "created",
    },
  ]);

  function toggleSortDirection() {
    activeSortDirection.value = activeSortDirection.value === "asc" ? "desc" : "asc";
    applySort(activeSort.value, activeSortDirection.value);
  }

  async function reloadScenarios() {
    const { listScenarios } = await useIndexedDb();
    storedScenarios.value = await listScenarios();
    applySort(activeSort.value, activeSortDirection.value);
  }

  async function onAction(action: StoredScenarioAction, scenario: ScenarioMetadata) {
    const {
      deleteScenario,
      duplicateScenario,
      downloadAsJson,
      loadScenario: loadScenarioFromDb,
    } = await useIndexedDb();
    switch (action) {
      case "open":
        await router.push({
          name: routeName,
          params: { scenarioId: scenario.id },
        });
        break;
      case "delete":
        if (
          window.confirm(
            `Are you sure you want to permanently delete the scenario "${scenario.name}"?`,
          )
        ) {
          await deleteScenario(scenario.id);
        }
        break;
      case "download":
        await downloadAsJson(scenario.id);
        break;
      case "duplicate":
        await duplicateScenario(scenario.id);
        break;
      case "copyToClipboard": {
        const scenarioBlob = await loadScenarioFromDb(scenario.id);
        if (scenarioBlob) {
          await copyToClipboard(JSON.stringify(scenarioBlob, null, 2));
          send({ message: "Scenario copied to clipboard", type: "success" });
        }
        break;
      }
    }

    await reloadScenarios();
  }

  async function onBulkAction(
    action: StoredScenarioBulkAction,
    scenarios: ScenarioMetadata[],
  ) {
    if (!scenarios.length) {
      return;
    }

    const { deleteScenarios } = await useIndexedDb();

    switch (action) {
      case "delete":
        await deleteScenarios(scenarios.map((scenario) => scenario.id));
        send({
          message: `Deleted ${scenarios.length} scenario${scenarios.length === 1 ? "" : "s"}`,
          type: "success",
        });
        break;
    }

    await reloadScenarios();
  }

  async function loadScenario(v: Scenario, routeName = MAP_EDIT_MODE_ROUTE) {
    const { addScenario, getScenarioInfo, putScenario } = await useIndexedDb();

    const existingScenarioInfo = await getScenarioInfo(v.id ?? nanoid());
    if (existingScenarioInfo) {
      let scenarioId = v.id;
      if (
        window.confirm(
          "A scenario with the same ID is stored in the browser. Do you want to replace it with this scenario?",
        )
      ) {
        scenarioId = await putScenario(v);
      } else {
        scenarioId = await addScenario(v, nanoid());
      }
      await router.push({ name: routeName, params: { scenarioId } });
    } else {
      const scenarioId = await addScenario(v);
      await router.push({ name: routeName, params: { scenarioId } });
    }
  }

  async function importScenario(scenarioId: string) {
    const { loadScenario } = await useIndexedDb();
    const scenario = await loadScenario(scenarioId);
    if (scenario) {
      return scenario;
    }
  }

  onMounted(async () => {
    await reloadScenarios();
  });

  return {
    storedScenarios,
    sortOptions,
    sortDirection: activeSortDirection,
    toggleSortDirection,
    onAction,
    onBulkAction,
    loadScenario,
    importScenario,
  };
}
