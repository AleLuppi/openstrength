<template>
  <div class="q-pa-md">
    <table
      class="prevent-select"
      :class="{ 'table-bordered': bordered }"
      @mouseup="onSelectionEnd"
      @mouseleave="onSelectionEnd"
    >
      <component
        :is="tableIdx == 0 ? 'thead' : 'tbody'"
        v-for="(numRows, tableIdx) in [-numRowsHeader, numRowsBody]"
        :key="tableIdx"
      >
        <tr
          v-for="rowIdx in arrayRange(
            1,
            numRows + 1 + (showEmptyLine && tableIdx ? 1 : 0),
            { reversible: true },
          )"
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
            :class="{
              'cell-selected': isSelected(rowIdx, colIdx) && selected,
            }"
            @update:model-value="updateCellModelValue"
            @mousedown="onSelectionStart(rowIdx, colIdx)"
            @mouseover="onSelectionContinue(rowIdx, colIdx)"
          >
            <template v-for="(_, slot) in $slots" #[slot]="scope">
              <slot :name="slot" v-bind="scope ?? {}"></slot>
            </template>
          </osTableSheetCellGod>
        </tr>
      </component>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
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
    configBody?: TableSheetCellConfig | undefined;

    // set table in read-only mode
    readonly?: boolean;

    // display an empty line at the end TODO
    showEmptyLine?: boolean;
    deleteEmptyLine?: boolean;
    emptyLineConfig?: TableSheetCellConfig | undefined; // TODO

    // model value debounce in ms
    debounce?: string | number;

    // whether to apply an outside border to the table
    bordered?: boolean;
  }>(),
  {
    config: () => [],
    configHeaderRow: () => ({}),
    configHeaderCol: () => ({}),
    configBody: undefined,
    readonly: false,
    showEmptyLine: false,
    deleteEmptyLine: true,
    emptyLineConfig: undefined,
    debounce: 25,
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
 * Get the config of a cell.
 *
 * The resulting config is a merge of header and body configs,
 * which can be overwritten by any custom cell configs.
 * Output config will be used to render the cell.
 *
 * @param row row number of cell.
 * @param col column number of cell.
 * @returns config object for the given cell.
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

  // Any cell is set to read-only mode if the table is read-only
  if (props.readonly) cellConfig.readonly = props.readonly;

  return cellConfig;
}

/**
 * Get the model value of a cell.
 *
 * If the cell does not exist in the model yet,
 * it will be created with the default values.
 *
 * @param row row number of the cell.
 * @param col column number of the cell.
 * @returns model value of the given cell.
 */
function getCellModelValue(row: number, col: number): TableSheetCell {
  let cellValue = modelValue.value.find(
    (val) => val.row == row && val.col == col,
  );
  if (!cellValue) {
    cellValue = { values: [], row: row, col: col };
    if (row <= numRowsBody.value && col <= numColsBody.value)
      modelValue.value.push(cellValue);
  }
  return cellValue;
}

/**
 * Update cell value.
 *
 * @param value new value to set.
 */
function updateCellModelValue(value: TableSheetCell) {
  const { row, col } = value;
  const cellValue = getCellModelValue(row, col);
  cellValue.values = value.values;
  let outNumRows = numRowsBody.value + 1;

  // Add new line if necessary
  if (row > numRowsBody.value && col <= numColsBody.value) {
    modelValue.value.push(cellValue);
    outNumRows -= 1;
  }

  // Remove trailing empty lines if necessary
  while (outNumRows > 0) {
    const lastRowCells = modelValue.value.filter(
      (val) => val.row == outNumRows,
    );

    // Check if line should be removed
    if (
      props.deleteEmptyLine &&
      lastRowCells.every(
        (cell) =>
          cell.values.length == 0 ||
          (cell.values.length == 1 && cell.values[0] == ""),
      )
    ) {
      modelValue.value = modelValue.value.filter(
        (val) => !lastRowCells.includes(val),
      );
      outNumRows -= 1;
    } else outNumRows = -1;
  }
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

/**
 * Clear the selected cells.
 */
function onSelectionDelete() {
  // Ensure some data are selected
  if (!selected.value) return;

  // Get starting and ending values in order
  const rowStart = Math.min(selected.value.rowFrom, selected.value.rowTo),
    rowEnd = Math.max(selected.value.rowFrom, selected.value.rowTo),
    colStart = Math.min(selected.value.colFrom, selected.value.colTo),
    colEnd = Math.max(selected.value.colFrom, selected.value.colTo);

  // Ignore deletion if only one cell is selected
  if (rowStart == rowEnd && colStart == colEnd) return;

  // Clear values in cells
  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) {
      updateCellModelValue({ row: row, col: col, values: [] });
    }
  }
}

/**
 * Override copy to save data to clipboard.
 *
 * @param clipboardEvent event that triggered copy.
 */
function onCopy(clipboardEvent: ClipboardEvent) {
  // Ensure some data are selected
  if (!selected.value) return;

  // Get starting and ending values in order
  const rowStart = Math.min(selected.value?.rowFrom, selected.value?.rowTo),
    rowEnd = Math.max(selected.value?.rowFrom, selected.value?.rowTo),
    colStart = Math.min(selected.value?.colFrom, selected.value?.colTo),
    colEnd = Math.max(selected.value?.colFrom, selected.value?.colTo);

  // Prepare text to copy
  const rowData = [];
  const colData: string[] = [];
  for (let row = rowStart; row <= rowEnd; row++) {
    colData.length = 0;
    for (let col = colStart; col <= colEnd; col++) {
      if (row <= numRowsBody.value)
        colData.push(getCellModelValue(row, col).values.join(";;"));
    }
    rowData.push(colData.join("\t"));
  }

  // Copy text
  clipboardEvent.clipboardData?.setData("text/plain", rowData.join("\n"));
  clipboardEvent.preventDefault();
}

/**
 * Override paste to get data from clipboard.
 *
 * @param clipboardEvent event that triggered paste.
 */
function onPaste(clipboardEvent: ClipboardEvent) {
  // Ensure one cell is selected
  if (!selected.value) return;

  // Get starting cell
  const rowStart = Math.min(selected.value?.rowFrom, selected.value?.rowTo),
    colStart = Math.min(selected.value?.colFrom, selected.value?.colTo);

  // Replace data in table with input
  clipboardEvent.clipboardData
    ?.getData("text/plain")
    .split(/\r?\n/)
    .forEach((rowData, rowIndex) =>
      rowData.split(/\t/).forEach((colData, colIndex) => {
        if (rowStart + rowIndex <= numRowsBody.value + 1)
          updateCellModelValue({
            row: rowStart + rowIndex,
            col: colStart + colIndex,
            values: colData.split(";;"),
          });
      }),
    );
}

// TODO manage col and row span

/**
 * Manage keydown events on table.
 *
 * @param event keydown event.
 */
function manageKeydown(event: KeyboardEvent) {
  if (!selected.value) return;

  // Check for delete key
  if (event.key == "Delete" || event.key == "Backspace") onSelectionDelete();
}

// Add useful listeners
onMounted(() => {
  document.addEventListener("keydown", manageKeydown);
  document.addEventListener("copy", onCopy);
  document.addEventListener("paste", onPaste);
});

// Remove listeners
onBeforeUnmount(() => {
  document.removeEventListener("keydown", manageKeydown);
  document.removeEventListener("copy", onCopy);
  document.removeEventListener("paste", onPaste);
});
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
