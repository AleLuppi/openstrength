<template>
  <div class="q-pa-md" style="height: 100%">
    <!-- Show selected program -->
    <div v-if="programSnapshot">
      <!-- Program infos -->
      <div class="q-mx-md">
        <div class="row justify-between">
          <h3 class="text-margin-xs">
            {{ $t("coach.program_management.viewer.title") }}
            {{ programSnapshot.athlete }}
          </h3>
          <div class="column justify-center">
            <q-btn
              v-if="user.role == UserRole.coach"
              icon="sym_o_assignment_return"
              :to="{
                name: NamedRoutes.program,
                params: { programId: route.query.id },
              }"
              class="no-print"
              >{{ $t("coach.program_management.viewer.back") }}</q-btn
            >
          </div>
        </div>

        <p>
          <b>{{ $t("coach.program_management.viewer.program_name") }} </b>
          {{ programSnapshot.name }}
        </p>
        <p v-if="programSnapshot.description">
          <b>{{ $t("coach.program_management.viewer.description") }}</b>
          {{ programSnapshot.description }}
        </p>
        <p>
          <b>{{ $t("coach.program_management.viewer.frozen_date") }} </b>
          {{ $d(programSnapshot.frozenOn, "short") }}
        </p>
        <p v-if="programSnapshot.startedOn">
          <b>{{ $t("coach.program_management.viewer.start_date") }}</b>
          {{ $d(programSnapshot.startedOn, "short") }}
        </p>
        <p v-if="programSnapshot.startedOn && programSnapshot.finishedOn">
          <b>{{ $t("coach.program_management.viewer.end_date") }}</b>
          {{ $d(programSnapshot.finishedOn, "short") }}
        </p>
      </div>

      <!-- Visualized program days -->
      <q-table
        class="q-ma-md q-mb-lg"
        v-for="(block, index) in programSnapshot?.weekdays"
        :key="index"
        :title="`${$t('coach.program_management.builder.week_name', {
          week: block.weekName,
        })} - ${$t('coach.program_management.builder.day_name', {
          day: block.dayName,
        })}`"
        :rows="block.exercises"
        :columns="columns"
        wrap-cells
        row-key="name"
        flat
        bordered
        hide-bottom
        separator="cell"
        dense
      >
        <!-- Set header style -->
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-table-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Custom slot to render values as HTML content -->
        <template v-slot:body-cell="props">
          <q-td :props="props">
            <div v-for="value in props.value" :key="props.col + '_' + value">
              {{ value }}
            </div>
          </q-td>
        </template>

        <!-- Custom slot to render exercise title -->
        <template v-slot:body-cell-exerciseInfo="props">
          <q-td :props="props">
            <div class="text-bold">
              {{ props.value[0] }}
            </div>
            <div>
              {{ props.value[1] }}
            </div>
          </q-td>
        </template>
      </q-table>

      <!-- TODO: Personal records of reference -->

      <!-- TODO: Exercise descriptions -->
    </div>

    <!-- Show something else otherwise -->
    <div v-else class="q-pa-lg column items-center">
      <h6>
        {{ $t("coach.program_management.viewer.no_program_title") }}
      </h6>
      <p>
        {{ $t("coach.program_management.viewer.no_program_explanation") }}
      </p>
      <q-btn
        :to="{
          name: NamedRoutes.home,
        }"
        :label="$t('coach.program_management.viewer.no_program_action')"
        rounded
        unelevated
        class="q-ma-lg"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { NamedRoutes } from "@/router";
import { useUserStore } from "@/stores/user";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { UserRole } from "@/helpers/users/user";
import type { QTableProps } from "quasar";

// Init plugin
const route = useRoute();
const i18n = useI18n();

// Get store
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Get correct program istance
const programSnapshot = computed(
  () =>
    coachInfo.programs
      ?.find((program) => program.uid == route.query.id)
      ?.freeze(),
);

// Set table columns
// TODO i18n in columns labels
const columns: QTableProps["columns"] = [
  {
    name: "exerciseInfo",
    label: "Esercizio",
    align: "left",
    field: (row) => [`${row.exerciseName} ${row.variantName}`, row.note],
    style: "width: 30%",
  },
  {
    name: "schema",
    label: "Schema",
    align: "left",
    field: "schema",
    style: "width: 20%",
  },
  {
    name: "schemaNote",
    label: "Note",
    align: "left",
    field: "schemaNote",
    style: "width: 30%",
  },
  {
    name: "textFeedback",
    label: "Feedback testuale",
    align: "left",
    field: (row) =>
      row.textFeedback.map((val: boolean) =>
        val ? i18n.t("common.yes") : "-",
      ),
    style: "width: 10%",
  },
  {
    name: "videoFeedback",
    label: "Feedback video",
    align: "left",
    field: (row) =>
      row.videoFeedback.map((val: boolean) =>
        val ? i18n.t("common.yes") : "-",
      ),
    style: "width: 10%",
  },
];
</script>
