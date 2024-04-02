<template>
  <div class="q-pa-md">
    <table
      @mouseup="onSelectionEnd"
      @mouseleave="onSelectionEnd"
      class="prevent-select"
      :class="{ 'table-bordered': bordered }"
    >
      <component
        :is="tableIdx == 0 ? 'thead' : 'tbody'"
        v-for="(numRows, tableIdx) in [-numRowsHeader, numRowsBody]"
        :key="tableIdx"
      >
        <tr
          v-for="rowIdx in arrayRange(1, numRows + 1, { reversible: true })"
          :key="rowIdx"
        >
          <osTableSheetCellGod
            v-for="colIdx in arrayRange(-numColsHeader + 1, numColsBody + 1)"
            :key="colIdx"
            :config="getCellConfig(rowIdx, colIdx)"
            :type="tableIdx == 0 ? 'th' : 'td'"
            :model-value="getCellModelValue(rowIdx, colIdx)"
            :row="rowIdx"
            :col="colIdx"
            :use-chip="tableIdx == 0 || colIdx <= 0 ? useChipHeader : useChip"
            @mousedown="onSelectionStart(rowIdx, colIdx)"
            @mouseover="onSelectionContinue(rowIdx, colIdx)"
            :class="{
              'cell-selected': isSelected(rowIdx, colIdx) && selected,
            }"
          />
        </tr>
      </component>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import osTableSheetCellGod from "./osTableSheetCellGod.vue";
import { arrayRange } from "@/helpers/array";
import { TableSheetCell, TableSheetCellConfig } from "@/components/models";

// Define props
const props = withDefaults(
  defineProps<{
    // cells config
    config?: TableSheetCellConfig[];
    configHeaderRow?: TableSheetCellConfig;
    configHeaderCol?: TableSheetCellConfig;
    configBody?: TableSheetCellConfig;

    // whether to display table values inside chips
    useChip?: boolean | "single" | "multiple";
    useChipHeader?: boolean | "single" | "multiple";

    // whether to apply an outside border to the table
    bordered?: boolean;
  }>(),
  {
    config: () => [],
    configHeaderRow: () => ({}),
    configHeaderCol: () => ({}),
    useChip: false,
    useChipHeader: false,
  },
);

// FIXME delete eslint line
// eslint-disable-next-line
const modelValue = defineModel<TableSheetCell[]>({ required: true });

// FIXME delete eslint line
// eslint-disable-next-line
const selected = defineModel<{
  rowFrom: number;
  rowTo: number;
  colFrom: number;
  colTo: number;
}>("selected");

// Whether user is currently selecting some cells
const isSelecting = ref(false);

// Get number of rows and columns
const numRowsHeader = computed(
  () => Math.max(...modelValue.value.map((val) => -val.row), -1) + 1,
);
const numColsHeader = computed(
  () => Math.max(...modelValue.value.map((val) => -val.col), -1) + 1,
);
const numRowsBody = computed(() =>
  Math.max(...modelValue.value.map((val) => val.row), 0),
);
const numColsBody = computed(() =>
  Math.max(...modelValue.value.map((val) => val.col), 0),
);

/**
 * FIXME
 * @param row
 * @param col
 */
function getCellConfig(row: number, col: number): TableSheetCellConfig {
  // Assign a starting config for header or body
  const initialConfig: TableSheetCellConfig = {};
  if (col <= 0) Object.assign(initialConfig, props.configHeaderCol);
  if (row <= 0) Object.assign(initialConfig, props.configHeaderRow);
  if (col > 0 && row > 0)
    Object.assign(
      initialConfig,
      props.configBody ?? { class: "cell-default-style" },
    );

  // Apply selected configs
  const cellConfig = props.config.reduce((outConfig, currentConfig) => {
    if (
      row >= (currentConfig.rowFrom ?? row) &&
      row <= (currentConfig.rowTo ?? row) &&
      col >= (currentConfig.colFrom ?? col) &&
      col <= (currentConfig.colTo ?? col)
    )
      return {
        ...outConfig,
        ...currentConfig,
      };
    return outConfig;
  }, initialConfig);
  cellConfig.rowFrom =
    cellConfig.rowTo =
    cellConfig.colFrom =
    cellConfig.colTo =
      undefined;
  return cellConfig;
}

/**
 * FIXME
 * @param row
 * @param col
 */
function getCellModelValue(row: number, col: number) {
  let cellValue = modelValue.value.find(
    (val) => val.row == row && val.col == col,
  );
  if (!cellValue) {
    cellValue = { values: [], row: row, col: col };
    modelValue.value.push(cellValue);
  }
  return cellValue;
}

//eslint-disable-next-line
function rangeToString(
  fromRow: number,
  fromCol: number,
  toRow?: number,
  toCol?: number,
) {
  const row = toRow != undefined ? `${fromRow}:${toRow}` : fromRow.toString();
  const col = toCol != undefined ? `${fromCol}:${toCol}` : fromCol.toString();
  return `${row};${col}`;
}

/**
 * Start cells selection by selecting current cell only.
 *
 * @param rowNum row number of current cell that's being selected.
 * @param colNum column number of current cell that's being selected.
 */
function onSelectionStart(rowNum: number, colNum: number) {
  isSelecting.value = true;
  selectSingleCell(rowNum, colNum);
}

/**
 * Add current cell to the selection in rectangular format.
 *
 * @param rowNum row number of current cell that's being selected.
 * @param colNum column number of current cell that's being selected.
 */
function onSelectionContinue(rowNum: number, colNum: number) {
  if (isSelecting.value)
    if (selected.value) {
      selected.value = { ...selected.value, rowTo: rowNum, colTo: colNum };
      selected.value.rowTo = rowNum;
      selected.value.colTo = colNum;
    } else onSelectionStart(rowNum, colNum);
}

/**
 * Stop cells selection.
 */
function onSelectionEnd() {
  isSelecting.value = false;
}

/**
 * Select a single cell by its location.
 *
 * @param rowNum row number of cell that must be selected.
 * @param colNum column number of cell that must be selected.
 */
function selectSingleCell(rowNum: number, colNum: number) {
  selected.value = {
    rowFrom: rowNum,
    rowTo: rowNum,
    colFrom: colNum,
    colTo: colNum,
  };
}

/**
 * Check if a cell is in selection.
 *
 * @param rowNum row number of cell to check.
 * @param colNum column number of cell to check.
 * @returns true if cell is selected, false otherwise.
 */
function isSelected(rowNum: number, colNum: number) {
  if (!selected.value) return false;
  const numRow = rowNum,
    numCol = colNum;
  return (
    numRow >= Math.min(selected.value.rowFrom, selected.value.rowTo) &&
    numRow <= Math.max(selected.value.rowFrom, selected.value.rowTo) &&
    numCol >= Math.min(selected.value.colFrom, selected.value.colTo) &&
    numCol <= Math.max(selected.value.colFrom, selected.value.colTo)
  );
}

// TODO manage col and row span
</script>

<style scoped lang="scss">
table {
  border-collapse: collapse;
  width: 100%;
}

table.table-bordered,
table:deep(td.cell-default-style) {
  border: 1px solid $grey-4;
}

table .cell-selected,
table .cell-selected:hover {
  background-image: linear-gradient(rgba($primary, 0.03), rgba($primary, 0.03));
  outline: 1px solid $primary;
}
</style>
