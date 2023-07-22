<template>
  <div class="dashboard">
    <chart-component title="Workout Volume" description="Volume of workouts over time computed as Rep x Set x Load"
      :data="chartData" :options="chartOptions" :width="400" :height="300" />
    <chart-component title="Volume alzate principali" description="Just another graph to test multiple components"
      :data="chartData2" :options="chartOptions2" :width="400" :height="300" />
    <chart-component title="1RM alzate principali" description="Just another graph to test multiple components"
      :data="chartData1RM" :options="chartOptions1RM" :width="400" :height="300" />
  </div>
</template>

<script setup>
import ChartComponent from '@/components/charts/ChartComponent.vue';

const chartData = {
  datasets: [
    {
      label: 'Giorno A',
      data: [2500, 2300, 2800, 2600, 2400, 2600, 2400, 2600, 2400],
      borderColor: 'rgba(0, 123, 255, 1)',
      backgroundColor: 'rgba(0, 123, 255, 0.2)',
      fill: false,
      cubicInterpolationMode: 'monotone',
      tension: 0.1,
    },
    {
      label: 'Giorno B',
      data: [2000, 1900, 1800, 1600, 1400, 1600, 1400, 1600, 1400],
      borderColor: 'red',
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      fill: false,
      cubicInterpolationMode: 'monotone',
      tension: 0.1,
    },
    {
      label: 'Giorno C',
      data: [2200, 2300, 2600, 2600, 2400, 1900, 1800, 1700, 1800],
      borderColor: 'green',
      backgroundColor: 'rgba(0, 0, 255, 0.2)',
      fill: false,
      cubicInterpolationMode: 'monotone',
      tension: 0.1,
    },
  ],
  labels: ['2023-07-01', '2023-07-04', '2023-07-07', '2023-07-10', '2023-07-13', '2023-07-16', '2023-07-17', '2023-07-22', '2023-07-25'],
}
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Date',
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Volume',
      },
    },
  },
}
const chartData2 = {
  datasets: [
    {
      label: 'Squat',
      data: [200, 600, 1000, 1600, 2000, 2300, 1600, 1000, 600],
      borderColor: 'rgba(0, 123, 255, 1)',
      backgroundColor: 'rgba(0, 123, 255, 0.2)',
      fill: false,
      cubicInterpolationMode: 'monotone',
      tension: 0.1,
    },
    {
      label: 'Panca',
      data: [1600, 1400, 1300, 1000, 1400, 1600, 1900, 2000, 2400],
      borderColor: 'red',
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      fill: false,
      cubicInterpolationMode: 'monotone',
      tension: 0.1,
    },
    {
      label: 'Stacco',
      data: [1500, 1600, 2000, 1000, 500, 800, 1800, 2000, 2500],
      borderColor: 'green',
      backgroundColor: 'rgba(0, 0, 255, 0.2)',
      fill: false,
      cubicInterpolationMode: 'monotone',
      tension: 0.1,
    },
  ],
  labels: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre'],
}
const chartOptions2 = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Mese',
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Volume',
      },
    },
  },
}
const chartData1RM = {
  datasets: [
    {
      label: 'Squat',
      data: [180, 185, 192.5, 200, 205, 215],
      borderColor: 'rgba(0, 123, 255, 1)',
      backgroundColor: 'rgba(0, 123, 255, 0.2)',
      fill: false,
      cubicInterpolationMode: 'monotone',
      tension: 0.1,
    },
    {
      label: 'Panca',
      data: [105, 107.5, 112.5, 120, 120, 122.5],
      borderColor: 'red',
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      fill: false,
      cubicInterpolationMode: 'monotone',
      tension: 0.1,
    },
    {
      label: 'Stacco',
      data: [190, 205, 210, 210, 215, 220],
      borderColor: 'green',
      backgroundColor: 'rgba(0, 0, 255, 0.2)',
      fill: false,
      cubicInterpolationMode: 'monotone',
      tension: 0.1,
    },
  ],
  labels: ['Gennaio', 'Marzo', 'Maggio', 'Luglio', 'Settembre', 'Dicembre'],
}
const chartOptions1RM = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Mese',
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: '1RM [kg]',
      },
    },
  },
}
</script>
