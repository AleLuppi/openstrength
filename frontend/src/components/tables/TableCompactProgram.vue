<template>
  <q-page>
    <div v-for="dayBlock in props.compactprogram?.days" :key="dayBlock.dayName">
      <q-table
        :rows="flattenedRows[dayBlock.dayName]"
        :columns="columns"
        :title="'Day ' + dayBlock.dayName"
        row-key="dayName"
        wrap-cells
        :pagination="{ rowsPerPage: 0 }"
        flat
        bordered
        hide-bottom
        separator="cell"
        dense
        class="my-sticky-column-table"
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
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, PropType } from "vue";
import type { QTableProps } from "quasar";
import { ProgramCompactView } from "@/helpers/programs/program";

// Define props
const props = defineProps({
  compactprogram: {
    type: Object as PropType<ProgramCompactView>,
    required: false,
  },
});

// Get day names
const programDays = ref<string[]>([]);
props.compactprogram?.days.forEach((day) => {
  programDays.value?.push(day.dayName);
});

// Sort the day names as numbers
programDays.value.sort((a, b) => {
  const numA = parseInt(a);
  const numB = parseInt(b);
  return numA - numB;
});

// Get week names
// Compute weekNames
const weekNames = computed(() => {
  const weeks: string[] = [];
  props.compactprogram?.days.forEach((day) => {
    day.exercises.forEach((exercise) => {
      exercise.weekSchemas.forEach((week: { weekName: string }) => {
        if (!weeks.includes(week.weekName)) {
          weeks.push(week.weekName);
        }
      });
    });
  });
  return weeks;
});

// Sort the week names as numbers
weekNames.value.sort((a, b) => {
  const numA = parseInt(a);
  const numB = parseInt(b);
  return numA - numB;
});

// Flatten the rows
const flattenedRows = ref<{ [key: string]: Array<{ [key: string]: string }> }>(
  {},
);
props.compactprogram?.days.forEach((day) => {
  const rows: Array<{ [key: string]: string }> = [];
  day.exercises.forEach((exercise) => {
    const row: { [key: string]: string } = {
      exerciseFullName: exercise.exerciseFullName,
      dayName: day.dayName,
    };
    weekNames.value.forEach((weekName) => {
      const weekSchema = exercise.weekSchemas.find(
        (week) => week.weekName === weekName,
      );
      row[weekName] = weekSchema ? weekSchema.schemas.join(", ") : "";
    });
    rows.push(row);
  });
  flattenedRows.value[day.dayName] = rows;
});

console.log("flattened rows", flattenedRows.value);

// Constructing the columns array dynamically
const columns: QTableProps["columns"] = [
  {
    name: "exerciseFullName",
    label: "Exercise",
    align: "left",
    field: (row) => row.exerciseFullName,
    style: "width: 30%",
    format: (val) => `${val}`,
  },
  ...weekNames.value.map((weekName) => ({
    name: weekName,
    label: "Week " + weekName,
    align: "left" as const,
    field: weekName,
    style: "width: 20%",
  })),
];
</script>

<style lang="sass">
.my-sticky-column-table

  thead tr:first-child th:first-child
    /* bg color is important for th; just specify one */
    background-color: $lighter

  td:first-child
    background-color: rgba($lighter, 1)

  th:first-child,
  td:first-child
    position: sticky
    left: 0
    z-index: 1
</style>
