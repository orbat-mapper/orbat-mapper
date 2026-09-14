<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "@lucide/vue";
import CoaAssumptionsKeyValueTable from "@/modules/scenarioeditor/CoaAssumptionsKeyValueTable.vue";
import {
  formatPercent,
  formatRecord,
  type CoaAssumptionsCatalog,
} from "@/modules/scenarioeditor/coaGenerationAssumptions";
import { fetchCoaAssumptions } from "@/modules/scenarioeditor/coaGenerationApi";

const loading = ref(true);
const error = ref<string | null>(null);
const catalog = ref<CoaAssumptionsCatalog | null>(null);

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    catalog.value = await fetchCoaAssumptions();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : "Failed to load assumptions";
  } finally {
    loading.value = false;
  }
});

const gridSummary = computed(() => {
  if (!catalog.value) return "";
  const { grid, highways_y_km, pl_boxcars_crossing_x_km } = catalog.value.terrain;
  return `${grid.cell_km} km cells · x [${grid.x_min_km}, ${grid.x_max_km}] · y [${grid.y_min_km}, ${grid.y_max_km}] · highways y=${highways_y_km.join(", ")} · PL BOXCARS x=${pl_boxcars_crossing_x_km}`;
});

const fragoActivePriorsText = computed(() => {
  const active = catalog.value?.runtime?.active_priors;
  if (!active || !catalog.value) return null;
  const differs = Object.entries(active).some(
    ([name, value]) => catalog.value!.priors.hypotheses[name] !== value,
  );
  return differs ? formatRecord(active) : null;
});

function recordRows(record: Record<string, number>) {
  return Object.entries(record).map(([parameter, value]) => ({
    parameter,
    value: formatPercent(value),
  }));
}
</script>

