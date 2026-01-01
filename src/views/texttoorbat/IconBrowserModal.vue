<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import NewMilitarySymbol from "@/components/NewMilitarySymbol.vue";
import {
  ICON_UNSPECIFIED,
  ICON_INFANTRY,
  ICON_MECHANIZED_INFANTRY,
  ICON_MOTORIZED_INFANTRY,
  ICON_LIGHT_INFANTRY,
  ICON_AIRBORNE_INFANTRY,
  ICON_AIR_ASSAULT_INFANTRY,
  ICON_MOUNTAIN_INFANTRY,
  ICON_MARINE_INFANTRY,
  ICON_ARMOR,
  ICON_LIGHT_ARMOR,
  ICON_CAVALRY,
  ICON_RECONNAISSANCE,
  ICON_ARTILLERY,
  ICON_SELF_PROPELLED_ARTILLERY,
  ICON_ROCKET_ARTILLERY,
  ICON_AIR_DEFENSE,
  ICON_AVIATION,
  ICON_ATTACK_HELICOPTER,
  ICON_ENGINEER,
  ICON_COMBAT_ENGINEER,
  ICON_SIGNAL,
  ICON_SUPPLY,
  ICON_MAINTENANCE,
  ICON_MEDICAL,
  ICON_MILITARY_POLICE,
  ICON_SPECIAL_FORCES,
  ICON_MISSILE,
  ICON_MORTAR,
  ICON_ANTITANK,
  ICON_TRANSPORTATION,
  ICON_HEADQUARTERS,
  ICON_CHEMICAL,
  ICON_NBC,
  ICON_ELECTRONIC_WARFARE,
  ICON_INTELLIGENCE,
  ICON_MILITARY_INTELLIGENCE,
  ICON_CIVIL_AFFAIRS,
  ICON_PSYCHOLOGICAL_OPS,
  ICON_NAVAL,
  ICON_AIR_FORCE,
  ICON_SNIPER,
  ICON_AMPHIBIOUS,
  ICON_PARACHUTE,
} from "@/views/texttoorbat/textToOrbat";
import SimpleDivider from "@/components/SimpleDivider.vue";

const open = defineModel<boolean>({ default: false });
const searchQuery = ref("");

interface IconEntry {
  name: string;
  code: string;
  sidc: string;
}

// Build SIDC from entity code
function buildSidc(entityCode: string): string {
  // Format: [standard_identity][symbol_set][status][hq_task_force_dummy][echelon][entity_code_with_modifiers]
  // 03 = friendly, 10 = land unit symbol set, 0 = present, 0 = not HQ/TF, 00 = unspecified echelon
  return `1003${10}0000${entityCode}`;
}

