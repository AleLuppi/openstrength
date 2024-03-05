<template>
  <div>
    <q-table
      v-for="day in dayNames"
      :key="day"
      :rows="rows[day]"
      :columns="columns"
      :title="'Day ' + day"
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
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { QTableProps } from "quasar";
import type { Program, ProgramCompactView } from "@/helpers/programs/program";
import { convertProgramToCompactView } from "@/helpers/programs/converters";
import {
  getProgramUniqueDays,
  getProgramUniqueWeeks,
} from "@/helpers/programs/linesManagement";

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

// Get sorted day names
const dayNames = computed<string[]>(() => {
  return getProgramUniqueDays(props.program);
});

// Build table columns dynamically
const columns = computed<QTableProps["columns"]>(() => [
  // TODO i18n, fix widths
  {
    name: "exercise",
    label: "Exercise",
    align: "left",
    field: "exercise",
    style: "width: 30%",
  },
  ...weekNames.value.map((weekName) => ({
    name: `week${weekName}`,
    label: "Week " + weekName,
    align: "left" as const,
    style: "width: 20%",
    field: `week${weekName}`,
  })),
]);

// Build table rows dinamically
const rows = computed<{
  [day: string]: { exercise: string; order: string; [week: string]: string }[];
}>(() => compactProgramToRows(compactProgram.value));

/**
 * Converts compact program to a flattened view.
 *
 * @param compactProgram compact program view.
 * @returns flattened view of the compact program.
 */
function compactProgramToRows(compactProgram: ProgramCompactView): {
  [day: string]: { exercise: string; order: string; [week: string]: string }[];
} {
  return compactProgram.reduce(
    (
      rows: {
        [day: string]: {
          exercise: string;
          order: string;
          [week: string]: string;
        }[];
      },
      dayInfo,
    ) => {
      // Add info to correct row/column pair
      if (!(dayInfo.day in rows)) rows[dayInfo.day] = [];
      dayInfo.exercises.forEach((compactExercise) => {
        let exerciseRow = rows[dayInfo.day].find(
          (row) => row.string == compactExercise.order,
        );
        if (!exerciseRow) {
          exerciseRow = {
            exercise: compactExercise.exercise,
            order: compactExercise.order,
          };
          rows[dayInfo.day].push(exerciseRow);
        }
        exerciseRow[`week${dayInfo.week}`] = compactExercise.schemas.join(", ");
      });

      return rows;
    },
    {},
  );
}
</script>
