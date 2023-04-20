import { DefaultTheme, defineConfig } from "vitepress";

export default defineConfig({
  cleanUrls: true,
  title: "ORBAT Mapper (beta)",
  description: "Just playing around.",
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
      { text: "Resources", link: "/resources/tools", activeMatch: "/resources/" },
      { text: "Support", link: "/support", activeMatch: "/support" },
      { text: "Open App", link: "https://orbat-mapper.app" },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "",
    },
    sidebar: sidebarGuide(),
    search: {
      provider: "local",
    },
  },
});

function sidebarGuide(): DefaultTheme.Sidebar {
  return [
    {
      text: "Introduction",
      items: [
        { text: "What is ORBAT Mapper?", link: "/guide/about-orbat-mapper" },
        { text: "Getting started", link: "/guide/getting-started" },
        { text: "Terminology", link: "/guide/terminology" },
        { text: "Military symbology", link: "/guide/military-symbology" },
      ],
    },
    {
      text: "Scenario editor",
      items: [
        { text: "Editing modes", link: "/guide/editing-modes" },
        { text: "Map edit mode", link: "/guide/map-edit-mode" },
        { text: "Grid edit mode", link: "/guide/grid-edit-mode" },
        { text: "Chart edit mode", link: "/guide/chart-edit-mode" },
      ],
    },
    {
      text: "Import and export",
      items: [
        { text: "Import data", link: "/guide/import-data" },
        { text: "Export data", link: "/guide/export-data" },
      ],
    },
    {
      text: "Resources",
      items: [
        { text: "Tools", link: "/resources/tools" },
        { text: "Military history", link: "/resources/military-history" },
      ],
    },
  ];
}
