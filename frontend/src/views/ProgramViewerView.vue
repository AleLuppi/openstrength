<template>
  <div class="q-pa-none" style="height: 100%">
    <!-- Show selected program -->
    <div v-if="programSnapshot">
      <!-- Program infos -->
      <div class="q-mx-md">
        <div class="row justify-between">
          <h3 class="text-margin-xs">
            {{ $t("coach.program_management.viewer.title") }}
            {{ programSnapshot.athlete }}
          </h3>
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
      <div v-if="showTable">
        <q-table
          class="q-ma-md q-mb-lg"
          v-for="(block, indexDay) in programSnapshot?.weekdays"
          :key="indexDay"
          :title="`${$t('coach.program_management.builder.week_name', {
            week: block.weekName,
          })} - ${$t('coach.program_management.builder.day_name', {
            day: block.dayName,
          })}`"
          :rows="block.exercises"
          :columns="columns"
          wrap-cells
          row-key="name"
          :pagination="{ rowsPerPage: 0 }"
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
              <div class="q-gutter-y-sm">
                <div
                  v-for="value in props.value"
                  :key="props.col + '_' + value"
                >
                  {{ value }}
                </div>
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
      </div>

      <!-- Show Workout day -->
      <div
        v-for="(block, indexDay) in programSnapshot?.weekdays"
        :key="indexDay"
        class="q-my-md q-mx-xs"
      >
        <WorkoutDayForm
          :block="block"
          :dayShowDone="dayShowDone[indexDay]"
          :feedback="programFeedbacks?.workoutDays.at(indexDay)"
        >
        </WorkoutDayForm>
      </div>
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
import { ref, watch, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { NamedRoutes } from "@/router";
import { useQuasar } from "quasar";
import type { QTableProps } from "quasar";
import { doGetDocs } from "@/helpers/database/readwrite";
import {
  dbCollections,
  dbSubcollections,
} from "@/helpers/database/collections";
import { ProgramForzenView } from "@/helpers/programs/program";
import WorkoutDayForm from "@/components/feedback/WorkoutDayForm.vue";
import { AthleteFeedbackFrozenView } from "@/helpers/programs/athleteFeedback";

// Init plugin
const route = useRoute();
const $q = useQuasar();
const i18n = useI18n();

const showTable = ref(false);

// Set card behavior
const dayDone = ref<boolean[]>([]);
const dayShowDone = computed(() => dayDone.value);

// Get correct program istance
const programSnapshot = ref<ProgramForzenView>();

// Get correct associated feedbacks
const programFeedbacks = ref<AthleteFeedbackFrozenView>();

console.log(programFeedbacks);

watch(
  () => route.query.id,
  (docId) =>
    doGetDocs(
      `${dbCollections.programs}/${docId}/${dbSubcollections.programSnapshots}`,
      undefined,
      {
        ordering: ["-frozenOn"],
        numDocs: 1,
        onSuccess: (docVal: { [key: string]: ProgramForzenView }) => {
          programSnapshot.value = Object.values(docVal)[0];

          // Hide loading spinner
          $q.loading.hide();
        },
      },
    ),
  { immediate: true },
);

// Set table columns
const columns: QTableProps["columns"] = [
  {
    name: "exerciseInfo",
    label: i18n.t("coach.program_management.viewer.header_exercise_info"),
    align: "left",
    field: (row) => [`${row.exerciseName} ${row.variantName}`, row.note],
    style: "width: 30%",
  },
  {
    name: "schema",
    label: i18n.t("coach.program_management.viewer.header_schema"),
    align: "left",
    field: "schema",
    style: "width: 20%",
  },
  {
    name: "schemaNote",
    label: i18n.t("coach.program_management.viewer.header_schema_note"),
    align: "left",
    field: "schemaNote",
    style: "width: 30%",
  },
  {
    name: "textFeedback",
    label: i18n.t("coach.program_management.viewer.header_text_feedback"),
    align: "left",
    field: (row) =>
      row.textFeedback.map((val: boolean) =>
        val ? i18n.t("common.yes") : "-",
      ),
    style: "width: 10%",
  },
  {
    name: "videoFeedback",
    label: i18n.t("coach.program_management.viewer.header_video_feedback"),
    align: "left",
    field: (row) =>
      row.videoFeedback.map((val: boolean) =>
        val ? i18n.t("common.yes") : "-",
      ),
    style: "width: 10%",
  },
];

// Operations to perform on component mount
onMounted(() => {
  // Show loading spinner
  $q.loading.show();
});
</script>
