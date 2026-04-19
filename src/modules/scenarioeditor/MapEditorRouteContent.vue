<script setup lang="ts">
import {
  IconCheck as ConfirmIcon,
  IconChevronDown as ChevronDownIcon,
  IconChevronRight as ChevronRightIcon,
  IconClose as CloseIcon,
  IconContentSave as SaveIcon,
  IconMapMarkerPath as RouteIcon,
  IconPlus as AddLegIcon,
} from "@iconify-prerendered/vue-mdi";
import { TriangleAlertIcon } from "@lucide/vue";
import { computed, ref } from "vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { useRoutingStore } from "@/stores/routingStore";
import { useMeasurementsStore } from "@/stores/geoStore";
import type { RoutingOutcome } from "@/geo/routing/types";
import InputGroup from "@/components/InputGroup.vue";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatDateString, formatLength } from "@/geo/utils";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { isNGeometryLayerItem } from "@/types/scenarioLayerItems";
import { getGeometryIcon } from "@/modules/scenarioeditor/featureLayerUtils";
import type { FeatureId } from "@/types/scenarioGeoModels";
import { useSelectedItems } from "@/stores/selectedStore";
import { convertSpeedToMetric } from "@/utils/convert";
import type { NUnit } from "@/types/internalModels";
import type { SpeedUnitOfMeasure, UnitProperty } from "@/types/scenarioModels";

const props = withDefaults(
  defineProps<{
    activeUnitName?: string | null;
    canRouteUnit?: boolean;
    canRouteFeature?: boolean;
    showCloseButton?: boolean;
  }>(),
  {
    canRouteUnit: true,
    canRouteFeature: true,
    showCloseButton: false,
  },
);

const emit = defineEmits<{
  close: [];
  addLeg: [];
  clearCurrentLeg: [];
  finish: [];
  endDrawing: [];
}>();

const routingStore = useRoutingStore();
const measurementsStore = useMeasurementsStore();
const activeScenario = injectStrict(activeScenarioKey);
const {
  geo: { layerItemsLayers },
  helpers: { getUnitById },
  store: { state },
} = activeScenario;
const { activeUnitId, selectedUnitIds } = useSelectedItems();

const obstacleLayers = computed(() =>
  layerItemsLayers.value.map((layer) => ({
    id: layer.id,
    name: layer.name,
    isHidden: layer.isHidden,
    _hidden: layer._hidden,
    items: layer.items.filter(isNGeometryLayerItem),
  })),
);

