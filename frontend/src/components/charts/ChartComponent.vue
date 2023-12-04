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
      <template v-if="dataIsInvalid">
        <div class="text-h6 text-center text-weight-bold text-negative">
          Check your data and try refreshing the chart
        </div>
      </template>
      <!-- Render chart canvas only if data is valid -->
      <template v-else>
        <canvas ref="chartCanvas"></canvas>
      </template>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { colors } from "quasar";
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
} from "chart.js";

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
  Legend,
);
const { getPaletteColor, lighten } = colors;

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
});

// Define refs
const chartCanvas = ref(null);

// Computed property to check if data is invalid
const dataIsInvalid = computed(() => {
  return (
    props.data === undefined ||
    props.data === null ||
    (Array.isArray(props.data) && props.data.length === 0)
  );
});

/**
 * Render the Chart
 */
function renderChart() {
  // Ensure canvas reference exists
  if (!chartCanvas.value) {
    console.error("Missing reference to canvas element.");
    return;
  }

  try {
    // Add background color to datasets
    props.data.datasets.forEach((el, idx) => {
      let currColor = getPaletteColor("chart-color" + (idx + 1));
      el.borderColor = currColor;
      el.backgroundColor = lighten(currColor, 25);
    });

    // Fill canvas
    const ctx = chartCanvas.value.getContext("2d");
    new Chart(ctx, {
      type: props.type,
      data: props.data,
      options: props.options,
    });
  } catch (error) {
    console.error("Error rendering chart:", error);
  }
}

// Watch for changes in data and re-render the chart
watch(() => props.data, renderChart, { deep: true });

// Render the chart on component mount
onMounted(() => {
  renderChart();
});
</script>

<style scoped lang="scss">
@import "@/styles/quasar.scss";

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
