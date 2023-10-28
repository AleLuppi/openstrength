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

import dataA4 from "@/data/dataA4.json";
import optionA4 from "@/data/dataA4.json";

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
