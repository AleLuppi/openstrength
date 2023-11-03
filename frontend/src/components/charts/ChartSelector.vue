<template>
  <!-- Chart Selector Component -->
  <div class="chart-selector">
    <!-- DROPDOWNS  -->
    <div class="row q-ma-sm justify-evenly">
      <!-- VOLUME DROPDOWN -->
      <q-btn-dropdown color="primary" label="Volume">
        <q-list>
          <q-item
            clickable
            v-close-popup
            v-for="item in volumeOptions"
            :key="item.value"
          >
            <q-item-section>
              <q-checkbox
                v-model="selectionVolume"
                :val="item.value"
                :label="item.label"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <!-- INTENSITY DROPDOWN-->
      <q-btn-dropdown color="primary" label="Intensity">
        <q-list>
          <q-item
            clickable
            v-close-popup
            v-for="item in intensityOptions"
            :key="item.value"
          >
            <q-item-section>
              <q-checkbox
                v-model="selectionIntensity"
                :val="item.value"
                :label="item.label"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <!-- IRT DROPDOWN -->
      <q-btn-dropdown color="primary" label="IRT">
        <q-list>
          <q-item
            clickable
            v-close-popup
            v-for="item in irtOptions"
            :key="item.value"
          >
            <q-item-section>
              <q-checkbox
                v-model="selectionIRT"
                :val="item.value"
                :label="item.label"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>

    <!-- CHARTS RENDERING -->
    <q-scroll-area dark class="rounded-borders" style="height: 70vh">
      <div class="q-px-xs q-py-sm">
        <!-- VOLUME CHART -->
        <div v-if="selectionVolume.includes('total')" class="q-ma-xs">
          <chart-component
            title="Total Volume"
            description="Andamento del volume per le diverse alzate principali."
            :data="dataA4"
            :options="optionA4"
          />
        </div>
        <div v-if="selectionVolume.includes('totalreps')" class="q-ma-xs">
          <chart-component
            title="Total Reps"
            description="Andamento del volume per le diverse alzate principali."
            :data="dataA4"
            :options="optionA4"
          />
        </div>
        <div v-if="selectionVolume.includes('totalsets')" class="q-ma-xs">
          <chart-component
            title="Total Sets"
            description="Andamento del volume per le diverse alzate principali."
            :data="dataA4"
            :options="optionA4"
          />
        </div>

        <!-- INTENSITY CHART -->
        <div v-if="selectionIntensity.includes('max')" class="q-ma-xs">
          <chart-component
            title="Intensity Max"
            description="Andamento del volume per le diverse alzate principali."
            :data="dataA4"
            :options="optionA4"
          />
        </div>
        <div v-if="selectionIntensity.includes('mean')" class="q-ma-xs">
          <chart-component
            title="Intensity Mean"
            description="Andamento del volume per le diverse alzate principali."
            :data="dataA4"
            :options="optionA4"
          />
        </div>
        <div v-if="selectionIntensity.includes('cumulated')" class="q-ma-xs">
          <chart-component
            title="Intensity Cumulated"
            description="Andamento del volume per le diverse alzate principali."
            :data="dataA4"
            :options="optionA4"
          />
        </div>

        <!-- IRT CHART -->
        <div v-if="selectionIRT.includes('max')" class="q-ma-xs">
          <chart-component
            title="IRT Max"
            description="Andamento del volume per le diverse alzate principali."
            :data="dataA4"
            :options="optionA4"
          />
        </div>
        <div v-if="selectionIRT.includes('mean')" class="q-ma-xs">
          <chart-component
            title="IRT Mean"
            description="Andamento del volume per le diverse alzate principali."
            :data="dataA4"
            :options="optionA4"
          />
        </div>
        <div v-if="selectionIRT.includes('cumulated')" class="q-ma-xs">
          <chart-component
            title="IRT Cumulated"
            description="Andamento del volume per le diverse alzate principali."
            :data="dataA4"
            :options="optionA4"
          />
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ChartComponent from "@/components/charts/ChartComponent.vue";

// TODO load from program data
const dataA4 = {
  datasets: [
    {
      label: "Panca",
      data: [40, 42, 33, 30, 35, 38],
      borderColor: "rgba(0, 123, 255, 1)",
      backgroundColor: "rgba(0, 123, 255, 0.2)",
      fill: false,
      cubicInterpolationMode: "monotone",
      tension: 0.1,
      yAxisID: "y",
    },
    {
      label: "Stacco",
      data: [70, 74, 78, 80, 83, 87],
      borderColor: "red",
      backgroundColor: "rgba(255, 0, 0, 0.2)",
      fill: false,
      cubicInterpolationMode: "monotone",
      tension: 0.1,
      yAxisID: "y",
    },
    {
      label: "Squat",
      data: [80, 82, 83, 86, 90, 92],
      borderColor: "green",
      backgroundColor: "rgba(0, 255, 0, 0.2)",
      fill: false,
      cubicInterpolationMode: "monotone",
      tension: 0.1,
      yAxisID: "y",
    },
  ],
  labels: [
    "Settimana 1",
    "Settimana 2",
    "Settimana 3",
    "Settimana 4",
    "Settimana 5",
    "Settimana 6",
  ],
};

// TODO load from program data
const optionA4 = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: "Date",
      },
    },
    y: {
      type: "linear",
      display: true,
      position: "left",
      title: {
        display: true,
        text: "Volume",
      },
    },
  },
};

const selectionVolume = ref(["total"]);
const selectionIntensity = ref(["cumulated"]);
const selectionIRT = ref(["cumulated"]);

const volumeOptions = [
  { value: "total", label: "Total Volume" },
  { value: "totalreps", label: "Total Reps" },
  { value: "totalsets", label: "Total Sets" },
];

const intensityOptions = [
  { value: "max", label: "Max Intensity" },
  { value: "mean", label: "Mean Intensity" },
  { value: "cumulated", label: "Cumulated Intensity" },
];

const irtOptions = [
  { value: "max", label: "Max IRT" },
  { value: "mean", label: "Mean IRT" },
  { value: "cumulated", label: "Cumulated IRT" },
];
</script>

<style scoped lang="scss">
.chart-selector {
  width: 100%;
}
</style>
