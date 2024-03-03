<template>
  <div>
    <div v-for="dayBlock in compactProgram?.days" :key="dayBlock.dayName">
      <q-table
        v-if="flattenedRows?.[dayBlock.dayName]"
        :rows="flattenedRows[dayBlock.dayName]"
        :columns="columns"
        :title="'Day ' + dayBlock.dayName"
        row-key="exercise"
        wrap-cells
        :pagination="{ rowsPerPage: 0 }"
        flat
        bordered
        hide-bottom
        separator="cell"
        dense
        class="q-my-sm"
        table-header-class="bg-table-header"
      ></q-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { QTableProps } from "quasar";
import type { Program } from "@/helpers/programs/program";
import {
  convertCompactProgramToFlatView,
  convertProgramToCompactView,
} from "@/helpers/programs/converters";
import { getProgramUniqueWeeks } from "@/helpers/programs/linesManagement";

// Define props
const props = defineProps<{
  program: Program;
}>();

// Get compact version of program
const compactProgram = computed(() =>
  convertProgramToCompactView(props.program),
);

// Get sorted week names
const weekNames = computed<string[]>(() => {
  return getProgramUniqueWeeks(props.program);
});

// Build table columns dynamically
const columns = computed<QTableProps["columns"]>(() => [
  // TODO i18n, fix widths
  {
    name: "exercise",
    label: "Exercise",
    align: "left",
    field: "exerciseFullName",
    style: "width: 30%",
  },
  ...weekNames.value.map((weekName) => ({
    name: weekName,
    label: "Week " + weekName,
    align: "left" as const,
    style: "width: 20%",
    field: weekName,
  })),
]);

// Build table rows dinamically
const flattenedRows = computed(() => {
  return compactProgram.value
    ? convertCompactProgramToFlatView(compactProgram.value)
    : undefined;
});
</script>
