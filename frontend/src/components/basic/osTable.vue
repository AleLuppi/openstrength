<template>
  <q-table
    v-bind="$attrs"
    v-model:selected="selected"
    flat
    wrap-cells
    separator="horizontal"
    :pagination="{
      rowsPerPage: 0,
      ...sortInfo,
    }"
    :hide-pagination="
      Boolean($attrs.hidePagination) ||
      (($attrs.rows as any[]) ?? []).length < 10
    "
    :rows-per-page-options="[10, 25, 50, 100, 0]"
    :hide-selected-banner="true"
    row-key="name"
    binary-state-sort
    class="os-table-sticky-header"
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
        class="bg-table-row"
        :class="{
          'cursor-pointer': $attrs.onRowClick || props.row.expanded,
          'bg-table-row-selected': props.selected,
          'os-tr-selected': props.selected,
        }"
        @click="
          (event: Event) => {
            ($attrs.onRowClick as Function)?.(event, props.row);
            if ($attrs.selection && $attrs.selection != 'none')
              onRowClick(undefined, props.row, $attrs.selection as string);
            props.expand = !props.expand;
          }
        "
      >
        <q-td
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
          class="os-td-selected"
        >
          <osVariableElement :props="col.value" />
        </q-td>
      </q-tr>

      <q-tr
        v-for="row in props.row.expanded"
        v-show="props.expand"
        :key="row"
        :props="props"
        class="q-px-lg bg-lighter table-element-selected-child"
        :class="{ 'cursor-pointer': $attrs.onSubRowClick }"
        @click="($attrs.onSubRowClick as Function)?.(props.row, row)"
      >
        <q-td v-for="(colvalue, colname) in row" :key="colname">
          <osVariableElement :props="colvalue" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

// Define props
const props = defineProps<{
  sortBy?: string;
}>();

// Set ref
const selected = ref<{ [key: string]: any }[]>([]);

// Allow selected model from parent
const emit = defineEmits(["update:selected"]);
watch(selected, (val) => {
  emit("update:selected", val);
});

// Get optional sorting
const sortInfo = computed(() => {
  if (!props.sortBy) return {};
  if (props.sortBy.startsWith("-"))
    return { sortBy: props.sortBy.slice(1), descending: true };
  else return { sortBy: props.sortBy, descending: false };
});

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
.os-table-sticky-header {
  /* Make header sticky */
  thead tr {
    height: 48px;

    & th {
      position: sticky;
      z-index: 1;
    }

    &:first-child th {
      top: 0;
    }
  }

  /* Handle loading indicator appearance */
  &.q-table--loading thead tr:last-child th {
    /* height of all previous header rows */
    top: 48px;
  }

  /* Prevent scrolling behind sticky top row on focus */
  tbody {
    /* height of all previous header rows */
    scroll-margin-top: 48px;
  }
}

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
