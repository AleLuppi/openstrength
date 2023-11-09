<template>
  <os-table
    :columns="columns"
    :rows="rows"
    virtual-scroll
    class="os-sticky-header os-maxlifts-max-height-override"
    hide-pagination
    selection="single"
  ></os-table>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { MaxLift } from "@/helpers/maxlifts/maxlift";

// Define props
const props = defineProps({
  maxlifts: {
    type: Array as PropType<MaxLift[]>,
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

// Set table rows
const rows = computed(() => {
  return props.maxlifts.map((maxlift) => ({
    exercise: maxlift.exercise,
    type: maxlift.type,
    value: maxlift.value,
    date: maxlift.lastUpdated,
    update: {
      element: "button",
      on: { click: () => props.onUpdate?.(maxlift) },
      label: "",
      icon: "update",
      rounded: true,
      outline: true,
      color: "button-primary",
    },
  }));
});
</script>
