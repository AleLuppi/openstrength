import { Program } from "../programs/program";

// NOTE: I put OS as prefix to avoid overriding chart.js types!!!
/**
 * Defines the available chart types
 */
export enum OSChartType {
  Volume = "Volume",
  Intensity = "Intensity",
  IRT = "IRT",
  VolumeOnLoadRanges = "VolumeOnLoadRanges",
  All = "All",
}

/**
 * Defines the available version of a given chart type
 */
export enum OSChartVersion {
  TotalVolume = "Total Volume",
  TotalReps = "Total Reps",
  TotalSets = "Total Sets",
  MaxIntensityKg = "Max [kg]",
  MaxIntensityPercentage = "Max [%]",
  MeanIntensity = "Mean",
}

/**
 * Define the available X-axis types
 * Note: LoadRanges is used only for pie-chart
 */
export enum OSAvailableXType {
  Weeks = "Weeks",
  Days = "Days",
  LoadRanges = "LoadRanges",
}

/**
 * Defines the x and y axis chart titles
 */
export type OSAxisTitles = {
  titleXaxis?: string;
  titleYaxis?: string;
};

/**
 * Defines the complete request for chart
 */
export type OSChartDataRequest = {
  chartInfo: OSChartDescriptor;
  program: Program;
  selectedExercises?: string[];
  selectedDays?: string[];
  selectedWeeks?: string[];
};

/**
 * Identifies univocally the chart to be computed
 */
export type OSChartDescriptor = {
  chartType: OSChartType;
  chartVersion: OSChartVersion;
  xAxisType: OSAvailableXType;
  chartTitle?: string;
  chartDescription?: string;
};
