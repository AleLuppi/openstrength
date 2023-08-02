<template>
    <q-card class="shadow-3">
      <q-card-section class="q-mb-md">
        <div class="row items-center no-wrap">
          <div class="col text-h5 text-weight-medium text-grey">
            {{ props.title }}
          </div>
  
          <div class="col-auto">
            <q-icon name="fas fa-circle-info" size="1.7rem" color="grey-5">
              <q-tooltip anchor="center left" self="center right" transition-show="fade" transition-hide="fade"
                class="bg-primary text-body2">
                {{ props.description }}
              </q-tooltip>
            </q-icon>
          </div>
        </div>
      </q-card-section>
  
      <q-separator spaced="lg" size="2px" />
  
      <q-card-section>
        <canvas ref="doughnutChart" :width="props.width" :height="props.height"></canvas>
      </q-card-section>
    </q-card>
  </template>
  
  <script setup>
  import { ref, onMounted, defineProps } from 'vue';
  import { Chart, Doughnut, Tooltip, Legend } from 'chart.js';
  
  Chart.register(Doughnut, Tooltip, Legend);
  
  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    width: {
      type: [Number, String],
      default: 400,
    },
    height: {
      type: [Number, String],
      default: 200,
    },
  });
  
  const doughnutChart = ref(null);
  
  function renderChart() {
    // Ensure canvas reference exists
    if (!doughnutChart.value) {
      console.error('Missing reference to canvas element.');
      return;
    }
  
    const ctx = doughnutChart.value.getContext('2d');
    new Chart(ctx, {
      type: 'doughnut', // Use doughnut chart type
      data: props.data,
      options: props.options,
    });
  }
  
  onMounted(renderChart);
  </script>
  
  <style scoped lang="scss">
  /* Styles specific to the component can be added here */
  </style>
  