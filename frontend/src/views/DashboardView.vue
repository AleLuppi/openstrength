<template>
  <div class="row q-pa-md justify-between q-col-gutter-md">
    <!-- TODO dynamic sizing, and auto add title + description -->

    <div class="col-12">
      <chart-component title="Workout Volume" description="Volume of workouts over time computed as Rep x Set x Load"
        :data="chartData" :options="chartOptions" :width="400" :height="300" />
    </div>
    <div class="col-7">
      <chart-component title="Volume alzate principali" description="Just another graph to test multiple components"
        :data="chartData2" :options="chartOptions2" :width="400" :height="300" />
    </div>
    <div class="col-5">
      <chart-component title="1RM alzate principali" description="Just another graph to test multiple components"
        :data="chartData1RM" :options="chartOptions1RM" :width="400" :height="300" />
    </div>

    <div class="col-6">
      <chart-component title="Progressi Mesociclo" type="bar"
        description="Questo grafico mostra l'andamento del volume e intensità all'interno di un mesociclo per un esercizio. Es settimana 1, es 1, settimana 2 es 1 ecc ecc."
        :data="barLineChartData" :options="barLineChartOptions" :width="400" :height="150" />
    </div>
    <div class="col-6">
      <chart-component title="Progressi Mesociclo" type="bar"
        description="Questo grafico mostra l'andamento di serie e rep all'interno di un mesociclo per un esercizio."
        :data="barChartData" :options="barChartOptions" :width="400" :height="150" />
    </div>
    <div class="col-5">
      <chart-component title="Example preprocessing" description="Volume data taken from complete JSON for athlete"
        :data="data" :options="chartOptions" :width="400" :height="300" />
    </div>

  </div>
</template>

<script setup>
import ChartComponent from '@/components/charts/ChartComponent.vue';
import chartData from '@/views/chartdata/chartData.json';

console.log("chartdata here it is");
console.log(chartData);
import chartData2 from '@/views/chartdata/chartData2.json';
import chartOptions2 from '@/views/chartdata/chartOptions2.json';
import chartData1RM from '@/views/chartdata/chartData1RM.json';
import chartOptions1RM from '@/views/chartdata/chartOptions1RM.json';

import barLineChartData from '@/views/chartdata/barLineChartData.json';
import barLineChartOptions from '@/views/chartdata/barLineChartOptions.json';
import barChartData from '@/views/chartdata/barChartData.json';
import barChartOptions from '@/views/chartdata/barChartOptions.json';

import chartOptions from '@/views/chartdata/chartOptions.json';
import data from '@/views/data/datapreprocessing.js';
</script>
