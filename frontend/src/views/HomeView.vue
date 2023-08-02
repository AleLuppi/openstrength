<template>
    <!-- TO DO: adjust color styling in component or create another component -->
    <div class="col-4">
      <chart-component title="Volume per diversi livelli di intensità" 
      description="Volume di allenamento per vari livelli di intensità relativa durante le settimane." type="doughnut"
        :data="dataE3" :options="optionsE3" :width="400" :height="300" />
    </div>

    <!-- TO DO: adjust color styling in component or create another component -->
        <div class="col-4">
      <chart-component title="Volume nelle settimane" 
      description="Volume di allenamento per durante le settimane." type="doughnut"
        :data="dataE4" :options="optionsE4" :width="400" :height="300" />
    </div>


</template>

<script setup>
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';
import ChartComponent from '@/components/charts/ChartComponent.vue';

// FIRST GRAPH: E3
const doughnutChartE3 = ref(null);

const dataE3 = {
  labels: ['<69%', '70|75%', '76|80%', '81|85%', '86|90%', '91|95%', '96|100%'],
  datasets: [
    {
      data: [40, 227, 88, 28, 0 ,3, 0],
      backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
      hoverOffset: 4,
    },
  ],
};

const optionsE3 = {
  type: 'doughnut',
  data: dataE3,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    // Customize chart options here
  },
};

const renderChartE3 = () => {
  if (!doughnutChartE3.value || !(doughnutChartE3.value instanceof HTMLCanvasElement)) {
    console.error('Missing or invalid reference to canvas element.');
    return;
  }

  const ctx = doughnutChartE3.value.getContext('2d');
  new Chart(ctx, optionsE3);
};

onMounted(renderChartE3);

// SECOND GRAPH E4

const doughnutChartE4 = ref(null);

const dataE4 = {
  labels: ['Settimana 1', 'Settimana 2', 'Settimana 3', 'Settimana 4'],
  datasets: [
    {
      data: [87, 101, 133, 65],
      backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
      hoverOffset: 4,
    },
  ],
};

const optionsE4 = {
  type: 'doughnut',
  data: dataE4,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    // Customize chart options here
  },
};

const renderChartE4 = () => {
  if (!doughnutChartE4.value || !(doughnutChartE4.value instanceof HTMLCanvasElement)) {
    console.error('Missing or invalid reference to canvas element.');
    return;
  }

  const ctx = doughnutChartE4.value.getContext('2d');
  new Chart(ctx, optionsE4);
};

onMounted(renderChartE4);
</script>

<style scoped lang="scss">
@import '@/styles/quasar.scss';

// TODO move outside of component
h2 {
  font-size: 1.5rem;
  margin: 0;
}

// TODO move outside of component
p {
  font-size: 1rem;
  margin: 0;
}
</style>
