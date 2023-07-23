<template>
  <div class="dashboard">
    <chart-component title="Workout Volume" description="Volume of workouts over time computed as Rep x Set x Load"
      :data="chartData" :options="chartOptions" :width="400" :height="300" />
    <chart-component title="Volume alzate principali" description="Just another graph to test multiple components"
      :data="chartData2" :options="chartOptions2" :width="400" :height="300" />
    <chart-component title="1RM alzate principali" description="Just another graph to test multiple components"
      :data="chartData1RM" :options="chartOptions1RM" :width="400" :height="300" />
 
    <bar-line-chart-component
    title="Progressi Mesociclo"
    description="Questo grafico mostra l'andamento del volume e intensità all'interno di un mesociclo per un esercizio. Es settimana 1, es 1, settimana 2 es 1 ecc ecc."
    :data="barLineChartData" 
    :options="barLineChartOptions" 
    :width="400"
    :height="300"
    />

    <bar-line-chart-component
      title="Progressi Mesociclo"
      description="Questo grafico mostra l'andamento di serie e rep all'interno di un mesociclo per un esercizio."
      :data="barChartData" 
      :options="barChartOptions" 
      :width="400"
      :height="300"
    />
  </div>
</template>

<script>
import ChartComponent from '@/components/charts/ChartComponent.vue';
import chartData from '@/views/chartdata/chartData.json';
import chartOptions from '@/views/chartdata/chartOptions.json';
import chartData2 from '@/views/chartdata/chartData2.json';
import chartOptions2 from '@/views/chartdata/chartOptions2.json';
import chartData1RM from '@/views/chartdata/chartData1RM.json';
import chartOptions1RM from '@/views/chartdata/chartOptions1RM.json'; 

import BarLineChartComponent from '@/components/charts/BarLineChartComponent.vue';
import barLineChartData from '@/views/chartdata/barLineChartData.json';
import barLineChartOptions from '@/views/chartdata/barLineChartOptions.json';
import barChartData from '@/views/chartdata/barChartData.json';
import barChartOptions from '@/views/chartdata/barChartOptions.json';





export default {
  components: {
    ChartComponent,
    BarLineChartComponent,
  },
  data() {
    return {
      chartData,
      chartOptions,
      chartData2,
      chartOptions2,
      chartData1RM,
      chartOptions1RM,
      barLineChartData,
      barLineChartOptions,
      barChartData,
      barChartOptions,
    };
  },
};
</script>
