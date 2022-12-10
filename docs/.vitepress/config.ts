import { DefaultTheme, defineConfig } from "vitepress";

export default defineConfig({
  cleanUrls: "without-subfolders",
  title: "ORBAT Mapper",
  description: "Just playing around.",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }]],
  themeConfig: {
    outline: "deep",
    logo: "/favicon.svg",
    socialLinks: [
      { icon: "github", link: "https://github.com/orbat-mapper/orbat-mapper" },
    ],

    nav: [
      { text: "Guide", link: "/guide/what-is-orbat-mapper", activeMatch: "/guide/" },
      { text: "Resources", link: "/resources/tools", activeMatch: "/resources/" },
      { text: "Open App", link: "https://orbat-mapper.app" },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "",
    },
    sidebar: sidebarGuide(),
  },
});

function sidebarGuide(): DefaultTheme.Sidebar {
  return [
    {
      text: "Introduction",
      items: [
        { text: "What is ORBAT Mapper?", link: "/guide/what-is-orbat-mapper" },
        { text: "Getting started", link: "/guide/getting-started" },
        { text: "Military symbology", link: "/guide/military-symbology" },
      ],
    },
    {
      text: "Editing modes",
      items: [
        { text: "Map edit mode", link: "/guide/map-edit-mode" },
        { text: "Grid edit mode", link: "/guide/grid-edit-mode" },
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