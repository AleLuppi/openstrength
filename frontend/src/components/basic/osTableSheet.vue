<template>
  <q-table
    :columns="columns"
    :rows="rows"
    flat
    dense
    wrap-cells
    separator="cell"
    bordered
    :pagination="{ rowsPerPage: 0 }"
    :hide-header="!Boolean(props.headers)"
    :hide-bottom="true"
    row-key="row"
    @mouseup="onSelectionEnd"
    @mouseleave="onSelectionEnd"
    @copy.prevent="onCopy"
    @paste.prevent="onPaste"
  >
    <!-- Set header style -->
    <template v-slot:header="props">
      <q-tr :props="props" class="bg-table-header">
        <q-th
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
          class="text-h6 text-table-header text-uppercase text-weight-medium"
        >
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>

    <!-- Set custom rows -->
    <template v-slot:body="props">
      <q-tr
        v-if="dataRef"
        :props="props"
        @click="($attrs.onRowClick as Function)?.(undefined, props.row)"
        :class="{
          'cursor-pointer': $attrs.onRowClick || props.row.expanded,
        }"
        class="os-tr-selected"
      >
        <q-td
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
          :class="{
            'os-td-selected': isSelected(props.row.id, col.id),
          }"
          @click="
            if (getCellName(props.row.id, col.id) in childElements)
              childElements[getCellName(props.row.id, col.id)]?.focus();
          "
          @mousedown="onSelectionStart(props.row.id, col.id)"
          @mouseover="onSelectionContinue(props.row.id, col.id)"
        >
          {{ dataRef }}
          <q-input
            :ref="
              (el) => (childElements[getCellName(props.row.id, col.id)] = el)
            "
            v-model="dataRef[getCellName(props.row.id, col.id)]"
            borderless
            autogrow
          ></q-input>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, PropType } from "vue";

// Define props
const props = defineProps({
  modelValue: {
    type: Array as PropType<{ [key: string]: string }[]>,
    required: true,
  },
  headers: {
    type: Object as PropType<{ [key: string]: string }>,
    required: false,
  },
});

// Update model values to parent
const emit = defineEmits(["update:modelValue"]);

// Set ref
const childElements = ref<{ [key: string]: any }>({});
const dataRef = ref<{ [key: string]: any }>();
const selected = ref<{
  rowFrom: number;
  rowTo: number;
  colFrom: number;
  colTo: number;
}>();
const isSelecting = ref(false);

// Get headers map
const headers = computed(
  () =>
    props.headers ??
    props.modelValue.reduce(
      (outHeaders: { [key: string]: string }, row) => (
        Object.keys(row).forEach((col) => {
          if (!(col in outHeaders)) outHeaders[col] = col;
        }),
        outHeaders
      ),
      {},
    ),
);

// Set rows and columns
const columns = computed(() => {
  console.log(headers.value);
  return Object.values(headers.value).map((val, index) => ({
    id: getCellName(undefined, index),
    name: getCellName(undefined, index),
    field: getCellName(undefined, index),
    label: val,
  }));
});
const rows = computed(() =>
  props.modelValue.map((row, rowIndex) => ({
    id: getCellName(rowIndex),
    ...Object.fromEntries(
      Object.keys(headers.value).map((key, colIndex) => [
        getCellName(undefined, colIndex),
        key in row ? row[key] : "",
      ]),
    ),
  })),
);

// Update data when rows change
watch(rows, (newRows) => setDataRef(newRows));

// TODO Emit updated values
watch(dataRef, (val) => emit("update:modelValue", getDataRef(val)), {
  deep: true,
});

/**
 * Set new values in data ref.
 *
 * @param rows new data that shall be stored.
 */
function setDataRef(rows: { [key: string]: string }[]) {
  dataRef.value = rows.reduce(
    (result, row) =>
      Object.assign(
        result,
        Object.entries(row).reduce(
          (outRow: { [key: string]: string }, [key, value]) => (
            key.startsWith("row")
              ? null
              : (outRow[getCellName(row.id, key)] = value),
            outRow
          ),
          {},
        ),
      ),
    {},
  );
}

/**
 * Set table data from data ref.
 *
 * @param rows new data that shall be stored.
 * @returns a data list in original format.
 */
function getDataRef(data?: { [key: string]: any }) {
  // TODO
  return [data];
}

/**
 * Get the name of a cell based on its location in the grid.
 *
 * @param rowNum row number.
 * @param colNum column number.
 */
function getCellName(rowNum?: string | number, colNum?: string | number) {
  const nameList = [];
  if (rowNum !== undefined) nameList.push(rowNum);
  if (colNum !== undefined) nameList.push(colNum);
  return nameList.join(".");
}

/**
 * Start cells selection by selecting current cell only.
 *
 * @param rowNum row number of current cell that's being selected.
 * @param colNum column number of current cell that's being selected.
 */
function onSelectionStart(rowNum: string | number, colNum: string | number) {
  isSelecting.value = true;
  selected.value = {
    rowFrom: Number(rowNum),
    rowTo: Number(rowNum),
    colFrom: Number(colNum),
    colTo: Number(colNum),
  };
}

/**
 * Add current cell to the selection in rectangular format.
 *
 * @param rowNum row number of current cell that's being selected.
 * @param colNum column number of current cell that's being selected.
 */
function onSelectionContinue(rowNum: string | number, colNum: string | number) {
  if (isSelecting.value)
    if (selected.value) {
      selected.value.rowTo = Number(rowNum);
      selected.value.colTo = Number(colNum);
    } else onSelectionStart(rowNum, colNum);
}

/**
 * Stop cells selection.
 */
function onSelectionEnd() {
  isSelecting.value = false;
}

/**
 * Check if a cell is in selection.
 *
 * @param rowNum row number of cell to check.
 * @param colNum column number of cell to check.
 */
function isSelected(rowNum: string | number, colNum: string | number) {
  if (!selected.value) return false;
  const numRow = Number(rowNum),
    numCol = Number(colNum);
  return (
    numRow >= Math.min(selected.value.rowFrom, selected.value.rowTo) &&
    numRow <= Math.max(selected.value.rowFrom, selected.value.rowTo) &&
    numCol >= Math.min(selected.value.colFrom, selected.value.colTo) &&
    numCol <= Math.max(selected.value.colFrom, selected.value.colTo)
  );
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
  const colData = [];
  for (let row = rowStart; row <= rowEnd; row++) {
    colData.length = 0;
    for (let col = colStart; col <= colEnd; col++) {
      if (!dataRef.value) dataRef.value = {};
      colData.push(dataRef.value[getCellName(row, col)]);
    }
    rowData.push(colData.join("\t"));
  }

  // Copy text
  clipboardEvent.clipboardData?.setData("text/plain", rowData.join("\n"));
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
        const currentCell = getCellName(
          rowStart + rowIndex,
          colStart + colIndex,
        );
        if (dataRef.value && currentCell in dataRef.value)
          dataRef.value[currentCell] = colData;
      }),
    );
}

/**
 * Get a reference to input data.
 */
onMounted(() => {
  setDataRef(rows.value);
});
</script>

<style scoped lang="scss">
.os-tr-selected {
  & > .os-td-selected {
    background: rgba($primary, 0.1);
    border: 1px solid $primary;
  }
}
</style>
