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
      <canvas ref="chartCanvas" :width="props.width" :height="props.height"></canvas>
    </q-card-section>
  </q-card>
</template>
  
<script setup>
import { ref, onMounted } from 'vue';
import { colors } from 'quasar'
import { Chart, LinearScale, CategoryScale, PointElement, LineElement, LineController, BarElement, BarController, Tooltip, Legend } from 'chart.js';

// Init plugins
Chart.register(LinearScale, CategoryScale, PointElement, LineElement, LineController, BarElement, BarController, Tooltip, Legend);
const { getPaletteColor, lighten } = colors

// Define props
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
  type: {
    type: String,
    default: "line",  // e.g.: 'line', 'bar', 'pie'
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

// Define refs
const chartCanvas = ref(null);

/**
 * 
 */
function renderChart() {
  // Ensure canvas reference exists
  if (!chartCanvas.value) {
    console.error('Missing reference to canvas element.');
    return
  }

  // Add background color to datasets
  props.data.datasets.forEach((el, idx) => {
    let currColor = getPaletteColor('chart-color' + (idx + 1));
    el.borderColor = currColor;
    el.backgroundColor = lighten(currColor, 25);
  });

  // Fill canvas
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
