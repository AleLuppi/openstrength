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
  ></os-table>
</template>

<script setup lang="ts">
import { ref, computed, watch, PropType } from "vue";
import { useQuasar } from "quasar";
import { Program } from "@/helpers/programs/program";
import { useI18n } from "vue-i18n";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Define props
const props = defineProps({
  programs: {
    type: Array as PropType<Program[]>,
    required: true,
  },
  selected: {
    type: Program,
    required: false,
  },
  small: {
    type: Boolean,
    default: false,
  },
});

// Define emits
const emit = defineEmits<{
  open: [program: Program];
  selection: [evt: Event, row: Object, index: Number];
  "update:selected": [value?: Program];
}>();

// Set table columns
const columns = computed(() =>
  !props.small
    ? [
        {
          name: "name",
          required: true,
          label: i18n.t("coach.program_management.fields.program"),
          align: "center",
          field: "name",
          sortable: true,
        },
        {
          name: "athletename",
          required: true,
          label: i18n.t("coach.program_management.fields.athlete"),
          align: "center",
          field: "athletename",
          sortable: true,
        },
        ...($q.screen.gt.sm
          ? [
              {
                name: "startdate",
                required: true,
                label: i18n.t("common.start"),
                align: "center",
                field: "startdate",
                sortable: true,
              },
              {
                name: "enddate",
                required: true,
                label: i18n.t("common.end"),
                align: "center",
                field: "enddate",
                sortable: true,
              },
              {
                name: "lastmodification",
                required: true,
                label: i18n.t(
                  "coach.program_management.fields.last_modification",
                ),
                align: "center",
                field: "lastmodification",
                sortable: true,
              },
            ]
          : []),

        {
          name: "open",
          required: true,
          label: "",
          align: "center",
          field: "open",
        },
      ]
    : [
        {
          name: "name",
          required: true,
          label: i18n.t("coach.program_management.fields.program"),
          align: "center",
          field: "name",
          sortable: true,
        },
        {
          name: "athletename",
          required: true,
          label: i18n.t("coach.program_management.fields.athlete"),
          align: "center",
          field: "athletename",
          sortable: true,
        },
        {
          name: "open",
          required: true,
          label: "",
          align: "center",
          field: "open",
        },
      ],
);

// Set table rows
const rows = computed(() => {
  if (!Array.isArray(props.programs) || props.programs == undefined) {
    return [];
  }
  return props.programs.map((program) => ({
    uid: program.uid,
    name: program.name,
    athletename:
      program.athlete?.displayName ??
      program.athlete?.name + " " + program.athlete?.surname ??
      "Not assigned",
    startdate: program.startedOn
      ? new Date(program.startedOn).toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Not selected",
    enddate: program.finishedOn
      ? new Date(program.finishedOn).toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Not selected",
    lastmodification: program.lastUpdated
      ? new Date(program.lastUpdated).toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        })
      : "Not selected",
    open: {
      element: "button",
      on: { click: () => emit("open", program) },
      label: "",
      icon: "sym_o_open_in_new",
      rounded: true,
      outline: true,
      flat: true,
      color: "button-primary",
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
