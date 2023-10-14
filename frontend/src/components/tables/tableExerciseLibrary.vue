<template>
  <os-table
    :columns="columns"
    :rows="rows"
    virtual-scroll
    table-style="max-height: 60vh"
    hide-pagination
    @row-click="$props.onExerciseUpdate"
    @sub-row-click="$props.onVariantUpdate"
    selection="single"
  ></os-table>
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
  onExerciseUpdate: {
    type: Function,
    required: false,
    default: () => {},
  },
  onVariantUpdate: {
    type: Function,
    required: false,
    default: () => {},
  },
  onExerciseDelete: {
    type: Function,
    required: false,
    default: () => {},
  },
  onVariantDelete: {
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
    label: "Exercise", // TODO i18n
    field: "exercise",
    align: "left",
    sortable: true,
  },
  {
    name: "variants",
    align: "left",
    label: "Variants", // TODO i18n
    field: "variants",
  },
  { name: "delete", align: "center", label: "", field: "delete" },
];

// Set table rows
const rows = computed(() => {
  return props.exercises.map((exercise) => ({
    uid: exercise.uid,
    exercise: exercise.name,
    name: exercise.name,
    variants: (exercise.variants?.length ?? 0).toString() + " variants", // TODO i18n
    update: {
      element: "button",
      on: { click: () => props.onExerciseUpdate(exercise) },
      icon: "edit",
      flat: true,
      round: true,
    },
    delete: {
      element: "button",
      on: { click: () => props.onExerciseDelete(exercise) },
      icon: "delete",
      flat: true,
      round: true,
      color: "dark-light",
    },
    expanded: exercise.variants?.map((variant) => ({
      icon: {
        element: "icon",
        name: "subdirectory_arrow_right",
        flat: true,
        round: true,
        color: "dark",
      },
      variant: variant.name,
      delete: {
        element: "button",
        on: { click: () => props.onVariantDelete(variant) },
        icon: "delete",
        flat: true,
        round: true,
        color: "light",
      },
    })),
  }));
});
</script>
