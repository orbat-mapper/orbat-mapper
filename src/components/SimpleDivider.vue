<template>
  <div>
    <div class="relative">
      <div class="absolute inset-0 flex items-center" aria-hidden="true">
        <div class="border-border w-full border-t" />
      </div>
      <div class="relative flex justify-center">
        <span class="text-muted-foreground bg-muted/50 rounded px-2 text-sm"
          ><slot
        /></span>
      </div>
    </div>
  </div>
</template>
