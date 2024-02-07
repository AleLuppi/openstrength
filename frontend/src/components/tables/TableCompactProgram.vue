<template>
  <q-scroll-area style="height: calc(100vh - 64px - 48px - 21px)">
    <div v-for="dayBlock in props.compactprogram?.days" :key="dayBlock.dayName">
      <q-table
        v-if="flattenedRows"
        :rows="flattenedRows[dayBlock.dayName]"
        :columns="columns"
        :title="'Day ' + dayBlock.dayName"
        row-key="exerciseFullName"
        wrap-cells
        :pagination="{ rowsPerPage: 0 }"
        flat
        bordered
        hide-bottom
        separator="cell"
        dense
        class="q-mt-sm q-mb-sm my-sticky-column-table"
      >
        <!-- Set header style -->
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-table-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
      </q-table>
    </div>
  </q-scroll-area>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import type { QTableProps } from "quasar";
import { ProgramCompactView } from "@/helpers/programs/program";
import {
  convertCompactProgramToFlatView,
  getWeekNamesFromCompactProgram,
} from "@/helpers/programs/converters";

// Define props
const props = defineProps({
  compactprogram: {
    type: Object as () => ProgramCompactView,
    required: true,
  },
});

const flattenedRows = computed(() => {
  return props.compactprogram
    ? convertCompactProgramToFlatView(props.compactprogram)
    : undefined;
});

const weekNames = computed(() => {
  return props.compactprogram
    ? getWeekNamesFromCompactProgram(props.compactprogram)
    : [""];
});

// Constructing the columns array dynamically
const columns = computed(() => {
  const cols: QTableProps["columns"] = [
    {
      name: "exerciseFullName",
      label: "Exercise",
      align: "left",
      field: "exerciseFullName",
      style: "width: 30%",
      format: (val: string) => val,
    },
    ...weekNames.value.map((weekName) => ({
      name: weekName,
      label: "Week " + weekName,
      align: "left" as const,
      style: "width: 20%",
      field: weekName,
    })),
  ];
  return cols;
});
</script>

<style lang="sass">
.my-sticky-column-table
  thead tr:first-child th:first-child
    background-color: $lighter
  td:first-child
    background-color: rgba($lighter, 1)
  th:first-child,
  td:first-child
    position: sticky
    left: 0
    z-index: 1
</style>
