<!-- <template>
    <div class="dashboard">
      <h1>This is a dashboard</h1>
    </div>
  </template>
  
  <script setup>
  </script>
   -->

   <template>
    <div class="dashboard">
      <chart-component
        title="Workout Volume"
        description="Volume of workouts over time"
        :data="chartData"
        :options="chartOptions"
        :width="400"
        :height="200"
      />
    </div>
  </template>
  
  <script>
  import ChartComponent from '@/components/ChartComponent.vue';
  
  export default {
    components: {
      ChartComponent,
    },
    data() {
      return {
        chartData: {
          labels: ['2023-07-01', '2023-07-02', '2023-07-03', '2023-07-04', '2023-07-05'],
          datasets: [
            {
              label: 'Workout Volume',
              data: [2500, 2200, 2800, 2600, 2400],
              borderColor: 'rgba(0, 123, 255, 1)',
              backgroundColor: 'rgba(0, 123, 255, 0.2)',
              fill: true,
            },
          ],
        },
        chartOptions: {
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
        },
      };
    },
  };
  </script>
  