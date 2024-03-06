<template>
  <os-table
    :columns="columns"
    :rows="rows"
    row-key="uid"
    virtual-scroll
    flat
    bordered
    hide-pagination
    :class="
      $q.screen.lt.md
        ? 'os-table-max-height-with-header justify-center'
        : 'os-table-max-height justify-center'
    "
    @row-click="
      (...params: [Event, Object, Number]) => emit('selection', ...params)
    "
    selection="single"
    v-model:selected="selectedRows"
    sort-by="-lastmodification"
  ></os-table>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { Program } from "@/helpers/programs/program";
import { useI18n } from "vue-i18n";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Define props
const props = withDefaults(
  defineProps<{
    programs: Program[];
    selected?: Program;
    showFields?: (keyof Program)[];
    small?: boolean;
    allowDelete?: boolean;
  }>(),
  { small: false, allowDelete: false },
);

// Define emits
const emit = defineEmits<{
  selection: [evt: Event, row: Object, index: Number];
  "update:selected": [value?: Program];
  delete: [program: Program];
}>();

// Set table columns
const columns = computed(() => {
  const showFields: (keyof Program)[] =
    props.showFields ??
    (props.small
      ? ["name", "athlete"]
      : ["name", "athlete", "startedOn", "finishedOn", "lastUpdated"]);
  const outColumns = [];
  showFields.forEach((key) => {
    switch (key) {
      case "name":
        outColumns.push({
          name: "name",
          required: true,
          label: i18n.t("coach.program_management.fields.program"),
          align: "center",
          field: "name",
          sortable: true,
        });
        break;
      case "athlete":
        outColumns.push({
          name: "athletename",
          required: true,
          label: i18n.t("coach.program_management.fields.athlete"),
          align: "center",
          field: "athletename",
          sortable: true,
        });
        break;
      case "startedOn":
        outColumns.push({
          name: "startdate",
          required: true,
          label: i18n.t("common.start"),
          align: "center",
          field: "startdate",
          sortable: true,
        });
        break;
      case "finishedOn":
        outColumns.push({
          name: "enddate",
          required: true,
          label: i18n.t("common.end"),
          align: "center",
          field: "enddate",
          sortable: true,
        });
        break;
      case "lastUpdated":
        outColumns.push({
          name: "lastmodification",
          required: true,
          label: i18n.t("coach.program_management.fields.last_modification"),
          align: "center",
          field: "lastmodification",
          sortable: true,
        });
        break;
    }
  });
  if (props.allowDelete)
    outColumns.push({
      name: "delete",
      align: "center",
      label: "",
      field: "delete",
    });
  return outColumns;
});

// Set table rows
const rows = computed(() => {
  if (!Array.isArray(props.programs) || props.programs == undefined) {
    return [];
  }
  return props.programs.map((program) => ({
    uid: program.uid,
    name: program.name,
    athletename: program.athlete?.referenceName ?? "Not assigned",
    startdate: program.startedOn
      ? i18n.d(program.startedOn, "short")
      : "Not selected",
    enddate: program.finishedOn
      ? i18n.d(program.finishedOn, "short")
      : "Not selected",
    lastmodification: program.lastUpdated
      ? i18n.d(program.lastUpdated, "middle")
      : "Not selected",
    delete: {
      element: "button",
      on: { click: () => emit("delete", program) },
      icon: "delete",
      flat: true,
      round: true,
      color: "button-negative",
    },
  }));
});

// Set ref
const selectedRows = ref<typeof rows.value>();

// Update selected rows upon selected program change
watch(
  () => props.selected,
  (selectedProgram) => {
    const selectedRow = rows.value.find(
      (row) => row.uid == selectedProgram?.uid,
    );
    if (selectedRow) selectedRows.value = [selectedRow];
  },
  { immediate: true },
);

// Update selected program upon program row change
watch(selectedRows, (value) =>
  emit(
    "update:selected",
    props.programs.find((program) =>
      value && value.length > 0 ? program.uid === value[0].uid : undefined,
    ),
  ),
);
</script>

<style scoped lang="scss">
.os-table-max-height {
  max-height: calc(100vh - 255px);
}

.os-table-max-height-with-header {
  max-height: calc(100vh - 255px - 50px);
}
</style>
