<template>
  <q-table
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
    sort-by="-lastmodification"
  >
    <!-- Set header style -->
    <template v-slot:header="props">
      <q-tr :props="props" class="bg-table-header">
        <q-th
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
          class="text-h6 text-table-header text-uppercase text-weight-medium"
        >
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>

    <!-- Custom slot to render badge for identifying current program -->
    <template v-slot:body-cell-name="props">
      <q-td :props="props">
        <div>
          <q-badge
            v-if="props.row.state"
            color="positive"
            :label="props.row.state"
          />
          <p class="text-bold">{{ props.row.name }}</p>
        </div>
      </q-td>
    </template>

    <!-- Custom slot to render date range -->
    <template v-slot:body-cell-startdate="props">
      <q-td :props="props">
        <div class="row justify-start items-center">
          <p>da</p>

          <q-badge outline color="info">
            {{ props.row.startdate }}
          </q-badge>
        </div>
        <div v-if="props.row.enddate" class="row justify-start items-center">
          <p>a</p>

          <q-badge outline color="info"> {{ props.row.enddate }} </q-badge>
        </div>
      </q-td>
    </template>

    <!-- Custom slot to render buttons -->
    <template v-slot:body-cell-edit="props">
      <q-td :props="props">
        <q-btn
          color="light-dark"
          rounded
          outline
          flat
          :icon="props.row.edit.icon"
          :label="props.row.edit.label"
        ></q-btn>
      </q-td>
    </template>

    <!-- Custom slot to render buttons -->
    <template v-slot:body-cell-menu="props">
      <q-td :props="props">
        <q-btn-dropdown
          color="secondary"
          rounded
          outline
          dropdown-icon=""
          :label="props.row.menu.label"
        >
          <q-list>
            <q-item clickable v-close-popup @click="onItemClick">
              <q-item-section>
                <q-item-label>Open in builder</q-item-label>
                <q-item-label caption>Last mod: February 22, 2024</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="info" color="amber" />
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="onItemClick">
              <q-item-section>
                <q-item-label>Set as current</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="info" color="amber" />
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="onItemClick">
              <q-item-section>
                <q-item-label>Delete</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-td>
    </template>
  </q-table>
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
  selection: [evt: Event, row: Object, index: Number];
  "update:selected": [value?: Program];
}>();

// Set table columns
const columns = computed(() => [
  {
    name: "name",
    required: true,
    label: i18n.t("coach.program_management.fields.program"),
    align: "left",
    field: "name",
    sortable: true,
  },

  ...(!props.small
    ? [
        {
          name: "startdate",
          required: true,
          label: i18n.t("common.date"),
          align: "left",
          field: "startdate",
          sortable: true,
        },
      ]
    : []),

  {
    name: "edit",
    align: "center",
    label: "",
    field: "edit",
  },
  {
    name: "menu",
    align: "center",
    label: "",
    field: "menu",
  },
]);

// Set table rows
const rows = computed(() => {
  if (!Array.isArray(props.programs) || props.programs == undefined) {
    return [];
  }
  return props.programs.map((program) => ({
    uid: program.uid,
    name: program.name,
    state: program.athlete?.assignedProgramId === program.uid ? "Current" : "",
    startdate: program.startedOn
      ? i18n.d(program.startedOn, "short")
      : "Not selected",
    enddate: program.finishedOn
      ? i18n.d(program.finishedOn, "short")
      : "Not selected",
    lastmodification: program.lastUpdated
      ? i18n.d(program.lastUpdated, "middle")
      : "Not selected",
    edit: {
      element: "button",
      on: { click: () => emit("update:selected", program) },
      label: "Info",
      icon: "sym_o_edit",
      rounded: true,
      outline: true,
      color: "button-primary",
    },
    menu: {
      element: "button",
      on: { click: () => emit("update:selected", program) },
      label: "",
      icon: "sym_o_more_vert",
      rounded: true,
      outline: true,
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
