<template>
  <div class="chart-container bg-grey-1">
    <div class="q-mb-md">
      <h2>{{ props.title }}</h2>
      <p>{{ props.description }}</p>
    </div>
    <div>
      <canvas ref="chartCanvas" :width="props.width" :height="props.height"></canvas>
    </div>
  </div>
</template>
  
<script>
import { ref, onMounted } from 'vue';
import { Chart, LinearScale, CategoryScale, PointElement, LineElement, LineController, Tooltip, Legend } from 'chart.js';

// Init plugins
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
    data: {
      type: Array,
      required: true,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    type: {
      type: String,
      default: "line", // e.g.: 'line', 'bar', 'pie'
    },
    width: {
      type: [Number, String],
      default: 400,
    },
    height: {
      type: [Number, String],
      default: 200,
    },
  },
  setup(props) {
    const chartCanvas = ref(null);
    /**
     * 
     */
    function renderChart() {
      const ctx = chartCanvas.value.getContext('2d');
      new Chart(ctx, {
        type: props.type,
        data: props.data,
        options: props.options,
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