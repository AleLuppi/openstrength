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
  onDelete: {
    type: Function,
    required: false,
  },
});

// Define emits
const emit = defineEmits<{
  selection: [evt: Event, row: Object, index: Number];
  "update:selected": [value?: Program];
}>();

// Set table columns
const columns = computed(() => [
  {
    name: "name",
    required: true,
    label: i18n.t("coach.program_management.fields.program"),
    align: "center",
    field: "name",
    sortable: true,
  },
  {
    name: "lastmodification",
    required: true,
    label: i18n.t("coach.program_management.fields.last_modification"),
    align: "center",
    field: "lastmodification",
    sortable: true,
  },
  { name: "delete", align: "center", label: "", field: "delete" },
]);

// Set table rows
const rows = computed(() => {
  if (!Array.isArray(props.programs) || props.programs == undefined) {
    return [];
  }
  return props.programs.map((program) => ({
    uid: program.uid,
    name: program.name,
    lastmodification: program.lastUpdated
      ? i18n.d(program.lastUpdated, "middle")
      : "Not selected",
    delete: {
      element: "button",
      on: { click: () => props.onDelete?.(program) },
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
  max-height: calc(100vh - 116px - 38px);
}

.os-table-max-height-with-header {
  max-height: calc(100vh - 116px - 38px);
}
</style>
