<template>
  <os-table :columns="columns" :rows="rows"></os-table>
</template>

<script setup lang="ts">
import { PropType, computed } from "vue";
import { Exercise } from "@/helpers/exercises/exercise";

// Define props
const props = defineProps({
  exercises: {
    type: Array as PropType<Exercise[]>,
    required: true,
  },
  onUpdate: {
    type: Function,
    required: false,
    default: () => {},
  },
  onDelete: {
    type: Function,
    required: false,
    default: () => {},
  },
});

// Set table columns
const columns = [
  {
    name: "exercise",
    required: true,
    label: "Exercise", // TODO
    align: "left",
    sortable: true,
  },
  {
    name: "variants",
    align: "left",
    label: "# variants", // TODO
    field: "variants",
  },
  {
    name: "update",
    align: "center",
    label: "",
    field: "update",
  },
  { name: "delete", align: "center", label: "", field: "delete" },
];

// Set table rows
const rows = computed(() => {
  return props.exercises.map((exercise) => ({
    exercise: "Prova", // TODO
    variants: 50, // TODO,
    update: {
      element: "button",
      on: { click: () => props.onUpdate(exercise) },
      icon: "edit",
      flat: true,
      round: true,
    },
    delete: {
      element: "button",
      on: { click: () => props.onDelete(exercise) },
      icon: "delete",
      flat: true,
      round: true,
    },
  }));
});
</script>
