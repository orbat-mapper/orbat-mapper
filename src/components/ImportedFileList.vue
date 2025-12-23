<script setup lang="ts">
import type { ImportData } from "@/types/importExport.ts";
import { Item, ItemContent, ItemGroup, ItemMedia } from "@/components/ui/item";
import { PaperclipIcon } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";

defineProps<{ importData: ImportData }>();
</script>
<template>
  <ItemGroup v-if="Array.isArray(importData.fileInfo)">
    <Item
      v-for="(file, index) in importData.fileInfo"
      :key="index"
      variant="outline"
      size="sm"
    >
      <ItemMedia><PaperclipIcon class="size-4" /></ItemMedia>
      <ItemContent class="flex-row items-center justify-between gap-2">
        <div class="flex items-center gap-4">
          <span class="font-mono font-medium">{{ file.fileName }}</span>
          <span class="text-muted-foreground">{{ file.fileSize }} bytes</span>
        </div>
        <Badge variant="secondary">{{ file.format }}</Badge>
      </ItemContent>
    </Item>
  </ItemGroup>
</template>
