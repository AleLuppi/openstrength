<template>
  <div class="col-4">
       <q-card class="shadow-3">
        <q-card-section class="q-mb-md">
          <div class="row items-center no-wrap">
            <div class="col text-h5 text-weight-medium text-grey">
              {{ "Volume per diversi livelli di intensità" }}
            </div>

            <div class="col-auto">
              <q-icon name="fas fa-circle-info" size="1.7rem" color="grey-5">
                <q-tooltip anchor="center left" self="center right" transition-show="fade" transition-hide="fade"
                  class="bg-primary text-body2">
                  {{ "Volume di allenamento per vari livelli di intensità relativa durante le settimane." }}
                </q-tooltip>
              </q-icon>
            </div>
          </div>
        </q-card-section>

        <q-separator spaced="lg" size="2px" />

        <q-card-section>
          <div>
            <canvas ref="doughnutChart"></canvas>
          </div>
        </q-card-section>
      </q-card>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';

const doughnutChart = ref(null);

const data = {
  labels: ['<69%', '70|75%', '76|80%', '81|85%', '86|90%', '91|95%', '96|100%'],
  datasets: [
    {
      data: [40, 227, 88, 28, 0 ,3, 0],
      backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
      hoverOffset: 4,
    },
  ],
};

const options = {
  type: 'doughnut',
  data: data,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    // Customize chart options here
  },
};

const renderChart = () => {
  if (!doughnutChart.value || !(doughnutChart.value instanceof HTMLCanvasElement)) {
    console.error('Missing or invalid reference to canvas element.');
    return;
  }

  const ctx = doughnutChart.value.getContext('2d');
  new Chart(ctx, options);
};

onMounted(renderChart);
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
