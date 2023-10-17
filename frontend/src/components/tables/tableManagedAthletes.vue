<template>
  <os-table :columns="columns" :rows="rows"></os-table>
</template>

<script setup lang="ts">
import { PropType, computed } from "vue";
import { AthleteUser } from "@/helpers/users/user";

// Define props
const props = defineProps({
  athletes: {
    type: Array as PropType<AthleteUser[]>,
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
    label: "Name",
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
    name: "note",
    align: "left",
    label: "Note",
    field: "note",
  },
  { name: "update", align: "center", label: "", field: "update" },
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
    note: athlete.coachNote,
    update: {
      element: "button",
      on: { click: () => props.onUpdate(athlete) },
      label: "Update",
      rounded: true,
      color: "button-primary",
      outline: true,
    },
  }));
});
</script>
