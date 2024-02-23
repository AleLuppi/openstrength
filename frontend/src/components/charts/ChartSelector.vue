<template>
  <div style="width: 100%">
    <div class="row justify-between items-center q-mb-sm">
      <h6 class="text-margin-xs">
        {{ $t("coach.charts_management.list.charts_section") }}
      </h6>
      <q-btn
        @click="updateCharts()"
        icon="fa-solid fa-refresh"
        :flat="!oldData"
        round
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
      :title="getChartTitle(chartDataRequest)"
      :description="getChartDescription(chartDataRequest)"
      :data="chartData?.[index]"
      :options="getChartOptions(chartDataRequest)"
      class="q-my-sm"
      :class="{ disabled: oldData }"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { debounce } from "quasar";
import { ChartData } from "chart.js";
import {
  type ExerciseChartData,
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

// Import components
const ChartComponent = defineAsyncComponent(
  () => import("@/components/charts/ChartComponent.vue"),
);

// Init plugin
const i18n = useI18n();

// Define props
const props = withDefaults(
  defineProps<{
    program?: Program;
    filterExercise?: string[];
    filterDay?: string[];
    filterWeek?: string[];
  }>(),
  { filterWeek: undefined, filterDay: undefined, filterExercise: undefined },
);

// Set ref
const chartsKey = ref<string>("");
const chartDataRequests = ref<OSChartDataRequest[]>();
const chartData = ref<(ChartData<"line", ExerciseChartData[]> | undefined)[]>();
const oldData = ref(false);

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

  /* TODO
  {
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
  },
  */
];

// Inform user of old data when filters gets updated
watch(
  () => props,
  () => {
    oldData.value = true;
    debouncedChartsUpdate();
  },
  { deep: true },
);

/**
 * Auto-update charts after a delay from last update.
 */
const debouncedChartsUpdate = debounce(updateCharts, 10000);

/**
 * Force reload of chart components to refresh charts data.
 */
async function updateCharts() {
  console.log(props.filterWeek);

  chartDataRequests.value = chartDescriptions.map((chartDescriptor) => {
    return {
      chartInfo: chartDescriptor,
      program: props.program ?? new Program(),
      selectedExercises: props.filterExercise,
      selectedDays: props.filterDay,
      selectedWeeks: props.filterWeek,
    };
  });

  chartData.value = chartDataRequests.value.map((val) =>
    formatChartData(computeChartData(val)),
  );

  oldData.value = false;
}

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

// Render charts when component gets mounted
onMounted(() => {
  updateCharts();
});
</script>
