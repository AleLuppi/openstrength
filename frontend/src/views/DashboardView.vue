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
    <!-- <div class="col-5">
      <chart-component title="Example preprocessing" description="Volume data taken from complete JSON for athlete"
        :data="data" :options="chartOptions" :width="400" :height="300" />
    </div> -->

  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import ChartComponent from '@/components/charts/ChartComponent.vue';
import chartData from '@/test/test_data/chartData.json';

import chartData2 from '@/test/test_data/chartData2.json';
import chartOptions2 from '@/test/test_data/chartOptions2.json';
import chartData1RM from '@/test/test_data/chartData1RM.json';
import chartOptions1RM from '@/test/test_data/chartOptions1RM.json';

import barLineChartData from '@/test/test_data/barLineChartData.json';
import barLineChartOptions from '@/test/test_data/barLineChartOptions.json';
import barChartData from '@/test/test_data/barChartData.json';
import barChartOptions from '@/test/test_data/barChartOptions.json';

import chartOptions from '@/test/test_data/chartOptions.json';

import { computeVolumeInDateRange } from '@/utils/datamanager/postprocessing.ts';
import dataInput from '@/test/test_data/finalTemplate.json';

onMounted(() => {
  dataInput.registeredFitness.forEach((el) => el.date = new Date(el.date))
  console.log(computeVolumeInDateRange(dataInput.registeredFitness, new Date('2023-07-25'), new Date('2023-07-28')))
})
</script>
