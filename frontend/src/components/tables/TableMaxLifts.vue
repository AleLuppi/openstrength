<template>
  <os-table
    :columns="$q.screen.lt.sm ? columnsMobile : columns"
    :rows="rows"
    row-key="rowId"
    virtual-scroll
    class="os-table-max-height"
    hide-pagination
    selection="single"
  ></os-table>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { MaxLift } from "@/helpers/maxlifts/maxlift";
import { useI18n } from "vue-i18n";

const i18n = useI18n();

// Define props
const props = defineProps({
  maxlifts: {
    type: Array as PropType<MaxLift[]>,
    required: true,
  },
});

// Define emits
const emit = defineEmits<{
  update: [maxlift: MaxLift];
}>();

// Set table columns
const columns = [
  {
    name: "exercise",
    required: true,
    label: "Exercise", // TODO i18n
    align: "left",
    field: "exercise",
    sortable: true,
  },
  {
    name: "type",
    align: "left",
    label: "Type", // TODO i18n
    field: "type",
  },
  {
    name: "value",
    align: "left",
    label: "Value", // TODO i18n
    field: "value",
  },
  {
    name: "date",
    align: "left",
    label: "Date", // TODO i18n
    field: "date",
  },
  {
    name: "update",
    align: "center",
    label: "",
    field: "update",
  },
];
const columnsMobile = [
  {
    name: "exercise",
    required: true,
    label: "Exercise", // TODO i18n
    align: "left",
    field: "exercise",
    sortable: true,
  },
  {
    name: "type",
    align: "left",
    label: "Type", // TODO i18n
    field: "type",
  },
  {
    name: "update",
    align: "center",
    label: "",
    field: "update",
  },
];

// Set table rows
const rows = computed(() => {
  return props.maxlifts.map((maxlift) => ({
    exercise: maxlift.exercise?.name ?? "",
    type: maxlift.type ?? "",
    value: maxlift.value ?? "",
    date: maxlift.performedOn ? i18n.d(maxlift.performedOn) : "",
    update: {
      element: "button",
      on: { click: () => emit("update", maxlift) },
      label: "",
      icon: "update",
      rounded: true,
      outline: true,
      color: "button-primary",
    },
    rowId: maxlift.uid,
  }));
});
</script>

<style scoped lang="scss">
.os-table-max-height {
  max-height: calc(100vh - 128px);
}
</style>
