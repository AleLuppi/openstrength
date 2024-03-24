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
    :hide-header="hideHeaders"
    :hide-bottom="true"
    row-key="row"
    @mouseup="onSelectionEnd"
    @mouseleave="onSelectionEnd"
    @copy.prevent="onCopy"
    @paste.prevent="onPaste"
    @keydown.delete="onSelectionDelete"
  >
    <!-- Set header style -->
    <template #header="props">
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
    <template #body="props">
      <q-tr
        :props="props"
        @click="
          (event: Event) =>
            ($attrs.onRowClick as Function)?.(event, props.row, props.rowIndex)
        "
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
            if (getCellName(props.row.id, col.id) in childElements) {
              if (types[props.rowIndex]?.[col.name] == typesAvailable.checkbox)
                childElements[getCellName(props.row.id, col.id)]?.toggle?.();
              childElements[getCellName(props.row.id, col.id)]?.focus?.();
            }
          "
          @mousedown="onSelectionStart(props.row.id, col.id)"
          @mouseover="onSelectionContinue(props.row.id, col.id)"
        >
          <q-checkbox
            v-if="types[props.rowIndex]?.[col.name] == typesAvailable.checkbox"
            v-bind="childProps[col.name]"
            :ref="
              (el) => (childElements[getCellName(props.row.id, col.id)] = el)
            "
            :model-value="props.row[col.name]"
            @update:model-value="
              (value) => onModelValueUpdate(props.rowIndex, col.name, value)
            "
            @focus="selectSingleCell(props.row.id, col.id)"
            dense
          ></q-checkbox>

          <q-input
            v-else
            :ref="
              (el) => (childElements[getCellName(props.row.id, col.id)] = el)
            "
            v-bind="childProps[col.name]"
            :model-value="props.row[col.name]"
            @update:model-value="
              (value) => onModelValueUpdate(props.rowIndex, col.name, value)
            "
            :placeholder="placeholders[col.name]"
            @focus="selectSingleCell(props.row.id, col.id)"
            borderless
            autogrow
            :debounce="debounce"
            :dense="dense"
            class="placeholder-light placeholder-hide-on-focus"
          >
          </q-input>

          <!-- Optional element provided by parent -->
          <slot
            name="item"
            v-bind="{
              row: props.row,
              rowIndex: props.rowIndex,
              col: col,
              value: props.row[col.name],
            }"
          ></slot>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { objectMapValues } from "@/helpers/object";
import type { QTableColumn } from "quasar";

// Define props
const props = withDefaults(
  defineProps<{
    modelValue: { [key: string]: any }[];
    headers?: string[] | { [key: string]: string };
    types?: string[] | { [key: string]: string };
    childProps?:
      | { [prop: string]: any }[]
      | { [key: string]: { [prop: string]: any } };
    widths?: string[] | { [key: string]: string };
    placeholders?: any[] | { [key: string]: any };
    showNewLine?: boolean | any[] | { [key: string]: any };
    deleteEmptyLine?: boolean;
    dense?: boolean;
    debounce?: string | number;
  }>(),
  {
    showNewLine: false,
    deleteEmptyLine: false,
    dense: false,
  },
);

// Update model values to parent
const emit = defineEmits<{
  "update:modelValue": [value: typeof props.modelValue];
}>();

// Set ref
const childElements = ref<{ [key: string]: any }>({});
const selected = ref<{
  rowFrom: number;
  rowTo: number;
  colFrom: number;
  colTo: number;
}>();
const isSelecting = ref(false);

// Set constants
const typesAvailable = {
  input: "input",
  checkbox: "checkbox",
};

// Set when to show headers
const hideHeaders = computed(
  () => !props.headers || props.headers instanceof Array,
);

// Get headers map
const headers = computed(() => {
  if (props.headers) {
    if (props.headers instanceof Array)
      return props.headers.reduce(
        (obj: { [key: string]: string }, val) => ({ ...obj, [val]: val }),
        {},
      );
    else return props.headers;
  }
  return props.modelValue.reduce(
    (outHeaders: { [key: string]: string }, row) => (
      Object.keys(row).forEach((col) => {
        if (!(col in outHeaders)) outHeaders[col] = col;
      }),
      outHeaders
    ),
    {},
  );
});

// Get type map
const types = computed(() => {
  if (props.types) {
    // Handle case of fixed types
    const propsTypes = props.types;
    return rows.value.map(() =>
      Object.keys(headers.value).reduce(
        (out: { [key: string]: string }, key, idx) => {
          out[key] =
            propsTypes instanceof Array ? propsTypes[idx] : propsTypes[key];
          if (!Object.values(typesAvailable).includes(out[key]))
            out[key] = typesAvailable.input;
          return out;
        },
        {},
      ),
    );
  } else {
    // Handle case with unknown type
    return rows.value.map((row) =>
      Object.entries(row).reduce(
        (out: { [key: string]: string }, [key, value]) => {
          switch (typeof value) {
            case "boolean":
              out[key] = typesAvailable.checkbox;
              break;
            case "string":
              out[key] = typesAvailable.input;
              break;
            default:
              out[key] = typesAvailable.input;
          }
          return out;
        },
        {},
      ),
    );
  }
});

// Get props map
const childProps = computed(() => {
  if (props.childProps) {
    // Handle case of provided props
    const propsChild = props.childProps;
    return objectMapValues(headers.value, (_, key, idx) =>
      propsChild instanceof Array ? propsChild[idx] : propsChild[key],
    );
  } else {
    // Handle case with unknown type
    return {};
  }
});

