<template>
  <div class="home">
    <DoughnutChart :data="chartData" />
  </div>  
</template>


<script setup>
import { ref } from 'vue';
import DoughnutChart from '@/components/charts/DoughnutChartComponent.vue'; 

const chartData = ref({
  labels: ['Label 1', 'Label 2', 'Label 3'],
  datasets: [
    {
      data: [30, 50, 20],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    },
  ],
});
</script>
