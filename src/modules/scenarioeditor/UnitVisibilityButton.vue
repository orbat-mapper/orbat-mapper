<script setup lang="ts">
import { ChevronDown } from "@lucide/vue";
import { IconEye, IconEyeOff } from "@iconify-prerendered/vue-mdi";
import IconButton from "@/components/IconButton.vue";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hideBranchMenuItems } from "@/composables/scenarioActions";
import { type UnitAction, UnitActions } from "@/types/constants";

const props = defineProps<{ hidden: boolean; hasSubordinates: boolean }>();
const emit = defineEmits<{ action: [action: UnitAction] }>();
</script>

<template>
  <div class="flex items-center">
    <!-- aria-pressed:bg-accent keeps the hidden state visible at a glance -->
    <IconButton
      size="icon-sm"
      class="aria-pressed:bg-accent"
      :class="{ 'rounded-r-none': hasSubordinates }"
      :tooltip="hidden ? 'Hidden on map. Click to show' : 'Hide on map'"
      :aria-pressed="hidden"
      @click="emit('action', hidden ? UnitActions.Show : UnitActions.Hide)"
    >
      <IconEyeOff v-if="hidden" class="size-5" aria-hidden="true" />
      <IconEye v-else class="size-5" aria-hidden="true" />
    </IconButton>
    <DropdownMenu v-if="props.hasSubordinates">
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="icon-sm"
          class="text-foreground/80 w-4 rounded-l-none"
          aria-label="Hide or show subordinates"
          title="Hide or show subordinates"
        >
          <ChevronDown class="size-3" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Branch</DropdownMenuLabel>
        <DropdownMenuItem
          v-for="item in hideBranchMenuItems(true)"
          :key="item.action"
          @select="emit('action', item.action)"
        >
          {{ item.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
