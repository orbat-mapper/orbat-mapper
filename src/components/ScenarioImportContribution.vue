<script setup lang="ts">
import { computed, h, ref, shallowRef, watch } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type {
  Scenario,
  Unit,
  SideGroup,
  UnitSymbolOptions,
} from "@/types/scenarioModels";
import {
  planScenarioImport,
  type ImportOptions,
} from "@/importexport/scenarioImportPlan";
import { applyScenarioImport } from "@/importexport/applyScenarioImport";
import { useNotifications } from "@/composables/notifications";
import FieldSelect from "@/components/FieldSelect.vue";
import { FieldGroup } from "@/components/ui/field";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import DataGrid from "@/modules/grid/DataGrid.vue";
import ToggleField from "@/components/ToggleField.vue";
import OrbatCellRenderer from "@/components/OrbatCellRenderer.vue";
import type { ColumnDef } from "@tanstack/vue-table";
import { mapReinforcedStatus2Field } from "@/types/scenarioModels";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import {
  describeImportChange,
  summarizeImportPlan,
} from "@/importexport/scenarioImportSummary";
import { walkSubUnits } from "@/stores/scenarioStore";

const props = defineProps<{
  data: Scenario;
  mode: "side" | "group";
  optionsTarget?: HTMLElement | null;
  actionsTarget?: HTMLElement | null;
}>();
const emit = defineEmits<{ applied: [] }>();
const { store, io, time } = injectStrict(activeScenarioKey);
// Serializing the whole scenario is expensive, and doing it inside `plan` would make
// the preview depend on every entity in the store. Refresh it only when the store does.
const master = shallowRef<Scenario>(io.serializeToObject());
watch(
  () => store.revision.value,
  () => (master.value = io.serializeToObject()),
  { flush: "sync" },
);
const { send } = useNotifications();
const fmt = useTimeFormatStore();
const scopeId = ref("");
const action = ref<ImportOptions["action"]>("update");
const content = ref<ImportOptions["content"]>("units-and-state");
const states = ref<ImportOptions["states"]>("replace");
const selectedIds = ref<string[]>([]);
const showChangedOnly = ref(false);
const targetSideId = ref(store.state.sides[0]);
const failure = ref("");
const scopes = computed(() =>
  props.data.sides.flatMap((s) =>
    props.mode === "side"
      ? [{ value: s.id, label: s.name }]
      : s.groups.map((g) => ({ value: g.id, label: `${s.name} / ${g.name}` })),
  ),
);
watch(
  scopes,
  (available) => {
    if (!available.some((scope) => scope.value === scopeId.value)) {
      scopeId.value = available[0]?.value ?? "";
    }
  },
  { immediate: true },
);
const units = computed(() => {
  const result: Unit[] = [];
  const collect = (roots: Unit[]) =>
    roots.forEach((root) => walkSubUnits(root, (unit) => result.push(unit), true));
  for (const side of props.data.sides) {
    if (side.id === scopeId.value) {
      collect(side.subUnits ?? []);
      side.groups.forEach((g) => collect(g.subUnits));
    } else
      side.groups
        .filter((g) => g.id === scopeId.value)
        .forEach((g) => collect(g.subUnits));
  }
  return result;
});
watch(
  scopeId,
  () => {
    selectedIds.value = units.value.map((u) => u.id);
  },
  { immediate: true },
);
const targetSides = computed(() =>
  store.state.sides.map((id) => ({ value: id, label: store.state.sideMap[id].name })),
);
const importOptions = computed(() => ({
  scopeId: scopeId.value,
  action: action.value,
  content: content.value,
  states: states.value,
  targetSideId: targetSideId.value,
}));
const allUnitIds = computed(() => units.value.map((unit) => unit.id));
// Filtering compares all incoming entries, independent of which ones will be applied.
// Cache this comparison across checkbox changes and reuse it for the common all-selected case.
const comparisonPlan = computed(() =>
  planScenarioImport(master.value, props.data, {
    ...importOptions.value,
    selectedIds: allUnitIds.value,
  }),
);
const plan = computed(() => {
  const selected = new Set(selectedIds.value);
  if (
    selected.size === allUnitIds.value.length &&
    allUnitIds.value.every((id) => selected.has(id))
  )
    return comparisonPlan.value;
  return planScenarioImport(master.value, props.data, {
    ...importOptions.value,
    selectedIds: selectedIds.value,
  });
});
const sourceSide = computed(() =>
  props.data.sides.find(
    (s) => s.id === scopeId.value || s.groups.some((g) => g.id === scopeId.value),
  ),
);
const targetName = computed(() => {
  const target =
    store.state.sideMap[scopeId.value] ?? store.state.sideGroupMap[scopeId.value];
  const group = store.state.sideGroupMap[scopeId.value];
  const owner = group ? store.state.sideMap[group._pid]?.name : undefined;
  const side = sourceSide.value;
  const sourceGroup = side?.groups.find((g) => g.id === scopeId.value);
  const sourceName = sourceGroup ? `${side!.name} / ${sourceGroup.name}` : side?.name;
  return target
    ? `${owner ? owner + " / " : ""}${target.name}`
    : (sourceName ?? `New ${props.mode === "side" ? "side" : "group"}`);
});
const summary = computed(() =>
  summarizeImportPlan(plan.value.changes, {
    action: action.value,
    content: content.value,
  }),
);
const readableChanges = computed(() => {
  const names = new Map(plan.value.changes.map((c) => [c.id, c.name]));
  const nameForId = (id: string) =>
    names.get(id) ??
    store.state.unitMap[id]?.name ??
    store.state.sideGroupMap[id]?.name ??
    store.state.sideMap[id]?.name ??
    id;
  return plan.value.changes.map((change) => ({
    ...change,
    descriptions: describeImportChange(change, nameForId),
  }));
});
const affectedChanges = computed(() =>
  readableChanges.value.filter((c) => ["added", "changed", "removed"].includes(c.effect)),
);
const unchangedChanges = computed(() =>
  readableChanges.value.filter((c) => ["unchanged", "preserved"].includes(c.effect)),
);
const effectLabels = {
  added: "Added",
  changed: "Updated",
  removed: "Removed",
  unchanged: "Already matches",
  preserved: "Not included; kept unchanged",
};
type ImportRow = Unit | SideGroup;
const tableData = computed<ImportRow[]>(() => {
  const side = sourceSide.value;
  if (!side) return [];
  return props.mode === "side"
    ? [...side.groups, ...(side.subUnits ?? [])]
    : (side.groups.find((g) => g.id === scopeId.value)?.subUnits ?? []);
});
const changedRowFilter = computed(() => {
  if (!showChangedOnly.value) return undefined;
  if (action.value === "copy" && content.value !== "state-only") {
    // Every incoming entry can be added as a copy, even while unchecked.
    return () => true;
  }
  const changed = new Set(
    comparisonPlan.value.changes
      .filter((c) => c.effect === "added" || c.effect === "changed")
      .map((c) => c.id),
  );
  return (row: ImportRow) => changed.has(row.id);
});
const symbolOptions = computed(() => {
  const result = new Map<string, UnitSymbolOptions>();
  const collect = (roots: Unit[], inherited: UnitSymbolOptions) =>
    roots.forEach((root) =>
      walkSubUnits(
        root,
        (unit) =>
          result.set(unit.id, {
            ...inherited,
            ...unit.symbolOptions,
            reinforcedReduced: mapReinforcedStatus2Field(unit.reinforcedStatus) ?? "",
          }),
        true,
      ),
    );
  for (const side of props.data.sides) {
    collect(side.subUnits ?? [], side.symbolOptions ?? {});
    for (const group of side.groups)
      collect(group.subUnits, { ...side.symbolOptions, ...group.symbolOptions });
  }
  return result;
});
const changesById = computed(
  () => new Map(readableChanges.value.map((change) => [change.id, change])),
);
const selectedUnitIds = computed(() => new Set(selectedIds.value));
function rowChanges(row: ImportRow): string {
  const isUnit = "sidc" in row;
  const selected = !isUnit || selectedUnitIds.value.has(row.id);
  if (action.value === "copy" && content.value !== "state-only") {
    return selected ? "Added as a separate copy" : "Not selected";
  }
  const change = changesById.value.get(row.id);
  if (change?.effect === "unchanged") return "No changes";
  if (change?.effect === "preserved") return isUnit ? "Not selected" : "No changes";
  if (change) return change.descriptions.join(" ");
  if (!selected && (action.value !== "replace" || content.value === "state-only"))
    return "Not selected";
  if (content.value === "state-only" && isUnit && !store.state.unitMap[row.id])
    return "Skipped: unit does not exist";
  return plan.value.errors.length ? "Not applied — see review" : "No changes";
}
const columns: ColumnDef<ImportRow>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ table }) =>
      h(
        "button",
        {
          type: "button",
          title: "Expand/collapse all",
          onClick: table.getToggleAllRowsExpandedHandler(),
        },
        "Name",
      ),
    size: 300,
    enableSorting: false,
    cell: ({ row, getValue }) =>
      h(OrbatCellRenderer, {
        value: getValue() as string,
        sidc: "sidc" in row.original ? row.original.sidc : undefined,
        expanded: row.getIsExpanded(),
        level: row.depth,
        canExpand: row.getCanExpand(),
        onToggle: row.getToggleExpandedHandler(),
        symbolOptions: {
          ...symbolOptions.value.get(row.original.id),
          customSymbolMap: Object.fromEntries(
            (props.data.settings?.customSymbols ?? []).map((s) => [s.id, s]),
          ),
        },
      }),
  },
  {
    id: "changes",
    header: "Changes",
    size: 350,
    enableSorting: false,
    // Read the live plan in the cell: a cached accessor would go stale when the
    // selection or import options change without changing the source rows.
    cell: ({ row }) => {
      const description = rowChanges(row.original);
      return h(
        "span",
        { class: "block min-w-0 truncate", title: description },
        description,
      );
    },
  },
  {
    id: "exists",
    header: "Exists?",
    accessorFn: (row) =>
      row.id in store.state.unitMap || row.id in store.state.sideGroupMap ? "Yes" : "No",
    size: 90,
  },
  {
    id: "history",
    header: "Last state entry",
    accessorFn: (row) => {
      if (!("sidc" in row) || !row.state?.length) return "—";
      const latest = Math.max(...row.state.map((s) => +new Date(s.t)));
      return `${fmt.trackFormatter.format(latest)} (${row.state.length})`;
    },
    size: 220,
  },
];
function selectRows(rows: ImportRow[]) {
  selectedIds.value = rows
    .filter((row): row is Unit => "sidc" in row)
    .map((row) => row.id);
}
function apply() {
  const reviewed = plan.value;
  if (reviewed.errors.length || !reviewed.hasChanges) return;
  failure.value = "";
  try {
    applyScenarioImport(store, reviewed);
    time.setCurrentTime(store.state.currentTime);
    send({
      message: "Imported scenario data. Use Undo to revert the import in one step.",
      type: "success",
    });
    emit("applied");
  } catch (error) {
    failure.value = `Import was not applied: ${error instanceof Error ? error.message : String(error)}`;
  }
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <Teleport :to="optionsTarget ?? 'body'" :disabled="!optionsTarget">
      <FieldGroup>
        <FieldSelect
          v-model="action"
          label="Action"
          :items="[
            { value: 'update', label: 'Update included units' },
            { value: 'replace', label: 'Replace entire side/group' },
            { value: 'copy', label: 'Import as a separate copy' },
          ]"
        />
        <FieldSelect
          v-model="content"
          label="Content to import"
          :items="[
            { value: 'units-and-state', label: 'Units with state' },
            { value: 'units-only', label: 'Units only (preserve existing history)' },
            { value: 'state-only', label: 'State only (existing units)' },
          ]"
        />
        <FieldSelect
          v-if="content !== 'units-only'"
          v-model="states"
          label="State history"
          :items="[
            { value: 'replace', label: 'Replace state history' },
            { value: 'add_new', label: 'Append states after latest existing timestamp' },
          ]"
        />
        <FieldSelect
          v-if="
            (action === 'copy' || !store.state.sideGroupMap[scopeId]) && mode !== 'side'
          "
          v-model="targetSideId"
          label="Target side for new group"
          :items="targetSides"
        />
      </FieldGroup>
    </Teleport>
    <div class="flex flex-wrap items-end gap-4">
      <FieldSelect
        v-model="scopeId"
        :label="mode === 'side' ? 'Side' : 'Group'"
        :items="scopes"
        class="max-w-sm"
      />
      <ToggleField
        v-if="scopeId"
        v-model="showChangedOnly"
        title="Includes added entries and parent rows for context. Selection is unchanged."
        >Show changed entries only</ToggleField
      >
    </div>
    <p v-if="!scopeId" class="text-muted-foreground">
      Select a side or group from the file to import.
    </p>
    <template v-else>
      <DataGrid
        :key="scopeId"
        :data="tableData"
        :columns="columns"
        :row-filter="changedRowFilter"
        :get-sub-rows="(row: ImportRow) => row.subUnits ?? []"
        :row-height="40"
        :select="action !== 'replace' || content === 'state-only'"
        select-all
        no-indeterminate
        class="min-h-40 flex-1"
        @update:selected="selectRows"
      />
      <div class="max-h-72 shrink-0 overflow-auto">
        <section aria-label="Import summary" aria-live="polite">
          <p>{{ summary.action }} {{ targetName }}: {{ summary.sentence }}</p>
          <p v-if="summary.counts.preserved" class="text-muted-foreground">
            {{ summary.counts.preserved }}
            {{ summary.counts.preserved === 1 ? "unit is" : "units are" }} not included
            and will be kept.
          </p>
          <p
            v-if="
              mode !== 'side' && (action === 'copy' || !store.state.sideGroupMap[scopeId])
            "
          >
            Destination: {{ store.state.sideMap[targetSideId]?.name }}
          </p>
        </section>
        <Alert
          v-if="action === 'replace' && content !== 'state-only'"
          variant="destructive"
          class="mt-2"
        >
          <AlertTitle>Replace entire {{ mode === "side" ? "side" : "group" }}</AlertTitle>
          <AlertDescription
            >Units and groups missing from the file will be removed.
            {{ summary.counts.removed }} units will be removed.</AlertDescription
          >
        </Alert>
        <Alert v-if="plan.errors.length" variant="destructive" class="mt-2">
          <AlertTitle>Cannot import this selection</AlertTitle>
          <AlertDescription
            ><ul>
              <li v-for="error in plan.errors" :key="error">{{ error }}</li>
            </ul></AlertDescription
          >
        </Alert>
        <details class="mt-2">
          <summary>Review changes</summary>
          <section aria-label="Scenario import preview" class="flex flex-col gap-2">
            <details
              v-for="dependency in plan.dependencies"
              :key="dependency.kind + dependency.name"
            >
              <summary>
                Added {{ dependency.kind }} definition: {{ dependency.name }}
              </summary>
              <details>
                <summary>Advanced details</summary>
                <pre class="overflow-auto text-xs">{{
                  JSON.stringify(dependency.definition, null, 2)
                }}</pre>
              </details>
            </details>
            <p v-for="message in plan.ignored" :key="message">{{ message }}</p>
            <article
              v-for="change in affectedChanges"
              :key="change.id"
              class="flex flex-col gap-1"
            >
              <h4>
                {{ effectLabels[change.effect] }} {{ change.kind }}: {{ change.name }}
              </h4>
              <ul class="list-inside list-disc">
                <li v-for="description in change.descriptions" :key="description">
                  {{ description }}
                </li>
              </ul>
              <details>
                <summary>Advanced details</summary>
                <p>ID: {{ change.id }}</p>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p>Before</p>
                    <pre class="overflow-auto text-xs">{{
                      JSON.stringify(change.before, null, 2) ?? "Absent"
                    }}</pre>
                  </div>
                  <div>
                    <p>After</p>
                    <pre class="overflow-auto text-xs">{{
                      JSON.stringify(change.after, null, 2) ?? "Absent"
                    }}</pre>
                  </div>
                </div>
              </details>
            </article>
            <details v-if="unchangedChanges.length">
              <summary>
                Left unchanged ({{ unchangedChanges.length }} sides, groups and units)
              </summary>
              <ul class="list-inside list-disc">
                <li v-for="change in unchangedChanges" :key="change.id">
                  {{ change.name }} — {{ effectLabels[change.effect] }} ({{ change.id }})
                </li>
              </ul>
            </details>
            <p v-if="!plan.hasChanges && !plan.errors.length">No content changes.</p>
          </section>
          <details>
            <summary>How this import works</summary>
            <p v-if="content === 'state-only'">
              Only history of existing selected units changes. Missing units are skipped.
            </p>
            <p v-else>
              Included units and groups take the file's fields and hierarchy, including
              cleared fields. Updates preserve units not included.
            </p>
            <p v-if="content !== 'units-only' && states === 'add_new'">
              Only states after each unit's latest existing timestamp are appended.
            </p>
            <p>Use Undo to revert the import in one step.</p>
          </details>
        </details>
      </div>
    </template>
    <Alert v-if="failure" variant="destructive"
      ><AlertTitle>Import failed</AlertTitle
      ><AlertDescription>{{ failure }}</AlertDescription></Alert
    >

    <Teleport :to="actionsTarget ?? 'body'" :disabled="!actionsTarget">
      <div class="flex gap-2">
        <Button
          :disabled="!scopeId || plan.errors.length > 0 || !plan.hasChanges"
          @click="apply"
          >Import</Button
        >
      </div>
    </Teleport>
  </div>
</template>
