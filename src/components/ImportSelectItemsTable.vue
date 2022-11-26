<template>
  <div class="-my-2 overflow-x-auto">
    <div class="inline-block min-w-full p-1 pr-3">
      <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table class="min-w-full table-fixed">
          <thead class="bg-white">
            <tr>
              <th scope="col" class="relative w-12 px-6 sm:w-16 sm:px-8">
                <input
                  type="checkbox"
                  class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
                  :checked="indeterminate || selectedUnits.length === totalUnits.length"
                  :indeterminate="indeterminate"
                  @change="toggleSelectAll"
                />
              </th>
              <th
                scope="col"
                class="w-12 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
              >
                Symbol
              </th>
              <th
                scope="col"
                class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Name
              </th>
            </tr>
          </thead>
          <tbody class="bg-white">
            <template v-for="layer in layers" :key="layer.id">
              <tr class="border-t border-gray-200 bg-gray-50" v-if="layer.name">
                <td class="relative w-12 px-6 sm:w-16 sm:px-8">
                  <div class="absolute inset-y-0 left-0 w-0.5 bg-indigo-600"></div>
                  <input
                    type="checkbox"
                    class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
                    :checked="
                      layer.features
                        .map((e) => e.id)
                        .every((e) => selectedUnits.includes(e))
                    "
                    :indeterminate="
                      layer.features
                        .map((e) => e.id)
                        .some((e) => selectedUnits.includes(e)) &&
                      !layer.features
                        .map((e) => e.id)
                        .every((e) => selectedUnits.includes(e))
                    "
                    @change="toggleLayer(layer, $event)"
                  />
                </td>
                <th
                  colspan="2"
                  scope="colgroup"
                  class="bg-gray-50 py-2 text-left text-sm font-semibold text-gray-900"
                >
                  {{ layer.name }}
                </th>
              </tr>
              <tr
                v-for="(feature, idx) in layer.features"
                :key="feature.id"
                :class="[idx === 0 ? 'border-gray-300' : 'border-gray-200', 'border-t']"
              >
                <td class="relative w-12 px-6 sm:w-16 sm:px-8">
                  <div
                    v-if="selectedUnits.includes(feature.id)"
                    class="absolute inset-y-0 left-0 w-0.5 bg-indigo-600"
                  />
                  <input
                    type="checkbox"
                    class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
                    :value="feature.id"
                    v-model="selectedUnits"
                  />
                </td>
                <td
                  class="flex items-center justify-center whitespace-nowrap py-2 pr-3 text-sm font-medium text-gray-900"
                >
                  <MilSymbol :sidc="feature.properties.sidc" :size="20" />
                </td>
                <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                  {{ feature.properties.name || feature.properties.sidc }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { MilxImportedLayer } from "@/composables/scenarioImport";
import { computed, onMounted } from "vue";
import { useVModel } from "@vueuse/core";
import MilSymbol from "@/components/MilSymbol.vue";

interface Props {
  layers: MilxImportedLayer[];
  selected: (string | number)[];
  selectAll?: boolean;
}

const props = withDefaults(defineProps<Props>(), { selectAll: false });
const emit = defineEmits(["update:selected"]);

const selectedUnits = useVModel(props, "selected", emit);
const totalUnits = computed(() => props.layers.map((e) => e.features).flat());
const indeterminate = computed(
  () =>
    selectedUnits.value.length > 0 && selectedUnits.value.length < totalUnits.value.length
);

onMounted(() => {
  if (props.selectAll) {
    selectedUnits.value = totalUnits.value.map((p) => p.id);
  }
});

function toggleSelectAll(event: Event) {
  const isChecked = (<HTMLInputElement>event.target).checked;
  selectedUnits.value = isChecked ? totalUnits.value.map((p) => p.id) : [];
}

function toggleLayer(layer: MilxImportedLayer, event: Event) {
  const isChecked = (<HTMLInputElement>event.target).checked;
  const layerIds = layer.features.map((e) => e.id!);
  if (isChecked) {
    selectedUnits.value = [...new Set([...selectedUnits.value, ...layerIds])];
  } else {
    selectedUnits.value = selectedUnits.value.filter((id) => !layerIds.includes(id));
  }
}
</script>
