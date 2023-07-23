<template>
  <div class="dashboard">
    <chart-component
      title="Workout Volume"
      description="Volume of workouts over time computed as Rep x Set x Load"
      :data="chartData"
      :options="chartOptions"
      :width="400"
      :height="200"
    />
    <chart-component
      title="Volume alzate principali"
      description="Just another graph to test multiple components"
      :data="chartData2"
      :options="chartOptions2"
      :width="400"
      :height="200"
    />
    <chart-component
      title="1RM alzate principali"
      description="Just another graph to test multiple components"
      :data="chartData1RM"
      :options="chartOptions1RM"
      :width="400"
      :height="200"
    />
  </div>
</template>

<script>
import ChartComponent from '@/components/ChartComponent.vue';
import chartData from '@/views/chartdata/chartData.json';
import chartOptions from '@/views/chartdata/chartOptions.json';
import chartData2 from '@/views/chartdata/chartData2.json';
import chartOptions2 from '@/views/chartdata/chartOptions2.json';
import chartData1RM from '@/views/chartdata/chartData1RM.json';
import chartOptions1RM from '@/views/chartdata/chartOptions1RM.json'; 

export default {
  components: {
    ChartComponent,
  },
  data() {
    return {
      chartData,
      chartOptions,
      chartData2,
      chartOptions2,
      chartData1RM,
      chartOptions1RM,
    };
  },
};
</script>