const icons: IconEntry[] = [
  { name: "Unspecified", code: "ICON_UNSPECIFIED", sidc: buildSidc(ICON_UNSPECIFIED) },
  { name: "Infantry", code: "ICON_INFANTRY", sidc: buildSidc(ICON_INFANTRY) },
  {
    name: "Mechanized Infantry",
    code: "ICON_MECHANIZED_INFANTRY",
    sidc: buildSidc(ICON_MECHANIZED_INFANTRY),
  },
  {
    name: "Motorized Infantry",
    code: "ICON_MOTORIZED_INFANTRY",
    sidc: buildSidc(ICON_MOTORIZED_INFANTRY),
  },
  {
    name: "Light Infantry",
    code: "ICON_LIGHT_INFANTRY",
    sidc: buildSidc(ICON_LIGHT_INFANTRY),
  },
  {
    name: "Airborne Infantry",
    code: "ICON_AIRBORNE_INFANTRY",
    sidc: buildSidc(ICON_AIRBORNE_INFANTRY),
  },
  {
    name: "Air Assault Infantry",
    code: "ICON_AIR_ASSAULT_INFANTRY",
    sidc: buildSidc(ICON_AIR_ASSAULT_INFANTRY),
  },
  {
    name: "Mountain Infantry",
    code: "ICON_MOUNTAIN_INFANTRY",
    sidc: buildSidc(ICON_MOUNTAIN_INFANTRY),
  },
  {
    name: "Marine Infantry",
    code: "ICON_MARINE_INFANTRY",
    sidc: buildSidc(ICON_MARINE_INFANTRY),
  },
  { name: "Armor", code: "ICON_ARMOR", sidc: buildSidc(ICON_ARMOR) },
  { name: "Light Armor", code: "ICON_LIGHT_ARMOR", sidc: buildSidc(ICON_LIGHT_ARMOR) },
  { name: "Cavalry", code: "ICON_CAVALRY", sidc: buildSidc(ICON_CAVALRY) },
  {
    name: "Reconnaissance",
    code: "ICON_RECONNAISSANCE",
    sidc: buildSidc(ICON_RECONNAISSANCE),
  },
  { name: "Artillery", code: "ICON_ARTILLERY", sidc: buildSidc(ICON_ARTILLERY) },
  {
    name: "Self-Propelled Artillery",
    code: "ICON_SELF_PROPELLED_ARTILLERY",
    sidc: buildSidc(ICON_SELF_PROPELLED_ARTILLERY),
  },
  {
    name: "Rocket Artillery",
    code: "ICON_ROCKET_ARTILLERY",
    sidc: buildSidc(ICON_ROCKET_ARTILLERY),
  },
  { name: "Air Defense", code: "ICON_AIR_DEFENSE", sidc: buildSidc(ICON_AIR_DEFENSE) },
  { name: "Aviation", code: "ICON_AVIATION", sidc: buildSidc(ICON_AVIATION) },
  {
    name: "Attack Helicopter",
    code: "ICON_ATTACK_HELICOPTER",
    sidc: buildSidc(ICON_ATTACK_HELICOPTER),
  },
  { name: "Engineer", code: "ICON_ENGINEER", sidc: buildSidc(ICON_ENGINEER) },
  {
    name: "Combat Engineer",
    code: "ICON_COMBAT_ENGINEER",
    sidc: buildSidc(ICON_COMBAT_ENGINEER),
  },
  { name: "Signal", code: "ICON_SIGNAL", sidc: buildSidc(ICON_SIGNAL) },
  { name: "Supply", code: "ICON_SUPPLY", sidc: buildSidc(ICON_SUPPLY) },
  { name: "Maintenance", code: "ICON_MAINTENANCE", sidc: buildSidc(ICON_MAINTENANCE) },
  { name: "Medical", code: "ICON_MEDICAL", sidc: buildSidc(ICON_MEDICAL) },
  {
    name: "Military Police",
    code: "ICON_MILITARY_POLICE",
    sidc: buildSidc(ICON_MILITARY_POLICE),
  },
  {
    name: "Special Forces",
    code: "ICON_SPECIAL_FORCES",
    sidc: buildSidc(ICON_SPECIAL_FORCES),
  },
  { name: "Missile", code: "ICON_MISSILE", sidc: buildSidc(ICON_MISSILE) },
  { name: "Mortar", code: "ICON_MORTAR", sidc: buildSidc(ICON_MORTAR) },
  { name: "Antitank", code: "ICON_ANTITANK", sidc: buildSidc(ICON_ANTITANK) },
  {
    name: "Transportation",
    code: "ICON_TRANSPORTATION",
    sidc: buildSidc(ICON_TRANSPORTATION),
  },
  { name: "Headquarters", code: "ICON_HEADQUARTERS", sidc: buildSidc(ICON_HEADQUARTERS) },
  { name: "Chemical", code: "ICON_CHEMICAL", sidc: buildSidc(ICON_CHEMICAL) },
  { name: "NBC", code: "ICON_NBC", sidc: buildSidc(ICON_NBC) },
  {
    name: "Electronic Warfare",
    code: "ICON_ELECTRONIC_WARFARE",
    sidc: buildSidc(ICON_ELECTRONIC_WARFARE),
  },
  { name: "Intelligence", code: "ICON_INTELLIGENCE", sidc: buildSidc(ICON_INTELLIGENCE) },
  {
    name: "Military Intelligence",
    code: "ICON_MILITARY_INTELLIGENCE",
    sidc: buildSidc(ICON_MILITARY_INTELLIGENCE),
  },
  {
    name: "Civil Affairs",
    code: "ICON_CIVIL_AFFAIRS",
    sidc: buildSidc(ICON_CIVIL_AFFAIRS),
  },
  {
    name: "Psychological Operations",
    code: "ICON_PSYCHOLOGICAL_OPS",
    sidc: buildSidc(ICON_PSYCHOLOGICAL_OPS),
  },
  { name: "Naval", code: "ICON_NAVAL", sidc: buildSidc(ICON_NAVAL) },
  { name: "Air Force", code: "ICON_AIR_FORCE", sidc: buildSidc(ICON_AIR_FORCE) },
  { name: "Sniper", code: "ICON_SNIPER", sidc: buildSidc(ICON_SNIPER) },
  { name: "Amphibious", code: "ICON_AMPHIBIOUS", sidc: buildSidc(ICON_AMPHIBIOUS) },
  { name: "Parachute", code: "ICON_PARACHUTE", sidc: buildSidc(ICON_PARACHUTE) },
];

const filteredIcons = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return icons;
  return icons.filter(
    (icon) =>
      icon.name.toLowerCase().includes(query) || icon.code.toLowerCase().includes(query),
  );
});
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Icon mappings</DialogTitle>
        <DialogDescription>
          Browse available ICON_XXX entity codes and their symbols
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <Input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or code..."
          class="w-full"
        />

        <div class="grid max-h-96 grid-cols-2 gap-4 overflow-y-auto md:grid-cols-2">
          <div
            v-for="icon in filteredIcons"
            :key="icon.code"
            class="hover:bg-muted flex flex-col items-center gap-2 rounded border p-3 transition-colors"
          >
            <div class="flex h-12 w-12 items-center justify-center">
              <NewMilitarySymbol
                :sidc="icon.sidc"
                :size="40"
                :options="{ outlineWidth: 8, outlineColor: 'white' }"
              />
            </div>
            <div class="text-center text-sm">
              <div class="truncate" :title="icon.name">
                {{ icon.name }}
              </div>
              <div class="font-mono text-xs leading-6 text-amber-600 dark:text-amber-400">
                {{ icon.code.slice(5) }}
              </div>
              <div class="font-mono text-sm tracking-wider">
                {{ icon.sidc.slice(10) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="text-muted-foreground mt-2 text-sm"
        >Showing {{ filteredIcons.length }} of {{ icons.length }} icons</DialogFooter
      >
    </DialogContent>
  </Dialog>
</template>
