<template>
  <div v-for="(day, idx) in Object.keys(tableValue)" :key="day">
    <h6
      class="q-px-md"
      :class="{ 'q-pt-md': idx > 0 }"
      style="font-size: x-large"
    >
      Day {{ day }}
    </h6>
    <osTableSheetGod
      v-model="tableValue[day]"
      use-chip
      class="os-table-sheet"
      :config-header-row="headerRowConfig"
      :config-header-col="headerColConfig"
      :config="tableConfig"
      show-empty-line
      :readonly="readonly"
    >
    </osTableSheetGod>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import osTableSheetGod from "@/components/table-god/osTableSheetGod.vue";
import { TableSheetCell, TableSheetCellConfig } from "@/components/models";
import { Program, ProgramExercise } from "@/helpers/programs/program";
import {
  getProgramUniqueDays,
  getProgramUniqueWeeks,
} from "src/helpers/programs/linesManagement";
import { arraySort, arraySortObjectsByField } from "src/helpers/array";
import { convertLineToSchema } from "src/helpers/programs/converters";

// Define props
const props = withDefaults(
  defineProps<{
    // show only a selected subset of the program
    filter?: {
      week: string[];
      day: string[];
      exercise: string[];
    };

    // whether table should be in readonly mode
    readonly?: boolean;

    // whether to share columns across multiple tables
    shareColumns?: boolean; // FIXME
  }>(),
  {
    filter: () => ({ week: [], day: [], exercise: [] }),
    readonly: false,
    shareColumns: true,
  },
);

// Define models
const modelValue = defineModel<Program>({ required: true });

// Get the program tables for each day
const tableValue = computed<{ [key: string]: TableSheetCell[] }>(() => {
  // TODO use flexible keys (headers)

  const outTable: { [key: string]: TableSheetCell[] } = {};
  const outRowsKeys: { [key: string]: string[] } = {};

  /**
   * Get a single row unique key.
   *
   * @param programExercise exercise from which key shall be extracted.
   */
  const extractRowKey = (programExercise: ProgramExercise) =>
    (programExercise.exercise?.name ?? "") +
    (programExercise.exerciseVariant?.name
      ? ` - ${programExercise.exerciseVariant.name}`
      : "");

  // Extract all keys to program
  const allKeysSplit = arraySort(
    getProgramUniqueDays(modelValue.value).filter(
      (day) => props.filter.day.length == 0 || props.filter.day.includes(day),
    ),
    false,
    (day) => day.padStart(5, "0"),
  );
  const allColumnKeys = arraySort(
    getProgramUniqueWeeks(modelValue.value).filter(
      (week) =>
        props.filter.week.length == 0 || props.filter.week.includes(week),
    ),
    false,
    (week) => week.padStart(5, "0"),
  );

  // Prepare values
  const tmpRowsIdx: { [key: string]: { [key: string]: number } } = {};
  arraySortObjectsByField(
    modelValue.value.programExercises ?? [],
    "scheduleOrder",
    false,
    Number,
  ).forEach((programExercise) => {
    // Get separation keys // TODO make split selectable
    const splitKey = programExercise.scheduleDay?.toString() ?? "?";
    const colKey = programExercise.scheduleWeek?.toString() ?? "";
    const rowKey = extractRowKey(programExercise);

    // Skip if not in filter
    if (
      !allKeysSplit.includes(splitKey) ||
      !allColumnKeys.includes(colKey) ||
      (props.filter.exercise.length > 0 &&
        !props.filter.exercise.includes(programExercise.exercise?.name ?? ""))
    ) {
      console.log("skip", splitKey, colKey, rowKey);
      return;
    }

    // Check split key in output table
    if (!(splitKey in outTable)) outTable[splitKey] = [];

    // Get current row index where element should be inserted
    if (!(splitKey in tmpRowsIdx)) tmpRowsIdx[splitKey] = {};
    if (!(colKey in tmpRowsIdx[splitKey])) tmpRowsIdx[splitKey][colKey] = 0;
    if (!(splitKey in outRowsKeys)) outRowsKeys[splitKey] = [];
    let currRowIdx = outRowsKeys[splitKey]
      .slice(tmpRowsIdx[splitKey][colKey])
      .indexOf(rowKey);
    if (currRowIdx == -1) {
      outRowsKeys[splitKey].push(rowKey);
      currRowIdx = outRowsKeys[splitKey].length - 1;
    }
    tmpRowsIdx[splitKey][colKey] = currRowIdx + 1;

    outTable[splitKey].push({
      col: allColumnKeys.indexOf(colKey) + 1,
      row: currRowIdx + 1,
      values: programExercise.textOnly
        ? [programExercise.exerciseNote ?? ""]
        : programExercise.lines?.map((line) => convertLineToSchema(line)) ?? [],
      meta: programExercise,
    });
  });

  // Add headers
  allKeysSplit
    .filter((key) => key in outTable)
    .forEach((day) => {
      if (!(day in outTable)) outTable[day] = [];

      // On columns
      outTable[day].push(
        ...allColumnKeys.map((col, colIdx) => ({
          col: colIdx + 1,
          row: 0,
          values: [`Week ${col}`],
        })),
      );

      // On rows
      outTable[day].push(
        ...outRowsKeys[day].map((row, rowIdx) => ({
          col: 0,
          row: rowIdx + 1,
          values: [row],
        })),
      );
    });

  return outTable;
});

// Header config
const headerRowConfig: TableSheetCellConfig = {
  class: "table-row-header",
};
const headerColConfig: TableSheetCellConfig = {
  class: "table-col-header",
};

// Table config
const tableConfig: TableSheetCellConfig[] = [
  {
    rowFrom: 1,
    colFrom: 1,
    useChip: true,
    editInline: false,
    editSlot: "program-line",
    booleanIcon: ["check", "clear"],
    booleanIconUnchecked: ["check", "clear"],
    placeholder: "",
  },
];
</script>

<style scoped lang="scss">
.os-table-sheet:deep(.table-row-header) {
  border-radius: 8px 8px 0 0;
  padding-inline: 20px; 
  outline: solid 1px $light;
  background: rgba($lighter, 1);
  
  color: rgba($secondary, 1);
  &:first-child {
    visibility: hidden;
  }
}

.os-table-sheet:deep(.table-col-header) {
  padding-inline: 20px;
  outline: solid 1px $light;
  background: $lighter;
  color: rgba($secondary, 1);
  font-weight: bold;
}

.os-table-sheet:deep(tr) {
  &:first-child td.table-col-header {
    border-top-left-radius: 8px;
  }
  &:last-child td.table-col-header {
    border-bottom-left-radius: 8px;
  }
}
</style>
