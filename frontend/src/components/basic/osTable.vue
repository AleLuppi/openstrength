<template>
  <q-table
    v-bind="$attrs"
    flat
    wrap-cells
    separator="horizontal"
    :pagination="{ rowsPerPage: 0 }"
    :hide-pagination="
      Boolean($attrs.hidePagination) ||
      (($attrs.rows as any[]) ?? []).length < 10
    "
    :rows-per-page-options="[10, 25, 50, 100, 0]"
    :hide-selected-banner="true"
    row-key="name"
    v-model:selected="selected"
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
        :props="props"
        @click="
          ($attrs.onRowClick as Function)?.(undefined, props.row);
          if ($attrs.selection)
            onRowClick(undefined, props.row, $attrs.selection as string);
          props.expand = !props.expand;
        "
        :class="{
          'cursor-pointer': $attrs.onRowClick || props.row.expanded,
          'os-tr-selected': props.selected,
        }"
      >
        <q-td
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
          class="os-td-selected bg-table-element"
        >
          <osVariableElement :props="col.value" />
        </q-td>
      </q-tr>

      <q-tr
        v-show="props.expand"
        :props="props"
        v-for="row in props.row.expanded"
        :key="row"
        class="q-px-lg bg-table-element-selected-child"
        @click="($attrs.onSubRowClick as Function)?.(props.row, row)"
        :class="{ 'cursor-pointer': $attrs.onSubRowClick }"
      >
        <q-td v-for="(colvalue, colname) in row" :key="colname">
          <osVariableElement :props="colvalue" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Set ref
const selected = ref<{ [key: string]: any }[]>([]);

/**
 * Perform operations on clicked row.
 *
 * @param _ ignored event.
 * @param row row that has been clicked.
 */
function onRowClick(_: any, row: { [key: string]: any }, selection?: string) {
  if (selection == "multiple")
    if (selected.value.indexOf(row) == -1) {
      selected.value.push(row);
    } else {
      selected.value.splice(selected.value.indexOf(row), 1);
    }
  else if (selection) selected.value = [row];
}
</script>

<style scoped lang="scss">
.os-tr-selected {
  & > .os-td-selected {
    border-color: $primary;
    border-block-width: 2px;

    &:first-child {
      border-inline-start-width: 2px;
    }

    &:last-child {
      border-inline-end-width: 2px;
    }
  }
}
</style>