<template>
  <section class="space-y-4 pb-4">
    <p class="text-muted-foreground text-xs">
      Read-only engine constants from ITDX config YAML (terrain mobility, transition penalties,
      priors, sensors, weather, ISR). Editable at runtime only via FRAGO on the Parameters tab.
    </p>

    <p v-if="loading" class="text-muted-foreground text-sm">Loading assumptions…</p>
    <p v-else-if="error" class="text-amber-700 text-sm dark:text-amber-400">
      {{ error }} — start the ITDX API to view live engine parameters.
    </p>

    <template v-else-if="catalog">
      <p v-if="catalog.runtime" class="text-sm">
        Active session:
        <span class="font-medium">{{ catalog.runtime.step_count }} steps</span>
        from {{ catalog.runtime.window_start }} to {{ catalog.runtime.window_end }}.
        <span v-if="fragoActivePriorsText" class="text-muted-foreground block text-xs">
          FRAGO P₀: {{ fragoActivePriorsText }}
        </span>
      </p>

      <Collapsible default-open>
        <CollapsibleTrigger
          class="hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium"
        >
          Terrain & mobility
          <ChevronDownIcon class="size-4" />
        </CollapsibleTrigger>
        <CollapsibleContent class="space-y-2 px-1 pt-2 pb-3">
          <p class="text-muted-foreground text-xs">{{ gridSummary }}</p>
          <p class="text-xs font-medium">Mobility (fraction of max road speed)</p>
          <CoaAssumptionsKeyValueTable :rows="recordRows(catalog.terrain.mobility)" />
          <p class="text-xs font-medium">Concealment (reduces optical detection)</p>
          <CoaAssumptionsKeyValueTable :rows="recordRows(catalog.terrain.concealment)" />
        </CollapsibleContent>
      </Collapsible>

      <Collapsible default-open>
        <CollapsibleTrigger
          class="hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium"
        >
          Transition & penalties
          <ChevronDownIcon class="size-4" />
        </CollapsibleTrigger>
        <CollapsibleContent class="space-y-2 px-1 pt-2 pb-3">
          <CoaAssumptionsKeyValueTable
            :rows="[
              { parameter: 'stay_probability', value: catalog.transition.stay_probability },
              {
                parameter: 'task_diagonal_probability',
                value: catalog.transition.task_diagonal_probability,
              },
              { parameter: 'phase_jitter_hours', value: catalog.transition.phase_jitter_hours },
              {
                parameter: 'marsh_outgoing_absorption_max',
                value: catalog.transition.marsh_outgoing_absorption_max,
              },
              { parameter: 'step_hours', value: catalog.transition.step_hours },
            ]"
          />
          <p class="text-xs font-medium">Goal bias β</p>
          <CoaAssumptionsKeyValueTable :rows="recordRows(catalog.transition.beta)" />
          <p class="text-xs font-medium">Reinforcement commit rates</p>
          <CoaAssumptionsKeyValueTable :rows="recordRows(catalog.transition.reinforcement)" />
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger
          class="hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium"
        >
          Priors & flag thresholds
          <ChevronDownIcon class="size-4" />
        </CollapsibleTrigger>
        <CollapsibleContent class="space-y-2 px-1 pt-2 pb-3">
          <p class="text-xs font-medium">Baseline COA priors (P₀)</p>
          <CoaAssumptionsKeyValueTable :rows="recordRows(catalog.priors.hypotheses)" />
          <CoaAssumptionsKeyValueTable
            :rows="[
              {
                parameter: 'hypothesis_leak_per_hour',
                value: catalog.priors.hypothesis_leak_per_hour,
              },
              {
                parameter: 'initial_position_sigma_km',
                value: catalog.priors.initial_position_sigma_km,
              },
              {
                parameter: 'COLLECTION REQUIRED entropy (bits)',
                value: catalog.priors.entropy.coa_bits,
              },
              {
                parameter: 'Top-two COA gap flag',
                value: catalog.priors.entropy.top_two_gap,
              },
              {
                parameter: 'ENTITY LOST entropy (bits)',
                value: catalog.priors.entropy.entity_bits,
              },
              { parameter: 'MLCOA projection (hours)', value: catalog.priors.projection_hours },
            ]"
          />
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger
          class="hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium"
        >
          Observation model
          <ChevronDownIcon class="size-4" />
        </CollapsibleTrigger>
        <CollapsibleContent class="space-y-2 px-1 pt-2 pb-3">
          <div class="border-border overflow-x-auto rounded-md border">
            <table class="w-full text-xs">
              <thead class="bg-muted/40 text-muted-foreground">
                <tr>
                  <th class="px-3 py-2 text-left font-medium">Sensor</th>
                  <th class="px-3 py-2 text-left font-medium">P(detect)</th>
                  <th class="px-3 py-2 text-left font-medium">Reliability</th>
                  <th class="px-3 py-2 text-left font-medium">Optical</th>
                </tr>
              </thead>
              <tbody class="divide-border divide-y">
                <tr v-for="(cfg, sensor) in catalog.observation.sensors" :key="sensor">
                  <td class="px-3 py-2">{{ sensor }}</td>
                  <td class="px-3 py-2 font-mono">{{ cfg.p_sensor }}</td>
                  <td class="px-3 py-2 font-mono">{{ cfg.default_reliability }}</td>
                  <td class="px-3 py-2">{{ cfg.optical ? "yes" : "no" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-xs font-medium">Reliability grade γ</p>
          <CoaAssumptionsKeyValueTable
            :rows="recordRows(catalog.observation.reliability_gamma)"
          />
          <p class="text-muted-foreground text-xs">
            False positive per cell: {{ catalog.observation.false_positive_per_cell }} ·
            Negative-info exclusion:
            {{ catalog.observation.negative_info_report_exclusion_radius_cells }} cells
          </p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger
          class="hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium"
        >
          Weather, ISR & entities
          <ChevronDownIcon class="size-4" />
        </CollapsibleTrigger>
        <CollapsibleContent class="space-y-2 px-1 pt-2 pb-3">
          <CoaAssumptionsKeyValueTable
            :rows="[
              { parameter: 'optical_night_base', value: catalog.weather.optical_night_base },
              { parameter: 'optical_moon_weight', value: catalog.weather.optical_moon_weight },
              {
                parameter: 'precip_mod',
                value: Object.entries(catalog.weather.precip_mod)
                  .map(([k, v]) => `${k} ${v}`)
                  .join(', '),
              },
              {
                parameter: 'visibility_mod',
                value: Object.entries(catalog.weather.visibility_mod)
                  .map(([k, v]) => `${k} ${v}`)
                  .join(', '),
              },
              {
                parameter: 'UAS degraded window',
                value: `${catalog.isr.degraded_window.start} → ${catalog.isr.degraded_window.end}`,
              },
              {
                parameter: 'IMINT pass times (UTC)',
                value: catalog.isr.imint_pass_minutes.join(', '),
              },
              {
                parameter: 'UAS cycle (on/off h)',
                value: `${catalog.isr.uas_cycle_on_hours}/${catalog.isr.uas_cycle_off_hours}`,
              },
            ]"
          />
          <div class="border-border overflow-x-auto rounded-md border">
            <table class="w-full text-xs">
              <thead class="bg-muted/40 text-muted-foreground">
                <tr>
                  <th class="px-3 py-2 text-left font-medium">ID</th>
                  <th class="px-3 py-2 text-left font-medium">Unit</th>
                  <th class="px-3 py-2 text-left font-medium">Type</th>
                  <th class="px-3 py-2 text-left font-medium">Start (km)</th>
                </tr>
              </thead>
              <tbody class="divide-border divide-y">
                <tr v-for="entity in catalog.entities" :key="entity.id">
                  <td class="px-3 py-2 font-mono">{{ entity.id }}</td>
                  <td class="px-3 py-2">{{ entity.name }}</td>
                  <td class="px-3 py-2">{{ entity.type }}</td>
                  <td class="px-3 py-2 font-mono">
                    ({{ entity.start_km[0] }}, {{ entity.start_km[1] }})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </template>
  </section>
</template>
