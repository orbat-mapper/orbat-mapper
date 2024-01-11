import { DefaultTheme, defineConfig } from "vitepress";

export default defineConfig({
  cleanUrls: true,
  title: "ORBAT Mapper (beta)",
  description: "",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }]],
  vite: {
    ssr: {
      noExternal: ["milsymbol"],
    },
  },
  themeConfig: {
    outline: "deep",
    logo: "/favicon.svg",
    socialLinks: [
      { icon: "github", link: "https://github.com/orbat-mapper/orbat-mapper" },
    ],
    nav: [
      { text: "Guide", link: "/guide/about-orbat-mapper", activeMatch: "/guide/" },
      { text: "Tutorial", link: "/tutorial/introduction", activeMatch: "/tutorial/" },
      { text: "Resources", link: "/resources/tools", activeMatch: "/resources/" },
      { text: "Support", link: "/support", activeMatch: "/support" },
      { text: "Open App", link: "https://orbat-mapper.app" },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "",
    },
    sidebar: {
      "/guide/": { base: "/guide/", items: sidebarGuide() },
      "/resources/": { base: "/resources/", items: sidebarResources() },
      "/tutorial/": { base: "/tutorial/", items: sidebarTutorial() },
    },
    search: {
      provider: "local",
    },
  },
});

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Introduction",
      items: [
        { text: "What is ORBAT Mapper?", link: "about-orbat-mapper" },
        { text: "Getting started", link: "getting-started" },
        { text: "Terminology", link: "terminology" },
        { text: "Military symbology", link: "military-symbology" },
      ],
    },
    {
      text: "Scenario editor",
      items: [
        { text: "Loading and saving", link: "storage" },
        { text: "Editing modes", link: "editing-modes" },
        { text: "Map edit mode", link: "map-edit-mode" },
        { text: "Grid edit mode", link: "grid-edit-mode" },
        { text: "Chart edit mode", link: "chart-edit-mode" },
        { text: "Map layers", link: "map-layers" },
      ],
    },
    {
      text: "Import and export",
      items: [
        { text: "Import data", link: "import-data" },
        { text: "Export data", link: "export-data" },
      ],
    },
  ];
}

function sidebarResources(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Resources",
      items: [
        { text: "Tools", link: "tools" },
        { text: "Military history", link: "military-history" },
      ],
    },
  ];
}

function sidebarTutorial(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Tutorial",
      items: [
        { text: "Introduction", link: "introduction" },
        { text: "Research", link: "research" },
      ],
    },
    {
      text: "Part 1",
      items: [{ text: "Getting started", link: "getting-started" }],
    },
    ,
  ];
}
