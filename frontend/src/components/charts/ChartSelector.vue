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

    <template
      v-for="(chartDataRequest, index) in props.chartDataRequests"
      :key="index"
    >
      <div v-if="charts">
        <chart-component
          class="q-mb-sm"
          :v-if="getChartData(chartDataRequest)"
          :title="getChartTitle(chartDataRequest)"
          :description="getChartDescription(chartDataRequest)"
          :data="getChartData(chartDataRequest)"
          :options="getChartOptions(chartDataRequest)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType } from "vue";
import ChartComponent from "@/components/charts/ChartComponent.vue";
import {
  computeChartData,
  createChartOptions,
  formatChartData,
} from "@/helpers/charts/chartDataFormatter";
import { OSChartDataRequest } from "@/helpers/charts/chartTypes";

const props = defineProps({
  chartDataRequests: {
    type: Array as PropType<OSChartDataRequest[]>,
    required: true,
  },
});

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

const charts = ref<boolean>(false);
// Compute chart data
function updateCharts() {
  charts.value = true;
}
</script>
