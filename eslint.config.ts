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
  "src/geo/{featureStyles,arrowStyles,arrowStyles.test,simplestyleOl,layers,baseLayers,olInteractions,layerConfigTypes,types,kmlz}.ts",
  "src/geo/{unitStyles.test,unitStyles.reparent.test}.ts",
  "src/components/{MapContainer,ScenarioMap,ScenarioMapLogic,MapContextMenu,MeasurementToolbar,LayersPanel,BaseLayerSwitcher}.vue",
  "src/components/{MapContainer.test,ScenarioMapLogic.test,LayersPanel.test,BaseLayerSwitcher.test}.ts",
  "src/composables/{geoEditing,geoMeasurement,geoUnitLayers,geoUnitHistory,geoHover,geoDayNight,geoRangeRings,geoBoxDraw,boxDrawEngineOL,geoImageLayerInteraction,geoScaleLine,geoShowLocation,openlayersHelpers}.ts",
  "src/composables/geoUnitHistory.test.ts",
  "src/modules/scenarioeditor/{ScenarioEditorMap,SearchScenarioActions,ScenarioMapSettings,ScenarioBoundingBox}.vue",
  "src/modules/scenarioeditor/{scenarioEvents,scenarioDrawHelpers,scenarioFeatureLayers,scenarioMapLayers,useScenarioDraw,featureLayerUtilsOl,olInjects}.ts",
  "src/modules/scenarioeditor/{ScenarioEditorMap.test,featureLayerUtils.select.test,featureLayerUtils.items.test,featureLayerUtils.topHit.test,scenarioDrawHelpers.test,useScenarioDraw.test,recordHierarchyChangesUi.test}.ts",
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
    ignores: [...LEGACY_OPENLAYERS_FILES],
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
