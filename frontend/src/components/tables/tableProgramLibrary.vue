<template>
  <os-table
    :columns="columns"
    :rows="rows"
    virtual-scroll
    table-style="max-height: 50vh"
    hide-pagination
  ></os-table>
</template>

<script setup lang="ts">
import { PropType, computed } from "vue";
import { Program } from "@/helpers/programs/program";

// Define props
const props = defineProps({
  programs: {
    type: Array as PropType<Program[]>,
    required: true,
  },
  onUpdate: {
    type: Function,
    required: false,
    default: () => {},
  },
});

// Set table columns
const columns = [
  {
    name: "name",
    required: true,
    label: "Name",
    align: "left",
    field: (row: { name?: string }) => row.name,
    sortable: true,
  },
  {
    name: "label",
    align: "left",
    label: "Label",
    field: (row: { label?: string }) => row.label,
  },
  { name: "update", align: "center", label: "", field: "update" },
];

// Set table rows
const rows = computed(() => {
  return props.programs.map((program) => ({
    name: program.name,
    label: program.label,
    update: {
      element: "button",
      on: { click: () => props.onUpdate(program) },
      label: "Update",
      rounded: true,
    },
  }));
});
</script>