// Get widths map
const widths = computed(() => {
  if (props.widths) {
    // Handle case of fixed widths
    const propsWidths = props.widths;
    return objectMapValues(headers.value, (_, key, idx) =>
      propsWidths instanceof Array ? propsWidths[idx] : propsWidths[key],
    );
  } else {
    // Handle case with unknown type
    return objectMapValues(headers.value, () => "0%");
  }
});

// Get placeholders map
const placeholders = computed(() => {
  const propsPlaceholders = props.placeholders;
  return objectMapValues(headers.value, (_, key, idx) =>
    propsPlaceholders instanceof Array
      ? propsPlaceholders[idx]
      : propsPlaceholders?.[key],
  );
});

// Set rows and columns
const columns = computed<QTableColumn[]>(() =>
  Object.entries(headers.value).map(([key, val], index) => ({
    id: getCellName(undefined, index),
    name: key,
    field: key,
    label: val,
    align: "center",
    style: widths.value[key] ? "width: " + widths.value[key] : "",
  })),
);
const rows = computed(() =>
  [...props.modelValue, ...(props.showNewLine ? [newRow.value] : [])].map(
    (row, rowIndex) => ({
      id: getCellName(rowIndex),
      ...row,
    }),
  ),
);

// Set an empty new line
const newRow = computed(() =>
  columns.value.reduce(
    (out, col, idx) => ({
      ...out,
      [col.name]:
        props.showNewLine instanceof Array
          ? props.showNewLine[idx]
          : props.showNewLine instanceof Object
          ? props.showNewLine[col.name]
          : undefined,
    }),
    {},
  ),
);

/**
 * Update the value of a selected cell and emit the update.
 *
 * @param rowId row id from where update request is occurring.
 * @param colId column id from where update request is occurring.
 * @param newValue value that shall be inserted in selected cell.
 */
function onModelValueUpdate(
  rowId: number,
  colId: string,
  newValue: string | number | boolean | null,
) {
  // Get a copy of current data
  const outValue = props.modelValue;

  // Add a new line if necessary
  if (rowId == outValue.length && String(newValue).trim()) {
    outValue[rowId] = { ...newRow.value };
  }

  // Update with new value
  if (newValue != null && rowId < outValue.length) {
    outValue[rowId][colId] = newValue;

    // Remove trailing empty lines if necessary
    let checkLastLine = true;
    while (checkLastLine) {
      if (
        props.deleteEmptyLine &&
        outValue.length > 0 &&
        Object.keys(headers.value).every((key) => !outValue.at(-1)![key])
      )
        outValue.pop();
      else checkLastLine = false;
    }
    emit("update:modelValue", outValue);
  }
}

/**
 * Get the name of a cell based on its location in the grid.
 *
 * @param rowNum row number.
 * @param colNum column number.
 * @returns cell name.
 */
function getCellName(rowNum?: string | number, colNum?: string | number) {
  const nameList = [];
  if (rowNum !== undefined) nameList.push(rowNum);
  if (colNum !== undefined) nameList.push(colNum);
  return nameList.join(".");
}

/**
 * Get the header name according to column number.
 *
 * @param colNum column number whose header should be retrieved.
 * @returns header name.
 */
function getHeaderName(colNum: number) {
  return columns.value[colNum].name;
}

/**
 * Start cells selection by selecting current cell only.
 *
 * @param rowNum row number of current cell that's being selected.
 * @param colNum column number of current cell that's being selected.
 */
function onSelectionStart(rowNum: string | number, colNum: string | number) {
  isSelecting.value = true;
  selectSingleCell(rowNum, colNum);
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
 * Select a single cell by its location.
 *
 * @param rowNum row number of cell that must be selected.
 * @param colNum column number of cell that must be selected.
 */
function selectSingleCell(rowNum: string | number, colNum: string | number) {
  selected.value = {
    rowFrom: Number(rowNum),
    rowTo: Number(rowNum),
    colFrom: Number(colNum),
    colTo: Number(colNum),
  };
}

/**
 * Clear the selected cells.
 */
function onSelectionDelete() {
  // Ensure some data are selected
  if (!selected.value) return;

  // Get starting and ending values in order
  const rowStart = Math.min(selected.value?.rowFrom, selected.value?.rowTo),
    rowEnd = Math.max(selected.value?.rowFrom, selected.value?.rowTo),
    colStart = Math.min(selected.value?.colFrom, selected.value?.colTo),
    colEnd = Math.max(selected.value?.colFrom, selected.value?.colTo);

  // Ignore deletion if only one cell is selected
  if (rowStart == rowEnd && colStart == colEnd) return;

  // Clear values in cells
  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) {
      onModelValueUpdate(row, getHeaderName(col), "");
    }
  }
}

/**
 * Check if a cell is in selection.
 *
 * @param rowNum row number of cell to check.
 * @param colNum column number of cell to check.
 * @returns true if cell is selected, false otherwise.
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
      if (row < props.modelValue.length)
        colData.push(props.modelValue[row][getHeaderName(col)]);
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
        onModelValueUpdate(
          rowStart + rowIndex,
          getHeaderName(colStart + colIndex),
          colData,
        );
      }),
    );
}
</script>

<style scoped lang="scss">
.q-table--dense .q-table {
  & th,
  td {
    padding: 2px;
  }
}

.os-tr-selected {
  & > .os-td-selected {
    background: rgba($primary, 0.1);
    border: 1px solid $primary;
  }
}
</style>
