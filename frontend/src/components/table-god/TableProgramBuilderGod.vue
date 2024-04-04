<template>
  <osTableSheetGod
    v-model="tableValue"
    use-chip
    class="os-table-sheet"
    :config-header-row="headerRowConfig"
    :config-header-col="headerColConfig"
    :config="tableConfig"
  >
  </osTableSheetGod>
</template>

<script setup lang="ts">
import { ref } from "vue";
import osTableSheetGod from "@/components/table-god/osTableSheetGod.vue";
import { TableSheetCell, TableSheetCellConfig } from "@/components/models";

const tableValue = ref<TableSheetCell[]>([
  {
    col: 1,
    row: 0,
    values: ["Week 1"],
  },
  {
    col: 2,
    row: 0,
    values: ["Week 2"],
  },
  {
    col: 3,
    row: 0,
    values: ["Week 3"],
  },
  {
    col: 4,
    row: 0,
    values: ["Week 4"],
  },
  {
    col: 0,
    row: 1,
    values: ["Squat - culetto"],
  },
  {
    col: 0,
    row: 2,
    values: ["Squat - super"],
  },
  {
    col: 2,
    row: 6,
    values: ["Testo"],
  },
]);

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
  },
];
</script>

<style scoped lang="scss">
.os-table-sheet:deep(.table-row-header) {
  border-radius: 20px 20px 0 0;
  padding-inline: 20px;
  outline: solid 1px $primary;
  background: rgba($primary, 0.3);

  &:first-child {
    visibility: hidden;
  }
}

.os-table-sheet:deep(.table-col-header) {
  padding-inline: 20px;
  outline: solid 1px $os-grey-cold-4;
  background: $os-grey-cold-2;
}

.os-table-sheet:deep(tr) {
  &:first-child td.table-col-header {
    border-top-left-radius: 14px;
  }
  &:last-child td.table-col-header {
    border-bottom-left-radius: 14px;
  }
}
</style>
