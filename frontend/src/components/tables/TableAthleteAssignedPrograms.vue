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
    <template v-slot:body-cell-dates="props">
      <q-td :props="props">
        <div class="column justify-start items-start">
          <q-badge outline color="info">
            {{ props.row.startdate }}
          </q-badge>

          <div
            v-if="props.row.enddate"
            class="column justify-center items-center"
          >
            <p>{{ $t("common.to") }}</p>

            <q-badge outline color="info"> {{ props.row.enddate }} </q-badge>
          </div>
        </div>
      </q-td>
    </template>

    <!-- Custom slot to render buttons -->
    <template v-slot:body-cell-actions="props">
      <q-td :props="props" class="q-ma-none q-pa-none">
        <q-btn-group outline flat unelevated>
          <q-btn
            stack
            :color="props.row.info.color"
            :rounded="props.row.info.rounded"
            :outline="props.row.info.outline"
            :flat="props.row.info.flat"
            :icon="props.row.info.icon"
            :label="props.row.info.label"
            @click="props.row.info.on"
          ></q-btn>
          <q-btn
            stack
            :color="props.row.edit.color"
            :rounded="props.row.edit.rounded"
            :outline="props.row.edit.outline"
            :flat="props.row.edit.flat"
            :icon="props.row.edit.icon"
            :label="props.row.edit.label"
            @click="props.row.edit.on"
          ></q-btn>
          <q-btn
            stack
            :color="props.row.delete.color"
            :rounded="props.row.delete.rounded"
            :outline="props.row.delete.outline"
            :flat="props.row.delete.flat"
            :icon="props.row.delete.icon"
            :label="props.row.delete.label"
            @click="props.row.delete.on"
          ></q-btn>
        </q-btn-group>
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
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
  info: [value?: Program];
  edit: [value?: Program];
  delete: [value?: Program];
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
  {
    name: "dates",
    required: true,
    label: i18n.t("common.date"),
    align: "left",
    field: "dates",
    sortable: true,
  },
  {
    name: "actions",
    align: "center",
    label: "",
    field: "actions",
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
    info: {
      element: "button",
      on: emit("info", program),
      label: "Info",
      icon: "sym_o_info",
      rounded: true,
      outline: true,
      flat: true,
      color: "light-dark",
    },
    edit: {
      element: "button",
      on: emit("edit", program),
      label: "Edit",
      icon: "sym_o_edit",
      rounded: true,
      outline: true,
      flat: true,
      color: "light-dark",
    },
    delete: {
      element: "button",
      on: emit("delete", program),
      label: "Delete",
      icon: "delete",
      rounded: true,
      outline: true,
      flat: true,
      color: "light-dark",
    },
  }));
});
</script>

<style scoped lang="scss">
.os-table-max-height {
  max-height: calc(100vh - 255px);
}

.os-table-max-height-with-header {
  max-height: calc(100vh - 255px - 50px);
}
</style>
