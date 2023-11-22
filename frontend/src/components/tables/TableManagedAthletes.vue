<template>
  <os-table
    :columns="columns"
    :rows="rows"
    row-key="rowId"
    virtual-scroll
    hide-pagination
    class="os-table-max-height"
    @row-click="$props.onUpdate"
    selection="single"
  ></os-table>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { AthleteUser } from "@/helpers/users/user";
import { Program } from "@/helpers/programs/program";

// Define props
const props = defineProps({
  athletes: {
    type: Array as PropType<AthleteUser[]>,
    required: true,
  },
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
    name: "image",
    required: false,
    label: "",
    align: "center",
    field: "image",
  },
  {
    name: "name",
    required: true,
    label: "Name", // TODO i18n
    align: "left",
    field: (row: {
      name?: string;
      surname?: string;
      displayName?: string;
      [key: string]: any;
    }) => row.displayName ?? row.name + " " + row.surname,
    sortable: true,
  },
  {
    name: "program",
    label: "Program", // TODO i18n
    align: "left",
    field: "program",
  },
];

// Set table rows
const rows = computed(() => {
  return props.athletes.map((athlete) => ({
    image: {
      element: "avatar",
      src: athlete.photoUrl,
      icon: athlete.photoUrl ? undefined : "person",
      color: "light",
      size: "lg",
    },
    name: athlete.name,
    surname: athlete.surname,
    displayName: athlete.displayName,
    program: {
      element: "chip",
      label: athlete.getAssignedProgram(props.programs)?.isOngoing
        ? "Ongoing"
        : "Unassigned", // TODO i18n
      color: athlete.getAssignedProgram(props.programs)?.isOngoing
        ? "positive"
        : "negative",
    },
    rowId: athlete.uid,
  }));
});
</script>

<style scoped lang="scss">
.os-table-max-height {
  max-height: calc(100vh - 160px);
}
</style>
