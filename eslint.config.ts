import { globalIgnores } from "eslint/config";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import pluginVitest from "@vitest/eslint-plugin";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

// OpenLayers is only permitted in code that will be deleted together with the
// legacy map view. This list is the authoritative inventory of that code:
// deletion day = remove these files, the /legacy route, and the ol/ol-ext deps.
const LEGACY_OPENLAYERS_FILES = [
  "src/geo/engines/openlayers/**",
  "src/geo/routing/openLayersRoutingPreview.ts",
  "src/geo/{featureStyles,arrowStyles,arrowStyles.test,simplestyle,layers,baseLayers,olInteractions,layerConfigTypes,types,kmlz}.ts",
  "src/components/{MapContainer,ScenarioMap,ScenarioMapLogic,MapContextMenu,MeasurementToolbar,LayersPanel,DrawMarker,DrawRangeRingMarker}.vue",
  "src/composables/{geoEditing,geoMeasurement,geoUnitLayers,geoUnitHistory,geoHover,geoDayNight,geoRangeRings,geoBoxDraw,boxDrawEngineOL,geoImageLayerInteraction,geoScaleLine,geoShowLocation,openlayersHelpers}.ts",
  "src/modules/scenarioeditor/{ScenarioEditorMap,SearchScenarioActions,ScenarioMapSettings,ScenarioBoundingBox,TileMapLayerSettingsForm}.vue",
  "src/modules/scenarioeditor/{scenarioEvents,scenarioDrawHelpers,scenarioFeatureLayers,scenarioMapLayers,useScenarioDraw,featureLayerUtils.select.test}.ts",
];

// Shared files still being decoupled from OpenLayers. Shrink this list to
// empty; do NOT add to it.
const PENDING_OPENLAYERS_DECOUPLE = [
  "src/components/injects.ts",
  "src/components/commandPalette/CommandPalettePlaceItem.vue",
  "src/composables/scenarioActions.ts",
  "src/geo/utils.ts",
  "src/importexport/export/locationFormat.ts",
  "src/modules/scenarioeditor/{featureLayerUtils,referenceFeatureUtils}.ts",
  "src/modules/scenarioeditor/MapEditorMeasurementToolbar.vue",
  "src/stores/geoStore.ts",
  "src/utils/geoConvert.ts",
];

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
  },

  globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]),

  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/__tests__/*"],
  },

  {
    name: "app/no-openlayers-outside-legacy",
    files: ["**/*.{ts,mts,tsx,vue}"],
    ignores: [...LEGACY_OPENLAYERS_FILES, ...PENDING_OPENLAYERS_DECOUPLE],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["ol", "ol/*", "ol/**", "ol-ext", "ol-ext/*", "ol-ext/**"],
              message:
                "OpenLayers is only allowed in legacy map view code (see LEGACY_OPENLAYERS_FILES in eslint.config.ts). Use the MapAdapter contract, MapLibre, or @turf instead.",
            },
          ],
        },
      ],
    },
  },
  skipFormatting,
);
