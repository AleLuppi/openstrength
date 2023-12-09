<template>
  <!-- TODO: add i18n-->
  <div style="width: 100%">
    <div class="row justify-between">
      <h6 class="text-margin-xs">Charts Section</h6>
      <q-btn
        @click="updateCharts()"
        icon="fa-solid fa-refresh"
        outline
        flat
        color="secondary"
      >
        <q-tooltip :offset="[10, 10]"> Click to refresh charts data </q-tooltip>
      </q-btn>
    </div>

    <!-- CHARTS RENDERING -->

    <div v-if="charts">
      <template
        v-for="(chartDataRequest, index) in chartDataRequests"
        :key="index"
      >
        <chart-component
          class="q-mb-sm"
          v-if="getChartData(chartDataRequest)"
          :title="getChartTitle(chartDataRequest)"
          :description="getChartDescription(chartDataRequest)"
          :data="getChartData(chartDataRequest)"
          :options="getChartOptions(chartDataRequest)"
        />
      </template>
    </div>
    <div v-else>Click the refresh button to show available charts</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import ChartComponent from "@/components/charts/ChartComponent.vue";
import {
  computeChartData,
  createChartOptions,
  formatChartData,
} from "@/helpers/charts/chartDataFormatter";
import {
  OSAvailableXType,
  OSChartDataRequest,
  OSChartDescriptor,
  OSChartType,
  OSChartVersion,
} from "@/helpers/charts/chartTypes";
import { Program } from "@/helpers/programs/program";

const props = defineProps({
  program: {
    type: Program,
    required: true,
  },
  filterExercise: {
    type: Set,
    default: undefined,
    required: false,
  },
  filterDay: {
    type: Set,
    default: undefined,
    required: false,
  },
  filterWeek: {
    type: Set,
    default: undefined,
    required: false,
  },
});

const charts = ref<boolean>(false);

const chartDescriptions: OSChartDescriptor[] = [
  {
    chartType: OSChartType.Volume,
    chartVersion: OSChartVersion.TotalVolume,
    xAxisType: OSAvailableXType.Weeks,
    chartTitle: "Total Volume varying weeks",
    chartDescription: "Total sets x reps x load(kg) over week",
  },
  {
    chartType: OSChartType.Volume,
    chartVersion: OSChartVersion.TotalReps,
    xAxisType: OSAvailableXType.Weeks,
    chartTitle: "Total Reps varying weeks",
    chartDescription: "Total sets x reps total over week",
  },
  {
    chartType: OSChartType.Volume,
    chartVersion: OSChartVersion.TotalSets,
    xAxisType: OSAvailableXType.Weeks,
    chartTitle: "Total Sets varying weeks",
    chartDescription: "Total sets over week",
  },

  /*  {
    chartType: OSChartType.Intensity,
    chartVersion: OSChartVersion.MaxIntensity,
    xAxisType: OSAvailableXType.Weeks,
    chartTitle: "Total Volume varying weeks",
    chartDescription: "Maximum intensity in the week (computed as load/1RM)",
  },
  {
    chartType: OSChartType.Intensity,
    chartVersion: OSChartVersion.MeanIntensity,
    xAxisType: OSAvailableXType.Weeks,
    chartTitle: "Total Volume varying weeks",
    chartDescription: "Mean intensity over the week (computed as load/1RM)",
  }, */
];

const chartDataRequests: OSChartDataRequest[] = chartDescriptions.map(
  (chartDescriptor) => {
    return {
      chartInfo: chartDescriptor,
      program: props.program,
      selectedExercises: props.filterExercise as Set<string> | undefined,
      selectedDays: props.filterDay as Set<string> | undefined,
      selectedWeeks: props.filterWeek as Set<string> | undefined,
    };
  },
);

watch([props.filterExercise, props.filterDay, props.filterWeek], () => {
  updateCharts();
});

// Compute chart data
function updateCharts() {
  charts.value = true;
}

/**
 * Computes data
 * @param chartDataRequest
 */
function getChartData(chartDataRequest: OSChartDataRequest): any {
  return formatChartData(computeChartData(chartDataRequest));
}

/**
 * Builds chart options
 * @param chartDataRequest
 */
function getChartOptions(chartDataRequest: OSChartDataRequest): any {
  return createChartOptions(
    chartDataRequest.chartInfo.xAxisType,
    chartDataRequest.chartInfo.chartVersion,
  );
}

function getChartTitle(chartDataRequest: OSChartDataRequest): string {
  return chartDataRequest.chartInfo.chartTitle || "";
}

function getChartDescription(chartDataRequest: OSChartDataRequest): string {
  return chartDataRequest.chartInfo.chartDescription || "";
}
</script>
