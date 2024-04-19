<template>
  <os-table
    v-model:selected="selectedRows"
    :columns="columns"
    :rows="rows"
    row-key="uid"
    virtual-scroll
    hide-pagination
    :class="
      $q.screen.lt.md
        ? 'os-table-max-height-with-header'
        : 'os-table-max-height'
    "
    selection="single"
    @row-click="
      (...params: [Event, object, number]) => emit('selection', ...params)
    "
  ></os-table>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { AthleteUser } from "@/helpers/users/user";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Define props
const props = defineProps<{
  athletes: AthleteUser[];
  selected?: AthleteUser;
  athletesOnly?: boolean;
}>();

// Define emits
const emit = defineEmits<{
  selection: [evt: Event, row: object, index: number];
  "update:selected": [value?: AthleteUser];
}>();

// Set table columns
const columns = computed(() => [
  ...($q.screen.width > 840 || !$q.screen.lt.sm
    ? [
        {
          name: "image",
          required: false,
          label: "",
          align: "center",
          field: "image",
        },
      ]
    : []),
  {
    name: "name",
    required: true,
    label: i18n.t("coach.athlete_management.fields.name"),
    align: "left",
    field: (row: {
      name?: string;
      surname?: string;
      displayName?: string;
      [key: string]: any;
    }) => row.displayName ?? row.name + " " + row.surname,
    sortable: true,
  },
  ...(props.athletesOnly
    ? []
    : [
        {
          name: "program",
          label: i18n.t("coach.program_management.fields.program"),
          align: "left",
          field: "program",
        },
      ]),
]);

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
      size: "12px",
      label: athlete.assignedProgramId
        ? i18n.t("coach.athlete_management.fields.program_ongoing")
        : i18n.t("coach.athlete_management.fields.program_unassigned"),
      color: athlete.assignedProgramId ? "positive" : "negative",
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

.os-table-max-height-with-header {
  max-height: calc(100vh - 160px - 50px);
}
</style>
