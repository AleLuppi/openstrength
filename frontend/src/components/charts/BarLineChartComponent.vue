<template>
    <div class="chart-container bg-grey-1">
      <div class="q-mb-md">
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
      <div>
        <canvas ref="chartCanvas" :width="width" :height="height"></canvas>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { Chart, LinearScale, CategoryScale, BarElement, LineElement, BarController, Tooltip, Legend } from 'chart.js';
  
  // Init plugins
  Chart.register(LinearScale, CategoryScale, BarElement, LineElement, BarController, Tooltip, Legend);
  
  export default {
    props: {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      width: {
        type: [Number, String],
        default: 400,
      },
      height: {
        type: [Number, String],
        default: 200,
      },
      data: {
        type: Array, // Modify the type to Object since data is an object
        required: true,
      },
      options: {
        type: Object, // Modify the type to Object since options is an object
        default: () => ({}),
      },
    },
    setup(props) {
      const chartCanvas = ref(null);
  
      function renderChart() {
        if (!chartCanvas.value) return;
  
        const ctx = chartCanvas.value.getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: props.data, // Use the data prop passed from the parent component
          options: props.options, // Use the options prop passed from the parent component
        });
      }
  
      onMounted(() => {
        renderChart();
      });
  
      return {
        chartCanvas,
      };
    },
  };
  </script>
  
  <style scoped lang="scss">
  .chart-container {
    margin: 20px;
    border: 1px solid #ccc;
    padding: 10px;
  }
  
  h2 {
    font-size: 1.5rem;
    margin: 0;
  }
  
  p {
    font-size: 1rem;
    margin: 0;
  }
  </style>
  