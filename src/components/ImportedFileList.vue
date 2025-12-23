<script setup lang="ts">
import type { ImportData } from "@/types/importExport.ts";
import { Item, ItemContent, ItemGroup, ItemMedia } from "@/components/ui/item";
import { PaperclipIcon } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import prettyBytes from "pretty-bytes";

defineProps<{ importData: ImportData }>();
</script>
<template>
  <div
    v-if="Array.isArray(importData.fileInfo)"
    class="flex w-full flex-col gap-4 sm:flex-row sm:gap-6"
  >
    <span class="text-muted-foreground font-medium">Loaded files</span>
    <ItemGroup class="flex-auto">
      <Item
        v-for="(file, index) in importData.fileInfo"
        :key="index"
        variant="outline"
        size="sm"
      >
        <ItemMedia>
          <PaperclipIcon class="size-4" />
        </ItemMedia>
        <ItemContent class="flex-row items-center justify-between gap-2">
          <div class="flex items-center gap-4">
            <span class="font-mono font-medium">{{ file.fileName }}</span>
            <span class="text-muted-foreground"
              >{{ prettyBytes(file.fileSize) }} bytes</span
            >
          </div>
          <Badge variant="secondary">{{ file.format }}</Badge>
        </ItemContent>
      </Item>
    </ItemGroup>
  </div>
</template>
