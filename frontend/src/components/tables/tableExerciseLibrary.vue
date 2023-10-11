<template>
  <os-table
    :columns="columns"
    :rows="rows"
    virtual-scroll
    table-style="max-height: 60vh"
    hide-pagination
    @row-click="$props.onUpdate"
    :selection="isVariant ? 'none' : 'single'"
  ></os-table>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";

// Define props
const props = defineProps({
  exercises: {
    type: Array as PropType<Exercise[]>,
    required: true,
  },
  variants: {
    type: Array as PropType<ExerciseVariant[]>,
  },
  onAdd: {
    type: Function,
    required: false,
  },
  onUpdate: {
    type: Function,
    required: false,
  },
  onDelete: {
    type: Function,
    required: false,
  },
  addNew: {
    type: Boolean,
    default: false,
  },
});

// Check if exercise or variant
const isVariant = computed(() => Boolean(props.variants));

// Set table columns
const columns = computed(() =>
  isVariant.value
    ? [
        // Variant case
        {
          name: "variant",
          align: "left",
          label: "Variant", // TODO i18n
          field: "name",
        },
        { name: "delete", align: "center", label: "", field: "delete" },
      ]
    : [
        // Exercise case
        {
          name: "exercise",
          required: true,
          label: "Exercise", // TODO i18n
          field: "name",
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
      ],
);

// Set table rows
const rows = computed(() => {
  // Prepare exercise list
  let listToMap: Exercise[] | ExerciseVariant[] = [];
  if (isVariant.value) {
    const variants = [...props.variants!];
    if (props.addNew) variants.unshift(new ExerciseVariant());
    listToMap = variants;
  } else {
    const exercises = [...props.exercises];
    if (props.addNew) exercises.unshift(new Exercise());
    listToMap = exercises;
  }

  return listToMap.map((item) => ({
    uid: item.uid ?? "",
    name: isVariant.value
      ? [(item as ExerciseVariant).exercise?.name, item.name].join("  ")
      : item.name ?? {
          element: "input",
          hideBottomSpace: true,
          focus: true,
          clearOnBlur: true,
          on: {
            blur: (value: string) => props.onAdd?.(value),
          },
        },
    variants:
      item.name && item instanceof Exercise
        ? (item.variants?.length ?? 0).toString() + " variants"
        : "", // TODO i18n
    update: {
      element: "button",
      on: { click: () => props.onUpdate?.(item) },
      icon: "edit",
      flat: true,
      round: true,
    },
    delete: {
      element: "button",
      on: { click: () => props.onDelete?.(item) },
      icon: "delete",
      flat: true,
      round: true,
    },
  }));
});
</script>
