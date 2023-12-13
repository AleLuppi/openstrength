<template>
  <os-table
    :columns="columns"
    :rows="rows"
    row-key="rowId"
    virtual-scroll
    hide-pagination
    class="os-table-max-height"
    selection="single"
  ></os-table>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { Program } from "@/helpers/programs/program";
import { useI18n } from "vue-i18n";

const i18n = useI18n();

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
    label: i18n.t("common.name"),
    align: "left",
    field: "name",
    sortable: true,
  },
  {
    name: "athlete",
    align: "left",
    label: i18n.t("coach.ahlete_management.fields.program_assigned_to"),
    field: "athlete",
  },
  {
    name: "note",
    align: "left",
    label: i18n.t("common.note"),
    field: "note",
  },
  {
    name: "label",
    align: "left",
    label: i18n.t("common.label"),
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
      label: program.labels?.[0]?.toLocaleLowerCase(), // TODO handle all labels
      color: "primary",
    },
    update: {
      element: "button",
      on: { click: () => props.onUpdate?.(program) },
      label: i18n.t("common.update"),
      rounded: true,
      outline: true,
      color: "button-primary",
    },
    rowId: program.uid,
  }));
});
</script>

<style scoped lang="scss">
.os-table-max-height {
  max-height: calc(100vh - 120px - 140px);
}
</style>
