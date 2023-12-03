<template>
  <os-table
    :columns="columns"
    :rows="rows"
    row-key="uid"
    virtual-scroll
    hide-pagination
    class="os-table-max-height"
    @row-click="
      (...params: [Event, Object, Number]) => emit('selection', ...params)
    "
    selection="single"
    v-model:selected="selectedRows"
  ></os-table>
</template>

<script setup lang="ts">
import { ref, computed, watch, PropType } from "vue";
import { AthleteUser } from "@/helpers/users/user";

// Define props
const props = defineProps({
  athletes: {
    type: Array as PropType<AthleteUser[]>,
    required: true,
  },
  selected: {
    type: AthleteUser,
    required: false,
  },
});

// Define emits
const emit = defineEmits<{
  selection: [evt: Event, row: Object, index: Number];
  "update:selected": [value?: AthleteUser];
}>();

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
    uid: athlete.uid,
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
      label: athlete.getAssignedProgram([])?.isOngoing // TODO
        ? "Ongoing"
        : "Unassigned", // TODO i18n
      color: athlete.getAssignedProgram([])?.isOngoing // TODO
        ? "positive"
        : "negative",
    },
  }));
});

// Set ref
const selectedRows = ref<typeof rows.value>();

// Update selected rows upon selected athlete change
watch(
  () => props.selected,
  (selectedAthlete) => {
    const selectedRow = rows.value.find(
      (row) => row.uid == selectedAthlete?.uid,
    );
    if (selectedRow) selectedRows.value = [selectedRow];
  },
  { immediate: true },
);

// Update selected athlete upon selected row change
watch(selectedRows, (value) =>
  emit(
    "update:selected",
    props.athletes.find((athlete) =>
      value && value.length > 0 ? athlete.uid === value[0].uid : undefined,
    ),
  ),
);
</script>

<style scoped lang="scss">
.os-table-max-height {
  max-height: calc(100vh - 160px);
}
</style>
