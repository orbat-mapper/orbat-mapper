import type { DBSchema, IDBPDatabase } from "idb";
import { openDB } from "idb";
import type { Scenario } from "@/types/scenarioModels";
import { nanoid } from "@/utils";
import { saveBlobToLocalFile } from "@/utils/files";

export interface ScenarioMetadata {
  id: string;
  name: string;
  description: string;
  created: Date;
  modified: Date;
  image: string;
}

interface ScenarioDb extends DBSchema {
  "scenario-blobs": {
    key: string;
    value: Scenario;
  };
  "scenario-metadata": {
    key: string;
    value: ScenarioMetadata;
    indexes: { "by-name": string; "by-created": Date; "by-modified": Date };
  };
}

let db: IDBPDatabase<ScenarioDb>;

export async function useIndexedDb() {
  if (!db) {
    db = await createOrUpdateDb();
  }

  function createOrUpdateDb() {
    return openDB<ScenarioDb>("scenario-db", 3, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 1) {
          db.createObjectStore("scenario-blobs");
          const metadataStore = db.createObjectStore("scenario-metadata", {
            keyPath: "id",
          });
          metadataStore.createIndex("by-name", "name", { unique: false });
          metadataStore.createIndex("by-created", "created", { unique: false });
        }

        if (oldVersion < 2) {
          const metadataStore = transaction.objectStore("scenario-metadata");
          metadataStore.createIndex("by-modified", "modified", { unique: false });
        }

        if (oldVersion < 3) {
          const metadataStore = transaction.objectStore("scenario-metadata");
          metadataStore.deleteIndex("by-name");
        }
      },
    });
  }

  async function addScenario(scenario: Scenario, id?: string) {
    const scenarioId = id ?? scenario.id ?? nanoid();
    if (scenario.id !== scenarioId) {
      scenario = { ...scenario, id: scenarioId };
    }
    await db.add("scenario-blobs", scenario, scenarioId);
    const metadata = {
      id: scenarioId,
      name: scenario.name,
      description: scenario.description ?? "",
      created: scenario.meta?.createdDate
        ? new Date(scenario.meta.createdDate)
        : new Date(),
      modified: scenario.meta?.lastModifiedDate
        ? new Date(scenario.meta.lastModifiedDate)
        : new Date(),
      image: "",
    };

    await db.add("scenario-metadata", metadata);
    return scenarioId;
  }

  async function putScenario(scenario: Scenario) {
    const existing = await db.get("scenario-metadata", scenario.id);

    await db.put("scenario-blobs", scenario, scenario.id);
    const metadata = {
      id: scenario.id,
      name: scenario.name,
      description: scenario.description ?? "",
      created: scenario.meta?.createdDate
        ? new Date(scenario.meta.createdDate)
        : (existing?.created ?? new Date()),
      modified: scenario.meta?.lastModifiedDate
        ? new Date(scenario.meta.lastModifiedDate)
        : new Date(),

      image: "",
    };

    await db.put("scenario-metadata", metadata);
    return scenario.id;
  }

  async function loadScenario(id: string) {
    const scenarioBLob = await db.get("scenario-blobs", id);
    if (!scenarioBLob?.meta) {
      const metadata = await db.get("scenario-metadata", id);
      if (metadata && scenarioBLob) {
        scenarioBLob.meta = {
          createdDate: metadata.created.toISOString(),
          lastModifiedDate: metadata.modified.toISOString(),
        };
      }
    }

    return scenarioBLob;
  }

  async function listScenarios() {
    return db.getAllFromIndex("scenario-metadata", "by-modified");
  }

  async function deleteScenario(id: string) {
    const tx = db.transaction(["scenario-blobs", "scenario-metadata"], "readwrite");
    await tx.objectStore("scenario-blobs").delete(id);
    await tx.objectStore("scenario-metadata").delete(id);
    await tx.done;
  }

  async function duplicateScenario(id: string) {
    const scenario = await loadScenario(id);
    if (!scenario) {
      return;
    }
    const newId = nanoid();
    const newScenario = {
      ...scenario,
      name: `${scenario.name} (copy)`,
      id: newId,
      meta: undefined,
    };
    await addScenario(newScenario);
    return newId;
  }

  async function downloadAsJson(id: string, fileName?: string) {
    let name = fileName;

    const scenario = await loadScenario(id);
    if (!scenario) {
      return;
    }
    if (!name) {
      //@ts-ignore
      const { default: filenamify } = await import("filenamify/browser");
      name = filenamify(scenario.name) + ".json";
    }
    await saveBlobToLocalFile(
      new Blob([JSON.stringify(scenario)], {
        type: "application/json",
      }),
      name,
    );
  }

  async function getScenarioInfo(id: string) {
    return db.get("scenario-metadata", id);
  }
  return {
    db,
    addScenario,
    listScenarios,
    loadScenario,
    putScenario,
    deleteScenario,
    duplicateScenario,
    downloadAsJson,
    getScenarioInfo,
  };
}
