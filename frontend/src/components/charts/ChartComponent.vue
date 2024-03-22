<template>
  <q-card>
    <q-card-section class="q-pa-xs">
      <div class="row items-center no-wrap">
        <h6 class="col text-margin-xs text-weight-medium text-grey">
          {{ props.title }}
        </h6>

        <div class="col-auto">
          <q-icon name="fas fa-circle-info" size="1.7rem" color="grey-5">
            <q-tooltip
              anchor="center left"
              self="center right"
              transition-show="fade"
              transition-hide="fade"
              class="bg-primary text-body2"
            >
              {{ props.description }}
            </q-tooltip>
          </q-icon>
        </div>
      </div>
    </q-card-section>

    <q-separator spaced="none" size="2px" />

    <q-card-section>
      <!-- Check if data is defined and not empty -->
      <div v-if="dataIsInvalid" class="text-h6 text-center">
        {{ $t('coach.charts_management.list.chart_data_refresh') }}
      </div>

      <!-- Render chart canvas only if data is valid -->
      <canvas v-else ref="chartCanvas"></canvas>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, shallowRef } from 'vue';
import { colors } from 'quasar';
import {
  Chart,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Tooltip,
  Legend,
  ChartData,
  ChartTypeRegistry,
} from 'chart.js';
import { ExerciseChartData } from 'src/helpers/charts/chartDataFormatter';

// Init plugins
Chart.register(
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Tooltip,
  Legend
);
const { getPaletteColor, lighten } = colors;

// Define props
const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    data?: ChartData<'line', ExerciseChartData[]>;
    options?: object;
    type?: 'line' | 'bar' | 'pie';
    autoUpdate?: boolean;
    width?: number | string;
    height?: number | string;
  }>(),
  {
    options: () => ({}),
    type: 'line',
    autoUpdate: true,
    width: 400,
    height: 200,
  }
);

// Define expose
defineExpose({
  update: renderChart,
});

// Define refs
const chartCanvas = ref<HTMLCanvasElement>();
const chart =
  shallowRef<Chart<keyof ChartTypeRegistry, ExerciseChartData[], unknown>>();

// Computed property to check if data is invalid
const dataIsInvalid = computed(() => {
  return (
    props.data === undefined ||
    props.data === null ||
    (Array.isArray(props.data) && props.data.length === 0)
  );
});

/**
 * Render the chart.
 */
function renderChart() {
  // Check if data is valid
  if (dataIsInvalid.value) {
    // TODO display error to user
    console.error('Invalid data.');
    return;
  }

  // Ensure canvas reference exists
  if (!chartCanvas.value) {
    // TODO display error to user
    console.error('Missing reference to canvas element.');
    return;
  }

  try {
    /* eslint-disable */
    if (chart.value) {
      chart.value.options = props.options;
      chart.value.data = props.data!;
      chart.value.update();
    } else {
      // Add background color to datasets
      props.data!.datasets.forEach((el, idx) => {
        let currColor = getPaletteColor('chart-color' + (idx + 1));
        el.borderColor = currColor;
        el.backgroundColor = lighten(currColor, 25);
      });

      // Fill canvas
      const ctx = chartCanvas.value.getContext('2d');
      chart.value = new Chart(ctx!, {
        type: props.type as keyof ChartTypeRegistry,
        data: props.data!,
        options: props.options,
      });
    }
  } catch (error) {
    console.error('Error rendering chart:', error);
  }
}

// Watch for changes in data and re-render the chart
watch(
  () => props.data,
  () => {
    if (props.autoUpdate) renderChart();
  },
  { deep: true }
);

// Render the chart on component mount
onMounted(() => {
  renderChart();
});
</script>

<style scoped lang="scss">
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
