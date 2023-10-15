<template>
  <os-table
    :columns="columns"
    :rows="rows"
    virtual-scroll
    table-style="max-height: 60vh"
    hide-pagination
    selection="single"
  ></os-table>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
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
  },
});

// Set table columns
const columns = [
  {
    name: "name",
    required: true,
    label: "Name", // TODO i18n
    align: "left",
    field: "name",
    sortable: true,
  },
  {
    name: "athlete",
    align: "left",
    label: "Assigned to",
    field: "athlete",
  },
  {
    name: "note",
    align: "left",
    label: "Note", // TODO
    field: "note",
  },
  {
    name: "label",
    align: "left",
    label: "Label",
    field: "label",
  },
  { name: "update", align: "center", label: "", field: "update" },
];

// Set table rows
const rows = computed(() => {
  return props.programs.map((program) => ({
    name: program.name,
    athlete: "No one", // TODO program.ahtlete, and send to athlete page on click
    note: "", // TODO program.note
    label: {
      element: "chip",
      label: program.label?.toLocaleLowerCase(),
      color: "primary",
    },
    update: {
      element: "button",
      on: { click: () => props.onUpdate?.(program) },
      label: "Update",
      rounded: true,
      outline: true,
      color: "primary-button",
    },
  }));
});
</script>
