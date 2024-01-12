<template>
  <!-- TODO: add i18n-->
  <div style="width: 100%">
    <div class="row justify-between">
      <h6 class="text-margin-xs">
        {{ $t("coach.charts_management.list.charts_section") }}
      </h6>
      <q-btn
        @click="updateCharts()"
        icon="fa-solid fa-refresh"
        outline
        flat
        color="secondary"
      >
        <q-tooltip :offset="[10, 10]">
          {{ $t("coach.charts_management.list.refresh_tooltip") }}
        </q-tooltip>
      </q-btn>
    </div>

    <!-- CHARTS RENDERING -->
    <chart-component
      v-for="(chartDataRequest, index) in chartDataRequests"
      :key="chartsKey + index"
      class="q-mb-sm"
      :title="getChartTitle(chartDataRequest)"
      :description="getChartDescription(chartDataRequest)"
      :data="chartData[index]"
      :options="getChartOptions(chartDataRequest)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, PropType } from "vue";
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
import { useI18n } from "vue-i18n";

const i18n = useI18n();

// Define props
const props = defineProps({
  program: {
    type: Program,
    required: false,
  },
  filterExercise: {
    type: Array as PropType<string[]>,
    default: undefined,
    required: false,
  },
  filterDay: {
    type: Array as PropType<string[]>,
    default: undefined,
    required: false,
  },
  filterWeek: {
    type: Array as PropType<string[]>,
    default: undefined,
    required: false,
  },
});

// Set ref
const chartsKey = ref<string>("");

// Set constants
const chartDescriptions: OSChartDescriptor[] = [
  // TODO i18n

  {
    chartType: OSChartType.Volume,
    chartVersion: OSChartVersion.TotalVolume,
    xAxisType: OSAvailableXType.Weeks,
    chartTitle: i18n.t("coach.charts_management.list.tot_volume_title"),
    chartDescription: i18n.t("coach.charts_management.list.tot_volume_desc"),
  },
  {
    chartType: OSChartType.Volume,
    chartVersion: OSChartVersion.TotalReps,
    xAxisType: OSAvailableXType.Weeks,
    chartTitle: i18n.t("coach.charts_management.list.tot_reps_title"),
    chartDescription: i18n.t("coach.charts_management.list.tot_reps_desc"),
  },
  {
    chartType: OSChartType.Volume,
    chartVersion: OSChartVersion.TotalSets,
    xAxisType: OSAvailableXType.Weeks,
    chartTitle: i18n.t("coach.charts_management.list.tot_sets_title"),
    chartDescription: i18n.t("coach.charts_management.list.tot_sets_desc"),
  },
  {
    chartType: OSChartType.Intensity,
    chartVersion: OSChartVersion.MaxIntensityKg,
    xAxisType: OSAvailableXType.Weeks,
    chartTitle: "Maximum intensity varying weeks",
    chartDescription:
      "Maximum load used in the week [kg]. Note: values set as % are computed only if referred to something",
  },
  {
    chartType: OSChartType.Intensity,
    chartVersion: OSChartVersion.AverageIntensityKg,
    xAxisType: OSAvailableXType.Weeks,
    chartTitle: "Average intensity varying weeks",
    chartDescription:
      "Average intensity used in the weeks [kg]. Note: values set as % are computed only if referred to something",
  },
];

// Get a list of data requests for program
const chartDataRequests = computed<OSChartDataRequest[]>(() =>
  chartDescriptions.map((chartDescriptor) => {
    return {
      chartInfo: chartDescriptor,
      program: props.program ?? new Program(),
      selectedExercises: props.filterExercise,
      selectedDays: props.filterDay,
      selectedWeeks: props.filterWeek,
    };
  }),
);

watch(
  () => [props.filterExercise, props.filterDay, props.filterWeek],
  () => {
    updateCharts();
  },
  { deep: true },
);

/**
 * Force reload of chart components to refresh charts data.
 */
function updateCharts() {
  chartsKey.value = chartsKey.value == "+" ? "-" : "+";
}

/**
 * Computes data
 * @param chartDataRequest
 */
const chartData = computed(() =>
  chartDataRequests.value.map((val) => formatChartData(computeChartData(val))),
);

/**
 * Build chart options.
 *
 * @param chartDataRequest structure maintainig chart request.
 */
function getChartOptions(chartDataRequest: OSChartDataRequest): any {
  return createChartOptions(
    chartDataRequest.chartInfo.xAxisType,
    chartDataRequest.chartInfo.chartVersion,
  );
}

/**
 * Build chart title.
 *
 * @param chartDataRequest structure maintainig chart request.
 */
function getChartTitle(chartDataRequest: OSChartDataRequest): string {
  return chartDataRequest.chartInfo.chartTitle || "";
}

/**
 * Build chart description.
 *
 * @param chartDataRequest structure maintainig chart request.
 */
function getChartDescription(chartDataRequest: OSChartDataRequest): string {
  return chartDataRequest.chartInfo.chartDescription || "";
}
</script>
