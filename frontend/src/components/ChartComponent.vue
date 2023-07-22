<template>
    <div class="chart-container">
      <div class="chart-header">
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
      <canvas ref="chartCanvas" :width="width" :height="height"></canvas>
    </div>
  </template>
  
  <script>
import { Chart, LinearScale, CategoryScale, PointElement, LineElement, LineController, Tooltip, Legend } from 'chart.js';
Chart.register(LinearScale, CategoryScale, PointElement, LineElement, LineController, Tooltip, Legend);
  
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
        type: Object,
        required: true,
      },
      options: {
        type: Object,
        default: () => ({}),
      },
    },
    mounted() {
      this.renderChart();
    },
    methods: {
      renderChart() {
        const ctx = this.$refs.chartCanvas.getContext('2d');
        new Chart(ctx, {
          type: 'line', // Change the chart type as needed (e.g., 'bar', 'pie', etc.)
          data: this.data,
          options: this.options,
        });
      },
    },
  };
  </script>
  
  <style>
  .chart-container {
    margin: 20px;
    border: 1px solid #ccc;
    padding: 10px;
    background-color: #f5f5f5;
    display: flex; /* Use flexbox layout */
    flex-direction: column; /* Arrange children in a column */
  }
  
  .chart-header {
    margin-bottom: 10px;
  }
  
  h2 {
    font-size: 1.5rem;
    margin: 0;
  }
  
  p {
    font-size: 1rem;
    margin: 0;
  }

  canvas {
  max-height: 400px; /* workaround to make it fixed height */
  }
  </style>
  