const expandedLayers = ref<Set<FeatureId>>(new Set());
function toggleLayerExpanded(id: FeatureId) {
  const next = new Set(expandedLayers.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedLayers.value = next;
}

const obstacleCount = computed(() => {
  const selectedFeatureIds = new Set<FeatureId>();

  for (const layer of obstacleLayers.value) {
    const layerSelected = routingStore.obstacleLayerIds.has(layer.id);
    for (const item of layer.items) {
      if (layerSelected || routingStore.obstacleFeatureIds.has(item.id)) {
        selectedFeatureIds.add(item.id);
      }
    }
  }

  return selectedFeatureIds.size;
});

const statusMessage = computed(() => {
  if (routingStore.error) return routingStore.error;

  if (routingStore.outcome === "feature") {
    if (!routingStore.routeOrigin)
      return "Click the map to choose the first route point.";
  } else if (!routingStore.routeOrigin) {
    return "Click a unit on the map or select a single unit with a known location.";
  }

  if (!routingStore.hasDraftLegs) {
    if (!routingStore.destinationLocked) {
      return props.activeUnitName
        ? `Routing ${props.activeUnitName}. Move the cursor, then click to lock the first destination.`
        : "Move the cursor, then click to lock the first destination.";
    }
    if (routingStore.currentLegPreview) {
      return "First leg ready. Add it or finish the route.";
    }
  } else {
    if (routingStore.destinationLocked && routingStore.currentLegPreview) {
      return "Next leg ready. Add it or finish the route.";
    }
    return "Move the cursor, then click to lock the next destination or finish the route.";
  }

  return "Move the cursor to preview the next leg.";
});

function selectOutcome(outcome: RoutingOutcome) {
  routingStore.startRouting(outcome);
}

function selectUnitRouteTimingMode(value: unknown) {
  if (value === "currentTime" || value === "speedArrival") {
    routingStore.unitRouteTimingMode = value;
  }
}

const totalLengthLabel = computed(() => {
  if (routingStore.fullRouteTotalLengthMeters <= 0) return null;
  return formatLength(
    routingStore.fullRouteTotalLengthMeters,
    measurementsStore.measurementUnit,
  );
});

const activeRoutingUnit = computed<NUnit | null>(() => {
  if (activeUnitId.value) {
    return getUnitById(activeUnitId.value) ?? null;
  }
  if (selectedUnitIds.value.size === 1) {
    const [unitId] = [...selectedUnitIds.value];
    return getUnitById(unitId) ?? null;
  }
  return null;
});

function formatSpeed(metersPerSecond: number) {
  if (measurementsStore.measurementUnit === "imperial") {
    return `${(metersPerSecond / 0.44704).toFixed(1)} mph`;
  }
  if (measurementsStore.measurementUnit === "nautical") {
    return `${(metersPerSecond / 0.514444).toFixed(1)} knots`;
  }
  return `${(metersPerSecond * 3.6).toFixed(1)} km/h`;
}

function formatDuration(milliseconds: number) {
  const totalMinutes = Math.max(0, Math.round(milliseconds / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

const timingDetails = computed(() => {
  if (routingStore.outcome !== "unitTrack") return null;

  const unit = activeRoutingUnit.value;
  if (!unit) return null;

  const speedProperty: UnitProperty = unit.properties?.averageSpeed ??
    unit.properties?.maxSpeed ?? { value: 30, uom: "km/h" };
  const speedMetersPerSecond = convertSpeedToMetric(
    speedProperty.value,
    speedProperty.uom,
  );
  const startTime = routingStore.routeStartTime ?? state.currentTime;
  const speedArrivalDurationMilliseconds =
    speedMetersPerSecond > 0 && routingStore.fullRouteTotalLengthMeters > 0
      ? Math.round(
          (routingStore.fullRouteTotalLengthMeters / speedMetersPerSecond) * 1000,
        )
      : 0;
  const currentTimeDurationMilliseconds = Math.max(0, state.currentTime - startTime);
  const durationMilliseconds =
    routingStore.unitRouteTimingMode === "speedArrival"
      ? speedArrivalDurationMilliseconds
      : currentTimeDurationMilliseconds;
  const averageSpeedMetersPerSecond =
    currentTimeDurationMilliseconds > 0
      ? routingStore.fullRouteTotalLengthMeters / (currentTimeDurationMilliseconds / 1000)
      : 0;
  const destinationTime =
    routingStore.unitRouteTimingMode === "speedArrival" && durationMilliseconds > 0
      ? startTime + durationMilliseconds
      : state.currentTime;

  return {
    speedLabel:
      routingStore.unitRouteTimingMode === "speedArrival"
        ? formatSpeed(speedMetersPerSecond)
        : formatSpeed(averageSpeedMetersPerSecond),
    speedTitle:
      routingStore.unitRouteTimingMode === "speedArrival"
        ? "Speed used"
        : "Average speed",
    durationLabel: formatDuration(durationMilliseconds),
    destinationTimeLabel: formatDateString(
      destinationTime,
      state.info.timeZone,
      "YYYY-MM-DD HH:mm",
    ),
  };
});

const showObstacleWarning = computed(
  () => !routingStore.isBusy && routingStore.errorCode === "blocked-endpoint",
);
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <RouteIcon class="text-muted-foreground size-5" />
        <p class="text-sm font-medium">Route</p>
      </div>
      <div class="flex min-w-14 items-center justify-end gap-2">
        <span class="flex size-5 items-center justify-center">
          <Spinner v-if="routingStore.isBusy" class="text-muted-foreground size-4" />
          <TriangleAlertIcon
            v-else-if="showObstacleWarning"
            role="status"
            aria-label="Cursor is inside an obstacle"
            class="text-destructive size-4"
          />
        </span>
        <MainToolbarButton
          v-if="showCloseButton"
          title="Close routing"
          @click="emit('close')"
        >
          <CloseIcon class="size-5" />
        </MainToolbarButton>
      </div>
    </div>

    <Tabs
      :model-value="routingStore.outcome ?? undefined"
      @update:model-value="(v) => selectOutcome(v as RoutingOutcome)"
    >
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger value="unitTrack" :disabled="!props.canRouteUnit">
          Unit track
        </TabsTrigger>
        <TabsTrigger value="feature" :disabled="!props.canRouteFeature">
          Feature
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <p class="text-muted-foreground text-xs leading-relaxed">
      {{ statusMessage }}
    </p>

    <div class="grid grid-cols-1 gap-2">
      <InputGroup
        label="Buffer (m)"
        type="number"
        min="0"
        step="10"
        v-model="routingStore.bufferRadius"
      />
      <div v-if="routingStore.outcome === 'unitTrack'" class="grid gap-1">
        <p class="text-muted-foreground text-xs font-medium">Destination time</p>
        <ToggleGroup
          :model-value="routingStore.unitRouteTimingMode"
          type="single"
          variant="outline"
          size="sm"
          class="w-full"
          @update:model-value="selectUnitRouteTimingMode"
        >
          <ToggleGroupItem value="currentTime" class="flex-1">
            Current time
          </ToggleGroupItem>
          <ToggleGroupItem value="speedArrival" class="flex-1">
            Speed arrival
          </ToggleGroupItem>
        </ToggleGroup>
        <div
          v-if="timingDetails"
          class="border-border bg-muted/30 grid grid-cols-2 gap-x-3 gap-y-1 rounded-md border px-2 py-1.5 text-xs"
        >
          <span class="text-muted-foreground">{{ timingDetails.speedTitle }}</span>
          <span class="text-right font-medium">{{ timingDetails.speedLabel }}</span>
          <span class="text-muted-foreground">Duration</span>
          <span class="text-right font-medium">
            {{ timingDetails.durationLabel }}
          </span>
          <span class="text-muted-foreground">Arrival</span>
          <span class="text-right font-medium">
            {{ timingDetails.destinationTimeLabel }}
          </span>
        </div>
      </div>
    </div>

    <Popover v-model:open="routingStore.obstaclePickerOpen">
      <PopoverTrigger as-child>
        <Button type="button" variant="outline" size="sm" class="justify-start">
          Obstacles: {{ obstacleCount }} selected
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-80 p-2" align="start">
        <div class="mb-2 flex items-center justify-between">
          <p class="text-xs font-medium">Pick obstacles</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            :disabled="obstacleCount === 0"
            @click="routingStore.clearObstacleSelection()"
          >
            Clear
          </Button>
        </div>
        <div
          v-if="obstacleLayers.length === 0"
          class="text-muted-foreground py-2 text-xs"
        >
          No layers available.
        </div>
        <div class="max-h-72 overflow-y-auto">
          <div v-for="layer in obstacleLayers" :key="layer.id" class="py-1">
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="text-muted-foreground hover:text-foreground"
                :aria-label="expandedLayers.has(layer.id) ? 'Collapse' : 'Expand'"
                @click="toggleLayerExpanded(layer.id)"
              >
                <ChevronDownIcon v-if="expandedLayers.has(layer.id)" class="size-4" />
                <ChevronRightIcon v-else class="size-4" />
              </button>
              <Checkbox
                :id="`obstacle-layer-${layer.id}`"
                :model-value="routingStore.obstacleLayerIds.has(layer.id)"
                @update:model-value="routingStore.toggleObstacleLayer(layer.id)"
              />
              <label
                :for="`obstacle-layer-${layer.id}`"
                class="flex-1 cursor-pointer text-sm"
              >
                {{ layer.name }}
              </label>
              <span class="text-muted-foreground text-xs">{{ layer.items.length }}</span>
            </div>
            <div
              v-if="expandedLayers.has(layer.id) && layer.items.length > 0"
              class="mt-1 ml-7 flex flex-col gap-1"
            >
              <div
                v-for="item in layer.items"
                :key="item.id"
                class="flex items-center gap-2"
              >
                <Checkbox
                  :id="`obstacle-feature-${item.id}`"
                  :model-value="routingStore.obstacleFeatureIds.has(item.id)"
                  :disabled="routingStore.obstacleLayerIds.has(layer.id)"
                  @update:model-value="routingStore.toggleObstacleFeature(item.id)"
                />
                <component :is="getGeometryIcon(item)" class="size-4" />
                <label
                  :for="`obstacle-feature-${item.id}`"
                  class="flex-1 cursor-pointer truncate text-xs"
                >
                  {{ item.name || item.geometryMeta.geometryKind }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>

    <div v-if="routingStore.hasDraftLegs" class="text-muted-foreground text-xs">
      {{ routingStore.draftLegs.length }}
      {{ routingStore.draftLegs.length === 1 ? "leg" : "legs" }} added
    </div>

    <div v-if="totalLengthLabel" class="text-muted-foreground text-xs">
      Total: {{ totalLengthLabel }}
    </div>

    <div class="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        :disabled="!routingStore.hasPreview && !routingStore.destination"
        @click="emit('clearCurrentLeg')"
      >
        Clear leg
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        :disabled="!routingStore.canAddLeg"
        @click="emit('addLeg')"
      >
        <AddLegIcon class="mr-1 size-4" />
        Add leg
      </Button>
      <Button
        v-if="!routingStore.drawingFinished"
        type="button"
        size="sm"
        variant="outline"
        :disabled="!routingStore.active"
        @click="emit('endDrawing')"
      >
        <ConfirmIcon class="mr-1 size-4" />
        Finish route
      </Button>
      <Button
        v-if="routingStore.drawingFinished"
        type="button"
        size="sm"
        :disabled="!routingStore.canFinishRoute"
        @click="emit('finish')"
      >
        <SaveIcon class="mr-1 size-4" />
        Save route
      </Button>
    </div>
  </div>
</template>
