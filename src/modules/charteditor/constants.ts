export const ChartTabs = {
  Chart: "0",
  Level: "1",
  Branch: "2",
  Unit: "3",
} as const;

export type ChartTab = (typeof ChartTabs)[keyof typeof ChartTabs];
