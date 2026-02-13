# Sistema de Janelas Flutuantes e Interface Mobile

Este documento descreve como usar o novo sistema de janelas flutuantes e a interface otimizada para mobile, inspirado no Nomad Sculp.

## Componentes Principais

### 1. FloatingWindow

Janela flutuante draggable, resizable e minimizável.

**Uso básico:**
```vue
<script setup lang="ts">
import FloatingWindow from "@/components/FloatingWindow.vue";
import { useFloatingWindows } from "@/composables/useFloatingWindows";

const { createWindow, updateWindow, removeWindow } = useFloatingWindows();

// Criar janela
const window = createWindow("toolbar-1", "Editor Tools", {
  x: 100,
  y: 100,
  width: 400,
  height: 300,
});
</script>

<template>
  <FloatingWindow
    :state="window"
    @update:position="(x, y) => updateWindow('toolbar-1', { x, y })"
    @update:size="(w, h) => updateWindow('toolbar-1', { width: w, height: h })"
    @update:minimized="(v) => updateWindow('toolbar-1', { isMinimized: v })"
    @close="removeWindow('toolbar-1')"
    @bring-to-front="bringToFront('toolbar-1')"
  >
    <!-- Conteúdo da janela -->
  </FloatingWindow>
</template>
```

**Funcionalidades:**
- **Draggable header**: Clique e arraste o título para mover
- **Resize**: Arraste o canto inferior direito para redimensionar
- **Minimize**: Clique no botão "-" para minimizar
- **Maximize**: Clique no botão "□" para tela cheia
- **Close**: Clique no "X" para fechar (janela é destruída)

### 2. BottomSheetMenu

Menu que aparece de baixo para cima, otimizado para mobile.

**Uso básico:**
```vue
<script setup lang="ts">
import BottomSheetMenu from "@/components/BottomSheetMenu.vue";
import { ref } from "vue";

const isOpen = ref(false);
</script>

<template>
  <button @click="isOpen = true">Abrir Menu</button>

  <BottomSheetMenu
    :is-open="isOpen"
    title="Opções"
    @close="isOpen = false"
  >
    <!-- Conteúdo do menu -->
    <div class="space-y-2">
      <button>Opção 1</button>
      <button>Opção 2</button>
    </div>
  </BottomSheetMenu>
</template>
```

### 3. ResponsiveToolbar

Toolbar automática que muda entre desktop e mobile.

**Uso:**
```vue
<script setup lang="ts">
import ResponsiveToolbar from "@/components/ResponsiveToolbar.vue";

function handleAction(action: string) {
  console.log("Action:", action);
}
</script>

<template>
  <ResponsiveToolbar
    :can-undo="true"
    :can-redo="false"
    :move-unit-enabled="false"
    :current-toolbar="null"
    @action="handleAction"
    @show-settings="handleShowSettings"
  />
</template>
```

## Composables

### useFloatingWindows

Gerencia estado de múltiplas janelas flutuantes.

```ts
const {
  windows,        // Array de janelas ativas
  createWindow,   // Criar nova janela
  removeWindow,   // Remover janela
  updateWindow,   // Atualizar propriedades da janela
  bringToFront,   // Trazer janela para frente
  toggleMinimize, // Minimizar/restaurar
  getWindow,      // Obter janela por ID
  minimizeAll,    // Minimizar todas as janelas
  restoreAll,     // Restaurar todas as janelas
} = useFloatingWindows();
```

### useBottomSheets

Gerencia estado de bottom sheets para mobile.

```ts
const {
  sheets,      // Array de sheets abertos
  createSheet, // Criar novo sheet
  openSheet,   // Abrir sheet
  closeSheet,  // Fechar sheet
  toggleSheet, // Toggle sheet
  getSheet,    // Obter sheet por ID
  closeAll,    // Fechar todos os sheets
} = useBottomSheets();
```

## Exemplo Completo de Integração

```vue
<script setup lang="ts">
import FloatingWindow from "@/components/FloatingWindow.vue";
import ResponsiveToolbar from "@/components/ResponsiveToolbar.vue";
import { useFloatingWindows } from "@/composables/useFloatingWindows";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { ref, onMounted } from "vue";

const { windows, createWindow, updateWindow, removeWindow, bringToFront } =
  useFloatingWindows();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("sm");

onMounted(() => {
  // Criar janela principal na inicialização
  if (!isMobile.value) {
    createWindow("main-toolbar", "Main Toolbar", {
      x: 50,
      y: 50,
      width: 600,
      height: 200,
    });
  }
});

function handleToolbarAction(action: string) {
  console.log("Toolbar action:", action);
  switch (action) {
    case "undo":
      // Fazer undo
      break;
    case "redo":
      // Fazer redo
      break;
    // ... outros actions
  }
}
</script>

<template>
  <!-- Renderizar janelas flutuantes (desktop) -->
  <template v-for="window in windows" :key="window.id">
    <FloatingWindow
      :state="window"
      @update:position="(x, y) => updateWindow(window.id, { x, y })"
      @update:size="(w, h) => updateWindow(window.id, { width: w, height: h })"
      @update:minimized="(v) => updateWindow(window.id, { isMinimized: v })"
      @close="removeWindow(window.id)"
      @bring-to-front="bringToFront(window.id)"
    >
      <ResponsiveToolbar
        v-model:can-undo="canUndo"
        v-model:can-redo="canRedo"
        @action="handleToolbarAction"
      />
    </FloatingWindow>
  </template>

  <!-- Toolbar responsiva (mobile + desktop) -->
  <ResponsiveToolbar
    :can-undo="canUndo"
    :can-redo="canRedo"
    @action="handleToolbarAction"
  />
</template>
```

## Features de Mobile

- **Bottom Sheet Menu**: Menu deslizável de baixo para cima
- **Responsive Layout**: Botões maiores e mais espaçados
- **Touch Friendly**: Dimensões otimizadas para toque
- **Collapsible Toolbar**: Menu para acessar mais opções sem poluir a tela

## Features de Desktop

- **Janelas Flutuantes**: Múltiplas janelas que podem ser movidas e redimensionadas
- **Z-index automático**: Janelas trazidas para frente quando clicadas
- **Minimizable**: Minimizar janelas sem fechar (economiza espaço)
- **Maximize**: Tela cheia para trabalhar em uma janela específica

## Atalhos de Teclado Sugeridos

- `Ctrl+Z` / `Cmd+Z`: Undo
- `Ctrl+Y` / `Cmd+Shift+Z`: Redo
- `Ctrl+D`: Alternar Draw
- `Ctrl+M`: Alternar Measurement
- `Esc`: Fechar/Minimizar janela focada
- `Alt+Tab`: Alternar entre janelas

Estes podem ser implementados usando o composable `useKeyboardShortcuts` (a ser criado).
