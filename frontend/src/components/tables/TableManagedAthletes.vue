<template>
  <os-table
    :columns="columns"
    :rows="rows"
    virtual-scroll
    hide-pagination
    class="os-table-max-height"
    @row-click="$props.onUpdate"
    :selection="isAthlete ? 'none' : 'single'"
    v-model:selected="selected"
  ></os-table>
</template>

<script setup lang="ts">
import { PropType, computed, ref } from "vue";
import { AthleteUser } from "@/helpers/users/user";
import { Program } from "@/helpers/programs/program";

// See if any row is selected
const isAthlete = computed(() => Boolean(props.athletes));

// Allow row selection from parent
const selected = ref<{ [key: string]: any }[]>();
function selectRowByName(name: string, clearOnFail: boolean = false) {
  const row = rows.value.find((row) => Boolean(name) && row.name == name);
  if (row) selected.value = [row];
  else if (clearOnFail) selected.value = [];
}
defineExpose({
  selectRowByName,
});

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
    name: "program",
    required: true,
    label: "Program",
    align: "left",
    field: "program",
    sortable: true,
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
      label: athlete.hasAssignedProgram(props.programs)
        ? "Assigned"
        : "Unassigned",
      color: athlete.hasAssignedProgram(props.programs)
        ? "positive"
        : "negative",
    },
  }));
});
</script>

<style scoped lang="scss">
.os-table-max-height {
  max-height: calc(100vh - 160px);
}
</style>
