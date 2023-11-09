<template>
  <os-table
    :columns="columns"
    :rows="rows"
    virtual-scroll
    hide-pagination
    class="os-table-max-height"
    @row-click="$props.onUpdate"
    :selection="isVariant ? 'none' : 'single'"
    v-model:selected="selected"
  ></os-table>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from "vue";
import { useI18n } from "vue-i18n";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";

// Init plugin
const i18n = useI18n();

// Allow row selection from parent
const selected = ref<{ [key: string]: any }[]>();
function selectRowByName(name: string, clearOnFail: boolean = false) {
  const row = rows.value.find((row) => Boolean(name) && row.name == name);
  if (row) selected.value = [row];
  else if (clearOnFail) selected.value = [];
}
defineExpose({
  selectRowByName: selectRowByName,
});

// Define props
const props = defineProps({
  exercises: {
    type: Array as PropType<Exercise[]>,
    required: true,
  },
  variants: {
    type: Array as PropType<ExerciseVariant[]>,
    required: false,
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
          field: "displayName",
          sortable: true,
        },
        { name: "delete", align: "center", label: "", field: "delete" },
      ]
    : [
        // Exercise case
        {
          name: "exercise",
          required: true,
          label: "Exercise", // TODO i18n
          field: "displayName",
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
    listToMap = variants;
  } else {
    const exercises = [...props.exercises];
    if (props.addNew) exercises.unshift(new Exercise());
    listToMap = exercises;
  }

  // Move from list to row object
  return listToMap.map((item) => ({
    uid: item.uid ?? "",
    name: item.name,
    displayName: isVariant.value
      ? [
          (item as ExerciseVariant).exercise?.name,
          (item as ExerciseVariant).isDefault
            ? i18n.t("coach.exercise_management.default_variant")
            : item.name,
        ].join("  ")
      : item.name ?? {
          element: "input",
          hideBottomSpace: true,
          autofocus: true,
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
      color: "button-negative",
    },
  }));
});
</script>

<style scoped lang="scss">
.os-table-max-height {
  max-height: calc(100vh - 120px - 140px);
}
</style>
